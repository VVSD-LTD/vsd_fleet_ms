# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document
import datetime

class Manifest(Document):
	pass

@frappe.whitelist()
def get_manifests(filter):
    # Implement the logic to fetch the manifests to be billed based on the provided filters

	# frappe.msgprint(str(filters))
	manifests = frappe.get_all(
        'Manifest',
        filters=filter,
        fields=['name', 'route', 'truck_license_plate_no','driver_name']  # Adjust the fields as per your requirements
    )
	
	return manifests

@frappe.whitelist()
def create_manifest_from_cargo_registration(args_array):
	pass

@frappe.whitelist()
def add_to_existing_manifest(args_array):
	args_dict = json.loads(args_array)
	manifest = frappe.get_doc("Manifest",args_dict.get("manifest"))
	manifest.append(
		'manifest_cargo_details',
		{
			"cargo_id":args_dict.get("cargo_id"),
			"cargo_route": args_dict.get("cargo_route"),
			"cargo_type":args_dict.get("cargo_type"),
			"number_of_package":args_dict.get("number_of_package"),
			"weight":args_dict.get("weight"),
			"bl_number":args_dict.get("bl_number"),
			"expected_loading_date":args_dict.get("expected_loading_date"),
			"expected_offloading_date":args_dict.get("expected_offloading_date"),
			"customer_name":args_dict.get("customer_name"),
			"cargo_destination_country":args_dict.get("cargo_destination_country"),
			"cargo_destination_city":args_dict.get("cargo_destination_city"),
			"container_size":args_dict.get("container_size"),
			"seal_number":args_dict.get("seal_number"),
			"container_number":args_dict.get("container_number"),
			"cargo_loading_city":args_dict.get("cargo_loading_city"),
			"cargo_location_country":args_dict.get("cargo_location_country")
		}
	)
	if manifest.save():
		cargo_registration = frappe.get_doc('Cargo Registration', args_dict.get("parent_doctype_name") )
		if cargo_registration:
			for row in cargo_registration.cargo_details:
				if row.name == args_dict.get('cargo_id'):
					row.manifest_number = args_dict.get('manifest')
					cargo_registration.save()
					break
			
	return manifest.as_dict()

@frappe.whitelist()
def create_new_manifest(args_array):
	args_dict = json.loads(args_array)
	manifest = frappe.new_doc("Manifest")
	manifest.route = args_dict.get("cargo_route")
	manifest.posting_date = datetime.datetime.now().date()
	manifest.append(
		'manifest_cargo_details',
		{
			"cargo_id":args_dict.get("cargo_id"),
			"cargo_route": args_dict.get("cargo_route"),
			"cargo_type":args_dict.get("cargo_type"),
			"number_of_package":args_dict.get("number_of_package"),
			"weight":args_dict.get("weight"),
			"bl_number":args_dict.get("bl_number"),
			"expected_loading_date":args_dict.get("expected_loading_date"),
			"expected_offloading_date":args_dict.get("expected_offloading_date"),
			"customer_name":args_dict.get("customer_name"),
			"cargo_destination_country":args_dict.get("cargo_destination_country"),
			"cargo_destination_city":args_dict.get("cargo_destination_city"),
			"container_size":args_dict.get("container_size"),
			"seal_number":args_dict.get("seal_number"),
			"container_number":args_dict.get("container_number"),
			"cargo_loading_city":args_dict.get("cargo_loading_city"),
			"cargo_location_country":args_dict.get("cargo_location_country")
		}
	)
	manifest.save()
	if manifest.name:
		cargo_registration = frappe.get_doc('Cargo Registration', args_dict.get("parent_doctype_name") )
		if cargo_registration:
			for row in cargo_registration.cargo_details:
				if row.name == args_dict.get('cargo_id'):
					row.manifest_number = manifest.name
					cargo_registration.save()
					break
			
	return manifest.as_dict()