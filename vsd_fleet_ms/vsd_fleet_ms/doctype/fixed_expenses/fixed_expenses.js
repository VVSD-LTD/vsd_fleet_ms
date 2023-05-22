// Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
// For license information, please see license.txt

frappe.ui.form.on('Fixed Expenses', {
	onload: function (frm) {
		frappe.call({
			method: "vsd_fleet_ms.vsd_fleet_ms.doctype.fixed_expenses.fixed_expenses.expense_account",
			callback: function(response) {
				var expenseAccounts = response.message;
				frm.set_query("expense_account", function(doc) {
					return {
						filters: [
							["Account", "parent_account", "in", expenseAccounts],
							["Account", "is_group", "=", 0]
						]
					};
				});
			}
		});
		frappe.call({
			method: "vsd_fleet_ms.vsd_fleet_ms.doctype.fixed_expenses.fixed_expenses.cash_account",
			callback: function(response) {
				var cash_bank_account = response.message;
				frm.set_query("cash_bank_account", function(doc) {
					return {
						filters: [
							["Account", "parent_account", "in", cash_bank_account],
							["Account", "is_group", "=", 0]
						]
					};
				});
			}
		});
	}
});
