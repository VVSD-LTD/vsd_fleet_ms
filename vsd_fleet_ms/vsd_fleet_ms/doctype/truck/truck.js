// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Truck', {
	// refresh: function(frm) {

	// }
	onload: function (frm) {
		// Select the element with data-fieldname="disabled"
		const element = document.querySelector('[data-fieldname="disabled"]');

		// Set its style color to red
		element.style.color = "red";

		frappe.db.get_single_value("Transport Settings", "vehicle_fuel_parent_warehouse")
		.then(function(value) {
			var default_parent_warehouse = value;

			frm.set_query("trans_ms_fuel_warehouse", function () {
				return {
					"filters": {
						"parent_warehouse": default_parent_warehouse
					}
				};
			});
		})
	},
	trans_ms_maintain_stock: (frm) => {
		frm.doc.trans_ms_fuel_warehouse = "";

	}
});
