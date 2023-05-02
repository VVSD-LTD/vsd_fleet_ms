from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in vsd_fleet_ms/__init__.py
from vsd_fleet_ms import __version__ as version

setup(
	name="vsd_fleet_ms",
	version=version,
	description="Fleet Management System",
	author="VV SYSTEMS DEVELOPER LTD",
	author_email="info@vvsdtz.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
