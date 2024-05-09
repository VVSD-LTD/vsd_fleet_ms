// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Manifest', {
	has_trailers: function(frm){
		if (frm.doc.has_trailers == 0){
		frm.doc.manifest_cargo_details.forEach(function(row) {
			cur_frm.set_df_property("manifest_cargo_details", "cargo_allocation", "read_only", 1, row.idx);
		  });	
		  cur_frm.refresh_field("manifest_cargo_details")	
		}	  
	},
	transporter_type: (frm) => {
        // Get the transporter type value
        var transporter_type = frm.doc.transporter_type;

        // Check if transporter type is "Sub-Contractor"
        if (transporter_type === 'Sub-Contractor') {
            // Loop through child table rows
            frm.doc.manifest_cargo_details.forEach(function(row) {
                // Set transporter type to 'Sub-Contractor'
                row.transporter_type = 'Sub-Contractor';

                // Hide the "sub_contractor_cargo_allocation" field
                row.sub_contractor_cargo_allocation = '';
            });

            // Refresh child table field
            frm.refresh_field("manifest_cargo_details");
        }else{
			// Loop through child table rows
            frm.doc.manifest_cargo_details.forEach(function(row) {
                // Set transporter type to 'Sub-Contractor'
                row.transporter_type = 'In House';

                // Hide the "sub_contractor_cargo_allocation" field
                row.specific_cargo_allocation = '';
            });

            // Refresh child table field
            frm.refresh_field("manifest_cargo_details");
		}
    },
	refresh: function(frm) {
		$('*[data-fieldname="cargo_list"]').find('.grid-delete-row').hide();
		if(frm.doc.docstatus == 0) {
			frm.add_custom_button(__('Add Cargo to Manifest'), function () {
				frappe.call({
					args: {
						route_starting_point:frm.doc.route_starting_point
					},
					method: "vsd_fleet_ms.custom.custom_functions.add_to_manifest",
					callback: function (r) {
						if (r.message){
							// Show dialog with cargo data
							showCargoDialog(r.message);
						}
					}
				})
			});
		}
		if (frm.doc.has_trailers == 0){
			frm.doc.manifest_cargo_details.forEach(function(row) {
				cur_frm.set_df_property("manifest_cargo_details", "cargo_allocation", "read_only", 1, row.idx);
			  });
			  cur_frm.refresh_field("manifest_cargo_details")	
			}
		if(frm.doc.docstatus == 1 && !frm.doc.vehicle_trip){
			var args_array = [];
			if (frm.doc.transporter_type == "In House"){
				args_array = {
					manifest_name:frm.doc.name,
					transporter_type:frm.doc.transporter_type,
					driver:frm.doc.assigned_driver,
					trip_route:frm.doc.route,
					truck:frm.doc.truck
				}
			
				frm.add_custom_button(__('Vehicle Trip'), function () {
					frappe.call({
						args: {
							args_array:args_array
						},
						method: "vsd_fleet_ms.vsd_fleet_ms.doctype.trips.trips.create_vehicle_trip_from_manifest",
						callback: function (r) {
							if (r.message){
								var doc = frappe.model.sync(r.message)[0];
							frappe.set_route("Form", doc.doctype, doc.name);
							}
						}
					})
				}, __("Create"));
			}else{
				args_array = {
					manifest_name:frm.doc.name,
					transporter_type:frm.doc.transporter_type,
					sub_contactor_driver_name:frm.doc.sub_contactor_driver_name,
					trip_route:frm.doc.route,
					sub_contactor_truck_license_plate_no:frm.doc.sub_contactor_truck_license_plate_no
				}
				frm.add_custom_button(__('Vehicle Trip'), function () {
					frappe.call({
						args: {
							args_array:args_array
						},
						method: "vsd_fleet_ms.vsd_fleet_ms.doctype.trips.trips.create_vehicle_trip_from_manifest",
						callback: function (r) {
							if (r.message){
								var doc = frappe.model.sync(r.message)[0];
							frappe.set_route("Form", doc.doctype, doc.name);
							}
						}
					})
				}, __("Create"));
			}
		}
		
		var trailer_names = []

		if (frm.doc.trailer_1){
			trailer_names.push(frm.doc.trailer_1)
		}
		if (frm.doc.trailer_2){
			trailer_names.push(frm.doc.trailer_2)
		}
		if (frm.doc.trailer_3){
			trailer_names.push(frm.doc.trailer_3)
		}
		filters_for_trailers(trailer_names)

		frm.set_query("specific_cargo_allocated", "manifest_cargo_details", function(doc,cdt,cdn) {
		var row = locals[cdt][cdn]
		if (!row.specific_cargo_allocated){
			frm.refresh_field("manifest_cargo_details")
		}

		if (row.cargo_allocation == "Trailers"){
			var trailers = [];
			if (frm.doc.trailer_1) {
				var trailer_1 = frm.doc.trailer_1;
				trailers.push(trailer_1);
				
				if (frm.doc.trailer_2) {
					var trailer_2 = frm.doc.trailer_2;
					trailers.push(trailer_2);
					
					if (frm.doc.trailer_3) {
						var trailer_3 = frm.doc.trailer_3;
						trailers.push(trailer_3);
					}
				}
			}
		var filters = {
			disabled:0
		}
		if (trailers.length > 0) {
			filters["name"] = ["in", trailers];
		}
			return {
				filters: filters
			};
		}else if (row.cargo_allocation == "Truck"){
			if ( frm.doc.transporter_type == "In House"){
			if (!frm.doc.truck){
				frappe.msgprint("Please select truck before Allocating cargo to Truck")
				row.specific_cargo_allocated = ''
				row.cargo_allocation = ''
				frm.refresh_field("manifest_cargo_details")
			}else{
				row.specific_cargo_allocated = frm.doc.truck
				frm.refresh_field("manifest_cargo_details")
			}
		}
	}
	});
	},
	onload: function(frm){
		frm.get_field("manifest_cargo_details").grid.cannot_add_rows = true;
		var total_kg = 0;
		frm.doc.manifest_cargo_details.forEach(function(row) {
		total_kg = total_kg + parseInt(row.weight);
		});
		if (frm.doc.manifest_total_weight != total_kg){
			frm.doc.manifest_total_weight = total_kg;
			frm.refresh_field("manifest_total_weight")
			frm.dirty();
			frm.save();
		}
		var trailer_names = []

		if (frm.doc.trailer_1){
			trailer_names.push(frm.doc.trailer_1)
		}
		if (frm.doc.trailer_2){
			trailer_names.push(frm.doc.trailer_2)
		}
		if (frm.doc.trailer_3){
			trailer_names.push(frm.doc.trailer_3)
		}
		filters_for_trailers(trailer_names)
		
		if(!frm.doc.posting_date) {
			frm.set_value('posting_date', frappe.datetime.nowdate());
			frm.set_df_property('posting_date', 'read_only', 1);
			frm.refresh_field('posting_date')
		}else{
			frm.set_df_property('posting_date', 'read_only', 1);
			frm.refresh_field('posting_date')
		}
		frm.set_query("truck", function () {
			return {
				filters: {
					status: "Idle",
					disabled:0
				}
			};
		});
		frm.set_query("assigned_driver", function () {
			return {
				filters: {
					in_trip: 0,
					status:"Active"
				}
			};
		});
		frm.set_query("vehicle_trip", function () {
			return {
				filters: {
					docstatus:0
				}
			};
		});
		// if (frm.doc.trailer_1){
		// 	frm.set_query("trailer_1", function () {
		// 		return {
		// 			filters: {
		// 				disabled:0,
		// 				status:"Idle"
		// 			}
		// 		};
		// 	});
		// }
		
		
	},
	trailer_1: function(frm){
		if (!frm.doc.trailer_1){
			frm.doc.trailer_2 = "";
			frm.doc.trailer2_type = "";
			frm.doc.trailer_3 = "";
			frm.doc.trailer3_type = "";
			frm.refresh_field("trailer_2")
			frm.refresh_field("trailer2_type")
			frm.refresh_field("trailer_3")
			frm.refresh_field("trailer3_type")
		}
		var trailer_names = []

		if (frm.doc.trailer_1){
			trailer_names.push(frm.doc.trailer_1)
		}
		if (frm.doc.trailer_2){
			trailer_names.push(frm.doc.trailer_2)
		}
		if (frm.doc.trailer_3){
			trailer_names.push(frm.doc.trailer_3)
		}
		filters_for_trailers(trailer_names)
		
	},
	trailer_2: function(frm){
		if (!frm.doc.trailer_2){
			frm.doc.trailer_3 = "";
			frm.doc.trailer3_type = "";
			frm.refresh_field("trailer_3");
			frm.refresh_field("trailer3_type");
		}
		
		var trailer_names = []

		if (frm.doc.trailer_1){
			trailer_names.push(frm.doc.trailer_1)
		}
		if (frm.doc.trailer_2){
			trailer_names.push(frm.doc.trailer_2)
		}
		if (frm.doc.trailer_3){
			trailer_names.push(frm.doc.trailer_3)
		}
		filters_for_trailers(trailer_names)
	},
	trailer_3: function(frm){
		var trailer_names = []

		if (frm.doc.trailer_1){
			trailer_names.push(frm.doc.trailer_1)
		}
		if (frm.doc.trailer_2){
			trailer_names.push(frm.doc.trailer_2)
		}
		if (frm.doc.trailer_3){
			trailer_names.push(frm.doc.trailer_3)
		}
		filters_for_trailers(trailer_names)
	},
	has_trailers: function(frm){
		if (frm.doc.has_trailers == 0){
			frm.doc.trailer_1 = "";
			frm.doc.trailer1_type = "";
			frm.doc.trailer_2 = "";
			frm.doc.trailer2_type = "";
			frm.doc.trailer_3 = "";
			frm.doc.trailer3_type = "";
			frm.refresh_field("trailer_2")
			frm.refresh_field("trailer2_type")
			frm.refresh_field("trailer_3")
			frm.refresh_field("trailer3_type")
		}
	}
});
frappe.ui.form.on('Manifest Cargo Details', {
	
	cargo_allocation: function(frm,cdt,cdn){
		var row = locals[cdt][cdn]
		row.specific_cargo_allocated = ''
		frm.refresh_field("manifest_cargo_details")
		
		if (row.cargo_allocation == "Trailers"){
				var trailers = [];
				if (frm.doc.trailer_1) {
					var trailer_1 = frm.doc.trailer_1;
					trailers.push(trailer_1);
					
					if (frm.doc.trailer_2) {
						var trailer_2 = frm.doc.trailer_2;
						trailers.push(trailer_2);
						
						if (frm.doc.trailer_3) {
							var trailer_3 = frm.doc.trailer_3;
							trailers.push(trailer_3);
						}
					}
				}
			var filters = {
				disabled:0
			}
			if (trailers.length > 0) {
				filters["name"] = ["in", trailers];
			}
			frm.set_query("specific_cargo_allocated", "manifest_cargo_details", function() {
			return {
				filters: filters
				};
			});
			}else if (row.cargo_allocation == "Truck"){
				if (!frm.doc.truck){
					frappe.msgprint("Please select truck before Allocating cargo to Truck")
					row.specific_cargo_allocated = ''
					row.cargo_allocation = ''
					frm.refresh_field("manifest_cargo_details")
				}else{
					row.specific_cargo_allocated = frm.doc.truck
					frm.refresh_field("manifest_cargo_details")
				}
			}
	}
});
function filters_for_trailers(trailer_names){
		cur_frm.set_query("trailer_1", function () {
			return {
				filters: {
					disabled:0,
					name: ["not in", trailer_names]
				}
			};
		});
		cur_frm.set_query("trailer_2", function () {
			return {
				filters: {
					disabled:0,
					name: ["not in", trailer_names]
				}
			};
		});
		cur_frm.set_query("trailer_3", function () {
			return {
				filters: {
					disabled:0,
					name: ["not in", trailer_names]
				}
			};
		});
}
// Function to create and show dialog with cargo data
function showCargoDialog(data) {
    // Create a new dialog
    var dialog = new frappe.ui.Dialog({
        title: __("Cargo Details"),
        fields: [
            {
                fieldname: 'cargo_list',
                fieldtype: 'Table',
                label: __("Cargo List"),
                fields: [
                    {
                        fieldname: 'cargo_id',
                        label: __("Cargo ID"),
                        fieldtype: 'Data',
                        read_only: 1,
						hidden: 1
                    },
                    {
                        fieldname: 'customer_name',
                        label: __("Customer"),
   						in_list_view: 1,
                        fieldtype: 'Data',
                        read_only: 1
                    },
                    {
                        fieldname: 'cargo_route',
                        label: __("Cargo Route"),
   						in_list_view: 1,
                        fieldtype: 'Data',
                        read_only: 1
                    },
                    {
                        fieldname: 'posting_date',
                        label: __("Posting Date"),
   						in_list_view: 1,
                        fieldtype: 'Date',
                        read_only: 1
                    },
                    // {
                    //     fieldname: 'net_weight',
                    //     label: __("Net Weight"),
   					// 	in_list_view: 1,
                    //     fieldtype: 'Float',
                    //     read_only: 1
                    // },
                    {
                        fieldname: 'number_of_packages',
                        label: __("Number of Packages"),
   						in_list_view: 1,
                        fieldtype: 'Int',
                        read_only: 1
                    },
                ],
                data: data,
            }
        ],
        primary_action: function() {
            // Get selected cargo
            var selected_cargo = [];
			var manifestName = cur_frm.doc.name;
			dialog.fields_dict.cargo_list.grid.grid_rows.forEach(function(row) {
				if (row.doc.__checked) {
					selected_cargo.push(row.doc);
						// Perform the desired action with the selected item
						// Example: Call a function with the selected item name
						var args_array = {
							"manifest":manifestName,
							"cargo_id":row.doc.cargo_id,
							"bl_number":row.doc.bl_number,
							"cargo_route": row.doc.cargo_route,
							"cargo_type":row.doc.cargo_type,
							"number_of_package":row.doc.number_of_packages,
							"weight":row.doc.net_weight,
							"expected_loading_date":row.doc.loading_date,
							"expected_offloading_date":row.doc.expected_offloading_date,
							"customer_name":row.doc.customer_name,
							"cargo_destination_country":row.doc.cargo_destination_country,
							"cargo_destination_city":row.doc.cargo_destination_city,
							"container_size":row.doc.container_size,
							"seal_number":row.doc.seal_number,
							"container_number":row.doc.container_number,
							"cargo_loading_city":row.doc.cargo_location_city,
							"cargo_location_country":row.doc.cargo_location_country,
							"parent_doctype_name":row.doc.parent_doctype_name
						}
						handle_Assign_Button_Click(args_array)
				}
			});
			// console.log(selected_cargo);
			dialog.hide();
			cur_frm.refresh_field()
        }
    });

	// Remove add and remove row buttons
    dialog.fields_dict.cargo_list.grid.wrapper.find('.grid-add-row').remove();
    dialog.fields_dict.cargo_list.grid.wrapper.find('.grid-remove-rows').remove();
    dialog.fields_dict.cargo_list.grid.wrapper.find('.grid-delete-row').hide();
	dialog.fields_dict.cargo_list.grid.wrapper.find('.grid-delete-row').remove();
    // dialog.fields_dict.cargo_list.grid.wrapper.find('.grid-row-check').remove();
    // dialog.fields_dict.cargo_list.grid.wrapper.find('.edit-grid-row').remove();

    dialog.show();
}

function handle_Assign_Button_Click(args_array) {
	
	// console.log(args_array.manifest)
    frappe.call({
		args: {
			args_array:args_array
		},
		method: "vsd_fleet_ms.vsd_fleet_ms.doctype.manifest.manifest.add_to_existing_manifest",
		callback: function (r) {
			if (r.message){
				var doc = frappe.model.sync(r.message)[0];
			frappe.set_route("Form", doc.doctype, doc.name);
			}
		}
	})
}
