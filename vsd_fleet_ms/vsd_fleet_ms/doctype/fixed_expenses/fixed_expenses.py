# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class FixedExpenses(Document):
	pass
	

@frappe.whitelist()	
def expense_account():
    return (
        frappe.get_all(
            "Transport Expenses Account Group",
            fields=["account_group"],
            filters={"parent": "Transport Settings"},
            pluck="account_group"
        )
    )

@frappe.whitelist()			
def cash_account():
	return (
		frappe.db.get_all(
			"Transport Cash Account Group",
			fields=["account_group"],
			filters={"parent": "Transport Settings"},
			pluck="account_group"
			)
			)
