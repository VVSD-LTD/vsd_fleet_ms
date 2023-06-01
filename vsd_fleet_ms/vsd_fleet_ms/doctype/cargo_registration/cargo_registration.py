# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class CargoRegistration(Document):
	pass


@frappe.whitelist()
def create_sales_invoice(doc, rows):
    doc = frappe.get_doc(json.loads(doc))
    rows = json.loads(rows)
    if not rows:
        return
    items = []
    item_row_per = []
    for row in rows:
        description = ""
        trip_info = None
        if row["transporter_type"] == "In House":
            description += "<b>VEHICLE NUMBER: " + row["assigned_vehicle"]
            trip_info = "<BR>TRIP: " + row["created_trip"]
        elif row["transporter_type"] == "Sub-Contractor":
            description += "<b>VEHICLE NUMBER: " + row["vehicle_plate_number"]
        if row["route"]:
            description += "<BR>ROUTE: " + row["route"]
        if trip_info:
            description += trip_info
        item = frappe._dict({
                "item_code": row["item"],
                "qty": 1,
                "uom": frappe.get_value("Item", row["item"], "stock_uom"),
                "rate": row["rate"],
                "description": description,
            }
        )
        item_row_per.append([row, item])
        items.append(item)
        
    invoice = frappe.get_doc(
        dict(
            doctype="Sales Invoice",
            customer=doc.customer,
            currency=row["currency"],
            posting_date=nowdate(),
            company=doc.company,
            items=items,
        ),
    )

    set_dimension(doc, invoice, src_child=row)
    invoice.items = []
    for i in item_row_per:
        set_dimension(doc, invoice, src_child=i[0], tr_child=i[1])
        invoice.append("items", i[1])
    
    frappe.flags.ignore_account_permission = True
    invoice.set_taxes()
    invoice.set_missing_values()
    invoice.flags.ignore_mandatory = True
    invoice.calculate_taxes_and_totals()
    invoice.insert(ignore_permissions=True)
    for item in doc.assign_transport:
        if item.name in [i["name"] for i in rows]:
            item.invoice = invoice.name
            if item.transporter_type == "In House":
                trip = frappe.get_doc("Vehicle Trips", item.created_trip)
                trip.invoice_number = invoice.name
                trip.save()
    doc.save()
           
        
    frappe.msgprint(_("Sales Invoice {0} Created").format(invoice.name), alert=True)
    return invoice