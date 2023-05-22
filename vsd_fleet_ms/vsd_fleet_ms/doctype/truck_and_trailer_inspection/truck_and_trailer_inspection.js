// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Truck and Trailer Inspection', {

//function to load pre-entered checklist of inspection routine checklist
    truck_type: function (frm) {
        frappe.model.with_doc("Truck Inspections Template", frm.doc.truck_type, function () {
            var ref_doc = frappe.get_doc("Truck Inspections Template", frm.doc.truck_type);
            console.log(ref_doc);

            //for Lighting checklist
            if (ref_doc.lighting_checklist_details && ref_doc.lighting_checklist_details.length > 0) {

                frm.clear_table("truck_lighting");

                ref_doc.lighting_checklist_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_lighting");
                    new_row.lighting_check = row.lighting_check;
                })
            }

            //for brake system checklist
            if (ref_doc.brake_system_checklist_details && ref_doc.brake_system_checklist_details.length > 0) {

                frm.clear_table("truck_brakes");

                ref_doc.brake_system_checklist_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_brakes");
                    new_row.brake_system = row.brake_system;
                })
            }

            //for Engine checklist
            if (ref_doc.engine_checklist_details && ref_doc.engine_checklist_details.length > 0) {

                frm.clear_table("truck_engine");

                ref_doc.engine_checklist_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_engine");
                    new_row.engine_system = row.engine_system;
                })
            }

            //for fuel system checklist
            if (ref_doc.fuel_system_checklist_details && ref_doc.fuel_system_checklist_details.length > 0) {

                frm.clear_table("truck_fuel_system");

                ref_doc.fuel_system_checklist_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_fuel_system");
                    new_row.fuel_system = row.fuel_system;
                })
            }

            //for tire status and pressure
            if (ref_doc.tires_details && ref_doc.tires_details.length > 0) {

                frm.clear_table("truck_tires_checklist");

                ref_doc.tires_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_tires_checklist");
                    new_row.criteria = row.criteria;
                })
            }
            //for power train checklist
            if (ref_doc.power_train_details && ref_doc.power_train_details.length > 0) {

                frm.clear_table("truck_power_train");

                ref_doc.power_train_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_power_train");
                    new_row.power_train = row.power_train;
                })
            }

            //for electronics checklist
            if (ref_doc.electronics_details && ref_doc.electronics_details.length > 0) {

                frm.clear_table("truck_electronics");

                ref_doc.electronics_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_electronics");
                    new_row.electornics_part = row.electornics_part;
                })
            }

            //for electrical checklist
            if (ref_doc.electrical_details && ref_doc.electrical_details.length > 0) {

                frm.clear_table("truck_electrical_checklist");

                ref_doc.electrical_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_electrical_checklist");
                    new_row.electrical_part = row.electrical_part;
                })
            }

            //for steering checklist
            if (ref_doc.steering_details && ref_doc.steering_details.length > 0) {

                frm.clear_table("truck_steering_checklist");

                ref_doc.steering_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_steering_checklist");
                    new_row.steering_part = row.steering_part;
                })
            }

            //for tires checklist
            if (ref_doc.tire_checklist_details && ref_doc.tire_checklist_details.length > 0) {

                frm.clear_table("truck_tire_checklist");

                ref_doc.tire_checklist_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_tire_checklist");
                    new_row.tire_position = row.tire_position;
                })
            }

            //for suspension checklist
            if (ref_doc.suspension_details && ref_doc.suspension_details.length > 0) {

                frm.clear_table("truck_suspension_checklist");

                ref_doc.suspension_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_suspension_checklist");
                    new_row.part = row.part;
                })
            }


            //for air system/others checklist
            if (ref_doc.air_system_details && ref_doc.air_system_details.length > 0) {

                frm.clear_table("truck_air_system");

                ref_doc.air_system_details.forEach(function (row) {
                    var new_row = frm.add_child("truck_air_system");
                    new_row.part = row.part;
                })
            }



        });
        frappe.after_ajax(function () {
            //list of table_names_fields from Vehicle Inspection to Update Values
            var field_lists = ["truck_lighting", "truck_brakes", "truck_engine", "truck_fuel_system", "truck_tires_checklist", "truck_power_train", "truck_electronics", "truck_electrical_checklist", "truck_steering_checklist", "truck_tire_checklist", "truck_suspension_checklist", "truck_air_system"];
            field_lists.forEach(function (row) {
                frm.refresh_field(row);
            })

        })
    },
    refresh: function (frm) {


    }
});
