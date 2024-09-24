import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def execute():
    fields = {
        "Cargo Detail": [
            {
                "fieldname": "bill_uom",
                "fieldtype": "Link",
                "label": "Bill UOM",
                "insert_after": "container_size",
                "options": "UOM",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "net_weight_tonne",
                "fieldtype": "Float",
                "label": "Net Weight (Tonne)",
                "insert_after": "net_weight",
                "read_only": 1,
            }
        ]
    }
    create_custom_fields(fields, update=True)
