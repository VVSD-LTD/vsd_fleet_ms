import frappe
from frappe import qb

@frappe.whitelist()
def update_child_table(self, fieldname, df=None):
	'''Updated function to prevent saving of approved or rejected funds request'''
	'''sync child table for given fieldname'''
	rows = []
	if not df:
		df = self.meta.get_field(fieldname)

	for d in self.get(df.fieldname):
		if df.fieldname in ["requested_funds", "main_requested_funds", "return_requested_funds"]:
			if d.get("request_status") not in ["Approved", "Rejected"]:
				d.db_update()
		else:
			d.db_update()
		rows.append(d.name)

	if df.options in (self.flags.ignore_children_type or []):
		# do not delete rows for this because of flags
		# hack for docperm :(
		return

	if rows:
		# select rows that do not match the ones in the document
		deleted_rows = frappe.db.sql("""select name from `tab{0}` where parent=%s
			and parenttype=%s and parentfield=%s
			and name not in ({1})""".format(df.options, ','.join(['%s'] * len(rows))),
				[self.name, self.doctype, fieldname] + rows)
		if len(deleted_rows) > 0:
			# delete rows that do not match the ones in the document
			frappe.db.sql("""delete from `tab{0}` where name in ({1})""".format(df.options,
				','.join(['%s'] * len(deleted_rows))), tuple(row[0] for row in deleted_rows))

	else:
		# no rows found, delete all rows
		frappe.db.sql("""delete from `tab{0}` where parent=%s
			and parenttype=%s and parentfield=%s""".format(df.options),
			(self.name, self.doctype, fieldname))

@frappe.whitelist()
def add_to_manifest(route_starting_point):
	# Define your parent and child DocTypes
	cargo_registration = qb.DocType("Cargo Registration")
	cargo_detail = qb.DocType("Cargo Detail")

	# Perform the query
	existing_cargo_details = (
		qb.from_(cargo_detail)
    	.from_(cargo_registration)
    	.select(
			cargo_detail.name.as_("cargo_id"),
			cargo_registration.customer.as_("customer_name"),
			cargo_registration.name.as_("parent_doctype_name"),
			cargo_registration.posting_date,
			cargo_detail.net_weight,
			cargo_detail.number_of_packages,
			cargo_detail.bl_number,
			cargo_detail.cargo_route,
			cargo_detail.cargo_type,
			cargo_detail.loading_date,
			cargo_detail.expected_offloading_date,
			cargo_detail.cargo_destination_country,
			cargo_detail.cargo_destination_city,
			cargo_detail.container_size,
			cargo_detail.seal_number,
			cargo_detail.container_number,
			cargo_detail.cargo_location_city,
			cargo_detail.cargo_location_country,
			cargo_detail.cargo_route
		)
		.where(
			(cargo_detail.parent == cargo_registration.name)
			& (cargo_registration.docstatus == 1)
			& (cargo_detail.manifest_number.isnull())
			& (cargo_detail.route_starting_point == route_starting_point)
		)
		.run(as_dict=True)
	)
	return existing_cargo_details
		