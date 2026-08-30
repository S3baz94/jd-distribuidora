import { InventoryItem, StockAvailabilityStatus } from "@/types";
import { INITIAL_INVENTORY } from "./mockData";

const STORAGE_KEY = "porcob2b_inventory_state_v4";

export const inventoryService = {
  getInventory: (companyId = "dist-001"): InventoryItem[] => {
    if (typeof window === "undefined") return INITIAL_INVENTORY;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: InventoryItem[] = JSON.parse(stored);
        if (parsed.some((i) => i.productId === "prod-bondiola")) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY));
    return INITIAL_INVENTORY;
  },

  saveInventory: (inventory: InventoryItem[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
      } catch (e) {
        console.error("Error saving inventory state", e);
      }
    }
  },

  getProductStock: (productId: string, currentInventory?: InventoryItem[]): InventoryItem | undefined => {
    const list = currentInventory || inventoryService.getInventory();
    return list.find((item) => item.productId === productId);
  },

  getStockStatus: (availableQuantity: number): { status: StockAvailabilityStatus; label: string; color: string } => {
    if (availableQuantity <= 0) {
      return {
        status: "out_of_stock",
        label: "Agotado",
        color: "text-red-700 bg-red-50 border-red-200",
      };
    }
    if (availableQuantity <= 15) {
      return {
        status: "limited",
        label: "Disponibilidad limitada",
        color: "text-amber-700 bg-amber-50 border-amber-200",
      };
    }
    return {
      status: "available",
      label: "Disponible",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
  },

  deductStock: (items: { productId: string; quantity: number }[]): InventoryItem[] => {
    const current = inventoryService.getInventory();
    const updated = current.map((inv) => {
      const orderItem = items.find((i) => i.productId === inv.productId);
      if (!orderItem) return inv;

      const newAvailable = Math.max(0, inv.availableQuantity - orderItem.quantity);
      const newReserved = inv.reservedQuantity + orderItem.quantity;
      return {
        ...inv,
        availableQuantity: newAvailable,
        reservedQuantity: newReserved,
      };
    });

    inventoryService.saveInventory(updated);
    return updated;
  },

  addBatchStock: (productId: string, addedKg: number, note?: string): InventoryItem[] => {
    const current = inventoryService.getInventory();
    const updated = current.map((inv) => {
      if (inv.productId === productId) {
        return {
          ...inv,
          physicalQuantity: inv.physicalQuantity + addedKg,
          availableQuantity: inv.availableQuantity + addedKg,
        };
      }
      return inv;
    });

    inventoryService.saveInventory(updated);
    return updated;
  },

  updateStockManual: (
    productId: string,
    updates: Partial<Omit<InventoryItem, "productId" | "companyId">>
  ): InventoryItem[] => {
    const current = inventoryService.getInventory();
    const updated = current.map((inv) => {
      if (inv.productId === productId) {
        return {
          ...inv,
          ...updates,
        };
      }
      return inv;
    });

    inventoryService.saveInventory(updated);
    return updated;
  },

  resetInventory: (): InventoryItem[] => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY));
    }
    return INITIAL_INVENTORY;
  },
};
