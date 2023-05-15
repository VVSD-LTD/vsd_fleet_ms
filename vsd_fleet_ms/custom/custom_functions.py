import frappe
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
def validate_requested_funds(doc):
	make_request = False
	open_requests = []
	for requested_fund in doc.requested_funds:
		if requested_fund.request_status == "open":
			make_request = True
			open_requests.append(requested_fund)
			
	if make_request:
		args = {"reference_doctype": doc.doctype, "reference_docname": doc.name, "company": doc.company}
		request_status = request_funds(reference_doctype = doc.doctype, reference_docname = doc.name, company = doc.company)
		if request_status == "Request Inserted" or request_status == "Request Updated":
			for open_request in open_requests:
				open_request.set("request_status", "Requested")
		