import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def execute():
    fields = {
        "Cargo Detail": [
            {
                "fieldname": "allow_bill_on_weight",
                "fieldtype": "Check",
                "label": "Allow Bill On weight",
                "insert_after": "rate",
                "allow_on_submit":1
            }
        ]
    }
    create_custom_fields(fields, update=True)
