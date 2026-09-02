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
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(INITIAL_CUSTOMERS[0]));
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
        const parsed: Customer[] = JSON.parse(stored);
        if (!parsed.some((c) => (c.phone || "").replace(/\D/g, "") === "3233218831")) {
          const merged = [INITIAL_CUSTOMERS[0], ...parsed];
          localStorage.setItem(ALL_CUSTOMERS_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
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
