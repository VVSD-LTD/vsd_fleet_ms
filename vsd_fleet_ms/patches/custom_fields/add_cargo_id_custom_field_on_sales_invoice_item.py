import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def execute():
    fields = {
        "Sales Invoice Item": [
            {
                "fieldname": "cargo_id",
                "fieldtype": "Data",
                "label": "Cargo ID",
                "insert_after": "cost_center",
                "read_only": 1
            }
        ]
    }
    create_custom_fields(fields, update=True)
    frappe.reload_doc("accounts", "doctype", "sales_invoice_item", force=True)
