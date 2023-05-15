# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class FixedExpenses(Document):
	def onload(self):
		self.set_onload(
			"expense_accounts",
			frappe.db.get_single_value("Transport Settings","expense_account_group"),
			)
		
		self.set_onload(
			"cash_bank_accounts",
			frappe.db.get_single_value("Transport Settings","cash_or_bank_account_group"),
			)
