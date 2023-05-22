# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class TruckDriver(Document):
	
	def before_save(self):
		if self.status != "Active":
			trucks = frappe.get_all("Truck", filters={"trans_ms_driver":self.name})
			if trucks:
				for truck in trucks:
					single_truck = frappe.get_doc("Truck",truck.name)
					single_truck.trans_ms_driver = ''
					single_truck.trans_ms__driver_name = ''
					single_truck.save()
