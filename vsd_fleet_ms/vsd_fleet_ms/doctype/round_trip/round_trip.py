# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class RoundTrip(Document):
	def before_save(self):
		for trips in self.trip_details:
			trip = frappe.get_doc("Trips",trips.trip_id)
			if trip.round_trip != self.name:
				trip.round_trip = self.name
				trip.save()
