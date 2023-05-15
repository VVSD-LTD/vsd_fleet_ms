// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

//Global variable for delivery note print
var main_parenttype = '',
    main_parent_frm = null;
var return_parenttype = '',
    return_parent_frm = null;
var first_reload = true;
var return_cancelled = false;
var return_assignment = null;
var main_loading_date = null;
var return_loading_date = null;

frappe.ui.form.on('Vehicle Trips', {
    //added function for the form to load template
    onload: function (frm) {
        //frm.events.open_close_buttons(frm);


        if (first_reload == false) {
            return;
        }
        //Load data from the linked assignment
        //For main trip
        frappe.model.with_doc(frm.doc.reference_doctype, frm.doc.reference_docname, function () {
            var reference_doc = frappe.get_doc(frm.doc.reference_doctype, frm.doc.reference_docname);

            //File number
            frm.set_value('main_file_number', reference_doc.file_number);

            //Vehicle, driver and trailer assignment
            frm.set_value('transporter_type', reference_doc.transporter_type);
            frm.set_value('main_route', reference_doc.route);
            if (reference_doc.transporter_type == 'Sub-Contractor' || reference_doc.transporter_type == "Self Drive") {
                if (reference_doc.transporter_type == "Sub-Contractor") {
                    frm.set_value('sub_contractor', reference_doc.sub_contractor);
                    // frm.set_value('trailer_plate_number', reference_doc.assigned_trailer);
                }
                frm.set_value('truck_plate_number', reference_doc.assigned_vehicle);
                frm.set_value('driver_name', reference_doc.driver_name);
                frm.set_value('passport_number', reference_doc.passport_number);
                frm.toggle_display('truck', false);
                frm.toggle_display('truck_driver', false);
                // frm.toggle_display('trailer', false);
            } else {
                frm.set_value('truck', reference_doc.assigned_vehicle);
                // frm.set_value('trailer', reference_doc.assigned_trailer);
                frm.set_value('truck_driver', reference_doc.assigned_driver);
                frm.set_value('truck_plate_number', reference_doc.assigned_vehicle);
                // frm.set_value('trailer_plate_number', reference_doc.assigned_trailer);
                frm.set_value('driver_name', reference_doc.driver_name);
                frm.set_value('passport_number', reference_doc.passport_number);
                frm.toggle_display('truck', true);
                frm.toggle_display('truck_driver', true);
                // frm.toggle_display('trailers', true);
                frm.toggle_display('sub_contractor', false);
            }

            //If phone number is not entered
            if (!frm.doc.phone_number) {
                frm.set_value('phone_number', reference_doc.driver_contact);
            }

            //If driving licence is not entered
            if (!frm.doc.driving_licence_no) {
                frm.set_value('driving_licence_no', reference_doc.driver_licence);
            }


            //Temp solution for import reference files
            var is_import = false;
            var import_reference = null;
            // frappe.model.with_doc('Files', reference_doc.file_number, function(){
            // 	var reference_file = frappe.get_doc('Files', reference_doc.file_number);
            // 	if (reference_file.requested_service == 'Importation-Transit' || reference_file.requested_service == 'Importation-Local'){
            // 		is_import = true;
            // 		import_reference = reference_file.import_reference;
            // 	}
            // })

            //Customer & cargo details from import module
            if (is_import) {
                frm.set_value('main_cargo_type', 'Container');
                frappe.model.with_doc('Import', import_reference, function () {
                    var reference_parent = frappe.get_doc(reference_doc.parenttype, reference_doc.parent);
                    //Set the global variables
                    main_parenttype = "Import";
                    main_parent_frm = reference_parent;

                    frm.set_value('main_customer', reference_parent.customer);
                    frm.set_value('main_consignee', reference_parent.consignee);
                    frm.set_value('main_shipper', reference_parent.shipper);
                    frm.set_value("main_shipment_ref_no", reference_parent.bl_number);
                    frm.set_value("main_special_instructions_transporter", reference_parent.special_instructions_to_transporter);

                    //Set the file number manually
                    frm.set_value('main_file_number', reference_parent.reference_file_number);

                    //Cargo Location, destination
                    frm.set_value('main_cargo_location_country', 'Tanzania');
                    frm.set_value('main_cargo_location_city', reference_parent.port_of_discharge);
                    frm.set_value('main_cargo_destination_country', reference_parent.cargo_destination_country);
                    frm.set_value('main_cargo_destination_city', reference_parent.cargo_destination_city);
                    if (!reference_parent.icd) {
                        frm.set_value('main_loading_point', reference_parent.terminal);
                    } else {
                        frm.set_value('main_loading_point', reference_parent.icd);
                    }
                    frm.set_value('main_offloading_point', reference_parent.cargo_destination);

                    //Load border clearing agents
                    frm.set_value('main_border1_clearing', reference_parent.clearing_agent_border_1);
                    frm.set_value('main_border2_clearing', reference_parent.clearing_agent_border_2);
                    frm.set_value('main_border3_clearing', reference_parent.clearing_agent_border_3);

                    //Load cargo Information
                    frm.set_value('main_cargo_category', reference_parent.cargo);
                    frm.set_value('main_goods_description', reference_parent.cargo_description);
                    reference_parent.cargo_information.forEach(function (row) {
                        if (row.name == reference_doc.cargo) {
                            var new_row = null;
                            //If there is already cargo data, update it, else insert new row
                            if (frm.doc.main_cargo.length > 0) {
                                new_row = frm.doc.main_cargo[0];
                            } else {
                                new_row = frm.add_child('main_cargo');
                            }
                            new_row.container_number = row.container_number;
                            new_row.container_size = row.container_size;
                            new_row.seal_number = row.seal_number;
                            new_row.cargo_status = row.cargo_status;
                            new_row.no_of_packages = row.no_of_packages;
                            new_row.goods_description = row.goods_description;
                            new_row.gross_weight = row.gross_weight;
                            new_row.net_weight = row.net_weight;
                            new_row.tare_weight = row.tare_weight;
                            frm.refresh_field('main_cargo');
                        }
                    });
                });

            } else if (reference_doc.parenttype == "Export") //Customer & cargo details from export
            {
                frappe.model.with_doc(reference_doc.parenttype, reference_doc.parent, function () {
                    var reference_parent = frappe.get_doc(reference_doc.parenttype, reference_doc.parent);
                    //Set the global variables
                    main_parenttype = "Export";
                    main_parent_frm = reference_parent;

                    frm.set_value('main_customer', reference_parent.client);
                });
            } else if (reference_doc.parenttype == "Transport Request") //Customer & cargo details from transport request
            {
                frappe.model.with_doc(reference_doc.parenttype, reference_doc.parent, function () {
                    var reference_parent = frappe.get_doc(reference_doc.parenttype, reference_doc.parent);
                    //Set the global variables
                    main_parenttype = "Transport Request";
                    main_parent_frm = reference_parent;

                    frm.set_value('main_customer', reference_parent.customer);
                    if (reference_parent.consignee) {
                        frm.set_value('main_consignee', reference_parent.consignee);
                    }
                    if (reference_parent.shipper) {
                        frm.set_value('main_shipper', reference_parent.shipper);
                    }
                    frm.set_value("main_shipment_ref_no", reference_parent.file_number);


                    frm.set_value('main_cargo_type', reference_parent.cargo_type);
                    frm.set_value('main_cargo_category', reference_parent.goods_description);
                    frm.set_value('main_goods_description', reference_parent.cargo_description);
                    frm.set_value("main_special_instructions_transporter", reference_parent.special_instructions_to_transporter);

                    //Cargo Location, destination and route
                    frm.set_value('main_cargo_location_country', reference_parent.cargo_location_country);
                    frm.set_value('main_cargo_location_city', reference_parent.cargo_location_city);
                    frm.set_value('main_cargo_destination_country', reference_parent.cargo_destination_country);
                    frm.set_value('main_cargo_destination_city', reference_parent.cargo_destination_city);

                    //Load border clearing agents
                    frm.set_value('main_border1_clearing', reference_parent.border1_clearing_agent);
                    frm.set_value('main_border2_clearing', reference_parent.border2_clearing_agent);
                    frm.set_value('main_border3_clearing', reference_parent.border3_clearing_agent);


                    if (reference_parent.cargo_type == "Container") {
                        reference_parent.cargo.forEach(function (row) {
                            if (row.container_number == reference_doc.container_number) {
                                var new_row = null;
                                //If there is already cargo data, update it, else insert new row
                                if (frm.doc.main_cargo.length > 0) {
                                    new_row = frm.doc.main_cargo[0];
                                } else {
                                    new_row = frm.add_child('main_cargo');
                                }
                                new_row.container_number = row.container_number;
                                new_row.container_size = row.container_size;
                                new_row.seal_number = row.seal_number;
                                new_row.cargo_status = row.cargo_status;
                                new_row.no_of_packages = row.no_of_packages;
                                new_row.goods_description = row.goods_description;
                                new_row.gross_weight = row.gross_weight;
                                new_row.net_weight = row.net_weight;
                                new_row.tare_weight = row.tare_weight;
                                frm.refresh_field('main_cargo');
                            }
                        });
                    } else {
                        frm.set_value('main_amount', reference_doc.amount);
                        frm.set_value('main_unit', reference_doc.units);
                    }
                });
            }

            //For route steps
            if (frm.doc.main_route && frm.doc.main_route_steps.length == 0) {
                frm.events.load_route_details(frm);
            }
        });

        /*
         * 
         * For return trip
         * 
         */
        if (frm.doc.return_reference_doctype && frm.doc.return_reference_docname) {
            frappe.model.with_doc(frm.doc.return_reference_doctype, frm.doc.return_reference_docname, function () {
                var reference_doc = frappe.get_doc(frm.doc.return_reference_doctype, frm.doc.return_reference_docname);
                console.log(reference_doc);

                //File number
                frm.set_value('return_file_number', reference_doc.file_number);

                //Return route
                frm.set_value('return_route', reference_doc.route);
                //Customer details from import module
                if (reference_doc.parenttype == "Import") {
                    frm.set_value('return_cargo_type', 'Container');
                    frappe.model.with_doc(reference_doc.parenttype, reference_doc.parent, function () {
                        var reference_parent = frappe.get_doc(reference_doc.parenttype, reference_doc.parent);
                        //Set the global variables
                        return_parenttype = "Import";
                        return_parent_frm = reference_parent;

                        frm.set_value('return_customer', reference_parent.customer);
                        frm.set_value('return_consignee', reference_parent.consignee);
                        frm.set_value('return_shipper', reference_parent.shipper);
                        frm.set_value("return_shipment_ref_no", reference_parent.bl_number);

                        //Set the file number manually
                        frm.set_value('return_file_number', reference_parent.file_number);

                        //Cargo Location, destination and route
                        frm.set_value('return_cargo_location_country', 'Tanzania');
                        frm.set_value('return_cargo_location_city', reference_parent.port_of_discharge);
                        frm.set_value('return_cargo_destination_country', reference_parent.cargo_destination_country);
                        frm.set_value('return_cargo_destination_city', reference_parent.cargo_destination_city);

                        if (!reference_parent.icd) {
                            frm.set_value('return_loading_point', reference_parent.terminal);
                        } else {
                            frm.set_value('return_loading_point', reference_parent.icd);
                        }
                        frm.set_value('return_offloading_point', reference_parent.cargo_destination);
                        frm.set_value('return_route', reference_doc.route);
                        frm.set_value("return_special_instructions_transporter", reference_parent.special_instructions_to_transporter);

                        //Load border clearing agents
                        frm.set_value('return_border1_clearing', reference_parent.clearing_agent_border_1);
                        frm.set_value('return_border2_clearing', reference_parent.clearing_agent_border_2);
                        frm.set_value('return_border3_clearing', reference_parent.clearing_agent_border_3);

                        //Load cargo Information
                        reference_parent.cargo_information.forEach(function (row) {
                            if (row.name == reference_doc.cargo) {
                                var new_row = null;
                                //If there is already cargo data, update it, else insert new row
                                if (frm.doc.return_cargo.length > 0) {
                                    new_row = frm.doc.return_cargo[0];
                                } else {
                                    new_row = frm.add_child('return_cargo');
                                }
                                new_row.container_number = row.container_number;
                                new_row.container_size = row.container_size;
                                new_row.seal_number = row.seal_number;
                                new_row.cargo_status = row.cargo_status;
                                new_row.no_of_packages = row.no_of_packages;
                                new_row.goods_description = row.goods_description;
                                new_row.gross_weight = row.gross_weight;
                                new_row.net_weight = row.net_weight;
                                new_row.tare_weight = row.tare_weight;
                                frm.refresh_field('return_cargo');
                            }
                        });
                    });

                } else if (reference_doc.parenttype == "Export") //Customer details from export
                {
                    frappe.model.with_doc(reference_doc.parenttype, reference_doc.parent, function () {
                        var reference_parent = frappe.get_doc(reference_doc.parenttype, reference_doc.parent);
                        //Set the global variables
                        return_parenttype = "Export";
                        return_parent_frm = reference_parent;

                        frm.set_value('return_customer', reference_parent.client);
                    });
                } else if (reference_doc.parenttype == "Transport Request") //Customer & cargo details from transport request
                {
                    frappe.model.with_doc(reference_doc.parenttype, reference_doc.parent, function () {
                        var reference_parent = frappe.get_doc(reference_doc.parenttype, reference_doc.parent);
                        //Set the global variables
                        return_parenttype = "Transport Request";
                        return_parent_frm = reference_parent;

                        frm.set_value('return_customer', reference_parent.customer);
                        if (reference_parent.consignee) {
                            frm.set_value('return_consignee', reference_parent.consignee);
                        }
                        if (reference_parent.shipper) {
                            frm.set_value('return_shipper', reference_parent.shipper);
                        }
                        frm.set_value("return_shipment_ref_no", reference_parent.file_number);

                        frm.set_value('return_cargo_type', reference_parent.cargo_type);
                        frm.set_value('return_cargo_category', reference_parent.goods_description);
                        frm.set_value('return_goods_description', reference_parent.cargo_description);
                        frm.set_value("return_special_instructions_transporter", reference_parent.special_instructions_to_transporter);

                        //Cargo Location, destination and route
                        frm.set_value('return_cargo_location_country', reference_parent.cargo_location_country);
                        frm.set_value('return_cargo_location_city', reference_parent.cargo_location_city);
                        frm.set_value('return_cargo_destination_country', reference_parent.cargo_destination_country);
                        frm.set_value('return_cargo_destination_city', reference_parent.cargo_destination_city);

                        //Load border clearing agents
                        frm.set_value('return_border1_clearing', reference_parent.border1_clearing_agent);
                        frm.set_value('return_border2_clearing', reference_parent.border2_clearing_agent);
                        frm.set_value('return_border3_clearing', reference_parent.border3_clearing_agent);


                        if (reference_parent.cargo_type == "Container") {
                            reference_parent.cargo.forEach(function (row) {
                                if (row.container_number == reference_doc.container_number) {
                                    var new_row = null;
                                    //If there is already cargo data, update it, else insert new row
                                    if (frm.doc.main_cargo.length > 0) {
                                        new_row = frm.doc.main_cargo[0];
                                    } else {
                                        new_row = frm.add_child('return_cargo');
                                    }
                                    new_row.container_number = row.container_number;
                                    new_row.container_size = row.container_size;
                                    new_row.seal_number = row.seal_number;
                                    new_row.cargo_status = row.cargo_status;
                                    new_row.no_of_packages = row.no_of_packages;
                                    new_row.goods_description = row.goods_description;
                                    new_row.gross_weight = row.gross_weight;
                                    new_row.net_weight = row.net_weight;
                                    new_row.tare_weight = row.tare_weight;
                                    frm.refresh_field('return_cargo');
                                }
                            });
                        } else {
                            frm.set_value('return_amount', reference_doc.amount);
                            frm.set_value('return_unit', reference_doc.units);
                        }
                    });
                }

                //For route steps
                if (frm.doc.return_route && frm.doc.return_route_steps.length == 0) {
                    frm.events.load_return_route_steps(frm);
                }
            });
        }

        //Main loading date for GPS update
        if (frm.doc.main_route_steps && frm.doc.main_route_steps.length > 0) {
            frm.doc.main_route_steps.forEach(function (row) {
                if (row.location_type.toUpperCase() == 'LOADING POINT') {
                    main_loading_date = locals['Route Steps'][row.name].loading_date;
                }
            });
        }

        //Return loading date for GPS update
        if (frm.doc.return_route_steps && frm.doc.return_route_steps.length > 0) {
            frm.doc.return_route_steps.forEach(function (row) {
                if (row.location_type.toUpperCase() == 'LOADING POINT') {
                    return_loading_date = locals['Route Steps'][row.name].loading_date;
                }
            });
        }


        first_reload = false;

        frappe.after_ajax(function () {
            frm.events.render_address_and_contact(frm);
            frm.save_or_update();
        });
    },

    reduce_stock: function (frm) {
        if (frm.doc.stock_out_entry) return;
        frappe.call({
            method: "vsd_fleet_ms.vsd_fleet_ms.doctype.vehicle_trips.vehicle_trips.create_stock_out_entry",
            args: {
                doc: frm.doc,
                fuel_stock_out: frm.doc.fuel_stock_out
            },
            callback: function (data) {
                frappe.set_route('Form', data.message.doctype, data.message.name);
            }
        });
    },



    open_close_buttons: function (frm) {
        if (frm.doc.status == "Main Trip Offloaded" || frm.doc.status == "Return Trip Offloaded") {
            frm.add_custom_button(__("Close"), function () {
                if (frm.events.validate_close(frm)) {
                    frm.set_value("status", "Closed");
                    frm.save();
                }
            }, "fa fa-check", "btn-success");
        }
        /*if (!frm.doc.__islocal) {
            //if(frm.doc.status=="Open") {
                frm.add_custom_button(__("Close"), function() {
                    if(frm.events.validate_close(frm))
                    {
                        frm.set_value("status", "Closed");
                        frm.save();
                    }
                }, "fa fa-check", "btn-success");

            */
        /*	//Cancel Button
                        frm.add_custom_button(__("Cancel Export"), function() {
                            frm.set_value("status", "Cancelled");
                            frm.save();
                            frm.events.booking_cancellation(frm);
                            //frm.refresh_fields();
                            console.log("its cancelled");
                        }, "fa fa-check", "btn-success");*/
        /*
                //}
                    */
        /* else {
                        frm.add_custom_button(__("Re-open"), function() {
                            frm.set_value("status", "Open");

                           // clear table  for container
                           // frm.clear_table("cargo_information");
                           // frm.refresh_fields('cargo_information');

                            frm.save();

                        }, null, "btn-default");
                    }*/
        /*
                }*/
    },


    refresh: function (frm) {
        frappe.db.get_single_value('Transport Settings', 'fuel_item_group')
            .then(fuel_item_group => {
                frm.set_query('item_code', 'main_fuel_request', () => {
                    return {
                        filters: {
                            item_group: fuel_item_group
                        }
                    };
                });
            });
        //Show or hide return trip section
        frm.events.show_hide_sections(frm);

        //close trip
        frm.events.open_close_buttons(frm);



        //call function for return or main trip offloaded
        if (cur_frm.doc.status == "Main Trip Offloaded" || cur_frm.doc.status == "Return Trip Offloaded") {
            cur_frm.add_custom_button(__('Vehicle Inspection'), function () {
                frm.events.make_vehicle_inspection(frm);
            }, __("Make"));
        }

        //Button for cancelling return trip
        if (frm.doc.return_reference_doctype && frm.doc.return_reference_docname) {
            frm.add_custom_button(__("Cancel Return Trip"), function () {
                frm.events.cancel_return_trip(frm);
            });
        }

        // frm.events.location_buttons(frm);

        //Check if there are unsent fund requests
        // frm.events.new_fund_request(frm);
        frappe.after_ajax(function () {
            console.log(cur_frm);
        });


        frm.add_custom_button(__("Vehicle Inspection"), function () {
            frappe.new_doc('Truck Inspection', { trip_reference: frm.doc.name });
        });

        if (frm.doc.trip_completed == 0) {
            frm.add_custom_button(__("Complete Trip"), function () {
                frm.set_value("trip_completed", 1);
                frm.save();
                if (frm.doc.transporter_type == "In House") {
                    frappe.db.set_value('Truck', frm.doc.vehicle, {
                        current_trip: '',
                        status: 'Available'
                    }).then(r => {
                        frappe.msgprint(__(`Vehicle ${frm.doc.vehicle} is Available now`));
                    });
                }
            });
        }
    },

    show_hide_sections: function (frm) {
        frm.toggle_display(['section_return_trip', 'section_return_details', 'section_return_cargo', 'section_return_details', 'section_return_route'], (frm.doc.return_reference_doctype && frm.doc.return_reference_docname));
        frm.toggle_display(['section_return_delivery_note_information', 'section_return_requested_funds', 'section_return_expenses', 'section_return_fuel_request'], (frm.doc.return_reference_doctype && frm.doc.return_reference_docname));
        frm.toggle_display('section_main_expenses', (frm.doc.main_requested_funds && frm.doc.main_requested_funds.length > 0));
        frm.toggle_display('section_return_expenses', (frm.doc.return_requested_funds && frm.doc.return_requested_funds.length > 0));
        frm.toggle_display(['main_amount', 'main_unit', 'main_loose_no_of_packages', 'main_loose_gross_weight', 'main_loose_net_weight'], ('Loose Cargo' == frm.doc.main_cargo_type));
        frm.toggle_display('section_main_container_cargo', ('Container' == frm.doc.main_cargo_type));
        frm.toggle_display(['return_amount', 'return_unit', 'return_loose_no_of_packages', 'return_loose_gross_weight', 'return_loose_net_weight'], ('Loose Cargo' == frm.doc.return_cargo_type));
        frm.toggle_display('section_return_cargo', ('Container' == frm.doc.return_cargo_type));
    },

    validate_close: function (frm) {
        var excluded_fields = ['return_requested_funds', 'main_requested_funds', 'attachments', 'main_reporting_status', 'subtrips', 'return_reporting_status', 'main_location_update', 'return_location_update', 'return_expenses', 'main_expenses', 'main_fuel_request', 'main_cargo', 'main_customer_address_html', 'main_shipper_address_html', 'main_consignee_address_html'];

        if (frm.doc.status == 'Main Trip Offloaded') {
            excluded_fields.push('return_cargo_type',
                'return_cargo_category',
                'return_goods_description',
                'return_amount', 'return_unit',
                'return_loose_no_of_packages',
                'return_loose_gross_weight',
                'return_loose_net_weight',
                'return_customer_address_html',
                'return_cargo', 'return_shipper',
                'return_shipper_address_html',
                'return_consignee',
                'return_consignee_address_html',
                'return_cargo_location_country',
                'return_trip_fuel_request',
                'return_start_date',
                'return_customer',
                'return_fuel_request',
                'return_route_steps');
        } else if (frm.doc.status == 'Return Trip Offloaded') {
            excluded_fields.push();
        }
        if (frm.doc.main_cargo_type && frm.doc.main_cargo_type == 'Container') {
            excluded_fields.push('main_amount', 'main_unit', 'main_loose_no_of_packages', 'main_loose_gross_weight', 'main_loose_net_weight');
        } else if (frm.doc.main_cargo_type && frm.doc.main_cargo_type == 'Loose Cargo') {
            //excluded_fields.push("");
        }
        if (frm.doc.transporter_type == 'Sub-Contractor') {
            excluded_fields.push('driver', 'trailer', 'vehicle');
        } else if (frm.doc.transporter_type == 'In House') {
            excluded_fields.push('passport_number');
        }

        var excluded_field_type = ["Table", "Section Break", "Column Break"];
        var error_fields = [];
        frm.meta.fields.forEach(function (field) {
            if (!(excluded_field_type.indexOf(field.fieldtype) > -1) && !(excluded_fields.indexOf(field.fieldname) > -1) && !(field.fieldname in frm.doc)) {
                error_fields.push(field.label);
                return false;
            }

            if (field.fieldtype == "Table" && !(excluded_fields.indexOf(field.fieldname) > -1) && frm.doc[field.fieldname].length == 0) {
                error_fields.push(field.label);
                return false;
            }
        });

        if (error_fields.length > 0) {
            var error_msg = "Mandatory fields required before closing <br><ul>";
            error_fields.forEach(function (error_field) {
                error_msg = error_msg + "<li>" + error_field + "</li>";
            });
            error_msg = error_msg + "</ul>";
            frappe.msgprint(error_msg, "Missing Fields");
            return false;
        } else {
            return true;
        }
    },





    show_on_map: function (frm) {
        if (frm.doc.main_location_update && frm.doc.main_location_update.length > 0) {
            frm.doc.main_location_update.forEach(function (row) {
                if (row.latitude && row.longitude) {
                    var html = '<a target="_blank" href="https://www.google.com/maps.google.com/?ll=' + row.latitude + ',' + row.longitude + '">View on Map</a>';
                    row.view_on_map = html;
                }
            });
        }
        frm.refresh_field('main_location_update');
    },

    render_address_and_contact: function (frm) {
        // render address
        if (frm.fields_dict['main_customer_address_html'] && frm.doc.__onload && "main_addr_list" in frm.doc.__onload) {
            $(frm.fields_dict['main_customer_address_html'].wrapper)
                .html(frappe.render_template("address_list",
                    cur_frm.doc.__onload.main_addr_list))
                .find(".btn-address").hide();

            //For delivery note printing
            if (frm.doc.__onload.main_addr_list.addr_list && frm.doc.__onload.main_addr_list.addr_list.length > 0) {
                frm.set_value('main_address_display', frm.doc.__onload.main_addr_list.addr_list[0].display);
            }
        }

        if (frm.fields_dict['main_consignee_address_html'] && frm.doc.__onload && "main_consignee_addr_list" in frm.doc.__onload) {

            $(frm.fields_dict['main_consignee_address_html'].wrapper)
                .html(frappe.render_template("address_list",
                    cur_frm.doc.__onload.main_consignee_addr_list))
                .find(".btn-address").hide();

            //For delivery note printing
            if (frm.doc.__onload.main_consignee_addr_list.addr_list && frm.doc.__onload.main_consignee_addr_list.addr_list.length > 0) {
                frm.set_value('main_consignee_display', frm.doc.__onload.main_consignee_addr_list.addr_list[0].display);
            }
        }

        if (frm.fields_dict['main_shipper_address_html'] && frm.doc.__onload && "main_shipper_addr_list" in frm.doc.__onload) {
            $(frm.fields_dict['main_shipper_address_html'].wrapper)
                .html(frappe.render_template("address_list",
                    cur_frm.doc.__onload.main_shipper_addr_list))
                .find(".btn-address").hide();

            //For delivery note printing
            if (frm.doc.__onload.main_shipper_addr_list.addr_list && frm.doc.__onload.main_shipper_addr_list.addr_list.length > 0) {
                frm.set_value('main_shipper_display', frm.doc.__onload.main_shipper_addr_list.addr_list[0].display);
            }
        }

        //For return
        if (frm.fields_dict['return_customer_address_html'] && frm.doc.__onload && "return_addr_list" in frm.doc.__onload) {
            $(frm.fields_dict['return_customer_address_html'].wrapper)
                .html(frappe.render_template("address_list",
                    cur_frm.doc.__onload.return_addr_list))
                .find(".btn-address").hide();

            //For delivery note printing
            frm.set_value('return_address_display', frm.doc.__onload.return_addr_list.addr_list[0].display);
        }

        if (frm.fields_dict['return_consignee_address_html'] && frm.doc.__onload && "return_consignee_addr_list" in frm.doc.__onload) {

            $(frm.fields_dict['return_consignee_address_html'].wrapper)
                .html(frappe.render_template("address_list",
                    cur_frm.doc.__onload.return_consignee_addr_list))
                .find(".btn-address").hide();

            //For delivery note printing
            if (frm.doc.__onload.return_consignee_addr_list.addr_list && frm.doc.__onload.return_consignee_addr_list.addr_list.length > 0) {
                frm.set_value('return_consignee_display', frm.doc.__onload.return_consignee_addr_list.addr_list[0].display);
            }
        }

        if (frm.fields_dict['return_shipper_address_html'] && frm.doc.__onload && "return_shipper_addr_list" in frm.doc.__onload) {
            $(frm.fields_dict['return_shipper_address_html'].wrapper)
                .html(frappe.render_template("address_list",
                    cur_frm.doc.__onload.return_shipper_addr_list))
                .find(".btn-address").hide();

            //For delivery note printing
            if (frm.doc.__onload.return_shipper_addr_list.addr_list && frm.doc.__onload.return_shipper_addr_list.addr_list.length > 0) {
                frm.set_value('return_shipper_display', frm.doc.__onload.return_shipper_addr_list.addr_list[0].display);
            }
        }
    },

    // location_test: function (frm) {
    //     frappe.call({
    //         method: 'vsd_fleet_ms.vsd_fleet_ms.gps_connector.get_last_location',
    //         callback: function (data) {
    //             console.log(data);
    //         }
    //     });
    // },

    cancel_return_trip: function (frm) {
        frappe.confirm(
            "Are you sure you want to cancel the return trip?",
            function () {
                //Check that there are no approved funds
                frm.doc.return_requested_funds.forEach(function (row) {
                    if (row.request_status == 'Approved') {
                        frappe.throw("Cannot cancel return trip with Approved funds.");
                    }
                });
                return_cancelled = frm.doc.return_reference_docname;
                frm.meta.fields.forEach(function (field) {
                    if (!(['Section', 'Column Break', 'Table'].indexOf(field.fieldtype) > -1) && field.fieldname.startsWith('return')) {
                        frm.set_value(field.fieldname, '');
                        if (frm.doc[field.fieldname]) {
                            delete frm.doc[field.fieldname];
                        }
                    } else if (field.fieldtype == 'Table') {
                        frm.clear_table(field.fieldtype && field.fieldname.startsWith('return'));
                    }
                });
                frm.set_value('status', 'Main Trip Offloaded');
                frm.set_value('hidden_status', 3);
                frappe.after_ajax(function () {
                    frm.save_or_update();
                });
            },
            function () {
                //If no
            }
        );
    },

    main_cargo_type: function (frm) {
        frm.events.show_hide_sections(frm);
        if (frm.main_cargo_type) {
            frm.events.load_permit_types(frm);
        }
    },


    main_route: function (frm) {
        if (frm.doc.main_route) {
            frm.events.load_route_details(frm);
        }
    },


    load_route_details: function (frm) {
        frappe.model.with_doc('Trip Routes', frm.doc.main_route, function (frm) {
            var reference_route = frappe.model.get_doc('Trip Routes', cur_frm.doc.main_route);
            cur_frm.clear_table('main_route_steps');
            reference_route.trip_steps.forEach(function (row) {
                var new_row = cur_frm.add_child('main_route_steps');
                new_row.location = row.location;
                new_row.distance = row.distance;
                new_row.fuel_consumption_qty = row.fuel_consumption_qty;
                new_row.location_type = row.location_type;
            });


            cur_frm.refresh_field('main_requested_funds');
            cur_frm.refresh_field('main_route_steps');
        });
    },

    load_return_route_steps: function (frm) {
        frappe.model.with_doc('Trip Routes', frm.doc.return_route, function (frm) {
            var reference_route = frappe.model.get_doc('Trip Routes', cur_frm.doc.return_route);
            cur_frm.clear_table('return_route_steps');
            reference_route.trip_steps.forEach(function (row) {
                var new_row = cur_frm.add_child('return_route_steps');
                new_row.location = row.location;
                new_row.location_type = row.location_type;
            });
            cur_frm.refresh_field('return_route_steps');
        });
    },

    load_permit_types: function (frm) {
        frappe.model.with_doc('Cargo Types', frm.doc.main_cargo_type, function (frm) {
            var reference_permits = frappe.model.get_doc('Trip Routes', cur_frm.doc.main_cargo_type);
            cur_frm.clear_table('trip_permits');
            reference_permits.permits.forEach(function (row) {
                var new_row = cur_frm.add_child('trip_permits');
                new_row.permit_name = row.permit_name;
                new_row.mandatory = row.mandatory;
            });
            cur_frm.refresh_field('trip_permits');
        });
    },

    route_steps_options: function (frm, cdt, cdn) {
        //Processed row
        var row = frm.fields_dict['main_route_steps'].grid.grid_rows_by_docname[cdn];
        if (!row) //If its return route table
        {
            row = frm.fields_dict['return_route_steps'].grid.grid_rows_by_docname[cdn];
        }


        //Get trip locations type options
        frappe.model.with_doc('Trip Locations Type', row.doc.location_type, function (frm) {
            var reference = frappe.model.get_doc('Trip Locations Type', row.doc.location_type);
            row.toggle_display("border_details", row.doc.location_type == 'Border');
            row.toggle_editable('arrival_date', true);
            row.toggle_editable('departure_date', (reference.departure_date == 1));
            row.toggle_editable('loading_date', (reference.loading_date == 1));
            row.toggle_editable('offloading_date', (reference.offloading_date == 1));
            row.toggle_editable('border_details', (reference.border_details == 1));

            row.refresh();
        });
    },

    //Load delivery note template
    load_delivery_note_template: function (frm) {
        frappe.call({
            method: 'frappe.client.get_value',
            args: {
                'doctype': 'Delivery Note Template',
                'filters': {
                    'name': 'Delivery Note Template'
                },
                'fieldname': ['delivery_note_design']
            },
            callback: function (data) {
                frm.doc.delivery_note_template = data.message.delivery_note_design;
            }
        });
    },

    //For requesting funds	
    // new_fund_request: function (frm) {
    //     //For main trip
    //     var new_main_request = false;
    //     if (frm.doc.main_requested_funds && frm.doc.main_requested_funds.length > 0) {
    //         frm.doc.main_requested_funds.forEach(function (row) {
    //             if (row.request_status == "open" || (row.request_status == "Pre-Approved" && row.request_hidden_status != 'Sent')) {
    //                 new_main_request = true;
    //             }
    //         });
    //         if (new_main_request == true) {
    //             console.log(frm.doc);
    //             frappe.call({
    //                 method: "vsd_fleet_ms.vsd_fleet_ms.doctype.requested_payments.requested_payments.request_funds",
    //                 args: {
    //                     reference_doctype: "Vehicle Trip",
    //                     reference_docname: frm.doc.name,
    //                     company: frm.doc.company,
    //                     customer: frm.doc.customer,
    //                     vehicle_no: frm.doc.vehicle,
    //                     driver: frm.doc.driver,
    //                     trip_route: frm.doc.main_route
    //                 },
    //                 callback: function (data) {
    //                     console.log(data);
    //                     first_reload = false;
    //                     //frm.reload_doc();
    //                 }
    //             });
    //         }
    //     }

    // },

    after_save: function (frm) {
        var to_save = false;
        var vehicle_status = null;
        var vehicle_hidden_status = null;
        var offloaded = false;
        first_reload = false;
        //If return trip has been cancelled
        if (return_cancelled) {
            frappe.call({
                method: 'vsd_fleet_ms.vsd_fleet_ms.doctype.transport_assignment.transport_assignment.change_assignment_status',
                args: {
                    assignment_docname: return_cancelled
                },
                freeze: true,
                callback: function (data) {
                    console.log('Assignemnt Cancelled');
                }
            });
        }

        //Check if main trip offloaded
        if (frm.doc.main_route_steps && frm.doc.main_route_steps.length > 0) {
            frm.doc.main_route_steps.forEach(function (row) {
                if (row.offloading_date != null && cur_frm.doc.hidden_status != null && cur_frm.doc.hidden_status < 3) //Status above 3 means either offloaded or on return trip
                {
                    //add here 
                    offloaded = true;
                    cur_frm.set_value('hidden_status', 3);
                    cur_frm.set_value('status', 'Main Trip Offloaded');
                    vehicle_status = 'En Route';
                    vehicle_hidden_status = 3;
                    to_save = true;
                    console.log(frm);
                }
            });
        }

        if (to_save) {
            //Update vehicle status if is not subcontractor vehicle
            if (['Sub-Contractor', 'In House'].indexOf(frm.doc.transporter_type) == -1) {
                frappe.call({
                    method: 'vsd_fleet_ms.vsd_fleet_ms.doctype.vehicle.vehicle.change_status',
                    args: {
                        'vehicle': cur_frm.doc.vehicle,
                        'status': vehicle_status,
                        'hiden_status': vehicle_hidden_status
                    },
                    callback: function (data) {
                        console.log(data.message);
                    }
                });
            }

            //Save document
            frappe.after_ajax(function () {
                frm.save_or_update();
            });
        }

        //Check if main loading date changed
        // if (['Sub-Contractor', 'Self Drive'].indexOf(frm.doc.transporter_type) == -1 && (frm.doc.main_route_steps && frm.doc.main_route_steps.length > 0)) {
        //     frm.doc.main_route_steps.forEach(function (row) {
        //         if (row.location_type.toUpperCase() == 'LOADING POINT' && locals['Route Steps Table'][row.name].loading_date != main_loading_date) {
        //             frappe.call({
        //                 "method": "vsd_fleet_ms.vsd_fleet_ms.gps_connector.load_cargo",
        //                 "args": {
        //                     'vehicle_plate_number': frm.doc.vehicle_plate_number,
        //                     'loading_date': locals['Route Steps Table'][row.name].loading_date,
        //                     'cargo': frm.doc.main_goods_description,
        //                     'destination': frm.doc.main_cargo_destination_city
        //                 },
        //                 "freeze": true,
        //                 "freeze_message": "Updating GPS Data",
        //                 "callback": function (data) {
        //                     console.log(data);
        //                 }
        //             });
        //         }
        //     });
        // }

        //Check if return loading date changed
        // if (['Sub-Contractor', 'Self Drive'].indexOf(frm.doc.transporter_type) == -1 && (frm.doc.return_route_steps && frm.doc.return_route_steps.length > 0)) {
        //     frm.doc.return_route_steps.forEach(function (row) {
        //         if (row.location_type.toUpperCase() == 'LOADING POINT' && locals['Route Steps Table'][row.name].loading_date != return_loading_date) {
        //             frappe.call({
        //                 "method": "vsd_fleet_ms.vsd_fleet_ms.gps_connector.load_cargo",
        //                 "args": {
        //                     'vehicle_plate_number': frm.doc.vehicle_plate_number,
        //                     'loading_date': locals['Route Steps Table'][row.name].loading_date,
        //                     'cargo': frm.doc.return_goods_description,
        //                     'destination': frm.doc.return_cargo_destination_city
        //                 },
        //                 "freeze": true,
        //                 "freeze_message": "Updating GPS Data",
        //                 "callback": function (data) {
        //                     console.log(data);
        //                 }
        //             });
        //         }
        //     });
        // }

        //Offload in GTT
        // if (offloaded && ['Sub-Contractor', 'Self Drive'].indexOf(frm.doc.transporter_type) == -1) {
        //     frappe.call({
        //         "method": "vsd_fleet_ms.vsd_fleet_ms.gps_connector.offload_cargo",
        //         "args": {
        //             'vehicle_plate_number': frm.doc.vehicle_plate_number
        //         },
        //         "freeze": true,
        //         "freeze_message": "Updating GPS Data",
        //         "callback": function (data) {
        //             console.log(data);
        //         }
        //     });
        // }
    },

    // location_buttons: function (frm) {
    //     if (frm.doc.vehicle_plate_number && frm.doc.transporter_type != 'Sub-Contractor' && frm.doc.status == 'En Route') {
    //         frm.fields_dict['main_location_update'].grid.add_custom_button('Get Latest Location', function () {
    //             frappe.call({
    //                 "method": "vsd_fleet_ms.vsd_fleet_ms.gps_connector.get_last_location",
    //                 "args": {
    //                     'vehicle_plate_no': frm.doc.vehicle_plate_number
    //                 },
    //                 "freeze": true,
    //                 "callback": function (data) {
    //                     console.log(data);
    //                     if (data.message) {
    //                         frappe.msgprint(data.message);
    //                     }
    //                 }
    //             });
    //         });
    //     } else if (frm.doc.vehicle_plate_number && frm.doc.transporter_type != 'Sub-Contractor' && frm.doc.status == 'En Route Returning') {
    //         frm.fields_dict['return_location_update'].grid.add_custom_button('Get Latest Location', function () {
    //             frappe.call({
    //                 "method": "vsd_fleet_ms.vsd_fleet_ms.gps_connector.get_last_location",
    //                 "args": {
    //                     'vehicle_plate_no': frm.doc.vehicle_plate_number
    //                 },
    //                 "freeze": true,
    //                 "callback": function (data) {
    //                     console.log(data);
    //                     if (data.message) {
    //                         frappe.msgprint(data.message);
    //                     }
    //                 }
    //             });
    //         });
    //     }
    // },
    //Product Inspection function
    make_vehicle_inspection: function () {
        frappe.model.open_mapped_doc({
            method: "vsd_fleet_ms.vsd_fleet_ms.doctype.vehicle_trips.vehicle_trips.make_vehicle_inspection",
            frm: cur_frm
        });

    },
});

frappe.ui.form.on('Route Steps', {
    form_render: function (frm, cdt, cdn) {
        frm.events.route_steps_options(frm, cdt, cdn);
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

frappe.ui.form.on('Fuel Requests Table', {
    cost_per_litre: function (frm, cdt, cdn) {
        if (locals[cdt][cdn].cost_per_litre && locals[cdt][cdn].quantity) {
            var total = locals[cdt][cdn].cost_per_litre * locals[cdt][cdn].quantity;
            frappe.model.set_value(cdt, cdn, 'total_cost', total);
        }
    },

    create_purchase_order: (frm, cdt, cdn) => {
        const row = locals[cdt][cdn];
        if (row.purchase_order || row.status != "Approved") return;
        console.info("frm", frm);
        frappe.call({
            method: "vsd_fleet_ms.vsd_fleet_ms.doctype.vehicle_trips.vehicle_trips.create_purchase_order",
            args: {
                request_doc: frm.doc,
                item: row,
            },
            callback: function (r) {
                frm.reload_doc();
                frm.refresh_field("requested_fuel");
            }
        });
    },


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
            method: "vsd_fleet_ms.vsd_fleet_ms.doctype.vehicle_trips.vehicle_trips.create_fund_jl",
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
