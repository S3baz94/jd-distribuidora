import { Product, ProductCategory, BrandType } from "@/types";
import { INITIAL_PRODUCTS } from "./mockData";

const STORAGE_KEY = "porcob2b_products_state_v2";

export const productService = {
  getProducts: (companyId = "dist-001"): Product[] => {
    if (typeof window === "undefined") {
      return INITIAL_PRODUCTS.filter((p) => p.companyId === companyId && p.active);
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Product[] = JSON.parse(stored);
        if (parsed.length > 0) {
          return parsed.filter((p) => p.companyId === companyId && p.active);
        }
      }
    } catch (e) {
      console.warn("Error reading products from storage:", e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS.filter((p) => p.companyId === companyId && p.active);
  },

  getAllProductsRaw: (): Product[] => {
    if (typeof window === "undefined") return INITIAL_PRODUCTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Product[] = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  saveProducts: (products: Product[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      } catch (e) {
        console.error("Error saving products:", e);
      }
    }
  },

  addProduct: (newProduct: Product): Product[] => {
    const list = productService.getAllProductsRaw();
    const updated = [newProduct, ...list];
    productService.saveProducts(updated);
    return updated;
  },

  updateProduct: (productId: string, updates: Partial<Product>): Product[] => {
    const list = productService.getAllProductsRaw();
    const updated = list.map((p) => (p.id === productId ? { ...p, ...updates } : p));
    productService.saveProducts(updated);
    return updated;
  },

  deleteProduct: (productId: string): Product[] => {
    const list = productService.getAllProductsRaw();
    const updated = list.filter((p) => p.id !== productId);
    productService.saveProducts(updated);
    return updated;
  },

  resetProducts: (): Product[] => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    return INITIAL_PRODUCTS;
  },

  getProductById: (productId: string): Product | undefined => {
    const list = productService.getAllProductsRaw();
    return list.find((p) => p.id === productId);
  },

  getProductsByBrand: (brand: BrandType, companyId = "dist-001"): Product[] => {
    const list = productService.getProducts(companyId);
    return list.filter((p) => p.brand === brand);
  },

  getCategories: (): { id: ProductCategory; label: string }[] => {
    return [
      { id: "cortes_magros", label: "🥩 Cortes Magros & Especiales (Bondiola, Lomo, Solomito, Pernil, Brazo)" },
      { id: "cortes_con_hueso", label: "🍖 Costillas & Cortes con Hueso (San Luis, Baby Back, Chuleta, Codillo)" },
      { id: "tocinos_grasas", label: "🥓 Pancetas & Tocinos (Panceta, Barriguero, Papada)" },
      { id: "ahumados_costillas", label: "🪵🔥 Costillas Ahumadas al Leño (Gourmet Ahumados)" },
      { id: "ahumados_chuletas", label: "🪵🥩 Chuletas Ahumadas Tradicionales (Gourmet Ahumados)" },
    ];
  },
};
