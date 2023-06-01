// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Manifest', {
	// refresh: function(frm) {

	// }
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
					status: "Available",
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
		// 				status:"Available"
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
	setup: function(frm){
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
	});
	},
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
