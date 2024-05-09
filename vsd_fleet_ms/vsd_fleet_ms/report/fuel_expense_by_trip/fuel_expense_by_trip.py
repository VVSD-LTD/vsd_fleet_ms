# Copyright (c) 2024, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_data(filters)
	return columns, data, None

def get_columns():
	# Define the columns to be displayed in the report
	return [
		{"fieldname": "vehicle_trip", "fieldtype": "Link", "label": "Vehicle Trip", "options": "Trips"},
		{"fieldname": "date", "fieldtype": "Date", "label": "Trip Date"},
		{"fieldname": "driver_name", "fieldtype": "Data", "label": "Driver Name"},
		{"fieldname": "truck_number", "fieldtype": "Data", "label": "Truck Number"},
		{"fieldname": "transporter_type", "fieldtype": "Data", "label": "Transporter Type"},
		{"fieldname": "trip_status", "fieldtype": "Data", "label": "Trip Status"},
		{"fieldname": "truck_licence_plate", "fieldtype": "Data", "label": "Truck Licence Plate"},
		{"fieldname": "route", "fieldtype": "Link", "label": "Route","options":"Trip Routes"},
		{"fieldname": "item_name", "fieldtype": "Data", "label": "Item Name"},
		{"fieldname": "uom", "fieldtype": "Data", "label": "UOM"},
		{"fieldname": "quantity", "fieldtype": "Float", "label": "Quantity"},
		{"fieldname": "cost_per_litre", "fieldtype": "Float", "label": "Cost Per Litre"},
		{"fieldname": "currency", "fieldtype": "Link", "label": "Currency","options":"Currency"},
		{"fieldname": "total_cost", "fieldtype": "Currency", "label": "Total Cost","options":""},
		{"fieldname": "disbursement_type", "fieldtype": "Data", "label": "Disbursement Type"},
		{"fieldname": "supplier", "fieldtype": "Link", "label": "Supplier", "options": "Supplier"},
		{"fieldname": "status", "fieldtype": "Data", "label": "Status"},
		{"fieldname": "approved_by", "fieldtype": "Data", "label": "Approved By"},
		{"fieldname": "approved_date", "fieldtype": "Date", "label": "Approved Date"},
		{"fieldname": "round_trip", "fieldtype": "Check", "label": "Round Trip"},
		{"fieldname": "trip_complited", "fieldtype": "Check", "label": "Trip Completed"}

	]

def get_data(filters):
	data = []
	vehicle_trips = frappe.db.sql("SELECT * FROM tabTrips T INNER JOIN `tabFuel Requests Table` FL ON FL.parent = T.name",as_dict=True)
	for trip in vehicle_trips:
		data.append({
			"round_trip": trip.round_trip,
			"driver_name": trip.driver_name,
			"trip_complited": trip.trip_complited,
			"truck_number": trip.truck_number,
			"transporter_type": trip.transporter_type,
			"trip_status": trip.trip_status,
			"truck_number": trip.truck_number,
			"truck_licence_plate": trip.truck_licence_plate,
			"route": trip.route,
			"vehicle_trip": trip.parent,
			"item_code": trip.item_code,
			"item_name": trip.item_name,
			"uom": trip.uom,
			"quantity": trip.quantity,
			"cost_per_litre": trip.cost_per_litre,
			"currency": trip.currency,
			"total_cost": trip.total_cost,
			"disbursement_type": trip.disbursement_type,
			"supplier": trip.supplier,
			"status": trip.status,
			"approved_by": trip.approved_by,
			"date": trip.date,
			"approved_date": trip.approved_date

		})
	return data