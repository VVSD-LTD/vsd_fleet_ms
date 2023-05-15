# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document

class Truck(Document):
	def before_save(self):
		if not self.truck_number:
			self.truck_number = self.license_plate
