from frappe import _

def get_data():
    return {
        'fieldname': 'purchase_invoice',
        'non_standard_fieldnames': {
            'Requested Payment': 'reference_docname',
            'Fuel Requests': 'reference_docname',
        },
        'internal_links': {
            # 'Purchase Order': ['items', 'purchase_order'],
            # 'Purchase Receipt': ['items', 'purchase_receipt'],
        },
        'transactions': [
            {
                'label': _('Reference'),
                'items': ['Requested Payment', 'Fuel Requests']
            },
        ]
    }