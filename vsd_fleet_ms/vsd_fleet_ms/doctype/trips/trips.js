// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Trips', {
	refresh: function(frm) {
		if (frm.doc.route && frm.doc.main_route_steps.length < 1 && frm.doc.docstatus == 0){
			frappe.model.with_doc('Trip Routes', frm.doc.route, function (frm) {
				var reference_route = frappe.model.get_doc('Trip Routes', cur_frm.doc.route);
				cur_frm.clear_table('main_route_steps');
				reference_route.trip_steps.forEach(function (row) {
					var new_row = cur_frm.add_child('main_route_steps');
					new_row.location = row.location;
					new_row.distance = row.distance;
					new_row.fuel_consumption_qty = row.fuel_consumption_qty;
					new_row.location_type = row.location_type;
				});
				
				cur_frm.refresh_field('main_route_steps');
				cur_frm.dirty();
				cur_frm.save();
			});
		}
	},
	route: function(frm) {
			frappe.model.with_doc('Trip Routes', frm.doc.route, function (frm) {
				var reference_route = frappe.model.get_doc('Trip Routes', cur_frm.doc.route);
				cur_frm.clear_table('main_route_steps');
				reference_route.trip_steps.forEach(function (row) {
					var new_row = cur_frm.add_child('main_route_steps');
					new_row.location = row.location;
					new_row.distance = row.distance;
					new_row.fuel_consumption_qty = row.fuel_consumption_qty;
					new_row.location_type = row.location_type;
				});
				
				cur_frm.refresh_field('main_route_steps');
			});
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
