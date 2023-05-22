# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Truck(Document):
	def before_save(self):
		if not self.truck_number:
			self.truck_number = self.license_plate
		if self.disabled == 1:
			# Query Vehicle Trips Doctype for the given truck
			vehicle_trip = frappe.get_all("Vehicle Trips", filters={"truck": self.name, "trip_completed": 0})

			
			if vehicle_trip:
            
				trip_doctype = "Vehicle Trips"
				trip_name = vehicle_trip[0].name
			
				if trip_doctype and trip_name:
					doc_link = frappe.utils.get_link_to_form(trip_doctype, trip_name)
					
					frappe.throw(f"Vehicle trip found for this truck. Please complete the trip to be able to disable this vehicle: {doc_link}")

			else:
				self.status = "Disabled"
		if self.status == "Disabled":
			self.disabled == 1

