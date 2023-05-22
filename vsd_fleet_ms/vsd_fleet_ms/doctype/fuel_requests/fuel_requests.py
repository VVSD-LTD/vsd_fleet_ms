# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import json
import frappe
import time
import datetime
from frappe.model.document import Document
from frappe import _, msgprint
from frappe.model.mapper import get_mapped_doc
from frappe.utils import nowdate

class FuelRequests(Document):
    def onload(self):
        trip = frappe.get_doc(self.reference_doctype, self.reference_docname)
        # Load approved fuel for main trip
        if trip.main_route and trip.vehicle:
            consumption = frappe.db.get_value(
                "Truck", trip.vehicle, "trans_ms_fuel_consumption"
                )
            route = frappe.db.get_value("Trip Routes", trip.main_route, "total_distance")
            approved_fuel = consumption * route
            self.set("main_route", trip.main_route)
            self.set("main_approved_fuel", str(approved_fuel) + " Litres")

        # Load approved fuel for return trip
        if trip.return_route and trip.vehicle:
            consumption = frappe.db.get_value(
                "Truck", trip.vehicle, "trans_ms_fuel_consumption"
            )
            route = frappe.db.get_value(
                "Trip Routes", trip.return_route, "total_distance"
            )
            approved_fuel = consumption * route
            self.set("return_route", trip.return_route)
            self.set("return_approved_fuel", str(approved_fuel) + " Litres")

    def get_all_children(self, parenttype=None):
        # For getting children
        return []

    def update_children(self):
        """update child tables"""

    def before_save(self):
        for row in self.approved_requests:
            doc = frappe.get_doc("Fuel Requests Table", row.name)
            doc.db_set("disburcement_type", row.disburcement_type)
            doc.db_set("supplier", row.supplier)
            doc.db_set("receipt_date", row.receipt_date)
            doc.db_set("receipt_time", row.receipt_time)
            doc.db_set("received_by", row.received_by)

    def load_from_db(self):
        """Load document and children from database and create properties
        from fields"""
        if not getattr(self, "_metaclass", False) and self.meta.issingle:
            single_doc = frappe.db.get_singles_dict(self.doctype)
            if not single_doc:
                single_doc = frappe.new_doc(self.doctype).as_dict()
                single_doc["name"] = self.doctype
                del single_doc["__islocal"]

            super(Document, self).__init__(single_doc)
            self.init_valid_columns()
            self._fix_numeric_types()

        else:
            d = frappe.db.get_value(self.doctype, self.name, "*", as_dict=1)
            if not d:
                frappe.throw(
                    _("{0} {1} not found").format(_(self.doctype), self.name),
                    frappe.DoesNotExistError,
                )

            super(Document, self).__init__(d)

        if self.name == "DocType" and self.doctype == "DocType":
            from frappe.model.meta import doctype_table_fields

            table_fields = doctype_table_fields
        else:
            table_fields = self.meta.get_table_fields()

        for df in table_fields:
            if df.fieldname == "approved_requests":
                # Load approved or rejected requests
                children_main_approved = frappe.db.get_values(
                    df.options,
                    {
                        "parent": self.get("reference_docname"),
                        "parenttype": self.get("reference_doctype"),
                        "parentfield": "main_fuel_request",
                        "status": "Approved",
                    },
                    "*",
                    as_dict=True,
                    order_by="idx asc",
                )
                children_main_rejected = frappe.db.get_values(
                    df.options,
                    {
                        "parent": self.get("reference_docname"),
                        "parenttype": self.get("reference_doctype"),
                        "parentfield": "main_fuel_request",
                        "status": "Rejected",
                    },
                    "*",
                    as_dict=True,
                    order_by="idx asc",
                )
                children_return_approved = frappe.db.get_values(
                    df.options,
                    {
                        "parent": self.get("reference_docname"),
                        "parenttype": self.get("reference_doctype"),
                        "parentfield": "return_fuel_request",
                        "status": "Approved",
                    },
                    "*",
                    as_dict=True,
                    order_by="idx asc",
                )
                children_return_rejected = frappe.db.get_values(
                    df.options,
                    {
                        "parent": self.get("reference_docname"),
                        "parenttype": self.get("reference_doctype"),
                        "parentfield": "return_fuel_request",
                        "status": "Rejected",
                    },
                    "*",
                    as_dict=True,
                    order_by="idx asc",
                )
                children = (
                    children_main_approved
                    + children_main_rejected
                    + children_return_approved
                    + children_return_rejected
                )
                if children:
                    self.set(df.fieldname, children)
                else:
                    self.set(df.fieldname, [])
            elif df.fieldname == "requested_fuel":
                # Load requests which are not approved nor rejected
                children_main_requested = frappe.db.get_values(
                    df.options,
                    {
                        "parent": self.get("reference_docname"),
                        "parenttype": self.get("reference_doctype"),
                        "parentfield": "main_fuel_request",
                        "status": "Requested",
                    },
                    "*",
                    as_dict=True,
                    order_by="idx asc",
                )
                children_return_requested = frappe.db.get_values(
                    df.options,
                    {
                        "parent": self.get("reference_docname"),
                        "parenttype": self.get("reference_doctype"),
                        "parentfield": "return_fuel_request",
                        "status": "Requested",
                    },
                    "*",
                    as_dict=True,
                    order_by="idx asc",
                )
                children = children_main_requested + children_return_requested
                if children:
                    self.set(df.fieldname, children)
                else:
                    self.set(df.fieldname, [])

        # sometimes __setup__ can depend on child values, hence calling again at the end
        if hasattr(self, "__setup__"):
            self.__setup__()

@frappe.whitelist(allow_guest=True)
def set_status(doc):
    parent_doc_name = frappe.db.get_value("Fuel Requests Table", doc, "parent")
    fuel_requests = frappe.db.sql(
        """SELECT name, status FROM `tabFuel Requests Table` WHERE parent = %(parent_name)s""",
        {"parent_name": parent_doc_name},
        as_dict=1,
    )

    processed_requests = 0
    status = "Fully Processed"

    for request in fuel_requests:
        if request.status not in ["Approved", "Rejected"]:
            status = "Partially Processed"
        else:
            processed_requests = processed_requests + 1

    parent_request_name = frappe.db.get_value(
        "Fuel Request", {"reference_docname": parent_doc_name}
    )
    parent_request_doc = frappe.get_doc("Fuel Requests", parent_request_name)
    if 0 == processed_requests:
        parent_request_doc.db_set("status", "Waiting Approval")
    else:
        parent_request_doc.db_set("status", status)


@frappe.whitelist(allow_guest=True)
def approve_request(**args):
    args = frappe._dict(args)

    # Timestamp
    ts = time.time()
    timestamp = datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")

    doc = frappe.get_doc("Fuel Requests Table", args.request_docname)
    doc.db_set("status", "Approved")
    doc.db_set("approved_by", args.user)
    doc.db_set("approved_date", timestamp)
    # set_status(args.request_docname)
    return "Request Updated"


@frappe.whitelist(allow_guest=True)
def reject_request(**args):
    args = frappe._dict(args)

    # Timestamp
    ts = time.time()
    timestamp = datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")

    doc = frappe.get_doc("Fuel Requests Table", args.request_docname)
    doc.db_set("status", "Rejected")
    doc.db_set("approved_by", args.user)
    doc.db_set("approved_date", timestamp)
    # set_status(args.request_docname)
    return "Request Updated"

@frappe.whitelist()
def make_stock_entry(source_name, target_doc=None):
    doc = get_mapped_doc(
        "Fuel Requests",
        source_name,
        {
            "Fuel Requests": {
                "doctype": "Stock Entry",
                "field_map": {},
                "validation": {
                    "docstatus": ["=", 0],
                },
            },
            "Fuel Requests Table": {
                "doctype": "Stock Entry Detail",
                "field_map": {
                    "name": "fuel_request_table",
                    "parent": "fuel_request",
                    # "total_cost": "basic_amount",
                    "quantity": "qty",
                    source_name: "fuel_request",
                    # "cost_per_litre": "basic_rate",
                },
            },
        },
        target_doc,
    )
    return doc

