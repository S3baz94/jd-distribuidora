import { Promotion, PromotionPeriod, BrandType } from "@/types";

export const INITIAL_PROMOTIONS: Promotion[] = [
  // ==========================================
  // ⚡ PROMOCIONES DIARIAS (OFERTAS DEL DÍA / FLASH)
  // ==========================================
  {
    id: "promo-dia-costilla-ahumada",
    period: "diaria",
    brand: "gourmet_ahumados",
    title: "Miércoles de Costilla Ahumada al Leño",
    subtitle: "Racks St. Louis con 6 horas de ahumado en leña de roble",
    badge: "⚡ OFERTA DEL DÍA • 10% OFF",
    validityText: "Solo por hoy miércoles hasta las 18:00 hrs",
    description: "Costillar St. Louis marinado con salmuera de especias finas. Tierna, jugosa y lista para dorar al carbón o asador.",
    discountPercentage: 10,
    specialPricePerKg: 31500,
    regularPricePerKg: 35000,
    productId: "prod-costilla-ahumada",
    productName: "Costilla de Cerdo Ahumada Tradicional Gourmet (St. Louis)",
    minKgRequirement: 5,
    giftText: "Despacho prioritario 06:00 AM",
    themeColor: "fire",
    iconType: "flame",
    active: true,
  },
  {
    id: "promo-dia-pernil-desposte",
    period: "diaria",
    brand: "jd_distribuidora",
    title: "Oferta Relámpago: Pierna / Pernil Despostado",
    subtitle: "Carne magra 100% despostada sin merma de hueso ni grasa",
    badge: "⚡ OFERTA DEL DÍA • PRECIO ESPECIAL",
    validityText: "Válido hoy hasta agotar lote de beneficio frigorífico",
    description: "Pierna trasera fresca de cerdo de granja tecnificada. Posta limpia para asados en bloque, lechonerías o porcionado en mostrador.",
    discountPercentage: 9,
    specialPricePerKg: 16900,
    regularPricePerKg: 18500,
    productId: "prod-pernil",
    productName: "Pernil de cerdo crudo (Pierna entera / desposte)",
    minKgRequirement: 10,
    giftText: "Pesaje exacto en báscula digital",
    themeColor: "gold",
    iconType: "percent",
    active: true,
  },
  {
    id: "promo-dia-combo-parrillero",
    period: "diaria",
    brand: "todas",
    title: "Combo Parrillero Express Asaderos",
    subtitle: "Bondiola Cruda Marmoleada + Costilla Ahumada al Leño",
    badge: "⚡ COMBO DEL DÍA • ENVÍO PRIORITARIO",
    validityText: "Válido hoy para pedidos con entrega en la mañana",
    description: "Lleva 5 kg de Bondiola fresca de cerdo + 5 kg de Costilla Ahumada Gourmet con precio preferencial en ambos cortes.",
    discountPercentage: 8,
    specialPricePerKg: 24900,
    regularPricePerKg: 27200,
    productId: "prod-bondiola",
    productName: "Bondiola de cerdo fresca",
    minKgRequirement: 5,
    giftText: "Precinto de seguridad INVIMA",
    themeColor: "emerald",
    iconType: "truck",
    active: true,
  },

  // ==========================================
  // 📅 PROMOCIONES SEMANALES (SEMANA DE AHORRO MAYORISTA)
  // ==========================================
  {
    id: "promo-sem-chuleta-flete",
    period: "semanal",
    brand: "gourmet_ahumados",
    title: "Semana Mayorista de Chuleta Ahumada",
    subtitle: "Chuletón de lomo curado al frío con flete refrigerado bonificado",
    badge: "📅 ESPECIAL SEMANAL • FLETE GRATIS",
    validityText: "Vigente de Lunes a Sábado de esta semana",
    description: "Por compras desde 20 kg de Chuleta Ahumada Tradicional Gourmet, tu flete en furgón refrigerado térmico es 100% bonificado.",
    discountPercentage: 10,
    specialPricePerKg: 26900,
    regularPricePerKg: 29900,
    productId: "prod-chuleta-ahumada",
    productName: "Chuleta de Cerdo Ahumada Tradicional Gourmet",
    minKgRequirement: 20,
    giftText: "Flete bonificado en furgón 0°C a 4°C",
    themeColor: "fire",
    iconType: "calendar",
    active: true,
  },
  {
    id: "promo-sem-tocino-chicharron",
    period: "semanal",
    brand: "jd_distribuidora",
    title: "Semana del Chicharrón: 12% OFF en Tocino Barriguero",
    subtitle: "Plancha cruda con piel limpia para chicharrón crocante 100 puntos",
    badge: "📅 ESPECIAL SEMANAL • 12% DE DESCUENTO",
    validityText: "Válido durante toda la semana comercial",
    description: "Tocino barriguero crudo con capas simétricas de carne magra y grasa firme. El insumo preferido de piqueteaderos y restaurantes típicos.",
    discountPercentage: 12,
    specialPricePerKg: 17600,
    regularPricePerKg: 20000,
    productId: "prod-panceta",
    productName: "Panceta de cerdo fresca en plancha",
    minKgRequirement: 15,
    giftText: "Corte recto listo para porcionar",
    themeColor: "gold",
    iconType: "flame",
    active: true,
  },
  {
    id: "promo-sem-duo-lomo-costilla",
    period: "semanal",
    brand: "todas",
    title: "Dúo Semanal Ahorro: Lomo Magro + Costilla San Luis",
    subtitle: "La combinación perfecta de carne magra y costillar carnudo",
    badge: "📅 ESPECIAL SEMANAL • DÚO INSTITUCIONAL",
    validityText: "Disponible toda esta semana en Bogotá D.C.",
    description: "Abastécete con 10 kg de Lomo Cañón 100% magro crudo y 10 kg de Costilla San Luis para el menú de toda la semana.",
    discountPercentage: 7,
    specialPricePerKg: 21800,
    regularPricePerKg: 23500,
    productId: "prod-lomo",
    productName: "Lomo / Cañón de cerdo extra magro",
    minKgRequirement: 10,
    giftText: "Empaque al vacío incluido",
    themeColor: "blue",
    iconType: "sparkles",
    active: true,
  },

  // ==========================================
  // 🏆 PROMOCIONES MENSUALES (PLANES INSTITUCIONALES & FIDELIDAD)
  // ==========================================
  {
    id: "promo-mes-asaderos-vip",
    period: "mensual",
    brand: "todas",
    title: "Plan Mensual Asaderos & Restaurantes VIP",
    subtitle: "5% de Cashback en Notas Crédito + Canastillas Bonificadas",
    badge: "🏆 PLAN MENSUAL • CLIENTES VIP",
    validityText: "Válido todo el mes de septiembre",
    description: "Por compras acumuladas superiores a 150 kg en el mes calendario, recibe 5% de reintegro en nota crédito para tus facturas y 10 canastillas sin depósito.",
    discountPercentage: 5,
    giftText: "5% Cashback + Canastillas gratis",
    themeColor: "emerald",
    iconType: "trophy",
    active: true,
  },
  {
    id: "promo-mes-precio-congelado",
    period: "mensual",
    brand: "jd_distribuidora",
    title: "Garantía de Tarifa Congelada Famas & Carnicerías",
    subtitle: "Precio fijo garantizado en cortes primarios todo el mes",
    badge: "🏆 PLAN MENSUAL • ESTABILIDAD MAYORISTA",
    validityText: "Vigente durante todo el mes en curso",
    description: "Programa tu pedido fijo semanal de Pernil, Brazo o Lomo y te garantizamos precio congelado sin sufrir por variaciones de subasta ganadera.",
    giftText: "Tarifa fija sin alzas",
    themeColor: "blue",
    iconType: "calendar",
    active: true,
  },
  {
    id: "promo-mes-kit-gourmet",
    period: "mensual",
    brand: "gourmet_ahumados",
    title: "Plan Institucional Gourmet Ahumados",
    subtitle: "Exhibidor publicitario en acrílico + Delantal oficial de regalo",
    badge: "🏆 PLAN MENSUAL • MERCHANDISING EXCLUSIVO",
    validityText: "Aplica para nuevos contratos de suministro mensual",
    description: "Incorpora la línea Gourmet Ahumados en tu asadero o salsamentaria y recibe gratis el kit de punto de venta: hablador de mesa, afiche oficial y delantal.",
    giftText: "Kit publicitario oficial incluido",
    themeColor: "fire",
    iconType: "sparkles",
    active: true,
  },
];

const STORAGE_KEY = "porcob2b_promotions_v1";

export const promotionService = {
  getAllPromotions: (): Promotion[] => {
    if (typeof window === "undefined") return INITIAL_PROMOTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Promotion[] = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error reading promotions from storage:", e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROMOTIONS));
    return INITIAL_PROMOTIONS;
  },

  getPromotionsByPeriod: (period: PromotionPeriod): Promotion[] => {
    const all = promotionService.getAllPromotions();
    return all.filter((p) => p.period === period && p.active);
  },

  getPromotionsByBrand: (brand: BrandType | "todas"): Promotion[] => {
    const all = promotionService.getAllPromotions();
    if (brand === "todas") return all.filter((p) => p.active);
    return all.filter((p) => (p.brand === brand || p.brand === "todas") && p.active);
  },

  getPromotionById: (id: string): Promotion | undefined => {
    const all = promotionService.getAllPromotions();
    return all.find((p) => p.id === id);
  },
};
