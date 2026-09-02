import { Invoice, InvoiceItem, BillingSettings, BrandType } from "@/types";

const BILLING_STORAGE_KEY = "jd_distribuidora_invoices_v1";
const SETTINGS_STORAGE_KEY = "jd_distribuidora_billing_settings_v1";

export const COMPANY_JD_SETTINGS: BillingSettings = {
  companyName: "JD DISTRIBUIDORA DE CARNES S.A.S.",
  tradeName: "JD Distribuidora (Cortes de Cerdo Frescos Crudos)",
  nit: "901.684.219-3",
  address: "Calle 12 # 42-18, Frigorífico Central de Desposte",
  city: "Bogotá D.C., Colombia",
  phone: "+57 323 321 8831",
  email: "facturacion@jddistribuidora.com",
  resolutionNumber: "187640001892",
  resolutionDate: "2026-01-15",
  prefix: "FAC-JD",
  fromNumber: 1,
  toNumber: 50000,
  currentNumber: 10459,
  regime: "Responsable de IVA - Régimen Común / Actividad 4631 (Comercio mayorista de carnes de cerdo frescas exentas según Art. 477 E.T.)",
  posFooterNote: "Factura Comercial de Venta • Carnes frescas de cerdo seleccionadas bajo cadena de frío 0°C a 4°C. ¡Gracias por preferir a JD Distribuidora!",
};

export const COMPANY_GOURMET_SETTINGS: BillingSettings = {
  companyName: "GOURMET AHUMADOS & CHARCUTERÍA S.A.S.",
  tradeName: "Gourmet Ahumados (Ahumados Artesanales al Leño)",
  nit: "901.792.845-1",
  address: "Carrera 68D # 13-40, Planta Artesanal de Ahumados",
  city: "Bogotá D.C., Colombia",
  phone: "+57 323 321 8831",
  email: "contabilidad@gourmetahumados.co",
  resolutionNumber: "187650002941",
  resolutionDate: "2026-01-15",
  prefix: "FAC-GA",
  fromNumber: 1,
  toNumber: 50000,
  currentNumber: 520,
  regime: "Responsable de IVA - Régimen Común / Actividad 1011 (Procesamiento y conservación de productos cárnicos ahumados)",
  posFooterNote: "Factura Comercial de Venta • Ahumados artesanales al leño de roble 100% naturales sin conservantes artificiales. ¡Calidad Gourmet Prémium!",
};

export const DEFAULT_BILLING_SETTINGS: BillingSettings = COMPANY_JD_SETTINGS;

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-10454",
    number: "FAC-2026-10454",
    prefix: "FAC",
    orderId: "10454",
    customerId: "c1",
    customerName: "Fama & Carnicería El Roble",
    customerNit: "800.123.456-7",
    customerPhone: "315 889 1234",
    customerAddress: "Calle 140 # 15-32, Cedritos",
    customerZone: "Zona Norte (Usaquén - Suba - Cedritos)",
    items: [
      {
        id: "item-1",
        productId: "p1",
        sku: "JD-BON-01",
        productName: "Bondiola de cerdo fresca",
        brand: "jd_distribuidora",
        quantityKg: 20.0,
        unitPrice: 22000,
        subtotal: 440000,
        taxRate: 0,
      },
      {
        id: "item-2",
        productId: "p2",
        sku: "JD-LOM-02",
        productName: "Lomo / Cañón de cerdo extra magro",
        brand: "jd_distribuidora",
        quantityKg: 15.0,
        unitPrice: 23333.33,
        subtotal: 350000,
        taxRate: 0,
      },
    ],
    totalKg: 35.0,
    subtotal: 790000,
    discountTotal: 0,
    taxTotal: 0,
    total: 790000,
    paymentType: "efectivo",
    paymentDetails: {
      cashAmount: 790000,
      cashGiven: 800000,
      cashChange: 10000,
    },
    status: "pagada",
    origin: "despacho",
    notes: "Factura pagada en efectivo contra entrega al chofer Carlos Pérez. Canastillas: 2 dejadas / 1 recogida.",
    issuedAt: "2026-08-27T08:45:00.000Z",
    sellerName: "Carlos Pérez (Furgón KLP-541)",
  },
  {
    id: "inv-10455",
    number: "FAC-2026-10455",
    prefix: "FAC",
    orderId: "10455",
    customerId: "c2",
    customerName: "Restaurante & Asadero Don Jorge",
    customerNit: "830.492.111-2",
    customerPhone: "310 777 9988",
    customerAddress: "Carrera 19 # 106-45, Usaquén",
    customerZone: "Zona Norte (Usaquén - Suba - Cedritos)",
    items: [
      {
        id: "item-3",
        productId: "p5",
        sku: "JD-CST-05",
        productName: "Costilla de cerdo San Luis (St. Louis Cut)",
        brand: "jd_distribuidora",
        quantityKg: 25.0,
        unitPrice: 26000,
        subtotal: 650000,
        taxRate: 0,
      },
      {
        id: "item-4",
        productId: "p4",
        sku: "JD-CHL-04",
        productName: "Chuleta de cerdo fresca de centro",
        brand: "jd_distribuidora",
        quantityKg: 20.0,
        unitPrice: 23000,
        subtotal: 460000,
        taxRate: 0,
      },
      {
        id: "item-5",
        productId: "p6",
        sku: "JD-PAN-06",
        productName: "Panceta de cerdo fresca en plancha",
        brand: "jd_distribuidora",
        quantityKg: 10.0,
        unitPrice: 25000,
        subtotal: 250000,
        taxRate: 0,
      },
    ],
    totalKg: 55.0,
    subtotal: 1360000,
    discountTotal: 0,
    taxTotal: 0,
    total: 1360000,
    paymentType: "banco",
    paymentDetails: {
      bankAmount: 1360000,
      bankReference: "Bancolombia QR #77491",
    },
    status: "pagada",
    origin: "despacho",
    notes: "Transferencia bancaria validada en terminal móvil.",
    issuedAt: "2026-08-27T09:30:00.000Z",
    sellerName: "Carlos Pérez (Furgón KLP-541)",
  },
  {
    id: "inv-10456",
    number: "FAC-2026-10456",
    prefix: "FAC",
    orderId: "10456",
    customerId: "c3",
    customerName: "Piqueteadero & Fonda La 80",
    customerNit: "900.542.118-4",
    customerPhone: "312 456 7890",
    customerAddress: "Calle 80 # 58-12, Polo Club",
    customerZone: "Zona Norte (Usaquén - Suba - Cedritos)",
    items: [
      {
        id: "item-6",
        productId: "p7",
        sku: "JD-TOC-07",
        productName: "Tocino barriguero crudo con piel",
        brand: "jd_distribuidora",
        quantityKg: 25.0,
        unitPrice: 20000,
        subtotal: 500000,
        taxRate: 0,
      },
      {
        id: "item-7",
        productId: "p8",
        sku: "JD-PER-08",
        productName: "Pernil de cerdo crudo (Pierna entera)",
        brand: "jd_distribuidora",
        quantityKg: 25.0,
        unitPrice: 20000,
        subtotal: 500000,
        taxRate: 0,
      },
    ],
    totalKg: 50.0,
    subtotal: 1000000,
    discountTotal: 0,
    taxTotal: 0,
    total: 1000000,
    paymentType: "credito",
    paymentDetails: {
      creditAmount: 1000000,
      creditDays: 30,
      creditDueDate: "2026-09-26",
    },
    status: "pendiente",
    origin: "despacho",
    notes: "Crédito aprobado a 30 días según condiciones comerciales pactadas.",
    issuedAt: "2026-08-27T10:15:00.000Z",
    sellerName: "Carlos Pérez (Furgón KLP-541)",
  },
  {
    id: "inv-10457",
    number: "FAC-2026-10457",
    prefix: "FAC",
    orderId: "10457",
    customerId: "c4",
    customerName: "Carnicería & Fama La Cabaña de Suba",
    customerNit: "901.443.220-5",
    customerPhone: "318 665 4321",
    customerAddress: "Avenida Suba # 118-40, Suba Centro",
    customerZone: "Zona Norte (Usaquén - Suba - Cedritos)",
    items: [
      {
        id: "item-8",
        productId: "p5",
        sku: "JD-CST-05",
        productName: "Costilla de cerdo San Luis (St. Louis Cut)",
        brand: "jd_distribuidora",
        quantityKg: 20.0,
        unitPrice: 21000,
        subtotal: 420000,
        taxRate: 0,
      },
      {
        id: "item-9",
        productId: "p9",
        sku: "JD-BRZ-09",
        productName: "Brazo de cerdo crudo despostado",
        brand: "jd_distribuidora",
        quantityKg: 20.0,
        unitPrice: 18000,
        subtotal: 360000,
        taxRate: 0,
      },
    ],
    totalKg: 40.0,
    subtotal: 780000,
    discountTotal: 0,
    taxTotal: 0,
    total: 780000,
    paymentType: "efectivo",
    paymentDetails: {
      cashAmount: 780000,
      cashGiven: 800000,
      cashChange: 20000,
    },
    status: "pagada",
    origin: "despacho",
    notes: "Entrega efectuada con firma digital y recaudado en sobre.",
    issuedAt: "2026-08-27T11:00:00.000Z",
    sellerName: "Carlos Pérez (Furgón KLP-541)",
  },
  {
    id: "inv-10458",
    number: "FAC-2026-10458",
    prefix: "FAC",
    customerId: "c5",
    customerName: "Asadero Carnes & Brasas Toberín",
    customerNit: "900.887.654-9",
    customerPhone: "320 998 1122",
    customerAddress: "Autopista Norte # 168-20, Toberín",
    customerZone: "Zona Norte (Usaquén - Suba - Cedritos)",
    items: [
      {
        id: "item-10",
        productId: "p10",
        sku: "GA-CST-01",
        productName: "Costilla Ahumada al Leño Gourmet",
        brand: "gourmet_ahumados",
        quantityKg: 30.0,
        unitPrice: 28000,
        subtotal: 840000,
        taxRate: 0,
      },
      {
        id: "item-11",
        productId: "p11",
        sku: "GA-CHL-02",
        productName: "Chuleta Ahumada al Roble Gourmet",
        brand: "gourmet_ahumados",
        quantityKg: 30.0,
        unitPrice: 20583.33,
        subtotal: 617500,
        taxRate: 0,
      },
    ],
    totalKg: 60.0,
    subtotal: 1457500,
    discountTotal: 0,
    taxTotal: 0,
    total: 1457500,
    paymentType: "efectivo",
    paymentDetails: {
      cashAmount: 1457500,
      cashGiven: 1500000,
      cashChange: 42500,
    },
    status: "pagada",
    origin: "mostrador",
    notes: "Facturación directa mostrador planta de ahumados.",
    issuedAt: "2026-08-27T12:30:00.000Z",
    sellerName: "Planta Principal (Báscula)",
  },
];

export class BillingService {
  static getInvoices(): Invoice[] {
    if (typeof window === "undefined") return INITIAL_INVOICES;
    try {
      const stored = localStorage.getItem(BILLING_STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading invoices:", e);
    }
    return INITIAL_INVOICES;
  }

  static saveInvoices(invoices: Invoice[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.error("Error saving invoices:", e);
    }
  }

  static clearAllInvoices(): Invoice[] {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify([]));
      } catch (e) {
        console.error("Error clearing invoices:", e);
      }
    }
    return [];
  }

  static processRefund(
    invoiceId: string,
    refundData: {
      type: "total" | "parcial";
      refundedAmount: number;
      refundedKg: number;
      reason: string;
      refundedItems?: {
        productId: string;
        productName: string;
        quantityKg: number;
        amount: number;
      }[];
    }
  ): Invoice | null {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((i) => i.id === invoiceId);
    if (index === -1) return null;

    const target = invoices[index];
    const newStatus = refundData.type === "total" ? "devuelta_total" : "devuelta_parcial";

    const updated: Invoice = {
      ...target,
      status: newStatus,
      refundDetails: {
        ...refundData,
        refundedAt: new Date().toISOString(),
      },
    };

    invoices[index] = updated;
    this.saveInvoices(invoices);
    return updated;
  }

  static getCompanySettings(brand: BrandType = "jd_distribuidora"): BillingSettings {
    if (brand === "gourmet_ahumados") {
      return COMPANY_GOURMET_SETTINGS;
    }
    return COMPANY_JD_SETTINGS;
  }

  static getSettings(): BillingSettings {
    if (typeof window === "undefined") return DEFAULT_BILLING_SETTINGS;
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading billing settings:", e);
    }
    return DEFAULT_BILLING_SETTINGS;
  }

  static saveSettings(settings: BillingSettings): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving billing settings:", e);
    }
  }

  static getNextInvoiceNumber(brand: BrandType = "jd_distribuidora"): { number: string; nextSeq: number } {
    const settings = this.getCompanySettings(brand);
    const invoices = this.getInvoices().filter(
      (i) => i.brand === brand || (!i.brand && brand === "jd_distribuidora")
    );

    const maxNumber = invoices.reduce((max, inv) => {
      const parts = inv.number.split("-");
      const num = parseInt(parts[parts.length - 1], 10);
      return !isNaN(num) && num > max ? num : max;
    }, settings.currentNumber);

    const nextSeq = maxNumber + 1;
    const formatted = `${settings.prefix}-2026-${String(nextSeq).padStart(4, "0")}`;
    return { number: formatted, nextSeq };
  }

  static exportToCSV(invoices: Invoice[], brandFilter: "all" | BrandType = "all"): void {
    const filteredInvoices =
      brandFilter === "all"
        ? invoices
        : invoices.filter((i) => (i.brand || "jd_distribuidora") === brandFilter);

    const headers = [
      "Numero Factura",
      "Empresa Emisora",
      "NIT Empresa",
      "Fecha Emision",
      "Cliente",
      "NIT Cliente",
      "Direccion",
      "Zona",
      "Kilos Totales",
      "Subtotal COP",
      "Descuento COP",
      "Total Factura COP",
      "Forma de Pago",
      "Estado",
      "Origen",
      "Vendedor / Chofer",
    ];

    const rows = filteredInvoices.map((inv) => {
      const isGourmet = inv.brand === "gourmet_ahumados";
      const compName = inv.companyName || (isGourmet ? COMPANY_GOURMET_SETTINGS.companyName : COMPANY_JD_SETTINGS.companyName);
      const compNit = inv.companyNit || (isGourmet ? COMPANY_GOURMET_SETTINGS.nit : COMPANY_JD_SETTINGS.nit);

      return [
        inv.number,
        `"${compName}"`,
        compNit,
        inv.issuedAt,
        `"${inv.customerName.replace(/"/g, '""')}"`,
        inv.customerNit,
        `"${(inv.customerAddress || "").replace(/"/g, '""')}"`,
        `"${(inv.customerZone || "").replace(/"/g, '""')}"`,
        inv.totalKg.toFixed(2),
        inv.subtotal,
        inv.discountTotal,
        inv.total,
        inv.paymentType.toUpperCase(),
        inv.status.toUpperCase(),
        inv.origin.toUpperCase(),
        `"${inv.sellerName.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const brandSuffix =
      brandFilter === "jd_distribuidora"
        ? "JD_Distribuidora"
        : brandFilter === "gourmet_ahumados"
        ? "Gourmet_Ahumados"
        : "Consolidado_JD_y_Gourmet";

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Libro_Ventas_${brandSuffix}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
