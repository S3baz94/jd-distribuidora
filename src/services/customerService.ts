import { Customer } from "@/types";
import { INITIAL_CUSTOMERS } from "./mockData";

const CURRENT_CUSTOMER_KEY = "porcob2b_current_customer_v5";
const ALL_CUSTOMERS_KEY = "porcob2b_all_customers_v5";

export const customerService = {
  getCurrentCustomer: (): Customer => {
    if (typeof window === "undefined") return INITIAL_CUSTOMERS[0];
    try {
      const stored = localStorage.getItem(CURRENT_CUSTOMER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && parsed.id) {
          const baseCustomer = INITIAL_CUSTOMERS.find((c) => c.id === parsed.id) || INITIAL_CUSTOMERS[0];
          return {
            ...baseCustomer,
            ...parsed,
            minOrderAmount: parsed.minOrderAmount || baseCustomer.minOrderAmount || 300000,
            zone: parsed.zone || baseCustomer.zone || "Zona Norte (Cedritos - Usaquén - Suba)",
            address: parsed.address || baseCustomer.address || "Central de Carnes, Bodega Frigorífica JD",
            businessName: parsed.businessName || baseCustomer.businessName || "Cliente Mayorista",
          };
        }
      }
    } catch {
      // Fallback
    }
    try {
      localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(INITIAL_CUSTOMERS[0]));
    } catch {}
    return INITIAL_CUSTOMERS[0];
  },

  setCurrentCustomer: (customer: Customer) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(customer));
      } catch (e) {
        console.error("Error setting current customer", e);
      }
    }
  },

  getAllDemoCustomers: (): Customer[] => {
    if (typeof window === "undefined") return INITIAL_CUSTOMERS;
    try {
      const stored = localStorage.getItem(ALL_CUSTOMERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((c) => {
            const base = INITIAL_CUSTOMERS.find((init) => init.id === c?.id) || INITIAL_CUSTOMERS[0];
            return {
              ...base,
              ...c,
              minOrderAmount: c?.minOrderAmount || base.minOrderAmount || 300000,
            };
          });

          if (!sanitized.some((c) => (c?.phone || "").replace(/\D/g, "") === "3233218831")) {
            const merged = [INITIAL_CUSTOMERS[0], ...sanitized];
            localStorage.setItem(ALL_CUSTOMERS_KEY, JSON.stringify(merged));
            return merged;
          }
          return sanitized;
        }
      }
    } catch {
      // Fallback
    }
    localStorage.setItem(ALL_CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  },

  saveAllCustomers: (customers: Customer[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ALL_CUSTOMERS_KEY, JSON.stringify(customers));
      } catch (e) {
        console.error("Error saving customers", e);
      }
    }
  },

  addCustomer: (customer: Customer): Customer[] => {
    const list = customerService.getAllDemoCustomers();
    const updated = [...list, customer];
    customerService.saveAllCustomers(updated);
    return updated;
  },

  updateCustomer: (customerId: string, updates: Partial<Customer>): Customer[] => {
    const list = customerService.getAllDemoCustomers();
    const updated = list.map((c) => (c.id === customerId ? { ...c, ...updates } : c));
    customerService.saveAllCustomers(updated);

    const current = customerService.getCurrentCustomer();
    if (current.id === customerId) {
      customerService.setCurrentCustomer({ ...current, ...updates });
    }

    return updated;
  },

  deleteCustomer: (customerId: string): Customer[] => {
    const list = customerService.getAllDemoCustomers();
    // Protect principal VIP account 3233218831
    const updated = list.filter((c) => {
      const isVip = (c.phone || "").replace(/\D/g, "") === "3233218831" || c.id === "cust-sebastian";
      if (isVip && c.id === customerId) return true; // keep VIP
      return c.id !== customerId;
    });
    customerService.saveAllCustomers(updated);
    return updated;
  },
};
