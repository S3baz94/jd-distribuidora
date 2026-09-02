"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from "react";
import {
  Customer,
  Product,
  InventoryItem,
  Order,
  CartItem,
  OrderStatus,
  AdminRole,
  BrandType,
  DeliveryRoute,
  RepeatOrderValidationResult,
  DriverExpense,
  Invoice,
  InvoiceItem,
  BillingSettings,
  InvoicePaymentType,
  LicenseConfig,
  LicenseState,
} from "@/types";
import { customerService } from "@/services/customerService";
import { inventoryService } from "@/services/inventoryService";
import { priceService } from "@/services/priceService";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { routeService } from "@/services/routeService";
import { soundService } from "@/services/soundService";
import { INITIAL_EXPENSES } from "@/services/serverState";
import { BillingService, DEFAULT_BILLING_SETTINGS } from "@/services/billingService";
import { LicenseService, DEFAULT_LICENSE_CONFIG } from "@/services/licenseService";
import { autoAssignOrdersToRoutes } from "@/services/routeOptimizer";

interface ToastInfo {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface AppContextType {
  customer: Customer;
  allCustomers: Customer[];
  switchCustomer: (customerId: string) => void;
  loginCustomerByIdentifier: (term: string) => { success: boolean; customer?: Customer; error?: string };
  getMagicLinkForCustomer: (customerId: string) => string;
  products: Product[];
  inventory: InventoryItem[];
  orders: Order[];
  allOrders: Order[];
  routes: DeliveryRoute[];
  allRoutes: DeliveryRoute[];
  cart: CartItem[];
  cartTotal: number;
  cartKg: number;
  cartItemsCount: number;
  activeOrder: Order | undefined;
  lastOrder: Order | undefined;
  selectedBrand: BrandType;
  setSelectedBrand: (brand: BrandType) => void;
  adminRole: AdminRole;
  setAdminRole: (role: AdminRole) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  getProductStock: (productId: string) => InventoryItem | undefined;
  getProductPrice: (productId: string) => number;
  addToCart: (product: Product, quantity: number) => { success: boolean; error?: string };
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; error?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (data: {
    deliveryDate: string;
    deliveryAddress: string;
    notes: string;
    brand?: BrandType | "mixed";
  }) => Promise<Order>;
  repeatOrder: (order: Order) => Promise<RepeatOrderValidationResult>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmDelivery: (
    orderId: string,
    details: {
      paymentMethod?: "efectivo" | "banco" | "credito";
      receivedByName?: string;
      deliveredBasketsLeft?: number;
      emptyBasketsCollected?: number;
      invoicePhoto?: string;
      customerSignature?: string;
      returnDetails?: {
        hasReturn: boolean;
        type: "total" | "parcial";
        returnedKg: number;
        returnedAmount: number;
        returnNote: string;
        returnedAt: string;
        returnedItems?: {
          productId: string;
          productName: string;
          quantityKg: number;
          amount: number;
        }[];
      };
    }
  ) => void;
  adjustOrderRealWeight: (
    orderId: string,
    realQuantities: { productId: string; realQuantity: number }[]
  ) => void;
  updateOrderDispatch: (
    orderId: string,
    details: { driverName?: string; driverPhone?: string; sealNumber?: string; internalNotes?: string }
  ) => void;
  assignOrderToRoute: (orderId: string, routeId: string, stopOrder?: number) => void;
  autoAssignRoutes: () => { totalAssigned: number; routesCount: number };
  updateRouteStatus: (routeId: string, status: "planned" | "in_transit" | "completed") => void;
  createRoute: (newRoute: DeliveryRoute) => void;
  addInventoryBatch: (productId: string, addedKg: number, note?: string) => void;
  updateInventoryStock: (
    productId: string,
    updates: Partial<Omit<InventoryItem, "productId" | "companyId">>
  ) => void;
  createCustomer: (customer: Customer) => void;
  updateCustomerData: (customerId: string, updates: Partial<Customer>) => void;
  expenses: DriverExpense[];
  addDriverExpense: (expense: Omit<DriverExpense, "id" | "createdAt">) => void;
  resetAllDemoData: () => void;

  // Facturación & POS
  invoices: Invoice[];
  billingSettings: BillingSettings;
  createInvoice: (
    newInvoice: Omit<Invoice, "id" | "number" | "prefix" | "issuedAt"> & { customNumber?: string }
  ) => Invoice;
  cancelInvoice: (invoiceId: string) => void;
  updateInvoicePayment: (
    invoiceId: string,
    paymentType: InvoicePaymentType,
    paymentDetails: Invoice["paymentDetails"]
  ) => void;
  processInvoiceRefund: (
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
  ) => void;
  updateBillingSettings: (settings: BillingSettings) => void;
  exportInvoicesCSV: (brandFilter?: "all" | BrandType) => void;

  // Licenciamiento & Master Kill-Switch
  license: LicenseConfig;
  updateLicenseConfig: (updates: Partial<LicenseConfig>) => void;
  toggleRemoteLock: (locked: boolean, reason?: string) => void;
  verifyDeveloperPin: (pin: string) => boolean;
  extendLicenseDays: (days: number) => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CART_STORAGE_KEY = "porcob2b_cart_state_v11";
const DATA_VERSION_KEY = "porcob2b_data_version";
const CURRENT_VERSION = "jd_gourmet_routes_v11.0";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer>(customerService.getCurrentCustomer());
  const [allCustomers, setAllCustomers] = useState<Customer[]>(customerService.getAllDemoCustomers());
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [expenses, setExpenses] = useState<DriverExpense[]>(INITIAL_EXPENSES);
  const [invoices, setInvoices] = useState<Invoice[]>(() => BillingService.getInvoices());
  const [billingSettings, setBillingSettings] = useState<BillingSettings>(() => BillingService.getSettings());
  const [license, setLicense] = useState<LicenseConfig>(() => LicenseService.getConfig());
  const [selectedBrand, setSelectedBrand] = useState<BrandType>("jd_distribuidora");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [adminRole, setAdminRole] = useState<AdminRole>("admin");
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const lastServerTimestamp = useRef<number>(0);
  const broadcastChannel = useRef<BroadcastChannel | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to send action to server & broadcast
  const sendSyncAction = async (action: string, payload: unknown) => {
    try {
      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage({ action, payload, timestamp: Date.now() });
      }

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.lastUpdated) {
          lastServerTimestamp.current = data.lastUpdated;
        }
      }
    } catch (e) {
      console.error("Error sending sync action", e);
    }
  };

  // Process server state payload
  const applyRemoteState = (data: {
    orders: Order[];
    inventory: InventoryItem[];
    customers: Customer[];
    routes?: DeliveryRoute[];
    expenses?: DriverExpense[];
    lastUpdated: number;
  }) => {
    if (!data || !data.orders) return;

    setAllOrders((prev) => {
      const newOrders = data.orders.filter(
        (remoteOrd) => !prev.some((localOrd) => localOrd.id === remoteOrd.id)
      );

      if (newOrders.length > 0) {
        soundService.playOrderReceived();
        newOrders.forEach((o) => {
          showToast(`🔔 ¡Nuevo pedido ${o.orderNumber} de ${o.customerName}!`, "success");
        });
      } else {
        prev.forEach((localOrd) => {
          const remoteMatch = data.orders.find((r) => r.id === localOrd.id);
          if (remoteMatch && remoteMatch.status !== localOrd.status) {
            soundService.playStatusUpdated();
            showToast(
              `📦 Pedido ${remoteMatch.orderNumber} actualizado a "${remoteMatch.status}"`,
              "info"
            );
          }
        });
      }

      return data.orders;
    });

    setOrders(data.orders.filter((o) => o.customerId === customer.id));
    setInventory(data.inventory);
    setAllCustomers(data.customers);
    if (data.routes) {
      setRoutes(data.routes);
      routeService.saveRoutes(data.routes);
    }
    if (data.expenses) {
      setExpenses(data.expenses);
    }

    inventoryService.saveInventory(data.inventory);
    orderService.saveOrders(data.orders);
    customerService.saveAllCustomers(data.customers);

    lastServerTimestamp.current = data.lastUpdated || Date.now();
  };

  // Initialize data and connect BroadcastChannel & Polling
  useEffect(() => {
    setIsMounted(true);

    try {
      const storedVer = localStorage.getItem(DATA_VERSION_KEY);
      if (storedVer !== CURRENT_VERSION) {
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
        inventoryService.resetInventory();
        orderService.resetOrders();
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch {
      // ignore
    }

    let currentCustomer = customerService.getCurrentCustomer();
    const customerList = customerService.getAllDemoCustomers();
    const orderList = orderService.getAllOrders();
    const routeList = routeService.getRoutes();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const clientParam =
        params.get("c") ||
        params.get("cliente") ||
        params.get("nit") ||
        params.get("tel") ||
        params.get("phone");

      if (clientParam) {
        const cleanParam = clientParam.trim().toLowerCase().replace(/[\s\-\.]/g, "");
        const matched = customerList.find((c) => {
          const cleanPhone = (c.phone || "").replace(/[\s\-\.]/g, "").toLowerCase();
          const cleanNit = (c.nit || "").replace(/[\s\-\.]/g, "").toLowerCase();
          const cleanId = c.id.toLowerCase();
          return (
            cleanId === cleanParam ||
            cleanPhone === cleanParam ||
            cleanPhone.endsWith(cleanParam) ||
            cleanNit === cleanParam
          );
        });

        if (matched) {
          currentCustomer = matched;
          customerService.setCurrentCustomer(matched);
          setTimeout(() => {
            showToast(
              `🥩 ¡Acceso Mágico Directo! Comprando para: ${matched.businessName}`,
              "success"
            );
          }, 800);
        }
      }
    }

    setCustomer(currentCustomer);
    setAllCustomers(customerList);
    setInventory(inventoryService.getInventory());
    setAllOrders(orderList);
    setOrders(orderList.filter((o) => o.customerId === currentCustomer.id));
    setRoutes(routeList);

    productService.getProducts(currentCustomer.companyId).then(setProducts);

    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch {
      // ignore
    }

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("porcob2b_realtime_sync");
      broadcastChannel.current = channel;

      channel.onmessage = (event) => {
        const { action, payload } = event.data;
        if (action === "STATE_UPDATED") {
          applyRemoteState(payload);
        } else {
          fetch(`/api/sync?since=${lastServerTimestamp.current}`)
            .then((r) => r.json())
            .then((res) => {
              if (res.hasChanged) {
                applyRemoteState(res);
              }
            })
            .catch(() => {});
        }
      };
    }

    fetch("/api/sync")
      .then((r) => r.json())
      .then((res) => {
        if (res && res.orders) {
          applyRemoteState(res);
        }
      })
      .catch(() => {});

    const pollInterval = setInterval(() => {
      fetch(`/api/sync?since=${lastServerTimestamp.current}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.hasChanged) {
            applyRemoteState(res);
          }
        })
        .catch(() => {});
    }, 2500);

    return () => {
      clearInterval(pollInterval);
      if (broadcastChannel.current) {
        broadcastChannel.current.close();
      }
    };
  }, [customer.id]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, isMounted]);

  const switchCustomer = (customerId: string) => {
    const found = allCustomers.find((c) => c.id === customerId);
    if (found) {
      setCustomer(found);
      customerService.setCurrentCustomer(found);
      const currentOrders = allOrders.filter((o) => o.customerId === found.id);
      setOrders(currentOrders);
      showToast(`Sesión cambiada a: ${found.businessName}`, "info");
    }
  };

  const getMagicLinkForCustomer = (customerId: string): string => {
    if (typeof window !== "undefined") {
      const baseUrl = window.location.origin;
      return `${baseUrl}/?c=${customerId}`;
    }
    return `https://jd-distribuidora.vercel.app/?c=${customerId}`;
  };

  const loginCustomerByIdentifier = (
    term: string
  ): { success: boolean; customer?: Customer; error?: string } => {
    const cleanTerm = term.trim().toLowerCase().replace(/[\s\-\.]/g, "");
    if (!cleanTerm) {
      return { success: false, error: "Ingresa tu número de celular o NIT registrado." };
    }

    const found = allCustomers.find((c) => {
      const cleanPhone = (c.phone || "").replace(/[\s\-\.]/g, "").toLowerCase();
      const cleanNit = (c.nit || "").replace(/[\s\-\.]/g, "").toLowerCase();
      const cleanId = c.id.toLowerCase();
      const cleanName = c.businessName.toLowerCase();

      return (
        cleanPhone === cleanTerm ||
        cleanPhone.endsWith(cleanTerm) ||
        cleanNit === cleanTerm ||
        cleanNit.includes(cleanTerm) ||
        cleanId === cleanTerm ||
        cleanName.includes(cleanTerm)
      );
    });

    if (found) {
      setCustomer(found);
      customerService.setCurrentCustomer(found);
      const currentOrders = allOrders.filter((o) => o.customerId === found.id);
      setOrders(currentOrders);
      showToast(`¡Bienvenido! Sesión activa: ${found.businessName}`, "success");
      return { success: true, customer: found };
    }

    return {
      success: false,
      error: "No encontramos un negocio con ese celular o NIT. Comunícate a nuestra línea de WhatsApp.",
    };
  };

  const getProductStock = (productId: string) => {
    return inventory.find((inv) => inv.productId === productId);
  };

  const getProductPrice = (productId: string) => {
    return priceService.getPriceForCustomer(customer.priceListId, productId);
  };

  const addToCart = (product: Product, quantity: number) => {
    const stock = getProductStock(product.id);
    const availableQty = stock ? stock.availableQuantity : 0;

    if (availableQty <= 0) {
      const errorMsg = `"${product.name}" se encuentra agotado actualmente.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (quantity > availableQty) {
      const errorMsg = `Solo hay ${availableQty} kg disponibles de "${product.name}".`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (quantity < product.minimumQuantity) {
      const errorMsg = `El pedido mínimo para "${product.name}" es de ${product.minimumQuantity} kg.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if ((quantity - product.minimumQuantity) % product.quantityStep !== 0) {
      const errorMsg = `La cantidad debe ser en múltiplos de ${product.quantityStep} kg (mínimo ${product.minimumQuantity} kg).`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const unitPrice = getProductPrice(product.id);

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          product,
          quantity,
          unitPrice,
        };
        return updated;
      }
      return [...prev, { product, quantity, unitPrice }];
    });

    showToast(`Se agregaron ${quantity} kg de ${product.name} al pedido`, "success");
    return { success: true };
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, error: "Producto no encontrado" };

    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const stock = getProductStock(productId);
    const availableQty = stock ? stock.availableQuantity : 0;

    if (quantity > availableQty) {
      const error = `Solo hay ${availableQty} kg disponibles de ${product.name}`;
      showToast(error, "error");
      return { success: false, error };
    }

    if (quantity < product.minimumQuantity) {
      const error = `La cantidad mínima es ${product.minimumQuantity} kg`;
      showToast(error, "error");
      return { success: false, error };
    }

    const unitPrice = getProductPrice(productId);

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity, unitPrice }
          : item
      )
    );

    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast("Producto eliminado del pedido", "info");
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = async (data: {
    deliveryDate: string;
    deliveryAddress: string;
    notes: string;
    brand?: BrandType | "mixed";
  }): Promise<Order> => {
    const hasJD = cart.some((i) => i.product.brand === "jd_distribuidora");
    const hasGourmet = cart.some((i) => i.product.brand === "gourmet_ahumados");
    const inferredBrand: BrandType | "mixed" =
      hasJD && hasGourmet ? "mixed" : hasGourmet ? "gourmet_ahumados" : "jd_distribuidora";

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      brand: item.product.brand,
      sku: item.product.sku,
      productName: item.product.name,
      unit: item.product.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));

    const subtotal = orderItems.reduce((acc, curr) => acc + curr.subtotal, 0);

    const newOrder = await orderService.createOrder({
      companyId: customer.companyId,
      customerId: customer.id,
      customerName: customer.businessName,
      brand: inferredBrand,
      items: orderItems,
      subtotal,
      total: subtotal,
      deliveryDate: data.deliveryDate,
      deliveryAddress: data.deliveryAddress,
      zone: customer.zone,
      notes: data.notes,
    });

    const updatedInv = inventoryService.getInventory();
    const updatedAllOrders = orderService.getAllOrders();

    setInventory(updatedInv);
    clearCart();

    // Trigger automatic route assignment (max 5 stops per zone)
    const optResult = autoAssignOrdersToRoutes([newOrder, ...allOrders], routes, allCustomers);
    setAllOrders(optResult.updatedOrders);
    setOrders(optResult.updatedOrders.filter((o) => o.customerId === customer.id));
    orderService.saveOrders(optResult.updatedOrders);
    setRoutes(optResult.updatedRoutes);
    routeService.saveRoutes(optResult.updatedRoutes);

    sendSyncAction("CREATE_ORDER", { order: newOrder, routes: optResult.updatedRoutes });

    showToast(`¡Pedido ${newOrder.orderNumber} registrado y asignado a ruta automática!`, "success");
    return newOrder;
  };

  const repeatOrder = async (order: Order): Promise<RepeatOrderValidationResult> => {
    const result = await orderService.validateRepeatOrder(order, customer.priceListId);

    const validItems: CartItem[] = [];

    for (const adj of result.adjustedItems) {
      if (adj.finalQty > 0) {
        const prod = products.find((p) => p.id === adj.productId);
        if (prod) {
          validItems.push({
            product: prod,
            quantity: adj.finalQty,
            unitPrice: adj.currentPrice,
          });
        }
      }
    }

    if (validItems.length > 0) {
      setCart(validItems);
      setIsCartOpen(true);
    }

    return result;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orderService.updateOrderStatus(orderId, status);
    if (updated) {
      const allOrd = orderService.getAllOrders();
      setAllOrders(allOrd);
      setOrders(allOrd.filter((o) => o.customerId === customer.id));

      sendSyncAction("UPDATE_ORDER_STATUS", { orderId, status });
      showToast(`Estado del pedido ${updated.orderNumber} actualizado a "${status}"`, "info");
    }
  };

  const confirmDelivery = (
    orderId: string,
    details: {
      paymentMethod?: "efectivo" | "banco" | "credito";
      receivedByName?: string;
      deliveredBasketsLeft?: number;
      emptyBasketsCollected?: number;
      invoicePhoto?: string;
      customerSignature?: string;
      returnDetails?: {
        hasReturn: boolean;
        type: "total" | "parcial";
        returnedKg: number;
        returnedAmount: number;
        returnNote: string;
        returnedAt: string;
        returnedItems?: {
          productId: string;
          productName: string;
          quantityKg: number;
          amount: number;
        }[];
      };
    }
  ) => {
    const updated = orderService.confirmDelivery(orderId, details);
    if (updated) {
      // Re-add stock if there was a return in delivery
      if (details.returnDetails && details.returnDetails.hasReturn && details.returnDetails.returnedItems) {
        details.returnDetails.returnedItems.forEach((item) => {
          if (item.quantityKg > 0) {
            inventoryService.addBatchStock(
              item.productId,
              item.quantityKg,
              `Reintegro por Devolución en Entrega - Chofer: ${details.returnDetails?.returnNote || "N/A"}`
            );
          }
        });
        setInventory(inventoryService.getInventory());
      }

      const allOrd = orderService.getAllOrders();
      setAllOrders(allOrd);
      setOrders(allOrd.filter((o) => o.customerId === customer.id));

      sendSyncAction("CONFIRM_DELIVERY", { orderId, details });
      soundService.playStatusUpdated();

      if (details.returnDetails?.hasReturn) {
        showToast(
          `↩ Entrega con Devolución (${details.returnDetails.returnedKg} kg): ${updated.customerName}. Reintegro registrado.`,
          "warning"
        );
      } else {
        showToast(
          `✅ Parada completada: ${updated.customerName} (${(details.paymentMethod || "efectivo").toUpperCase()})`,
          "success"
        );
      }
    }
  };

  const adjustOrderRealWeight = (
    orderId: string,
    realQuantities: { productId: string; realQuantity: number }[]
  ) => {
    const updated = orderService.adjustRealWeight(orderId, realQuantities);
    if (updated) {
      const allOrd = orderService.getAllOrders();
      setAllOrders(allOrd);
      setOrders(allOrd.filter((o) => o.customerId === customer.id));

      sendSyncAction("ADJUST_REAL_WEIGHT", { orderId, realQuantities });
      showToast(`Pesaje real de báscula registrado para ${updated.orderNumber}`, "success");
    }
  };

  const updateOrderDispatch = (
    orderId: string,
    details: { driverName?: string; driverPhone?: string; sealNumber?: string; internalNotes?: string }
  ) => {
    const updated = orderService.updateDispatchDetails(orderId, details);
    if (updated) {
      const allOrd = orderService.getAllOrders();
      setAllOrders(allOrd);
      setOrders(allOrd.filter((o) => o.customerId === customer.id));

      sendSyncAction("UPDATE_DISPATCH", { orderId, ...details });
      showToast(`Datos de despacho guardados para ${updated.orderNumber}`, "success");
    }
  };

  const assignOrderToRoute = (orderId: string, routeId: string, stopOrder?: number) => {
    const targetRoute = routes.find((r) => r.id === routeId);
    if (!targetRoute) return;

    // Update order with route name and driver
    const updatedOrders = allOrders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            routeId,
            routeName: targetRoute.name,
            driverName: targetRoute.driverName,
            driverPhone: targetRoute.driverPhone,
            stopOrder: stopOrder || 1,
          }
        : o
    );

    setAllOrders(updatedOrders);
    setOrders(updatedOrders.filter((o) => o.customerId === customer.id));
    orderService.saveOrders(updatedOrders);

    // Update route with orderId
    const updatedRoutes = routeService.assignOrderToRoute(orderId, routeId, stopOrder);
    setRoutes(updatedRoutes);

    sendSyncAction("ASSIGN_ORDER_TO_ROUTE", {
      orderId,
      routeId,
      routeName: targetRoute.name,
      driverName: targetRoute.driverName,
      driverPhone: targetRoute.driverPhone,
      stopOrder,
    });

    showToast(`Pedido asignado a ${targetRoute.name} (${targetRoute.driverName})`, "success");
  };

  const autoAssignRoutes = () => {
    const optResult = autoAssignOrdersToRoutes(allOrders, routes, allCustomers);
    setAllOrders(optResult.updatedOrders);
    setOrders(optResult.updatedOrders.filter((o) => o.customerId === customer.id));
    orderService.saveOrders(optResult.updatedOrders);

    setRoutes(optResult.updatedRoutes);
    routeService.saveRoutes(optResult.updatedRoutes);

    sendSyncAction("AUTO_ASSIGN_ROUTES", {
      orders: optResult.updatedOrders,
      routes: optResult.updatedRoutes,
    });

    showToast(
      `⚡ ${optResult.stats.totalOrdersAssigned} pedidos asignados automáticamente en ${optResult.stats.totalRoutesCreatedOrUpdated} furgones (Máx. 5 paradas por ruta).`,
      "success"
    );

    return {
      totalAssigned: optResult.stats.totalOrdersAssigned,
      routesCount: optResult.stats.totalRoutesCreatedOrUpdated,
    };
  };

  const updateRouteStatus = (routeId: string, status: "planned" | "in_transit" | "completed") => {
    const updatedRoutes = routeService.updateRouteStatus(routeId, status);
    setRoutes(updatedRoutes);

    sendSyncAction("UPDATE_ROUTE_STATUS", { routeId, status });
    showToast(`Estado de la ruta actualizado a "${status}"`, "info");
  };

  const createRoute = (newRoute: DeliveryRoute) => {
    const updated = routeService.createRoute(newRoute);
    setRoutes(updated);

    sendSyncAction("CREATE_ROUTE", { route: newRoute });
    showToast(`Nueva ruta ${newRoute.name} creada con éxito`, "success");
  };

  const addInventoryBatch = (productId: string, addedKg: number, note?: string) => {
    const updated = inventoryService.addBatchStock(productId, addedKg, note);
    setInventory(updated);

    sendSyncAction("ADD_INVENTORY_BATCH", { productId, addedKg, note });
    const prod = products.find((p) => p.id === productId);
    showToast(`+${addedKg} kg ingresados al stock de ${prod ? prod.name : "producto"}`, "success");
  };

  const updateInventoryStock = (
    productId: string,
    updates: Partial<Omit<InventoryItem, "productId" | "companyId">>
  ) => {
    const updated = inventoryService.updateStockManual(productId, updates);
    setInventory(updated);

    sendSyncAction("UPDATE_INVENTORY_MANUAL", { productId, updates });
    showToast("Inventario actualizado correctamente", "success");
  };

  const createCustomer = (newCust: Customer) => {
    const updated = customerService.addCustomer(newCust);
    setAllCustomers(updated);

    sendSyncAction("CREATE_CUSTOMER", { customer: newCust });
    showToast(`Cliente ${newCust.businessName} registrado con éxito`, "success");
  };

  const updateCustomerData = (customerId: string, updates: Partial<Customer>) => {
    const updated = customerService.updateCustomer(customerId, updates);
    setAllCustomers(updated);
    if (customer.id === customerId) {
      setCustomer((prev) => ({ ...prev, ...updates }));
    }

    sendSyncAction("STATE_UPDATED", {
      orders: allOrders,
      inventory,
      customers: updated,
      routes,
      lastUpdated: Date.now(),
    });

    showToast("Cliente actualizado", "success");
  };

  const addDriverExpense = (expData: Omit<DriverExpense, "id" | "createdAt">) => {
    const newExp: DriverExpense = {
      ...expData,
      id: `exp-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    sendSyncAction("ADD_DRIVER_EXPENSE", { expense: newExp });
    showToast(`📸 Gasto de $${expData.amount.toLocaleString()} registrado con éxito`, "success");
  };

  const resetAllDemoData = () => {
    const defInv = inventoryService.resetInventory();
    const defOrders = orderService.resetOrders();
    const defCustomers = customerService.getAllDemoCustomers();
    const defCustomer = defCustomers[0];
    const defRoutes = routeService.getRoutes();
    customerService.setCurrentCustomer(defCustomer);

    setInventory(defInv);
    setAllOrders(defOrders);
    setOrders(defOrders.filter((o) => o.customerId === defCustomer.id));
    setAllCustomers(defCustomers);
    setRoutes(defRoutes);
    setExpenses(INITIAL_EXPENSES);
    setCustomer(defCustomer);
    clearCart();

    sendSyncAction("RESET", {});
    showToast("Datos de demostración reiniciados", "success");
  };

  // ==========================================
  // FACTURACIÓN CÁRNICA & POS (SEPARACIÓN CORPORATIVA JD vs GOURMET)
  // ==========================================
  const createInvoice = (
    newInvoiceData: Omit<Invoice, "id" | "number" | "prefix" | "issuedAt"> & { customNumber?: string }
  ): Invoice => {
    // Detect brand based on items or explicit brand
    const isGourmet =
      newInvoiceData.brand === "gourmet_ahumados" ||
      (!newInvoiceData.brand &&
        newInvoiceData.items.length > 0 &&
        newInvoiceData.items.every((i) => i.brand === "gourmet_ahumados"));

    const targetBrand: BrandType = isGourmet ? "gourmet_ahumados" : "jd_distribuidora";
    const companySettings = BillingService.getCompanySettings(targetBrand);

    const { number } = BillingService.getNextInvoiceNumber(targetBrand);
    const invoiceNumber = newInvoiceData.customNumber || number;

    const newInvoice: Invoice = {
      ...newInvoiceData,
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      number: invoiceNumber,
      prefix: companySettings.prefix,
      brand: targetBrand,
      companyName: companySettings.companyName,
      companyNit: companySettings.nit,
      issuedAt: new Date().toISOString(),
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    BillingService.saveInvoices(updatedInvoices);

    soundService.playStatusUpdated();
    return newInvoice;
  };

  const cancelInvoice = (invoiceId: string) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: "anulada" as const } : inv
    );
    setInvoices(updated);
    BillingService.saveInvoices(updated);
    showToast("Factura anulada correctamente", "warning");
  };

  const updateInvoicePayment = (
    invoiceId: string,
    paymentType: InvoicePaymentType,
    paymentDetails: Invoice["paymentDetails"]
  ) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId
        ? { ...inv, paymentType, paymentDetails, status: "pagada" as const }
        : inv
    );
    setInvoices(updated);
    BillingService.saveInvoices(updated);
    showToast("Pago de factura registrado", "success");
  };

  const processInvoiceRefund = (
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
  ) => {
    const updated = BillingService.processRefund(invoiceId, refundData);
    if (updated) {
      const allInvs = BillingService.getInvoices();
      setInvoices(allInvs);

      // Restore inventory kg for refunded items
      if (refundData.refundedItems && refundData.refundedItems.length > 0) {
        refundData.refundedItems.forEach((item) => {
          if (item.quantityKg > 0) {
            inventoryService.addBatchStock(
              item.productId,
              item.quantityKg,
              `Reintegro por Devolución ${refundData.type === "total" ? "Total" : "Parcial"}`
            );
          }
        });
        setInventory(inventoryService.getInventory());
      }

      showToast(
        refundData.type === "total"
          ? `Devolución total procesada: $${refundData.refundedAmount.toLocaleString()} COP reintegrados al stock e inventario`
          : `Devolución parcial procesada: $${refundData.refundedAmount.toLocaleString()} COP y ${refundData.refundedKg} kg reintegrados al inventario`,
        "info"
      );
    }
  };

  const updateBillingSettings = (settings: BillingSettings) => {
    setBillingSettings(settings);
    BillingService.saveSettings(settings);
    showToast("Configuración de facturación actualizada", "success");
  };

  const exportInvoicesCSV = (brandFilter: "all" | BrandType = "all") => {
    BillingService.exportToCSV(invoices, brandFilter);
    const suffix =
      brandFilter === "jd_distribuidora"
        ? "JD Distribuidora"
        : brandFilter === "gourmet_ahumados"
        ? "Gourmet Ahumados"
        : "Consolidado";
    showToast(`📥 Libro contable de ${suffix} exportado a Excel (CSV)`, "success");
  };

  // ==========================================
  // LICENCIAMIENTO & MASTER KILL-SWITCH
  // ==========================================
  const updateLicenseConfig = (updates: Partial<LicenseConfig>) => {
    const current = LicenseService.getConfig();
    const updated = { ...current, ...updates };
    LicenseService.saveConfig(updated);
    setLicense(updated);
    showToast("Configuración de licencia actualizada", "success");
  };

  const toggleRemoteLock = (locked: boolean, reason?: string) => {
    const updated = LicenseService.setLockStatus(locked, reason);
    setLicense(updated);
    if (locked) {
      showToast("🔒 ACCESO SUSPENDIDO: Software bloqueado por licencia", "error");
    } else {
      showToast("🔓 ACCESO RESTABLECIDO: Software 100% activo", "success");
    }
  };

  const verifyDeveloperPin = (pin: string): boolean => {
    return LicenseService.verifyMasterPin(pin);
  };

  const extendLicenseDays = (days: number) => {
    const updated = LicenseService.extendValidity(days);
    setLicense(updated);
    showToast(`Licencia extendida por ${days} días`, "success");
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const cartKg = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.length;
  }, [cart]);

  const activeOrder = useMemo(() => {
    return orders.find(
      (o) =>
        o.status === "pending" ||
        o.status === "confirmed" ||
        o.status === "preparing" ||
        o.status === "ready" ||
        o.status === "dispatched"
    );
  }, [orders]);

  const lastOrder = useMemo(() => {
    if (orders.length === 0) return undefined;
    return orders[0];
  }, [orders]);

  return (
    <AppContext.Provider
      value={{
        customer,
        allCustomers,
        switchCustomer,
        loginCustomerByIdentifier,
        getMagicLinkForCustomer,
        products,
        inventory,
        orders,
        allOrders,
        routes,
        allRoutes: routes,
        cart,
        cartTotal,
        cartKg,
        cartItemsCount,
        activeOrder,
        lastOrder,
        selectedBrand,
        setSelectedBrand,
        adminRole,
        setAdminRole,
        toasts,
        showToast,
        removeToast,
        getProductStock,
        getProductPrice,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        repeatOrder,
        updateOrderStatus,
        confirmDelivery,
        adjustOrderRealWeight,
        updateOrderDispatch,
        assignOrderToRoute,
        autoAssignRoutes,
        updateRouteStatus,
        createRoute,
        addInventoryBatch,
        updateInventoryStock,
        createCustomer,
        updateCustomerData,
        expenses,
        addDriverExpense,
        resetAllDemoData,
        invoices,
        billingSettings,
        createInvoice,
        cancelInvoice,
        updateInvoicePayment,
        processInvoiceRefund,
        updateBillingSettings,
        exportInvoicesCSV,
        license,
        updateLicenseConfig,
        toggleRemoteLock,
        verifyDeveloperPin,
        extendLicenseDays,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
