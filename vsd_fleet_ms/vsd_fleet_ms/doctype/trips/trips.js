// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Trips', {
	refresh: function (frm) {
		approved_total();
		requested_total();
		rejected_total();
		fuel_amount();
		if (frm.doc.trip_completed == 0 && frm.doc.trip_status != "Breakdown") {
            frm.add_custom_button(__("Complete Trip"), function () {
                frm.set_value("trip_completed", 1);
				frm.set_value("trip_completed_date", frappe.datetime.nowdate());
				var truck = frm.doc.truck_number;
				frm.save();
                if (frm.doc.transporter_type == "In House") {
					frappe.db.set_value('Truck', truck, {
						trans_ms_current_trip: '',
                        status: 'Idle'
                    }).then(r => {
						frappe.msgprint(__(`Truck ${truck} is Available now`));
                    });
                }
            }, __('Actions'));
        }
		if(frm.doc.trip_completed == 0 && frm.doc.trip_status == "Pending" && frm.doc.docstatus == 0){
			frm.add_custom_button(__('Create Breakdown Entry'), function() {
				frappe.confirm('Do you want to create breakdown entry?',function() {
					frappe.call({
						method: 'vsd_fleet_ms.vsd_fleet_ms.doctype.trips.trips.create_breakdown',
						args: {
							docname: frm.doc.name
						},
						callback: function (r) {
							if (r.message){
								location.reload();
							frappe.msgprint("Successful Created Breakdown Entry")
						}
					}
					});
				});
			}, __('Actions'));
		}
		if(!frm.doc.resumption_trip && frm.doc.trip_status == "Breakdown" && frm.doc.status != "Re-Assigned"){
			frm.add_custom_button(__('Allocate New Vehicle Trip'), function() {
					frappe.call({
						method: 'vsd_fleet_ms.vsd_fleet_ms.doctype.trips.trips.create_resumption_trip',
						args: {
							"docname": frm.doc.name
						},
						callback: function (r) {
							if (r.message){
							var doc = frappe.model.sync(r.message)[0];
							frappe.set_route("Form", doc.doctype, doc.name);
						}
					}
					});
			}, __('Actions'));
		}
	},
	setup: function(frm){
		$(frm.wrapper).on("grid-row-render", function(e, grid_row) {
			if (grid_row.doc.request_status == "Requested") {
				$(grid_row.columns.request_status).css({"font-weight": "bold","color": "blue"});
			}	
			else if(grid_row.doc.request_status == "Approved")
			{
				$(grid_row.columns.request_status).css({"font-weight": "bold", "color": "green"});
			}
			else if(grid_row.doc.request_status == "Rejected")
			{
				$(grid_row.columns.request_status).css({"font-weight": "bold", "color": "red"});
			}
			
			if (grid_row.doc.status == "Requested") {
				$(grid_row.columns.status).css({"font-weight": "bold","color": "blue"});
			}	
			else if(grid_row.doc.status == "Approved")
			{
				$(grid_row.columns.status).css({"font-weight": "bold", "color": "green"});
			}
			else if(grid_row.doc.status == "Rejected")
			{
				$(grid_row.columns.status).css({"font-weight": "bold", "color": "red"});
			}
		});
	},
	reduce_stock: function (frm) {
        if (frm.doc.stock_out_entry) return;
        frappe.call({
            method: "vsd_fleet_ms.vsd_fleet_ms.doctype.trips.trips.create_stock_out_entry",
            args: {
                doc: frm.doc,
                fuel_stock_out: frm.doc.fuel_stock_out
            },
            callback: function (data) {
                frappe.set_route('Form', data.message.doctype, data.message.name);
            }
        });
    },
	route: function (frm) {
		frappe.model.with_doc('Trip Routes', frm.doc.route, function (frm) {
			var reference_route = frappe.model.get_doc('Trip Routes', cur_frm.doc.route);
			cur_frm.clear_table('main_route_steps');
			reference_route.trip_steps.forEach(function (row) {
				var new_row = cur_frm.add_child('main_route_steps');
				new_row.location = row.location;
				new_row.distance = row.distance;
				new_row.fuel_consumption_qty = row.fuel_consumption_qty;
				new_row.location_type = row.location_type;
				cur_frm.refresh_field('main_route_steps');
			});
			cur_frm.clear_table('requested_fund_accounts_table');
        	reference_route.fixed_expenses.forEach(function(row) {
				frappe.model.with_doc('Fixed Expenses', row.expense, function (frm) {
				var fixed_expense_doc = frappe.model.get_doc("Fixed Expenses", row.expense);
				var new_row = cur_frm.add_child('requested_fund_accounts_table');
				new_row.requested_date = frappe.datetime.nowdate();
				new_row.request_amount = row.amount;
				new_row.request_currency = row.currency;
				new_row.request_status = "Requested";
				new_row.expense_type = row.expense;
				new_row.expense_account = fixed_expense_doc.expense_account;
				new_row.payable_account = fixed_expense_doc.cash_bank_account;
				new_row.party_type = row.party_type;
				// if (row.party_type == "Employee" && cur_frm.doc.assigned_driver) {
				// 	new_row.party = frappe.db.get_value("Driver", cur_frm.doc.assigned_driver, "employee");
				// }
				cur_frm.refresh_field('requested_fund_accounts_table');
			})
        });		
		});
	},
	side_trips_add: function (frm, cdt, cdn) {
		var total_fuel = 0;
		var total_distance = 0;
		frm.doc.main_route_steps.forEach(function (row) {
			total_fuel = total_fuel + parseInt(row.fuel_consumption_qty);
			total_distance = total_distance + parseInt(row.distance);
		});
		frm.doc.side_trips.forEach(function (row) {
			total_fuel = total_fuel + parseInt(row.total_fuel);
			total_distance = total_distance + parseInt(row.total_distance);
		});
		if (frm.doc.total_fuel != total_fuel) {
			frm.doc.total_fuel = total_fuel
		}
		if (frm.doc.total_distance != total_distance) {
			frm.doc.total_distance = total_distance
		}
	},
	side_trips_remove: function (frm, cdt, cdn) {
		var total_fuel = 0;
		var total_distance = 0;
		frm.doc.main_route_steps.forEach(function (row) {
			total_fuel = total_fuel + parseInt(row.fuel_consumption_qty);
			total_distance = total_distance + parseInt(row.distance);
		});
		frm.doc.side_trips.forEach(function (row) {
			total_fuel = total_fuel + parseInt(row.total_fuel);
			total_distance = total_distance + parseInt(row.total_distance);
		});
		if (frm.doc.total_fuel != total_fuel) {
			frm.doc.total_fuel = total_fuel
		}
		if (frm.doc.total_distance != total_distance) {
			frm.doc.total_distance = total_distance
		}
	},
	date_of_departure_from_border: (frm) => {
		if (frm.doc.date_of_departure_from_border && frm.doc.arrival_date_at_border){
			var date1 = frappe.datetime.str_to_obj(cur_frm.doc.date_of_departure_from_border);
			var date2 = frappe.datetime.str_to_obj(cur_frm.doc.arrival_date_at_border);

			// Calculate the difference in milliseconds
			var difference_ms = date1 - date2;

			// Convert milliseconds to days
			var difference_days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));

			frm.doc.total_days_at_the_border = difference_days;
			frm.refresh_field("total_days_at_the_border");
		}
	},
	arrival_date_at_border: (frm) => {
		if (frm.doc.date_of_departure_from_border && frm.doc.arrival_date_at_border){
			var date1 = frappe.datetime.str_to_obj(cur_frm.doc.date_of_departure_from_border);
			var date2 = frappe.datetime.str_to_obj(cur_frm.doc.arrival_date_at_border);

			// Calculate the difference in milliseconds
			var difference_ms = date1 - date2;

			// Convert milliseconds to days
			var difference_days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));

			frm.doc.total_days_at_the_border = difference_days;
			frm.refresh_field("total_days_at_the_border");
		}
	}
});

// frappe.ui.form.on('Side Trips', {
// 	total_distance: function (frm, cdt, cdn) {
// 		var total_distance = 0;
// 		frm.doc.main_route_steps.forEach(function (row) {
// 			total_distance = total_distance + parseInt(row.distance);
// 		});
// 		frm.doc.side_trips.forEach(function (row) {
// 			total_distance = total_distance + parseInt(row.total_distance);
// 		});
// 		if (frm.doc.total_distance != total_distance){
// 			frm.doc.total_distance = total_distance
// 		}
// 	},
// 	total_fuel: function(frm, cdt, cdn){
// 		var total_fuel = 0;
// 		frm.doc.main_route_steps.forEach(function (row) {
// 			total_fuel = total_fuel + parseInt(row.fuel_consumption_qty);
// 		});
// 		frm.doc.side_trips.forEach(function (row) {
// 			total_fuel = total_fuel + parseInt(row.total_fuel);
// 		});
// 		if (frm.doc.total_fuel != total_fuel) {
// 			frm.doc.total_fuel = total_fuel
// 		}
// 	}
// });

frappe.ui.form.on('Truck Trip Location Update', {
	view_on_map: function (frm, cdt, cdn) {
		if (locals[cdt][cdn].latitude & locals[cdt][cdn].longitude) {
			var url = 'https://www.google.com/maps/search/?api=1&query=' + locals[cdt][cdn].latitude + ',' + locals[cdt][cdn].longitude;
			var win = window.open(url, '_blank');
			win.focus();
		}
	}
});
frappe.ui.form.on('Fuel Requests Table', {
	create_purchase_order: (frm, cdt, cdn) => {
        const row = locals[cdt][cdn];
        if (row.purchase_order || row.status != "Approved") return;
        console.info("frm", frm);
        frappe.call({
            method: "vsd_fleet_ms.vsd_fleet_ms.doctype.trips.trips.create_purchase_order",
            args: {
                request_doc: frm.doc,
                item: row,
            },
            callback: function (r) {
                frm.reload_doc();
                frm.refresh_field("fuel_request_history");
            }
        });
    },
	quantity: function(frm, cdt, cdn){
		var row = locals[cdt][cdn];
		if (row.cost_per_litre){
		row.total_cost = row.quantity * row.cost_per_litre
		cur_frm.refresh_field("requested_fund_accounts_table")
		}
	},
	cost_per_litre: function(frm, cdt, cdn){
		var row = locals[cdt][cdn];
		if (row.quantity){
		row.total_cost = row.quantity * row.cost_per_litre
		cur_frm.refresh_field("requested_fund_accounts_table")
		}
	},
});
frappe.ui.form.on('Requested Fund Details', {
    disburse_funds: function (frm, cdt, cdn) {
        if (frm.is_dirty()) {
            frappe.throw(__("Plase Save First"));
            return;
        }
        const row = locals[cdt][cdn];
        if (row.journal_entry) return;
        frappe.call({
            method: "vsd_fleet_ms.vsd_fleet_ms.doctype.trips.trips.create_fund_jl",
            args: {
                doc: frm.doc,
                row: row
            },
            callback: function (data) {
                frm.reload_doc();
                // frappe.set_route('Form', data.message.doctype, data.message.name);
                const new_url = `${window.location.origin}/app/journal-entry/${data.message.name}`;
                window.open(new_url, '_blank');
            }
        });
    }
});

function approved_total(){
			//For total requested
			var total_request_tsh = 0;
			var total_request_usd = 0;
			cur_frm.doc.requested_fund_accounts_table.forEach(function (row) {
				if (row.request_currency == 'TZS' && row.request_status == "Approved") {
					total_request_tsh += row.request_amount;
				}
				else if (row.request_currency == 'USD' && row.request_status == "Approved") {
					total_request_usd += row.request_amount;
				}
			});
			cur_frm.get_field("html2").wrapper.innerHTML = '<p class="text-muted small">Total Amount Approved</p><b>USD ' + total_request_usd.toLocaleString() + ' <br> TZS ' + total_request_tsh.toLocaleString() + '</b>';
	
};
function requested_total(){
	var total_request_tsh = 0;
	var total_request_usd = 0;
	cur_frm.doc.requested_fund_accounts_table.forEach(function (row) {
		if (row.request_currency == 'TZS' && row.request_status == "Requested") {
			total_request_tsh += row.request_amount;
		}
		else if (row.request_currency == 'USD' && row.request_status == "Requested") {
			total_request_usd += row.request_amount;
		}
	});
	cur_frm.get_field("html").wrapper.innerHTML = '<p class="text-muted small">Total Amount Requested</p><b>USD ' + total_request_usd.toLocaleString() + ' <br> TZS ' + total_request_tsh.toLocaleString() + '</b>';

};
function rejected_total(){
	var total_request_tsh = 0;
		var total_request_usd = 0;
		cur_frm.doc.requested_fund_accounts_table.forEach(function (row) {
			if (row.request_currency == 'TZS' && row.request_status == "Rejected") {
				total_request_tsh += row.request_amount;
			}
			else if (row.request_currency == 'USD' && row.request_status == "Rejected") {
				total_request_usd += row.request_amount;
			}
		});
		cur_frm.get_field("html3").wrapper.innerHTML = '<p class="text-muted small">Total Amount Rejected</p><b>USD ' + total_request_usd.toLocaleString() + ' <br> TZS ' + total_request_tsh.toLocaleString() + '</b>';

};
function fuel_amount(){
	var approved_fuel = 0;
	var requested_fuel = 0;
	var rejected_fuel = 0;
	cur_frm.doc.fuel_request_history.forEach(function (row) {
		if (row.status == "Approved") {
			approved_fuel += row.quantity;
		}
		if (row.status == "Requested") {
			requested_fuel += row.quantity;
		}
		if (row.status == "Rejected") {
			rejected_fuel += row.quantity;
		}
	});
	var content = '';
	content = '<p class="text-muted small">Total Fuel Requested: <b>' + requested_fuel.toLocaleString() + '</b></p>';
	content += '<p class="text-muted small">Total Fuel Approved: <b>' + approved_fuel.toLocaleString() + '</b></p>';
	content += '<p class="text-muted small">Total Fuel Rejected: <b>' + rejected_fuel.toLocaleString() + '</b></p>';
	cur_frm.get_field("html4").wrapper.innerHTML = content;

}
