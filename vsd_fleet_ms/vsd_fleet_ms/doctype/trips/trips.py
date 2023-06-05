# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document

class Trips(Document):
	pass

@frappe.whitelist()
def create_vehicle_trip_from_manifest(args_array):
	args_dict = json.loads(args_array)
	vehicle_trip = frappe.new_doc("Trips")
	vehicle_trip.manifest = args_dict.get("manifest_name")
	if vehicle_trip.save():
		manifest = frappe.get_doc("Manifest", args_dict.get("manifest_name"))
		manifest.vehicle_trip = vehicle_trip.name
		manifest.save()
	return vehicle_trip.as_dict()
