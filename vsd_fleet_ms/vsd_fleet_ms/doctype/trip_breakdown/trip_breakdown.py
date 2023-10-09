# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from vsd_fleet_ms.vsd_fleet_ms.doctype.requested_payment.requested_payment import request_funds

class TripBreakdown(Document):
	pass

@frappe.whitelist()
def create_resumption_trip(docname,trip):
	old_trip = frappe.get_doc("Trips", trip)
	
	new_trip = frappe.new_doc("Trips")
	new_trip.update(old_trip.as_dict())
	new_trip.location_update = []
	new_trip.trip_status = "Pending"
	new_trip.trip_breakdown = ""
	new_trip.stock_out_entry = ""

	new_trip.insert()
	if new_trip.transporter_type == "In House":
		funds_args = {
                "reference_doctype": "Trips",
                "reference_docname": new_trip.name,
                "manifest": new_trip.manifest,
                "truck": new_trip.truck_number,
                "truck_driver": new_trip.assigned_driver,
                "trip_route": new_trip.route
            }
		request_funds(**funds_args)
	if new_trip.round_trip:
		round_trip = frappe.get_doc("Round Trip",new_trip.round_trip)
		round_trip.append("trip_details",{
			"trip_id":new_trip.name
		})
		round_trip.save()
	
	doc_trip_breakdown = frappe.get_doc("Trip Breakdown",docname)
	doc_trip_breakdown.resumption_trip = new_trip.name
	doc_trip_breakdown.save()
	
	return new_trip.as_dict()