# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
	columns, data = [], []
	
	columns = [
		{
			"fieldname": "reference",
			"label": _("Reference"),
			"fieldtype": "Link",
			"options": "Trips",
			"width": 100
		},
		{
			"fieldname": "transporter_type",
			"label": _("Transporter Type"),
			"fieldtype": "Data",
			"width": 150
		},
		{
			"fieldname": "transporter_name",
			"label": _("Transporter Name"),
			"fieldtype": "Data",
			"width": 200
		},
		{
			"fieldname": "vehicle_plate_number",
			"label": _("Vehicle"),
			"fieldtype": "Data",
			"width": 100
		},
		{
			"fieldname": "driver_name",
			"label": _("Driver"),
			"fieldtype": "Data",
			"width": 200
		},
		{
			"fieldname": "route",
			"label": _("Route"),
			"fieldtype": "Data",
			"width": 150
		},
		{
			"fieldname": "status",
			"label": _("Status"),
			"fieldtype": "Data",
			"width": 120
		},
		{
			"fieldname": "trip_expenses_usd",
			"label": _("Trip Expenses (USD)"),
			"fieldtype": "Float",
			"width": 160
		},
		{
			"fieldname": "trip_expenses_tzs",
			"label": _("Trip Expenses (TZS)"),
			"fieldtype": "Float",
			"width": 150
		},
		{
			"fieldname": "posting_date",
			"label": _("Posting Date"),
			"fieldtype": "Date",
			"width": 120
		}
	]
	
	if filters.from_date > filters.to_date:
		frappe.throw(_("From Date must be before To Date {}").format(filters.to_date))
		
	where = ""
	where_filter = {"from_date": filters.from_date, "to_date": filters.to_date}
	if filters.status:
		where += 'AND status = %(status)s'
		where_filter.update({"status": filters.status})
	
	data = frappe.db.sql('''
		SELECT 
			`tabTrips`.name AS reference,
			`tabTrips`.transporter_type,
			IF(`tabTrips`.transporter_type = 'In House', '', `tabTrips`.sub_contractor_name) AS transporter_name,
			IF(`tabTrips`.transporter_type = 'In House', `tabTrips`.truck_licence_plate, `tabTrips`.sub_contactor_truck_license_plate_no) AS vehicle_plate_number,
			IF(`tabTrips`.transporter_type = 'In House', `tabTrips`.driver_name, `tabTrips`.sub_contactor_driver_name) AS driver_name,
			route,
			`tabTrips`.trip_status as status,
			(
				SELECT SUM(request_amount)
				FROM `tabRequested Fund Details`
				WHERE parenttype = 'Trips' AND parent = `tabTrips`.name AND request_currency = 'USD' AND request_status = 'Approved' AND journal_entry != ''
			) AS trip_expenses_usd,
			(
				SELECT SUM(request_amount)
				FROM `tabRequested Fund Details`
				WHERE parenttype = 'Trips' AND parent = `tabTrips`.name AND request_currency = 'TZS' AND request_status = 'Approved' AND journal_entry != ''
			) AS trip_expenses_tzs,
			date as posting_date
		FROM
			`tabTrips`
	''', as_dict=1)

	return columns, data

