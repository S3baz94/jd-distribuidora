import { INITIAL_PRICES } from "./mockData";

const STORAGE_KEY = "porcob2b_prices_state_v2";

export const priceService = {
  getStoredPrices: (): Record<string, number> => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {};
  },

  setPriceForProduct: (productId: string, price: number, priceListId = "list-famas-a"): void => {
    if (typeof window !== "undefined") {
      try {
        const stored = priceService.getStoredPrices();
        const key = `${priceListId}::${productId}`;
        stored[key] = price;
        stored[productId] = price; // generic fallback
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch (e) {
        console.error("Error setting product price:", e);
      }
    }
  },

  getPriceForCustomer: (priceListId: string, productId: string): number => {
    // 1. Check custom prices saved by user in production
    const stored = priceService.getStoredPrices();
    const specificKey = `${priceListId}::${productId}`;
    if (stored[specificKey] !== undefined) return stored[specificKey];
    if (stored[productId] !== undefined) return stored[productId];

    // 2. Check mock prices
    const entry = INITIAL_PRICES.find(
      (p) => p.priceListId === priceListId && p.productId === productId
    );
    if (entry) return entry.pricePerUnit;

    // 3. Fallbacks
    const defaultPrices: Record<string, number> = {
      "prod-bondiola": 23000,
      "prod-lomo": 22000,
      "prod-solomito": 25000,
      "prod-costilla-sanluis": 20000,
      "prod-costilla-babyback": 22500,
      "prod-panceta": 22000,
      "prod-tocino-barriguero": 21500,
      "prod-pernil": 18500,
      "prod-brazo": 19000,
      "prod-chuleta": 20500,
      "prod-codillo": 15500,
      "prod-papada": 16500,
      "prod-espinazo": 12000,
    };
    return defaultPrices[productId] || 20000;
  },

  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);
  },

  formatKg: (kg: number): string => {
    return `${kg.toLocaleString("es-CO")} kg`;
  },
};
