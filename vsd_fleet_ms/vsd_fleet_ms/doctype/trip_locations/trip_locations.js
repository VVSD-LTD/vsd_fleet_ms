// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Trip Locations', {
	// refresh: function(frm) {

	// }
    latitude(frm) {
		geolocation(frm);
    },
    longitude(frm) {
		geolocation(frm);
    },
    onload_post_render(frm) {
		geolocation(frm);
    }

});
function geolocation(frm){
    if (frm.doc.latitude == 0 && frm.doc.longitude == 0) {
        frm.fields_dict.location_latitude_longitude.map.setView([frm.doc.latitude, frm.doc.longitude], 13);
    }
    else {
        frm.doc.latitude = frm.fields_dict.location_latitude_longitude.map.getCenter()['lat'];
        frm.doc.longitude = frm.fields_dict.location_latitude_longitude.map.getCenter()['lng'];
    }
}
