## Fleet Managment System

## Overview

The **VSD Fleet Management System on ERPNext** is a Frappe Framework application designed to streamline and optimize transport operations. Built on top of ERPNext, this app provides comprehensive tools for managing all aspects of transportation, from master data setup to trip management and operational reporting.
![image](https://github.com/user-attachments/assets/a71b25dc-ce4a-44fc-84dd-31493d104bf8)

## Features

### Master Data Management
- **Cargo Types**: Define and manage different types of cargo for better organization.
- **Countries & Locations**: Set up countries and specific locations for transport routes.
- **Fixed Expenses**: Track and manage fixed expenses related to transportation.
- **Fuel Requests**: Streamline the process of requesting and tracking fuel.
- **Unit of Measure (UOM)**: Manage UOM for fuel and other items to ensure consistency.
- **Truck, Trailer & Driver Management**: Register and maintain all vehicle and driver details.
- **Trip Routes & Locations**: Configure and manage transport routes and trip locations.
- **Transportation Orders**: Handle transportation orders efficiently with detailed workflows.
- **Vehicle Inspections**: Set up templates and logs for vehicle inspections to ensure roadworthiness.

### Settings Configuration
- **Accounting Dimensions**: Define accounting dimensions for detailed financial reporting.
- **Cost Centers**: Track expenses by department or project.
- **Currency & Tax Settings**: Configure currency and tax rates specific to countries or regions.
- **Customer & Supplier Management**: Handle customer and supplier relationships effectively.
- **Warehouse & Inventory Management**: Manage warehouses, inventory, and item groups.
- **Document & Naming Conventions**: Standardize documentation with custom naming conventions.
- **Cargo Allocation & Trip Planning**: Efficiently allocate cargo and plan trips.

### Transport Operations
- **Real-Time Trip Tracking**: Monitor and update the status of trips in real time.
- **Fuel Management**: Track fuel consumption and manage requests effectively.
- **Vehicle Maintenance**: Schedule and manage vehicle maintenance and inspections.
- **Manifest Preparation**: Prepare and manage transport manifests to comply with regulations.
- **Round Trip Planning**: Optimize round trip routes for cost efficiency.

### User Training & Support
- **Cargo Registration**: In-depth training for registering cargo in the system.
- **Manifest Preparation**: Training on how to prepare and manage manifests.
- **Trip Management**: Training for planning, executing, and tracking trips.

## Installation

To install the VSD Fleet Management System on ERPNext app on your ERPNext instance:

1. Navigate to your Frappe Bench directory:
   ```
   cd /path/to/frappe-bench```
2. Get the app from the repository:
  ```
  bench get-app https://github.com/VVSD-LTD/vsd_fleet_ms.git
  ```
3. Install the app on your ERPNext site:
  ```
  bench --site [your-site-name] install-app vsd_fleet_ms
  ```
4. Migrate your site to apply the new app's changes:
  ```
  bench --site [your-site-name] migrate
  ```

  ## Usage
- Once installed, you can start using the VSD Fleet Management System on ERPNext from the ERPNext interface:

1. Master Data Setup: Begin by setting up your master data (Cargo Types, Trucks, Routes, etc.) from the Transport module.
2. Settings Configuration: Customize the settings to fit your operational needs (Accounting Dimensions, Tax Settings, etc.).
3. Manage Operations: Use the Transport module to handle daily operations, including trip management, vehicle inspections, and fuel requests.
4. Reporting: Access detailed reports for trips, expenses, and vehicle maintenance to optimize your transport operations.

  ## Contribution
- We welcome contributions from the community. If you find a bug or have a feature request, please open an issue on our GitHub repository.

## How to Contribute
1. Fork the repository.
2. Create a new branch:
```
git checkout -b feature-or-bugfix-name
```
3. Make your changes and commit them:
```
git commit -m "Your detailed description of the changes."
```
4. Push to your branch:
```
git push origin feature-or-bugfix-name
```
5. Open a pull request on GitHub.

License
This project is licensed under the GPL License - see the LICENSE file for details.

Support
For support, please reach out via GitHub Issues.

Happy transporting with VSD Fleet Management System on ERPNext!
=======
MIT
