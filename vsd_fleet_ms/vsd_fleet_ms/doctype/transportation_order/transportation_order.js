// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Transportation Order', {
	setup: function(frm){
		frm.set_query("assigned_vehicle","assign_transport", function() {
			return {
				filters: {
					disabled: 0,
					status: "Available"
				}
			};
		});
		frm.set_query("assigned_trailer","assign_transport", function() {
			return {
				filters: {
					disabled: 0,
					status: "Available"
				}
			};
		});
		frm.set_query("assigned_driver","assign_transport", function() {
			return {
				filters: {
					status: "Active"
				}
			};
		});
	},
	onload: function (frm) {
		frm.get_field("assign_transport").grid.cannot_add_rows = true;
		$("*[data-fieldname='assign_transport']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='assign_transport']").find(".grid-remove-all-rows").hide();
		//Load the buttons
		var html = '<button style="background-color: green; color: #FFF;" class="btn btn-default btn-xs" onclick="cur_frm.cscript.assign_transport(\'' + frm + '\');">Assign Vehicles</button> ';
		$(frm.fields_dict.html1.wrapper).html(html);

		frm.set_query("cargo_location_city", "cargo", function (doc, cdt, cdn) {
			const row = frappe.get_doc(cdt, cdn);
			console.log(row, cdt, cdn);
			return {
				filters: {
					country: row.cargo_location_country,
				}
			};
		});

		frm.set_query("cargo_destination_city", "cargo", function (doc, cdt, cdn) {
			const row = frappe.get_doc(cdt, cdn);
			console.log(row, cdt, cdn);
			return {
				filters: {
					country: row.cargo_destination_country,
				}
			};
		});
	},

	refresh: function (frm, cdt, cdn) {
		frm.get_field("assign_transport").grid.cannot_add_rows = true;
		$("*[data-fieldname='assign_transport']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='assign_transport']").find(".grid-remove-all-rows").hide();
		//	console.log(frm);

		//Fix assignement details
		frm.events.check_assignment_table(frm);

		//If request is from module, disable save, else enable save
		//If the request is from other module, load data from that module
		if (frm.doc.reference_docname) {
			cur_frm.cscript.populate_child(frm.doc.reference_doctype, frm.doc.reference_docname);
			frm.page.clear_indicator();
		}
		frm.events.calculate_total_assigned(frm);
		//frm.events.hide_show_cargo(frm);
		frappe.db.get_single_value('Transport Settings', 'sales_item_group')
			.then(sales_item_group => {
				frm.set_query('item', 'assign_transport', () => {
					return {
						filters: {
							item_group: sales_item_group
						}
					};
				});
			});

	},


	//Fix for bug which did copy cargo details in cargo.
	check_assignment_table: function (frm) {
		if (frm.doc.cargo_type == 'Container') {
			var to_save = false;
			frm.doc.assign_transport.forEach(function (row) {
				if (!row.cargo || row.cargo.toUpperCase().indexOf('NEW') > -1) {
					//Find the cargo details
					frm.doc.cargo.forEach(function (cargo_row) {
						if (cargo_row.container_number == row.container_number) {
							frappe.model.set_value('Transport Assignments', row.name, 'cargo', cargo_row.name);
						}
					});
					to_save = true;
				}
			});
			if (to_save) {
				frappe.after_ajax(function () {
					frm.save_or_update();
				});
			}
		}
	},

	show_submit_button: function (frm) {

	},

	show_hide_assignment: function (frm, cdt, cdn) {
		//Processed row
		var row = frm.fields_dict['assign_transport'].grid.grid_rows_by_docname[cdn];


		//Make editable according to request origin
		if (frm.doc.reference_docname) {
			row.toggle_editable('cargo', false);
			row.toggle_editable('container_number', false);
			row.toggle_editable('expected_loading_date', false);

		}

		//Hide the extra info section
		row.toggle_display('section_extra', false);

		// //Show, hide and enable entries according to the transporter type
		// if (locals[cdt][cdn].transporter_type == "Sub-Contractor" || locals[cdt][cdn].transporter_type == "Self Drive") {
		// 	//Show the sub-contractor select box
		// 	row.toggle_display("sub_contractor", (locals[cdt][cdn].transporter_type == "Sub-Contractor"));
		// 	//Enter vehicle details
		// 	row.toggle_display("assigned_vehicle", false);
		// 	row.toggle_editable("vehicle_plate_number", true);
		// 	//Vehicle Documents
		// 	//row.toggle_display("section_vehicle_attachments", true);
		// 	for (var i = 1; i < 5; i++) {
		// 		row.toggle_editable("attach_" + i, true);
		// 		row.toggle_editable("description_" + i, true);
		// 	}
		// 	//Trailor Details
		// 	row.toggle_display("assigned_trailer", false);
		// 	row.toggle_editable("trailer_plate_number", (locals[cdt][cdn].transporter_type == "Sub-Contractor"));
		// 	//Driver Details
		// 	row.toggle_display("assigned_driver", false);
		// 	row.toggle_editable("driver_name", true);
		// 	row.toggle_editable("passport_number", true);
		// 	row.toggle_editable("driver_licence", true);
		// 	row.toggle_editable("driver_contact", true);
		// }
		// else if (locals[cdt][cdn].transporter_type == "Bravo") {
		// 	//Hide the sub-contractor select box
		// 	row.toggle_display("sub_contractor", false);
		// 	//Enter vehicle details
		// 	row.toggle_display("assigned_vehicle", true);
		// 	row.toggle_editable("assigned_vehicle", true);
		// 	row.toggle_editable("vehicle_plate_number", false);
		// 	//Vehicle Documents
		// 	//row.toggle_display("section_vehicle_attachments", true);
		// 	for (var i = 1; i < 5; i++) {
		// 		row.toggle_editable("attach_" + i, false);
		// 		row.toggle_editable("description_" + i, false);
		// 	}
		// 	//Trailor Details
		// 	row.toggle_display("assigned_trailer", true);
		// 	row.toggle_editable("assigned_trailer", true);
		// 	row.toggle_editable("trailer_plate_number", false);
		// 	//Driver Details
		// 	row.toggle_display("assigned_driver", true);
		// 	row.toggle_editable("assigned_driver", true);
		// 	row.toggle_editable("driver_name", false);
		// 	row.toggle_editable("passport_number", false);
		// 	row.toggle_editable("driver_licence", true);
		// 	row.toggle_editable("driver_contact", true);
		// }
		// else {
		// 	//Hide the sub-contractor select box
		// 	row.toggle_display("sub_contractor", false);
		// 	//Enter vehicle details
		// 	row.toggle_display("assigned_vehicle", true);
		// 	row.toggle_editable("assigned_vehicle", true);
		// 	row.toggle_editable("vehicle_plate_number", false);
		// 	//Vehicle Documents
		// 	for (var i = 1; i < 5; i++) {
		// 		row.toggle_editable("attach_" + i, false);
		// 		row.toggle_editable("description_" + i, false);
		// 	}
		// 	//Trailor Details
		// 	row.toggle_display("assigned_trailer", true);
		// 	row.toggle_editable("assigned_trailer", true);
		// 	//Driver Details
		// 	row.toggle_display("assigned_driver", true);
		// 	row.toggle_editable("assigned_driver", true);
		// }
	},


	calculate_total_assigned: function (frm) {
		if (frm.doc.cargo_type == 'Loose Cargo' && frm.doc.assign_transport.length > 0) {
			frm.toggle_display('total_assigned', true);
			var total = 0;
			frm.doc.assign_transport.forEach(function (row) {
				total = total + row.amount;
			});
			frm.set_value('total_assigned', total + ' ' + frm.doc.unit);
		}
		else {
			frm.toggle_display('total_assigned', false);
		}
	},
	create_invoice: (frm) => {
		if (frm.is_dirty()) {
			frappe.throw(__("Plase Save First"));
			return;
		}
		let selected = frm.get_selected().assign_transport;
		if (selected) {
			let rows = frm.doc.assign_transport.filter(i => selected.includes(i.name) && !i.invoice);
			if (rows.length) {
				frappe.call({
					method: "vsd_fleet_ms.vsd_fleet_ms.doctype.transportation_order.transportation_order.create_sales_invoice",
					args: {
						doc: frm.doc,
						rows: rows
					},
					callback: function (data) {
						frappe.set_route('Form', data.message.doctype, data.message.name);
					}
				});
			} else {
				frappe.msgprint(__("All Rows Invoiced!"));
			}
		} else {
			frappe.msgprint(__("No Rows Selected!"));
		}
	},
});


frappe.ui.form.on("Transport Assignments", {
	form_render: function (frm, cdt, cdn) {
		const container = document.querySelector('[data-fieldname="create_vehicle_trip_record"]');

		if (container) {
		// Find the button element within the container
		const button = container.querySelector('button');

		// Override the entire class of the button with the new class
		if (button) {
			button.className = 'btn btn-xs btn-default bold btn-primary';
		}
		}
		frm.events.show_hide_assignment(frm, cdt, cdn);
		locals[cdt][cdn].units = frm.doc.unit;
	},

	before_assign_transport_remove: function (frm, cdt, cdn) {
		if (locals[cdt][cdn].status && locals[cdt][cdn].status == "Processed") {
			frappe.throw("You cannot delete a processed assignment");
		}
	},

	before_assign_transport_add: function (frm, cdt, cdn) {
		if (cur_frm.doc.cargo_type == "Container") {
			frappe.throw('Please use the assign vehicle button to assign vehicles.');
		}
	},

	assign_transport_add: function (frm, cdt, cdn) {
		if (cur_frm.doc.cargo_type != "Container") {
			locals[cdt][cdn].container_number = 'NIL';
			locals[cdt][cdn].cargo_type = frm.doc.cargo_type;
			locals[cdt][cdn].file_number = frm.doc.file_number;
			//If units are set, copy units to the assignment
			if (frm.doc.unit) {
				locals[cdt][cdn].units = frm.doc.unit;
			}
		}
	},

	amount: function (frm, cdt, cdn) {
		frm.events.show_submit_button(frm);
		frm.events.calculate_total_assigned(frm);
	},

	expected_loading_date: function (frm, cdt, cdn) {
		frm.events.show_submit_button(frm);
	},

	transporter_type: function (frm, cdt, cdn) {
		frm.events.show_hide_assignment(frm, cdt, cdn);
	},

	sub_contractor: function (frm, cdt, cdn) {
		frm.events.show_submit_button(frm);
	},

	assigned_vehicle: function (frm, cdt, cdn) {
		//Automatically enter the plate number, trailer and driver
		//For future reference on how to do this the frappe way. FOr some reason I cant get it to work on child table on first value change
		//cur_frm.add_fetch('assigned_vehicle', 'number_plate', 'vehicle_plate_number');
		frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Truck",
				filters: {
					name: locals[cdt][cdn].assigned_vehicle
				},
				fieldname: ["license_plate", "trans_ms_driver", "trans_ms_default_trailer"]
			},
			callback: function (data) {
				// set the returned values in cooresponding fields
				frappe.model.set_value(cdt, cdn, 'vehicle_plate_number', data.message.license_plate);
				frappe.model.set_value(cdt, cdn, 'assigned_trailer', data.message.trans_ms_default_trailer);
				frappe.model.set_value(cdt, cdn, 'assigned_driver', data.message.trans_ms_driver);
			}
		});

		//For vehicle documents
		frappe.model.with_doc('Truck', locals[cdt][cdn].assigned_vehicle, function () {
			var ref_vehicle = frappe.model.get_doc('Truck', locals[cdt][cdn].assigned_vehicle);
			var i = 1;
			ref_vehicle.vehicle_documents.forEach(function (row) {
				//Fill in the attachments and their descriptions.
				frappe.model.set_value(cdt, cdn, 'attach_' + i, row.attachment);
				frappe.model.set_value(cdt, cdn, 'description_' + i, row.description);
				i++;
			});
		});


		frm.events.show_submit_button(frm);
		frappe.after_ajax(function (row) {
			frm.events.show_hide_assignment(frm, cdt, cdn);
		});
	},

	vehicle_plate_number: function (frm, cdt, cdn) {
		frm.events.show_submit_button(frm);
	},

	assigned_trailer: function (frm, cdt, cdn) {
		frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Trailer",
				filters: {
					name: locals[cdt][cdn].assigned_trailer
				},
				fieldname: ["number_plate"]
			},
			callback: function (data) {
				// set the returned values in cooresponding fields
				frappe.model.set_value(cdt, cdn, 'trailer_plate_number', data.message.number_plate);
			}
		});
		frm.events.show_submit_button(frm);
	},

	trailer_plate_number: function (frm, cdt, cdn) {
		frm.events.show_submit_button(frm);
	},

	driver_name: function (frm, cdt, cdn) {
		frm.events.show_submit_button(frm);
	},

	passport_number: function (frm, cdt, cdn) {
		frm.events.show_submit_button(frm);
	},

	route: function (frm, cdt, cdn) {
		frm.events.show_submit_button(frm);
	},
	
	create_vehicle_trip_record: function (frm, cdt, cdn) {
		const doc = locals[cdt][cdn];
		console.log(doc.assigned_vehicle);
		var customer = frappe.db.get_value('Transportation Order', doc.parent, 'customer');
		if (doc.vehicle_status == 2 || doc.vehicle_status == 4) //If en route on trip and not offloaded
		{
			frappe.msgprint('The assigned vehicle is En Route on another trip and has not offloaded. Please offload the current cargo before starting new trip.', 'Not Allowed');
		}
		else if (doc.vehicle_status == 3) {
			console.log(doc);
			frappe.confirm(
				'The vehicle is En Route on another trip. Set as return cargo? If you select no, a new trip will be created',
				function () {
					frappe.call({
						method: "vsd_fleet_ms.vsd_fleet_ms.doctype.vehicle_trips.vehicle_trips.create_vehicle_trip",
						args: {
							reference_doctype: "Transport Assignments",
							reference_docname: doc.name,
							truck: doc.assigned_vehicle,
							transporter_type: doc.transporter_type,
							sub_contractor: doc.sub_contractor,
							assigned_vehicle: doc.assigned_vehicle,
							truck_plate_number: doc.vehicle_plate_number,
							assigned_trailer: doc.assigned_trailer,
							cargo: doc.cargo,
							truck_driver: doc.assigned_driver,
							driver_name: doc.driver_name,
							customer: doc.customer,
							invoice_number: doc.invoice
						},
						callback: function (data) {
							console.log(data);
							//frm.set_value('status', 'Processed');
							//frm.save_or_update();
							frappe.set_route('Form', data.message.doctype, data.message.name);
						}
					});
				}
				);
		}
		else {
			console.log(doc);
			frappe.call({
				method: "vsd_fleet_ms.vsd_fleet_ms.doctype.vehicle_trips.vehicle_trips.create_vehicle_trip",
				args: {
					reference_doctype: "Transport Assignments",
					reference_docname: doc.name,
					truck: doc.assigned_vehicle,
					transporter_type: doc.transporter_type,
					sub_contractor: doc.sub_contractor,
					assigned_vehicle: doc.assigned_vehicle,
					truck_plate_number: doc.vehicle_plate_number,
					assigned_trailer: doc.assigned_trailer,
					trailer_plate_number: doc.trailer_plate_number,
					cargo: doc.cargo,
					assign_transport: doc.assign_transport,
					truck_driver: doc.assigned_driver,
					driver_name: doc.driver_name,
					customer: doc.customer,
					invoice_number: doc.invoice
				},
				callback: function (data) {
					console.log(data);
					//frm.set_value('status', 'Processed');
					//frm.save_or_update();
					frappe.set_route('Form', data.message.doctype, data.message.name);
				}
			});
		}
	}
});



cur_frm.cscript.assign_transport = function (frm) {
	var selected = cur_frm.get_selected();
	// var def_curr
	if (selected['cargo']) {
		$.each(selected['cargo'], async function (index, cargo_nm) {
			var container_number = locals["Cargo Detail"][cargo_nm].container_number;
			var response = await frappe.db.get_value('Customer', cur_frm.doc.customer, 'default_currency');
			var transport_currency = response.message.default_currency;
			var exists = $('[data-fieldname="assign_transport"]:contains("' + container_number + '")');
			console.log(exists);
			if (exists.length > 0) {
				msgprint('Container No. ' + container_number + ' has already been processed.', 'Error');
			}
			else {
				var new_row = cur_frm.add_child("assign_transport");
				new_row.cargo_type = cur_frm.doc.cargo_type;
				new_row.cargo = locals["Cargo Detail"][cargo_nm].name;
				new_row.container_number = container_number;
				new_row.customer = cur_frm.doc.customer;
				frappe.model.set_value(new_row.doctype, new_row.name, "currency", transport_currency);
				new_row.expected_loading_date = cur_frm.doc.loading_date;
				cur_frm.refresh_field("assign_transport");
			}
		});
	}
	else {
		show_alert("Error: Please select cargo to process.");
	}
	//}
};

cur_frm.cscript.populate_child = function (reference_doctype, reference_docname) {
	if (reference_doctype == "Import") {
		frappe.model.with_doc(reference_doctype, reference_docname, function () {
			var request_total_amount = null;
			var reference_doc = frappe.get_doc(reference_doctype, reference_docname);

			//Load data and set as read only
			cur_frm.set_value('request_received', cur_frm.meta.creation.substr(0, 10));
			cur_frm.set_value('customer', reference_doc.customer);
			cur_frm.set_value('consignee', reference_doc.consignee);
			cur_frm.set_value('shipper', reference_doc.shipper);
			cur_frm.set_value('cargo_location_city', reference_doc.port_of_discharge);
			cur_frm.set_value('loading_date', reference_doc.ata);
			cur_frm.set_value('cargo_destination_country', reference_doc.cargo_destination_country);
			cur_frm.set_value('cargo_destination_city', reference_doc.cargo_destination_city);
			cur_frm.set_value('border1_clearing_agent', reference_doc.clearing_agent_border_1);
			cur_frm.set_value('border2_clearing_agent', reference_doc.clearing_agent_border_2);
			cur_frm.set_value('border3_clearing_agent', reference_doc.clearing_agent_border_3);
			cur_frm.set_value('special_instructions_to_transporter', reference_doc.special_instructions_to_transporter);
			cur_frm.set_value('cargo_type', 'Container');
			cur_frm.set_value('goods_description', reference_doc.cargo);
			cur_frm.set_value('cargo_description', reference_doc.cargo_description);
			cur_frm.set_value('file_number', reference_doc.reference_file_number);

			//Set as read only
			cur_frm.toggle_enable(['request_received', 'customer', 'cargo_location_city', 'loading_date', 'cargo_destination_city',
				'cargo_destination_country', 'cargo_type', 'goods_description', 'cargo_description', 'file_number',
				'consignee', 'shipper', 'special_instructions_to_transporter'], 0);
			cur_frm.toggle_enable(['border1_clearing_agent', 'border2_clearing_agent', 'border3_clearing_agent', 'cargo_location_country', 'transport_type', 'cargo'], 0);

			//Get port country
			frappe.model.with_doc('Port', reference_doc.port_of_discharge, function (frm) {
				cur_frm.set_value('cargo_location_country', frappe.model.get_doc('Port', reference_doc.port_of_discharge).country);
			});

			if (reference_doc.import_type == "Local") {
				cur_frm.set_value('transport_type', 'Internal');
			}
			else if (reference_doc.import_type == "Transit") {
				cur_frm.set_value('transport_type', 'Cross Border');
			}
		});
		return "done";
	}

};

frappe.ui.form.on('Cargo Detail', {
	onload(frm) {

	},
	refersh(frm) {
		console.info("Table Refresh");
	},
});
