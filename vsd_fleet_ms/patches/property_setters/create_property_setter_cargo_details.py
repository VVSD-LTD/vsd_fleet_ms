import frappe
from frappe.custom.doctype.property_setter.property_setter import make_property_setter

def execute():
    properties = [
            {
                "doctype": "Cargo Registration",
                "field_name": "cargo_details",
                "property": "allow_on_submit",
                "property_type": "Check",
                "value": 1
            }
    ]
    for property in properties:
        make_property_setter(
            property.get("doctype"),
            property.get("field_name"),
            property.get("property"),
            property.get("value"),
            property.get("property_type"),
            for_doctype=False,
            validate_fields_for_doctype=False
    )

frappe.db.commit()          