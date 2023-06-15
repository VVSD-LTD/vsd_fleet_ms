// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Fuel Requests', {
    onload: function (frm) {
        //Load the approve and reject buttons
        var html = '<button style="background-color: green; color: #FFF;" class="btn btn-default btn-xs" onclick="cur_frm.cscript.approve_request(\'' + frm + '\');">Approve</button> ';
        html += '<button style="background-color: red; color: #FFF;" class="btn btn-default btn-xs" onclick="cur_frm.cscript.reject_request(\'' + frm + '\');">Reject</button>';
        $(frm.fields_dict.approve_buttons.wrapper).html(html);

    },

    refresh: function (frm, cdt, cdn) {
        frm.events.show_hide_sections(frm);

        // Hide delete buttons for Requested fuel Child Doctype
        $('*[data-fieldname="requested_fuel"]').find('.grid-remove-rows').hide();
        $('*[data-fieldname="requested_fuel"]').find('.grid-remove-all-rows').hide();
        $('*[data-fieldname="requested_fuel"]').find('.grid-add-row').hide();

        // if (cur_frm.doc.status === "Fully Processed") {
        //     frappe.msgprint(locals[cdt][cdn].status);
        //     var row = frm.fields_dict['approved_requests'].grid.grid_rows_by_docname[cdn];

        //     if (row.doc.status == "Approved") {

        //         cur_frm.add_custom_button(__('Purchase Order'), function () {
        //             frm.events.make_purchase_order(frm);
        //         }, __("Make"));
        //         cur_frm.add_custom_button(__('Issue Fuel'), function () {
        //             frm.events.make_stock_entry(frm);
        //         }, __("Make"));
        //     }
        // }
    },

    show_hide_sections: function (frm) {
        frm.toggle_display(['approve_buttons', 'section_requested_fuel'], (frm.doc.requested_fuel.length > 0));
    },

    show_hide_request_fields: function (frm, cdt, cdn) {
        var row = frm.fields_dict['approved_requests'].grid.grid_rows_by_docname[cdn];
        if (row.doc.status == "Approved") {
            row.toggle_editable('disburcement_type', (row.doc.receipt_date == null));
            row.toggle_editable('supplier', (row.doc.receipt_date == null && row.doc.disburcement_type == "From Supplier"));
            row.toggle_editable('receipt_date', ((row.doc.disburcement_type == "From Supplier" && row.doc.supplier) || (row.doc.disburcement_type == "Cash")));
            row.toggle_editable('receipt_time', ((row.doc.disburcement_type == "From Supplier" && row.doc.supplier) || (row.doc.disburcement_type == "Cash")));
        }
    },
    make_purchase_order: function (frm) {
        frappe.model.open_mapped_doc({
            method: "vsd_fleet_ms.vsd_fleet_ms.doctype.fuel_requests.fuel_requests.make_purchase_order",
            frm: cur_frm
        });
    },
    make_stock_entry: function (frm) {
        frappe.model.open_mapped_doc({
            method: "vsd_fleet_ms.vsd_fleet_ms.doctype.fuel_requests.fuel_requests.make_stock_entry",
            frm: cur_frm
        });
    },
});



frappe.ui.form.on('Fuel Requests Table', {

    form_render(frm, cdt, cdn) {
        frm.fields_dict.requested_fuel.grid.wrapper.find('.grid-delete-row').hide();
        frm.fields_dict.requested_fuel.grid.wrapper.find('.grid-duplicate-row').hide();
        frm.fields_dict.requested_fuel.grid.wrapper.find('.grid-move-row').hide();
        frm.fields_dict.requested_fuel.grid.wrapper.find('.grid-append-row').hide();
        frm.fields_dict.requested_fuel.grid.wrapper.find('.grid-insert-row-below').hide();
        frm.fields_dict.requested_fuel.grid.wrapper.find('.grid-insert-row').hide();
    }
});


//For approve button
cur_frm.cscript.approve_request = function (frm) {
    var selected = cur_frm.get_selected();
    if (selected['requested_fuel']) {
        frappe.confirm(
            'Confirm: Approve selected requests?',
            function () {
                $.each(selected['requested_fuel'], function (index, value) {
                    frappe.call({
                        method: "vsd_fleet_ms.vsd_fleet_ms.doctype.fuel_requests.fuel_requests.approve_request",
                        freeze: true,
                        args: {
                            request_doctype: "Fuel Requests Table",
                            request_docname: value,
                            user: frappe.user.full_name()
                        },
                        callback: function (data) {
                            //alert(JSON.stringify(data));
                        }
                    });
                });
                frappe.call({
                    method: "vsd_fleet_ms.vsd_fleet_ms.doctype.fuel_requests.fuel_requests.set_status",
                    freeze: true,
                    args: {
                        request_doctype: "Fuel Requests Table",
                    },
                    callback: function (data) {
                        //alert(JSON.stringify(data));
                    }
                });
                location.reload();
            },
            function () {
                //Do nothing
            }
        );
    } else {
        show_alert("Error: Please select requests to process.");
    }
};

//For reject button
cur_frm.cscript.reject_request = function (frm) {
    //cur_frm.cscript.populate_child(cur_frm.doc.reference_doctype, cur_frm.doc.reference_docname);
    var selected = cur_frm.get_selected();
    if (selected['requested_fuel']) {
        frappe.confirm(
            'Confirm: Reject selected requests?',
            function () {
                $.each(selected['requested_fuel'], function (index, value) {
                    frappe.call({
                        method: "vsd_fleet_ms.vsd_fleet_ms.doctype.fuel_requests.fuel_requests.reject_request",
                        freeze: true,
                        args: {
                            request_doctype: "Fuel Requests Table",
                            request_docname: value,
                            user: frappe.user.full_name()
                        },
                        callback: function (data) {
                            //alert(JSON.stringify(data));
                        }
                    });
                });
                frappe.call({
                    method: "vsd_fleet_ms.vsd_fleet_ms.doctype.fuel_requests.fuel_requests.set_status",
                    freeze: true,
                    args: {
                        request_doctype: "Fuel Requests Table",
                    },
                    callback: function (data) {
                        //alert(JSON.stringify(data));
                    }
                });
                location.reload();
            },
            function () {
                //Do nothing
            }
        );
    } else {
        show_alert("Error: Please select requests to process.");
    }
};

