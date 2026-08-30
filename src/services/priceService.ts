import { INITIAL_PRICES } from "./mockData";

export const priceService = {
  getPriceForCustomer: (priceListId: string, productId: string): number => {
    const entry = INITIAL_PRICES.find(
      (p) => p.priceListId === priceListId && p.productId === productId
    );
    if (entry) return entry.pricePerUnit;

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
