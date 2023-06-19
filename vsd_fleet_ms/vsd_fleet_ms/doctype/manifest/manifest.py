# Copyright (c) 2023, VV SYSTEMS DEVELOPER LTD and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document
import datetime

class Manifest(Document):
	def onload(self):
		if self.name:
			self.update_cargo_registration_details()
			self.update_trips()

	def validate(self):
		self.validate_has_trailers()
		self.validate_transporter_type()

	def before_save(self):
		if self.name:
			self.update_cargo_registration_details()
			self.update_trips()

	def update_trips(self):
		trips = frappe.get_all("Trips",filters={"manifest":self.name,docstatus:0})
		for trip in trips:
			trip_doc = frappe.get_doc("Trips", trip.name)
			if self.transporter_type == "Sub-Contractor":
				trip_doc.transporter_type = "Sub-Contractor"
				trip_doc.sub_contactor_truck_license_plate_no = self.sub_contactor_truck_license_plate_no
				trip_doc.sub_contactor_driver_name = self.sub_contactor_driver_name
				trip_doc.truck_number = ''
				trip_doc.assigned_driver = ''
				trip_doc.driver_name = ''
				trip_doc.trailer_1 = ''
				trip_doc.sub_contactor_trailer_1 = self.sub_contactor_trailer_1
				trip_doc.trailer_2 = ''
				trip_doc.sub_contactor_trailer_2 = self.sub_contactor_trailer_2
				trip_doc.trailer_3 = ''
				trip_doc.sub_contactor_trailer_3 = self.sub_contactor_trailer_3

			elif self.transporter_type == "In House":
				trip_doc.transporter_type = "In House"
				trip_doc.sub_contactor_truck_license_plate_no = ''
				trip_doc.sub_contactor_driver_name = ''
				trip_doc.truck_number = self.truck_license_plate_no
				trip_doc.assigned_driver = self.driver_name
				trip_doc.trailer_1 = self.trailer_1
				trip_doc.sub_contactor_trailer_1 = ''
				trip_doc.trailer_2 = self.trailer_2
				trip_doc.sub_contactor_trailer_2 = ''
				trip_doc.trailer_3 = self.trailer_3
				trip_doc.sub_contactor_trailer_3 = ''
			trip_doc.save()

	def update_cargo_registration_details(self):
		cargo_details = frappe.get_all("Cargo Detail",filters={"manifest_number":self.name,docstatus:0})
		for cargo in cargo_details:
			cargo_detail = frappe.get_doc("Cargo Detail", cargo.name)
			if self.transporter_type == "Sub-Contractor":
				cargo_detail.transporter_type = "Sub-Contractor"
				cargo_detail.assigned_truck = ''
				cargo_detail.assigned_driver = ''
				cargo_detail.truck_number = self.sub_contactor_truck_license_plate_no
				cargo_detail.driver_name = self.sub_contactor_driver_name
			elif self.transporter_type == "In House":
				cargo_detail.transporter_type = "In House"
				cargo_detail.assigned_truck = self.truck_license_plate_no
				cargo_detail.assigned_driver = self.driver_name
				cargo_detail.truck_number = ''
				cargo_detail.driver_name = ''
			cargo_detail.save()


	def validate_has_trailers(self):
		if self.has_trailers == 0:
			self.trailer_1 = ''
			self.sub_contactor_trailer_1 = ''
			self.trailer1_type = ''
			self.trailer_2 = ''
			self.sub_contactor_trailer_2 = ''
			self.trailer2_type = ''
			self.trailer_3 = ''
			self.sub_contactor_trailer_3 = ''
			self.trailer3_type = ''
			for row in self.manifest_cargo_details:
				row.cargo_allocation = "Truck"
				row.sub_contractor_cargo_allocation = self.sub_contactor_truck_license_plate_no

	def validate_transporter_type(self):
		if self.transporter_type == "In House":
			self.sub_contactor_truck_license_plate_no = ''
			self.sub_contactor_driver_name = ''
			self.sub_contactor_trailer_1 = ''
			self.sub_contactor_trailer_2 = ''
			self.sub_contactor_trailer_3 = ''
		elif self.transporter_type == "Sub-Contractor":
			self.truck = ''
			self.assigned_driver = ''
			self.driver_name = ''
			self.truck_license_plate_no = ''
			self.trailer_1 = ''
			self.trailer1_type = ''
			self.trailer_2 = ''
			self.trailer2_type = ''
			self.trailer_3 = ''
			self.trailer3_type = ''


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