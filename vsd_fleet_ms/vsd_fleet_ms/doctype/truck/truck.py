# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Truck(Document):
	def before_save(self):
		current_status = frappe.db.get_value("Truck",self.name,"status")

		if current_status:
			if current_status != self.status:
				if self.status == "On Trip":
					doc = frappe.new_doc("Truck Log")
					doc.truck = self.name
					doc.vehicle_status = self.status
					doc.current_trip = self.trans_ms_current_trip 
					doc.save()
				else:
					doc = frappe.new_doc("Truck Log")
					doc.truck = self.name
					doc.vehicle_status = self.status
					doc.save()
    
		if not self.truck_number:
			self.truck_number = self.license_plate
		if self.disabled == 1:
			# Query Vehicle Trips Doctype for the given truck
			vehicle_trip = frappe.get_all("Trips", filters={"truck": self.name, "trip_completed": 0})

			
			if vehicle_trip:
            
				trip_doctype = "Trips"
				trip_name = vehicle_trip[0].name
			
				if trip_doctype and trip_name:
					doc_link = frappe.utils.get_link_to_form(trip_doctype, trip_name)
					
					frappe.throw(f"Trip found for this truck. Please complete the trip to be able to disable this vehicle: {doc_link}")

			else:
				self.status = "Disabled"
		if self.status == "Disabled":
			self.disabled == 1

