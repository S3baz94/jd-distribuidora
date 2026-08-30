import { Product, ProductCategory, BrandType } from "@/types";
import { INITIAL_PRODUCTS } from "./mockData";

export const productService = {
  getProducts: async (companyId = "dist-001"): Promise<Product[]> => {
    return INITIAL_PRODUCTS.filter((p) => p.companyId === companyId && p.active);
  },

  getProductById: async (productId: string): Promise<Product | undefined> => {
    return INITIAL_PRODUCTS.find((p) => p.id === productId);
  },

  getProductsByBrand: async (brand: BrandType, companyId = "dist-001"): Promise<Product[]> => {
    return INITIAL_PRODUCTS.filter((p) => p.companyId === companyId && p.active && p.brand === brand);
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
