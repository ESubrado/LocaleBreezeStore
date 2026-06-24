export type ProductCatalog = {
  id: number;
  slug: string;
  title: string;
  description: string;
  count: string;
  imageAlt: string;
  imagePosition: string;
  examples: string[];
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  format: string;
  price: string;
  imageAlt: string;
  imagePosition?: string;
  tags: string[];
};

export type ProductCatalogPageData = {
  catalogImage: string;
  catalogs: ProductCatalog[];
  products: Product[];
  stats: {
    sampleProducts: number;
    catalogGroups: number;
    digitalFormats: number;
  };
};

const catalogImage = "/locale-breeze-general-store-hero.png";

const catalogs: ProductCatalog[] = [
  {
    id: 1,
    slug: "digital-print",
    title: "Digital and Print",
    description:
      "Downloadable calculators, printable guides, templates, study sheets, and bundled print-ready resources.",
    count: "18 sample items",
    imageAlt:
      "Books and notebooks on a bright store counter representing digital and print catalog items",
    imagePosition: "72% 44%",
    examples: ["PDF guides", "Spreadsheets", "Printable planners"],
  },
  {
    id: 2,
    slug: "books-study",
    title: "Books and Study Tools",
    description:
      "Reference books, notebooks, workbooks, calculators, and practical tools for school, office, and home tasks.",
    count: "16 sample items",
    imageAlt:
      "Books, notebooks, and a calculator arranged as study and office tools",
    imagePosition: "70% 52%",
    examples: ["Books", "Calculators", "Notebooks"],
  },
  {
    id: 3,
    slug: "ink-writing",
    title: "Ink and Writing",
    description:
      "Ink refills, printer cartridges, everyday pens, markers, paper, and desk writing supplies.",
    count: "14 sample items",
    imageAlt: "Ink bottles, pens, and printer cartridges on a store counter",
    imagePosition: "67% 78%",
    examples: ["Ink", "Pens", "Printer supplies"],
  },
  {
    id: 4,
    slug: "computer-parts",
    title: "Computer Parts",
    description:
      "Common computer add-ons and replacements such as adapters, cables, keyboard parts, fans, and small components.",
    count: "20 sample items",
    imageAlt: "Computer cables, adapters, keyboard keys, and a small cooling fan",
    imagePosition: "82% 86%",
    examples: ["Adapters", "Cables", "Keyboard parts"],
  },
];

const products: Product[] = [
  {
    id: 1,
    slug: "budget-calculator-workbook",
    name: "Budget Calculator Workbook",
    category: "Digital",
    description:
      "A spreadsheet-style calculator bundle for monthly budgets, simple forecasting, and printable summaries.",
    format: "XLSX + PDF",
    price: "$12.00",
    imageAlt: "Calculator and notebooks representing a budget workbook",
    imagePosition: "72% 65%",
    tags: ["Download", "Printable", "Business"],
  },
  {
    id: 2,
    slug: "computer-basics-field-guide",
    name: "Computer Basics Field Guide",
    category: "Print",
    description:
      "A compact handbook covering everyday ports, cables, adapters, storage, and simple troubleshooting.",
    format: "Booklet",
    price: "$9.50",
    imageAlt: "Books and computer parts representing a computer basics guide",
    imagePosition: "78% 58%",
    tags: ["Reference", "Beginner", "Tech"],
  },
  {
    id: 3,
    slug: "everyday-desk-calculator",
    name: "Everyday Desk Calculator",
    category: "Office",
    description:
      "A reliable calculator sample for school, home office, invoices, receipts, and quick store math.",
    format: "Physical",
    price: "$18.00",
    imageAlt: "A black desk calculator beside books and pens",
    imagePosition: "73% 67%",
    tags: ["Desk", "School", "Office"],
  },
  {
    id: 4,
    slug: "refill-ink-starter-pack",
    name: "Refill Ink Starter Pack",
    category: "Print Supply",
    description:
      "Core ink colors for print-heavy work, sample labels, document prep, and everyday refill needs.",
    format: "Physical",
    price: "$22.00",
    imageAlt: "Ink bottles and printer cartridges on a store counter",
    imagePosition: "62% 79%",
    tags: ["Ink", "Print", "Refill"],
  },
  {
    id: 5,
    slug: "precision-pen-set",
    name: "Precision Pen Set",
    category: "Stationery",
    description:
      "Smooth pens for notes, forms, planning, signatures, sketches, and bundled office kits.",
    format: "Physical",
    price: "$7.25",
    imageAlt: "Pens arranged beside notebooks and office supplies",
    imagePosition: "80% 63%",
    tags: ["Writing", "Notes", "Daily use"],
  },
  {
    id: 6,
    slug: "usb-c-adapter-kit",
    name: "USB-C Adapter Kit",
    category: "Computer Part",
    description:
      "Common adapters for connecting laptops, monitors, drives, chargers, and small accessories.",
    format: "Physical",
    price: "$16.00",
    imageAlt: "USB cables, adapters, and computer connectors",
    imagePosition: "83% 88%",
    tags: ["USB-C", "Cable", "Adapter"],
  },
  {
    id: 7,
    slug: "keyboard-repair-bits",
    name: "Keyboard Repair Bits",
    category: "Computer Part",
    description:
      "Sample kit for replacing common keys, stabilizers, and small keyboard maintenance pieces.",
    format: "Physical",
    price: "$11.75",
    imageAlt: "Keyboard keys and small computer parts on a desk",
    imagePosition: "87% 92%",
    tags: ["Keyboard", "Repair", "Parts"],
  },
  {
    id: 8,
    slug: "printable-study-planner",
    name: "Printable Study Planner",
    category: "Digital",
    description:
      "A clean weekly planner designed for students, tutors, and anyone organizing repeat study routines.",
    format: "PDF",
    price: "$5.00",
    imageAlt: "Notebooks and paper goods representing a printable study planner",
    imagePosition: "63% 55%",
    tags: ["Download", "Planner", "School"],
  },
];

function getProductStats() {
  const digitalFormats = new Set(
    products
      .filter((product) => product.category === "Digital")
      .map((product) => product.format),
  ).size;

  return {
    sampleProducts: products.length,
    catalogGroups: catalogs.length,
    digitalFormats,
  };
}

export async function getProductCatalogs(): Promise<ProductCatalog[]> {
  return catalogs;
}

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  return products.find((product) => product.id === id);
}

export async function getProductCatalogPageData(): Promise<ProductCatalogPageData> {
  return {
    catalogImage,
    catalogs,
    products,
    stats: getProductStats(),
  };
}
