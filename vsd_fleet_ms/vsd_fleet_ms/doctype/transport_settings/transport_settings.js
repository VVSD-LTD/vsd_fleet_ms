// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Transport Settings', {
	// refresh: function(frm) {

	// }
	onload: function (frm) {
		frm.set_query("expense_account_group", function () {
			return {
				"filters": {
					"root_type": "Expense",
					"is_group": 1
				}
			};
		});
		frm.set_query("vehicle_fuel_parent_warehouse", function () {
			return {
				"filters": {
					"is_group": 1
				}
			};
		});
		frm.set_query("cash_or_bank_account_group", function () {
			return {
				"filters": {
					"root_type": "Asset",
					"is_group": 1
				}
			};
		});
	},
});
