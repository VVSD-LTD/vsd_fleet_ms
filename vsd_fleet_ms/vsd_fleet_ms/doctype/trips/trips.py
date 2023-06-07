# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document

class Trips(Document):
	pass

@frappe.whitelist()
def create_vehicle_trip_from_manifest(args_array):
	args_dict = json.loads(args_array)
	vehicle_trip = frappe.new_doc("Trips")
	vehicle_trip.manifest = args_dict.get("manifest_name")
	if vehicle_trip.save():
		manifest = frappe.get_doc("Manifest", args_dict.get("manifest_name"))
		manifest.vehicle_trip = vehicle_trip.name
		manifest.save()
	return vehicle_trip.as_dict()

@frappe.whitelist()
def create_fund_jl(doc, row):
    doc = frappe.get_doc(json.loads(doc))
    row = frappe._dict(json.loads(row))
    if row.journal_entry:
        frappe.throw("Journal Entry Already Created")

    if row.request_status != "Approved":
        frappe.throw("Fund Request is not Approved")

    accounts = []
    company_currency = frappe.db.get_value(
        "Company",
        doc.company,
        "default_currency",
    )
    frappe.msgprint(company_currency)
    if company_currency != row.request_currency:
        multi_currency = 1
        exchange_rate = get_exchange_rate(row.request_currency, company_currency)
    else:
        multi_currency = 0
        exchange_rate = 1

    if row.request_currency != row.expense_account_currency:
        debit_amount = row.request_amount * exchange_rate
        debit_exchange_rate = exchange_rate
    else:
        debit_amount = row.request_amount
        debit_exchange_rate = 1

    if row.request_currency != row.payable_account_currency:
        credit_amt = row.request_amount * exchange_rate
        credit_exchange_rate = exchange_rate
    else:
        credit_amt = row.request_amount
        credit_exchange_rate = 1

    debit_row = dict(
        account=row.expense_account,
        exchange_rate=debit_exchange_rate,
        debit_in_account_currency=debit_amount,
        cost_center=row.cost_center,
    )
    accounts.append(debit_row)

    credit_row = dict(
        account=row.payable_account,
        exchange_rate=credit_exchange_rate,
        credit_in_account_currency=credit_amt,
        cost_center=row.cost_center,
    )
    accounts.append(credit_row)

    company = doc.company
    user_remark = "Vehicle Trip No: {0}".format(doc.name)
    if row.requested_date:
        date = row.requested_date
    else:
        date = nowdate()
        
    jv_doc = frappe.get_doc(
        dict(
            doctype="Journal Entry",
            posting_date=date,
            accounts=accounts,
            company=company,
            multi_currency=multi_currency,
            user_remark=user_remark,
        )
    )
    jv_doc.flags.ignore_permissions = True
    frappe.flags.ignore_account_permission = True
    set_dimension(doc, jv_doc)
    for account_row in jv_doc.accounts:
        set_dimension(doc, jv_doc, tr_child=account_row)
    jv_doc.save()
    jv_url = frappe.utils.get_url_to_form(jv_doc.doctype, jv_doc.name)
    si_msgprint = "Journal Entry Created <a href='{0}'>{1}</a>".format(
        jv_url, jv_doc.name
    )
    frappe.msgprint(_(si_msgprint))
    frappe.set_value(row.doctype, row.name, "journal_entry", jv_doc.name)
    return jv_doc

