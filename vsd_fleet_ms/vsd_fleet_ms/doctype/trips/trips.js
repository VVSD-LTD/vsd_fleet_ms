// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Trips', {
	refresh: function (frm) {
	// 	if (frm.doc.route && frm.doc.docstatus == 0 && frm.doc.main_route_steps.length < 1 ) {
	// 		frappe.model.with_doc('Trip Routes', frm.doc.route, function (frm) {
	// 			var reference_route = frappe.model.get_doc('Trip Routes', cur_frm.doc.route);
	// 			cur_frm.clear_table('main_route_steps');
	// 			reference_route.trip_steps.forEach(function (row) {
	// 				var new_row = cur_frm.add_child('main_route_steps');
	// 				new_row.location = row.location;
	// 				new_row.distance = row.distance;
	// 				new_row.fuel_consumption_qty = row.fuel_consumption_qty;
	// 				new_row.location_type = row.location_type;
	// 				cur_frm.refresh_field('main_route_steps');
	// 			});
	// 			cur_frm.clear_table('requested_fund_accounts_table');
	// 			reference_route.fixed_expenses.forEach(function(row) {
	// 				frappe.model.with_doc('Fixed Expenses', row.expense, function (frm) {
	// 				var fixed_expense_doc = frappe.model.get_doc("Fixed Expenses", row.expense);
	// 				var new_row = cur_frm.add_child('requested_fund_accounts_table');
	// 				new_row.requested_date = frappe.datetime.nowdate();
	// 				new_row.request_amount = row.amount;
	// 				new_row.request_currency = row.currency;
	// 				new_row.request_status = "Pre-Approved";
	// 				new_row.expense_type = row.expense;
	// 				new_row.expense_account = fixed_expense_doc.expense_account;
	// 				new_row.payable_account = fixed_expense_doc.cash_bank_account;
	// 				new_row.party_type = row.party_type;
	// 				// if (row.party_type == "Employee" && cur_frm.doc.assigned_driver) {
	// 				// 	new_row.party = frappe.db.get_value("Driver", cur_frm.doc.assigned_driver, "employee");
	// 				// }
	// 				cur_frm.refresh_field('requested_fund_accounts_table');
	// 			})
	// 		});	
	// 	});
	// 	cur_frm.dirty();
	// 	cur_frm.save();
	// }
	// if (frm.doc.route && frm.doc.docstatus == 0 && frm.doc.requested_fund_accounts_table.length < 1 ) {
	// 		frappe.model.with_doc('Trip Routes', frm.doc.route, function (frm) {
	// 			var reference_route = frappe.model.get_doc('Trip Routes', cur_frm.doc.route);
	// 			cur_frm.clear_table('main_route_steps');
	// 			reference_route.trip_steps.forEach(function (row) {
	// 				var new_row = cur_frm.add_child('main_route_steps');
	// 				new_row.location = row.location;
	// 				new_row.distance = row.distance;
	// 				new_row.fuel_consumption_qty = row.fuel_consumption_qty;
	// 				new_row.location_type = row.location_type;
	// 				cur_frm.refresh_field('main_route_steps');
	// 			});
	// 			cur_frm.clear_table('requested_fund_accounts_table');
	// 			reference_route.fixed_expenses.forEach(function(row) {
	// 				frappe.model.with_doc('Fixed Expenses', row.expense, function (frm) {
	// 				var fixed_expense_doc = frappe.model.get_doc("Fixed Expenses", row.expense);
	// 				var new_row = cur_frm.add_child('requested_fund_accounts_table');
	// 				new_row.requested_date = frappe.datetime.nowdate();
	// 				new_row.request_amount = row.amount;
	// 				new_row.request_currency = row.currency;
	// 				new_row.request_status = "Pre-Approved";
	// 				new_row.expense_type = row.expense;
	// 				new_row.expense_account = fixed_expense_doc.expense_account;
	// 				new_row.payable_account = fixed_expense_doc.cash_bank_account;
	// 				new_row.party_type = row.party_type;
	// 				// if (row.party_type == "Employee" && cur_frm.doc.assigned_driver) {
	// 				// 	new_row.party = frappe.db.get_value("Driver", cur_frm.doc.assigned_driver, "employee");
	// 				// }
	// 				cur_frm.refresh_field('requested_fund_accounts_table');
	// 			})
	// 		});	
	// 	});
	// 	cur_frm.dirty();
	// 	cur_frm.save();
	// }
		// var total_fuel = 0;
		// var total_distance = 0;
		// frm.doc.main_route_steps.forEach(function (row) {
		// 	total_fuel = total_fuel + parseInt(row.fuel_consumption_qty);
		// 	total_distance = total_distance + parseInt(row.distance);
		// });
		// frm.doc.side_trips.forEach(function (row) {
		// 	total_fuel = total_fuel + parseInt(row.total_fuel);
		// 	total_distance = total_distance + parseInt(row.total_distance);
		// });
		// if (frm.doc.total_fuel != total_fuel) {
		// 	frm.doc.total_fuel = total_fuel
		// 	frm.dirty();
		// 	frm.save();
		// }
		// if (frm.doc.total_distance != total_distance) {
		// 	frm.doc.total_distance = total_distance
		// 	frm.dirty();
		// 	frm.save();
		// }
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
				new_row.request_status = "Pre-Approved";
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
	}
});

frappe.ui.form.on('Side Trips', {
	total_distance: function (frm, cdt, cdn) {
		var total_distance = 0;
		frm.doc.main_route_steps.forEach(function (row) {
			total_distance = total_distance + parseInt(row.distance);
		});
		frm.doc.side_trips.forEach(function (row) {
			total_distance = total_distance + parseInt(row.total_distance);
		});
		if (frm.doc.total_distance != total_distance){
			frm.doc.total_distance = total_distance
		}
	},
	total_fuel: function(frm, cdt, cdn){
		var total_fuel = 0;
		frm.doc.main_route_steps.forEach(function (row) {
			total_fuel = total_fuel + parseInt(row.fuel_consumption_qty);
		});
		frm.doc.side_trips.forEach(function (row) {
			total_fuel = total_fuel + parseInt(row.total_fuel);
		});
		if (frm.doc.total_fuel != total_fuel) {
			frm.doc.total_fuel = total_fuel
		}
	}
});

frappe.ui.form.on('Truck Trip Location Update', {
	view_on_map: function (frm, cdt, cdn) {
		if (locals[cdt][cdn].latitude & locals[cdt][cdn].longitude) {
			var url = 'https://www.google.com/maps/search/?api=1&query=' + locals[cdt][cdn].latitude + ',' + locals[cdt][cdn].longitude;
			var win = window.open(url, '_blank');
			win.focus();
		}
	}
});
frappe.ui.form.on('Requested Fund Details', {
    disburse_funds: function (frm, cdt, cdn) {
        frappe.msgprint("We are in Disburse funds");
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
