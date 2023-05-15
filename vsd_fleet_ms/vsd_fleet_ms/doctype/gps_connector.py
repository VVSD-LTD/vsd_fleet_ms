from __future__ import unicode_literals
import frappe
import sys
import psycopg2
from datetime import datetime

def connect_to_server():
	conn = None
	try:
		conn = 'test'
	except ex:
		print('Unable to connect the database: ' + str(ex))
		sys.exit(1)
	
	return conn
	
def record_vehicle_position(vehicle_plate_no, gps_timestamp, location, longitude, latitude):
	if vehicle_plate_no:
		existing_main_trip = frappe.db.get_value("Vehicle Trips", 
				{"vehicle_plate_number": vehicle_plate_no, "status": "En Route" })
		existing_return_trip = frappe.db.get_value("Vehicle Trips", 
				{"vehicle_plate_number": vehicle_plate_no, "status": "En Route - Returning" })
		if existing_main_trip:
			trip = frappe.get_doc('Vehicle Trips', existing_main_trip)
			last_location_date = frappe.db.sql('''SELECT timestamp FROM `tabVehicle Trips Location Update` WHERE parent = %(parent)s AND parenttype = %(parenttype)s AND parentfield='main_location_update' ORDER BY timestamp DESC LIMIT 1''', 
									{"parent": trip.name, "parenttype": 'Vehicle Trips'}, as_dict=1)
			if not last_location_date:
				trip.append('main_location_update', {"timestamp": gps_timestamp, 
							 "location": location,
							 "longitude": longitude,
							 "latitude": latitude,
							 "type_of_update": "GPS Update"})						  
				trip.save(ignore_permissions=True)
			elif last_location_date[0].timestamp and str(gps_timestamp) > str(last_location_date[0].timestamp):
				trip.append('main_location_update', {"timestamp": gps_timestamp, 
							 "location": location,
							 "longitude": longitude,
							 "latitude": latitude,
							 "type_of_update": "GPS Update"})								  
				trip.save(ignore_permissions=True)
			else:
				return "Trip location update is more current"
		elif existing_return_trip:
			trip = frappe.get_doc('Vehicle Trips', existing_return_trip)
			last_location_date = frappe.db.sql('''SELECT timestamp FROM `tabVehicle Trips Location Update` WHERE parent = %(parent)s AND parenttype = %(parenttype)s AND parentfield='return_location_update' ORDER BY timestamp DESC LIMIT 1''', 
									{"parent": trip.name, "parenttype": 'Vehicle Trips'}, as_dict=1)
			if not last_location_date:
				trip.append('return_location_update', {"timestamp": gps_timestamp, 
							 "location": location,
							 "longitude": longitude,
							 "latitude": latitude,
							 "type_of_update": "GPS Update"})							  
				trip.save(ignore_permissions=True)
			elif last_location_date[0].timestamp and str(gps_timestamp) > str(last_location_date[0].timestamp):
				trip.append('return_location_update', {"timestamp": gps_timestamp, 
							 "location": location,
							 "longitude": longitude,
							 "latitude": latitude,
							 "type_of_update": "GPS Update"})							  
				trip.save(ignore_permissions=True)
			else:
				return "Trip location update is more current"
	
  
@frappe.whitelist(allow_guest=True)
def get_last_location(vehicle_plate_no):
	if vehicle_plate_no and vehicle_plate_no != '':
		connection = connect_to_server() 
		if connection:
			curs = connection.cursor()
			curs.execute("SELECT gdlatitude, gdlongitude, gdlocation, gdtimestamp, gdhorseplateno FROM gps_devices WHERE UPPER(gdhorseplateno) = UPPER('" + vehicle_plate_no + "')")
			result = []
			for row in curs:
				clean_row = {}
				i = 0
				for column in row:
					clean_row.update({curs.description[i][0]: str(column)})
					i = i + 1
				result.append(clean_row)
			
			if result:
				record_vehicle_position(vehicle_plate_no, result[0]['gdtimestamp'], result[0]['gdlocation'], result[0]['gdlongitude'], result[0]['gdlatitude'])
			else:
				return "There is no tracking data."
		
		
@frappe.whitelist(allow_guest=True)
def load_cargo(**args):
	args = frappe._dict(args)
	vehicle_plate_number = args.vehicle_plate_number
	loading_date = args.loading_date
	cargo = args.cargo
	destination = args.destination
	if vehicle_plate_number and vehicle_plate_number != '' and loading_date and loading_date != '':
		connection = connect_to_server()
		if connection:
			curs = connection.cursor()
			curs.execute("""UPDATE gps_devices SET gdactive = TRUE, gdcargo = 'COTTON', gdloaded = %s, gddestination = %s WHERE UPPER(gdhorseplateno) = UPPER(%s)""", (loading_date, destination, vehicle_plate_number))
			connection.commit()
	
@frappe.whitelist(allow_guest=True)
def offload_cargo(**args):
	args = frappe._dict(args)
	vehicle_plate_number = args.vehicle_plate_number
	if vehicle_plate_number and vehicle_plate_number != '':
		connection = connect_to_server()
		if connection:
			curs = connection.cursor()
			curs.execute("""UPDATE gps_devices SET gdactive = FALSE, gdcargo = '', gdloaded = NULL, gddestination = '' WHERE UPPER(gdhorseplateno) = UPPER(%s)""", (vehicle_plate_number,))
			connection.commit()
	
		
@frappe.whitelist(allow_guest=True)
def loop_through_vehicles(**args):
	print("Executed: " + str(datetime.now()))
	args = frappe._dict(args)
	vehicle_list = frappe.get_all('Vehicle', fields=['name', 'number_plate'])
	if vehicle_list:
		for vehicle in vehicle_list:
			get_last_location(vehicle.number_plate)

