from decimal import Decimal

from db import db
from models import CatalogModel, ProductModel


CATALOGS = [
    {
        "slug": "digital-print",
        "title": "Digital and Print",
        "description": (
            "Downloadable calculators, printable guides, templates, study sheets, "
            "and bundled print-ready resources."
        ),
        "sample_item_count": 18,
        "image_alt": (
            "Books and notebooks on a bright store counter representing digital "
            "and print catalog items"
        ),
        "image_position": "72% 44%",
        "examples": ["PDF guides", "Spreadsheets", "Printable planners"],
        "display_order": 1,
    },
    {
        "slug": "books-study",
        "title": "Books and Study Tools",
        "description": (
            "Reference books, notebooks, workbooks, calculators, and practical "
            "tools for school, office, and home tasks."
        ),
        "sample_item_count": 16,
        "image_alt": "Books, notebooks, and a calculator arranged as study and office tools",
        "image_position": "70% 52%",
        "examples": ["Books", "Calculators", "Notebooks"],
        "display_order": 2,
    },
    {
        "slug": "ink-writing",
        "title": "Ink and Writing",
        "description": (
            "Ink refills, printer cartridges, everyday pens, markers, paper, and "
            "desk writing supplies."
        ),
        "sample_item_count": 14,
        "image_alt": "Ink bottles, pens, and printer cartridges on a store counter",
        "image_position": "67% 78%",
        "examples": ["Ink", "Pens", "Printer supplies"],
        "display_order": 3,
    },
    {
        "slug": "computer-parts",
        "title": "Computer Parts",
        "description": (
            "Common computer add-ons and replacements such as adapters, cables, "
            "keyboard parts, fans, and small components."
        ),
        "sample_item_count": 20,
        "image_alt": "Computer cables, adapters, keyboard keys, and a small cooling fan",
        "image_position": "82% 86%",
        "examples": ["Adapters", "Cables", "Keyboard parts"],
        "display_order": 4,
    },
]


PRODUCTS = [
    {
        "slug": "budget-calculator-workbook",
        "sku": "LB-DIG-001",
        "name": "Budget Calculator Workbook",
        "category": "Digital",
        "description": (
            "A spreadsheet-style calculator bundle for monthly budgets, simple "
            "forecasting, and printable summaries."
        ),
        "format": "XLSX + PDF",
        "fulfillment_type": "digital",
        "price_amount": Decimal("12.00"),
        "image_alt": "Calculator and notebooks representing a budget workbook",
        "image_position": "72% 65%",
        "tags": ["Download", "Printable", "Business"],
        "catalog_slug": "digital-print",
        "is_featured": True,
        "display_order": 1,
    },
    {
        "slug": "computer-basics-field-guide",
        "sku": "LB-PRT-001",
        "name": "Computer Basics Field Guide",
        "category": "Print",
        "description": (
            "A compact handbook covering everyday ports, cables, adapters, "
            "storage, and simple troubleshooting."
        ),
        "format": "Booklet",
        "fulfillment_type": "physical",
        "price_amount": Decimal("9.50"),
        "image_alt": "Books and computer parts representing a computer basics guide",
        "image_position": "78% 58%",
        "tags": ["Reference", "Beginner", "Tech"],
        "stock_quantity": 35,
        "catalog_slug": "books-study",
        "is_featured": True,
        "display_order": 2,
    },
    {
        "slug": "everyday-desk-calculator",
        "sku": "LB-OFC-001",
        "name": "Everyday Desk Calculator",
        "category": "Office",
        "description": (
            "A reliable calculator sample for school, home office, invoices, "
            "receipts, and quick store math."
        ),
        "format": "Physical",
        "fulfillment_type": "physical",
        "price_amount": Decimal("18.00"),
        "image_alt": "A black desk calculator beside books and pens",
        "image_position": "73% 67%",
        "tags": ["Desk", "School", "Office"],
        "stock_quantity": 24,
        "catalog_slug": "books-study",
        "display_order": 3,
    },
    {
        "slug": "refill-ink-starter-pack",
        "sku": "LB-INK-001",
        "name": "Refill Ink Starter Pack",
        "category": "Print Supply",
        "description": (
            "Core ink colors for print-heavy work, sample labels, document prep, "
            "and everyday refill needs."
        ),
        "format": "Physical",
        "fulfillment_type": "physical",
        "price_amount": Decimal("22.00"),
        "image_alt": "Ink bottles and printer cartridges on a store counter",
        "image_position": "62% 79%",
        "tags": ["Ink", "Print", "Refill"],
        "stock_quantity": 18,
        "catalog_slug": "ink-writing",
        "is_featured": True,
        "display_order": 4,
    },
    {
        "slug": "precision-pen-set",
        "sku": "LB-STA-001",
        "name": "Precision Pen Set",
        "category": "Stationery",
        "description": (
            "Smooth pens for notes, forms, planning, signatures, sketches, and "
            "bundled office kits."
        ),
        "format": "Physical",
        "fulfillment_type": "physical",
        "price_amount": Decimal("7.25"),
        "image_alt": "Pens arranged beside notebooks and office supplies",
        "image_position": "80% 63%",
        "tags": ["Writing", "Notes", "Daily use"],
        "stock_quantity": 60,
        "catalog_slug": "ink-writing",
        "display_order": 5,
    },
    {
        "slug": "usb-c-adapter-kit",
        "sku": "LB-CMP-001",
        "name": "USB-C Adapter Kit",
        "category": "Computer Part",
        "description": (
            "Common adapters for connecting laptops, monitors, drives, chargers, "
            "and small accessories."
        ),
        "format": "Physical",
        "fulfillment_type": "physical",
        "price_amount": Decimal("16.00"),
        "image_alt": "USB cables, adapters, and computer connectors",
        "image_position": "83% 88%",
        "tags": ["USB-C", "Cable", "Adapter"],
        "stock_quantity": 42,
        "catalog_slug": "computer-parts",
        "is_featured": True,
        "display_order": 6,
    },
    {
        "slug": "keyboard-repair-bits",
        "sku": "LB-CMP-002",
        "name": "Keyboard Repair Bits",
        "category": "Computer Part",
        "description": (
            "Sample kit for replacing common keys, stabilizers, and small "
            "keyboard maintenance pieces."
        ),
        "format": "Physical",
        "fulfillment_type": "physical",
        "price_amount": Decimal("11.75"),
        "image_alt": "Keyboard keys and small computer parts on a desk",
        "image_position": "87% 92%",
        "tags": ["Keyboard", "Repair", "Parts"],
        "stock_quantity": 28,
        "catalog_slug": "computer-parts",
        "display_order": 7,
    },
    {
        "slug": "printable-study-planner",
        "sku": "LB-DIG-002",
        "name": "Printable Study Planner",
        "category": "Digital",
        "description": (
            "A clean weekly planner designed for students, tutors, and anyone "
            "organizing repeat study routines."
        ),
        "format": "PDF",
        "fulfillment_type": "digital",
        "price_amount": Decimal("5.00"),
        "image_alt": "Notebooks and paper goods representing a printable study planner",
        "image_position": "63% 55%",
        "tags": ["Download", "Planner", "School"],
        "catalog_slug": "digital-print",
        "is_featured": True,
        "display_order": 8,
    },
]


def seed_catalog_product_data():
    if CatalogModel.query.first():
        return

    catalogs_by_slug = {}
    for catalog_data in CATALOGS:
        catalog = CatalogModel(**catalog_data)
        catalogs_by_slug[catalog.slug] = catalog
        db.session.add(catalog)

    db.session.flush()

    for product_data in PRODUCTS:
        catalog_slug = product_data["catalog_slug"]
        product_fields = {
            key: value for key, value in product_data.items() if key != "catalog_slug"
        }
        product = ProductModel(
            **product_fields,
            currency="USD",
            catalog_id=catalogs_by_slug[catalog_slug].id,
        )
        db.session.add(product)

    db.session.commit()
