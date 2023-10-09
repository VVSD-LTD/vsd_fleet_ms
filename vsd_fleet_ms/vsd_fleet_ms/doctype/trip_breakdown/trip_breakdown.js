// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Trip Breakdown', {
	refresh: function(frm){
		if(!frm.doc.resumption_trip){
			frm.add_custom_button(__('Resume Trip'), function() {
					frappe.call({
						method: 'vsd_fleet_ms.vsd_fleet_ms.doctype.trip_breakdown.trip_breakdown.create_resumption_trip',
						args: {
							"docname": frm.doc.name,
							"trip":frm.doc.trip
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
	}
});
