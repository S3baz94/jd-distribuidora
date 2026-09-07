import { DeliveryRoute } from "@/types";
import { INITIAL_ROUTES } from "./mockData";

const ROUTES_STORAGE_KEY = "porcob2b_routes_v1";

export const routeService = {
  getRoutes: (): DeliveryRoute[] => {
    if (typeof window === "undefined") return INITIAL_ROUTES;
    try {
      const stored = localStorage.getItem(ROUTES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(INITIAL_ROUTES));
    return INITIAL_ROUTES;
  },

  saveRoutes: (routes: DeliveryRoute[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
      } catch (e) {
        console.error("Error saving routes", e);
      }
    }
  },

  assignOrderToRoute: (
    orderId: string,
    routeId: string,
    stopOrder?: number,
    insertAsNext?: boolean
  ): DeliveryRoute[] => {
    const routes = routeService.getRoutes();
    const updated = routes.map((r) => {
      // Remove from other routes if previously assigned
      const filteredOrderIds = r.orderIds.filter((id) => id !== orderId);
      if (r.id === routeId) {
        const newOrderIds = [...filteredOrderIds];
        if (insertAsNext) {
          // Insert at the beginning of the route order sequence
          newOrderIds.unshift(orderId);
        } else if (typeof stopOrder === "number" && stopOrder > 0) {
          newOrderIds.splice(stopOrder - 1, 0, orderId);
        } else {
          newOrderIds.push(orderId);
        }

        return {
          ...r,
          orderIds: newOrderIds,
        };
      }
      return {
        ...r,
        orderIds: filteredOrderIds,
      };
    });

    routeService.saveRoutes(updated);
    return updated;
  },

  updateRouteStatus: (routeId: string, status: "planned" | "in_transit" | "completed"): DeliveryRoute[] => {
    const routes = routeService.getRoutes();
    const updated = routes.map((r) => (r.id === routeId ? { ...r, status } : r));
    routeService.saveRoutes(updated);
    return updated;
  },

  createRoute: (newRoute: DeliveryRoute): DeliveryRoute[] => {
    const routes = routeService.getRoutes();
    const updated = [...routes, newRoute];
    routeService.saveRoutes(updated);
    return updated;
  },
};
