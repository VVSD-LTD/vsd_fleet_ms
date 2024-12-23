import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def execute():
    fields = {
        "Transport Settings": [
            {
                "fieldname": "allow_bill_on_weight",
                "fieldtype": "Check",
                "label": "Allow Bill On Weight",
                "insert_after": "cash_or_bank_account_group"
            }
        ]
    }
    create_custom_fields(fields, update=True)
