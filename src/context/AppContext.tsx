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
    realQuantities: { productId: string; realQuantity: number }[],
    tareDetails?: { tareNote?: string; totalGrossKg?: number; totalTareKg?: number; totalNetKg?: number }
  ) => void;
  updateOrderDispatch: (
    orderId: string,
    details: { driverName?: string; driverPhone?: string; sealNumber?: string; internalNotes?: string }
  ) => void;
  assignOrderToRoute: (orderId: string, routeId: string, stopOrder?: number) => void;
  autoAssignRoutes: () => { totalAssigned: number; routesCount: number };
  reorderRouteOrders: (routeId: string, orderedOrders: Order[]) => void;
  updateRouteStatus: (routeId: string, status: "planned" | "in_transit" | "completed") => void;
  createRoute: (newRoute: DeliveryRoute) => void;
  addInventoryBatch: (productId: string, addedKg: number, note?: string) => void;
  updateInventoryStock: (
    productId: string,
    updates: Partial<Omit<InventoryItem, "productId" | "companyId">>
  ) => void;
  createCustomer: (customer: Customer) => void;
  updateCustomerData: (customerId: string, updates: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  createProduct: (product: Product, initialStockKg: number, initialPrice: number) => void;
  updateProduct: (productId: string, updates: Partial<Product>, newPrice?: number) => void;
  deleteProduct: (productId: string) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  createManualOrder: (order: Partial<Order>) => Order;
  clearDemoData: (options?: { wipeOrders?: boolean; wipeInvoices?: boolean; wipeDemoCustomers?: boolean }) => void;
  exportSystemBackup: () => void;
  importSystemBackup: (backupJson: string) => boolean;
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
  invoiceOrder: (
    orderId: string,
    paymentType?: InvoicePaymentType,
    paymentDetails?: Invoice["paymentDetails"]
  ) => Invoice | null;
  invoiceAllPendingOrders: () => number;
  isOrderInvoiced: (order: Order) => boolean;
  getOrderInvoice: (order: Order) => Invoice | undefined;

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

    setProducts(productService.getProducts(currentCustomer.companyId));

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

    // ==========================================
    // FACTURACIÓN AUTOMÁTICA INMEDIATA AL CREAR PEDIDO
    // ==========================================
    const targetBrand: BrandType = inferredBrand === "gourmet_ahumados" ? "gourmet_ahumados" : "jd_distribuidora";
    const companySettings = BillingService.getCompanySettings(targetBrand);
    const { number: invoiceNumber } = BillingService.getNextInvoiceNumber(targetBrand);

    const invoiceItems: InvoiceItem[] = orderItems.map((item, idx) => ({
      id: `item-${newOrder.id}-${idx}`,
      productId: item.productId,
      sku: item.sku,
      productName: item.productName,
      brand: item.brand || targetBrand,
      quantityKg: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      taxRate: 0,
    }));

    const totalKg = invoiceItems.reduce((s, i) => s + i.quantityKg, 0);

    const autoInvoice: Invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      number: invoiceNumber,
      prefix: companySettings.prefix,
      brand: targetBrand,
      companyName: companySettings.companyName,
      companyNit: companySettings.nit,
      orderId: newOrder.id,
      customerId: customer.id,
      customerName: customer.businessName,
      customerNit: customer.nit || "901.684.219-3",
      customerPhone: customer.phone,
      customerAddress: data.deliveryAddress || customer.address,
      customerZone: customer.zone,
      items: invoiceItems,
      totalKg,
      subtotal,
      discountTotal: 0,
      taxTotal: 0,
      total: subtotal,
      paymentType: "efectivo",
      paymentDetails: { cashAmount: subtotal },
      status: "pendiente",
      origin: "pedido_web",
      notes: `Factura generada automáticamente al confirmar el pedido web ${newOrder.orderNumber}. ${data.notes || ""}`,
      sellerName: "Portal Clientes Web JD",
      issuedAt: new Date().toISOString(),
    };

    // Actualizar pedido con los datos fiscales de inmediato
    newOrder.invoiceId = autoInvoice.id;
    newOrder.invoiceNumber = autoInvoice.number;
    newOrder.isInvoiced = true;
    newOrder.invoicedAt = autoInvoice.issuedAt;
    newOrder.status = "ready";

    // Guardar factura en almacenamiento fiscal
    const currentInvoices = BillingService.getInvoices();
    const updatedInvoices = [autoInvoice, ...currentInvoices];
    BillingService.saveInvoices(updatedInvoices);
    setInvoices(updatedInvoices);

    const updatedInv = inventoryService.getInventory();
    setInventory(updatedInv);
    clearCart();

    // Trigger automatic route assignment (max 5 stops per zone)
    const optResult = autoAssignOrdersToRoutes([newOrder, ...allOrders], routes, allCustomers);
    setAllOrders(optResult.updatedOrders);
    setOrders(optResult.updatedOrders.filter((o) => o.customerId === customer.id));
    orderService.saveOrders(optResult.updatedOrders);
    setRoutes(optResult.updatedRoutes);
    routeService.saveRoutes(optResult.updatedRoutes);

    sendSyncAction("CREATE_ORDER", {
      order: newOrder,
      invoice: autoInvoice,
      routes: optResult.updatedRoutes,
    });

    showToast(
      `¡Pedido ${newOrder.orderNumber} registrado y FACTURADO automáticamente (${autoInvoice.number})!`,
      "success"
    );
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
    realQuantities: { productId: string; realQuantity: number }[],
    tareDetails?: { tareNote?: string; totalGrossKg?: number; totalTareKg?: number; totalNetKg?: number }
  ) => {
    const updated = orderService.adjustRealWeight(orderId, realQuantities);
    if (updated) {
      if (tareDetails?.tareNote) {
        updated.notes = `${updated.notes || ""}\n[Báscula Tara Canastillas]: ${tareDetails.tareNote}`.trim();
        const currentList = orderService.getAllOrders().map((o) => (o.id === updated.id ? updated : o));
        orderService.saveOrders(currentList);
      }

      // Si el pedido ya tiene factura emitida, actualizar los ítems, kilos y total de la factura
      const existingInvoice = getOrderInvoice(updated);
      if (existingInvoice) {
        const updatedInvoiceItems = existingInvoice.items.map((invItem) => {
          const matchedOrderItem = updated.items.find((oi) => oi.productId === invItem.productId);
          if (matchedOrderItem && matchedOrderItem.realQuantity !== undefined) {
            return {
              ...invItem,
              quantityKg: matchedOrderItem.realQuantity,
              subtotal: matchedOrderItem.realSubtotal || matchedOrderItem.realQuantity * invItem.unitPrice,
            };
          }
          return invItem;
        });

        const newTotalKg = updatedInvoiceItems.reduce((s, i) => s + i.quantityKg, 0);
        const newSubtotal = updatedInvoiceItems.reduce((s, i) => s + i.subtotal, 0);

        const tareNotice = tareDetails?.tareNote
          ? `\n[Liquidación Báscula Tara]: ${tareDetails.tareNote}`
          : `\n[Liquidación Báscula]: ${newTotalKg.toFixed(2)} kg netos.`;

        const updatedInvoice: Invoice = {
          ...existingInvoice,
          items: updatedInvoiceItems,
          totalKg: newTotalKg,
          subtotal: newSubtotal,
          total: newSubtotal,
          paymentDetails: {
            ...existingInvoice.paymentDetails,
            cashAmount: existingInvoice.paymentType === "efectivo" ? newSubtotal : existingInvoice.paymentDetails?.cashAmount,
            bankAmount: existingInvoice.paymentType === "banco" ? newSubtotal : existingInvoice.paymentDetails?.bankAmount,
            creditAmount: existingInvoice.paymentType === "credito" ? newSubtotal : existingInvoice.paymentDetails?.creditAmount,
          },
          notes: `${existingInvoice.notes || ""}${tareNotice}`.trim(),
        };

        const currentInvoices = BillingService.getInvoices();
        const updatedInvoicesList = currentInvoices.map((inv) =>
          inv.id === updatedInvoice.id ? updatedInvoice : inv
        );
        BillingService.saveInvoices(updatedInvoicesList);
        setInvoices(updatedInvoicesList);
      }

      const allOrd = orderService.getAllOrders();
      setAllOrders(allOrd);
      setOrders(allOrd.filter((o) => o.customerId === customer.id));

      sendSyncAction("ADJUST_REAL_WEIGHT", { orderId, realQuantities, tareDetails });
      showToast(
        `⚖️ Gramaje neto aplicado a Factura & Pedido ${updated.orderNumber} (${priceService.formatCurrency(
          updated.realTotal || updated.total
        )})`,
        "success"
      );
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

  const reorderRouteOrders = (routeId: string, orderedOrders: Order[]) => {
    const orderIdToStopOrder = new Map<string, number>();
    orderedOrders.forEach((o, idx) => {
      orderIdToStopOrder.set(o.id, idx + 1);
    });

    const updatedOrders = allOrders.map((o) => {
      if (orderIdToStopOrder.has(o.id)) {
        return {
          ...o,
          stopOrder: orderIdToStopOrder.get(o.id)!,
        };
      }
      return o;
    });

    setAllOrders(updatedOrders);
    setOrders(updatedOrders.filter((o) => o.customerId === customer.id));
    orderService.saveOrders(updatedOrders);

    const updatedRoutes = routes.map((r) => {
      if (r.id === routeId) {
        return {
          ...r,
          orderIds: orderedOrders.map((o) => o.id),
        };
      }
      return r;
    });

    setRoutes(updatedRoutes);
    routeService.saveRoutes(updatedRoutes);

    sendSyncAction("STATE_UPDATED", {
      orders: updatedOrders,
      routes: updatedRoutes,
      inventory,
      customers: allCustomers,
      lastUpdated: Date.now(),
    });

    showToast(`✓ Ruta reordenada por cercanía a la ubicación actual (${orderedOrders.length} paradas)`, "success");
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

  const deleteCustomer = (customerId: string) => {
    const updated = customerService.deleteCustomer(customerId);
    setAllCustomers(updated);
    showToast("Cliente eliminado correctamente", "info");
  };

  const createProduct = (newProduct: Product, initialStockKg: number, initialPrice: number) => {
    const updated = productService.addProduct(newProduct);
    setProducts(updated);

    const newInvItem: InventoryItem = {
      productId: newProduct.id,
      companyId: newProduct.companyId,
      physicalQuantity: initialStockKg,
      availableQuantity: initialStockKg,
      reservedQuantity: 0,
      futureQuantity: 0,
      canReserveFuture: true,
    };
    const updatedInv = [...inventory, newInvItem];
    setInventory(updatedInv);
    inventoryService.saveInventory(updatedInv);

    priceService.setPriceForProduct(newProduct.id, initialPrice);

    sendSyncAction("STATE_UPDATED", {
      orders: allOrders,
      inventory: updatedInv,
      customers: allCustomers,
      routes,
      lastUpdated: Date.now(),
    });

    showToast(`✓ Producto "${newProduct.name}" registrado con éxito (${initialStockKg} kg iniciales)`, "success");
  };

  const updateProduct = (productId: string, updates: Partial<Product>, newPrice?: number) => {
    const updated = productService.updateProduct(productId, updates);
    setProducts(updated);

    if (newPrice !== undefined) {
      priceService.setPriceForProduct(productId, newPrice);
    }

    sendSyncAction("STATE_UPDATED", {
      orders: allOrders,
      inventory,
      customers: allCustomers,
      routes,
      lastUpdated: Date.now(),
    });

    showToast("✓ Producto y precio actualizados", "success");
  };

  const deleteProduct = (productId: string) => {
    const updated = productService.deleteProduct(productId);
    setProducts(updated);

    const updatedInv = inventory.filter((i) => i.productId !== productId);
    setInventory(updatedInv);
    inventoryService.saveInventory(updatedInv);

    showToast("Producto eliminado del catálogo", "info");
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    priceService.setPriceForProduct(productId, newPrice);
    setProducts((prev) => [...prev]);
    showToast(`✓ Precio actualizado a ${priceService.formatCurrency(newPrice)}/kg`, "success");
  };

  const createManualOrder = (orderData: Partial<Order>): Order => {
    const nextOrderNum = 10542 + allOrders.length + 1;
    const orderNumber = `#${nextOrderNum}`;

    const newOrder: Order = {
      id: `ord-${nextOrderNum}`,
      orderNumber,
      companyId: orderData.companyId || "dist-001",
      customerId: orderData.customerId || allCustomers[0]?.id || "cust-sebastian",
      customerName: orderData.customerName || allCustomers[0]?.businessName || "Cliente Mostrador",
      brand: orderData.brand || "jd_distribuidora",
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      total: orderData.total || 0,
      deliveryDate: orderData.deliveryDate || "Hoy / Despacho Inmediato",
      deliveryAddress: orderData.deliveryAddress || "Entrega en Mostrador Planta",
      zone: orderData.zone || "Zona Centro",
      notes: orderData.notes || "Pedido manual tomado desde Administración",
      status: (orderData.status as OrderStatus) || "pending",
      paymentMethod: orderData.paymentMethod || "efectivo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inventoryService.deductStock(
      newOrder.items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    );

    // ==========================================
    // FACTURACIÓN AUTOMÁTICA INMEDIATA PARA PEDIDO MANUAL
    // ==========================================
    const targetBrand: BrandType = newOrder.brand === "gourmet_ahumados" ? "gourmet_ahumados" : "jd_distribuidora";
    const companySettings = BillingService.getCompanySettings(targetBrand);
    const { number: invoiceNumber } = BillingService.getNextInvoiceNumber(targetBrand);

    const targetCustomer = allCustomers.find((c) => c.id === newOrder.customerId);

    const invoiceItems: InvoiceItem[] = newOrder.items.map((item, idx) => ({
      id: `item-${newOrder.id}-${idx}`,
      productId: item.productId,
      sku: item.sku,
      productName: item.productName,
      brand: item.brand || targetBrand,
      quantityKg: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal || item.quantity * item.unitPrice,
      taxRate: 0,
    }));

    const totalKg = invoiceItems.reduce((s, i) => s + i.quantityKg, 0);
    const subtotal = invoiceItems.reduce((s, i) => s + i.subtotal, 0);

    const pType: InvoicePaymentType = (newOrder.paymentMethod as InvoicePaymentType) || "efectivo";

    const autoInvoice: Invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      number: invoiceNumber,
      prefix: companySettings.prefix,
      brand: targetBrand,
      companyName: companySettings.companyName,
      companyNit: companySettings.nit,
      orderId: newOrder.id,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      customerNit: targetCustomer?.nit || "901.684.219-3",
      customerPhone: targetCustomer?.phone,
      customerAddress: newOrder.deliveryAddress || targetCustomer?.address,
      customerZone: newOrder.zone || targetCustomer?.zone,
      items: invoiceItems,
      totalKg,
      subtotal,
      discountTotal: 0,
      taxTotal: 0,
      total: subtotal,
      paymentType: pType,
      paymentDetails: {
        cashAmount: pType === "efectivo" ? subtotal : undefined,
        bankAmount: pType === "banco" ? subtotal : undefined,
        creditAmount: pType === "credito" ? subtotal : undefined,
      },
      status: pType === "credito" ? "pendiente" : "pagada",
      origin: "mostrador",
      notes: `Factura automática generada con el pedido manual ${newOrder.orderNumber}. ${newOrder.notes || ""}`,
      sellerName: "Administración / Mostrador JD",
      issuedAt: new Date().toISOString(),
    };

    newOrder.invoiceId = autoInvoice.id;
    newOrder.invoiceNumber = autoInvoice.number;
    newOrder.isInvoiced = true;
    newOrder.invoicedAt = autoInvoice.issuedAt;
    newOrder.status = "ready";

    const currentInvoices = BillingService.getInvoices();
    const updatedInvoices = [autoInvoice, ...currentInvoices];
    BillingService.saveInvoices(updatedInvoices);
    setInvoices(updatedInvoices);

    const updatedOrders = [newOrder, ...allOrders];
    setAllOrders(updatedOrders);
    setOrders(updatedOrders.filter((o) => o.customerId === customer.id));
    orderService.saveOrders(updatedOrders);
    setInventory(inventoryService.getInventory());

    sendSyncAction("NEW_ORDER", { order: newOrder, invoice: autoInvoice });
    showToast(`✓ Pedido ${newOrder.orderNumber} registrado y FACTURADO (${autoInvoice.number})`, "success");
    return newOrder;
  };

  const clearDemoData = (options?: { wipeOrders?: boolean; wipeInvoices?: boolean; wipeDemoCustomers?: boolean }) => {
    const wipeOrders = options?.wipeOrders !== false;
    const wipeInvoices = options?.wipeInvoices !== false;
    const wipeDemoCust = options?.wipeDemoCustomers === true;

    if (wipeOrders) {
      orderService.clearAllOrders();
      setAllOrders([]);
      setOrders([]);
    }

    if (wipeInvoices) {
      BillingService.clearAllInvoices();
      setInvoices([]);
    }

    if (wipeDemoCust) {
      const vipOnly = allCustomers.filter(
        (c) => (c.phone || "").replace(/\D/g, "") === "3233218831" || c.id === "cust-sebastian"
      );
      customerService.saveAllCustomers(vipOnly);
      setAllCustomers(vipOnly);
    }

    sendSyncAction("STATE_UPDATED", {
      orders: wipeOrders ? [] : allOrders,
      inventory,
      customers: allCustomers,
      routes,
      lastUpdated: Date.now(),
    });

    showToast("🧹 Datos de prueba limpiados. El sistema está listo para ingresar tus datos reales.", "success");
  };

  const exportSystemBackup = () => {
    const backup = {
      appName: "JD Distribuidora & Gourmet Ahumados",
      backupDate: new Date().toISOString(),
      version: CURRENT_VERSION,
      products: productService.getAllProductsRaw(),
      inventory: inventoryService.getInventory(),
      customers: customerService.getAllDemoCustomers(),
      orders: orderService.getAllOrders(),
      invoices: BillingService.getInvoices(),
      billingSettings,
      routes,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `JD_Distribuidora_Respaldo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("💾 Copia de respaldo exportada exitosamente en JSON", "success");
  };

  const importSystemBackup = (backupJson: string): boolean => {
    try {
      const data = JSON.parse(backupJson);
      if (!data || !data.customers || !data.inventory) {
        showToast("Archivo de respaldo inválido", "error");
        return false;
      }

      if (data.products && Array.isArray(data.products)) {
        productService.saveProducts(data.products);
        setProducts(data.products);
      }
      if (data.inventory && Array.isArray(data.inventory)) {
        inventoryService.saveInventory(data.inventory);
        setInventory(data.inventory);
      }
      if (data.customers && Array.isArray(data.customers)) {
        customerService.saveAllCustomers(data.customers);
        setAllCustomers(data.customers);
      }
      if (data.orders && Array.isArray(data.orders)) {
        orderService.saveOrders(data.orders);
        setAllOrders(data.orders);
        setOrders(data.orders.filter((o: Order) => o.customerId === customer.id));
      }
      if (data.invoices && Array.isArray(data.invoices)) {
        BillingService.saveInvoices(data.invoices);
        setInvoices(data.invoices);
      }
      if (data.routes && Array.isArray(data.routes)) {
        routeService.saveRoutes(data.routes);
        setRoutes(data.routes);
      }
      if (data.billingSettings) {
        BillingService.saveSettings(data.billingSettings);
        setBillingSettings(data.billingSettings);
      }

      sendSyncAction("STATE_UPDATED", {
        orders: data.orders || [],
        inventory: data.inventory || [],
        customers: data.customers || [],
        routes: data.routes || [],
        lastUpdated: Date.now(),
      });

      showToast("✓ Copia de seguridad restaurada correctamente", "success");
      return true;
    } catch (err) {
      console.error("Error importing backup:", err);
      showToast("Error al importar archivo de respaldo", "error");
      return false;
    }
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

  const getOrderInvoice = (order: Order): Invoice | undefined => {
    return invoices.find(
      (i) =>
        (order.invoiceId && i.id === order.invoiceId) ||
        (order.invoiceNumber && i.number === order.invoiceNumber) ||
        i.orderId === order.id ||
        i.orderId === order.orderNumber ||
        i.orderId === order.orderNumber.replace("#", "")
    );
  };

  const isOrderInvoiced = (order: Order): boolean => {
    return (
      order.isInvoiced === true ||
      !!order.invoiceId ||
      !!order.invoiceNumber ||
      !!getOrderInvoice(order)
    );
  };

  const invoiceOrder = (
    orderId: string,
    paymentType?: InvoicePaymentType,
    paymentDetails?: Invoice["paymentDetails"]
  ): Invoice | null => {
    const targetOrder = allOrders.find(
      (o) => o.id === orderId || o.orderNumber === orderId || o.orderNumber === `#${orderId}`
    );
    if (!targetOrder) {
      showToast("No se encontró el pedido para facturar", "error");
      return null;
    }

    // Check if already invoiced
    const existing = getOrderInvoice(targetOrder);
    if (existing) {
      showToast(`El pedido ${targetOrder.orderNumber} ya tiene la factura ${existing.number}`, "info");
      return existing;
    }

    const targetCustomer = allCustomers.find((c) => c.id === targetOrder.customerId);
    const invoiceBrand: BrandType =
      targetOrder.brand === "gourmet_ahumados" ? "gourmet_ahumados" : "jd_distribuidora";

    // Map items from order
    const invoiceItems: InvoiceItem[] = targetOrder.items.map((item, idx) => {
      const kg = item.realQuantity || item.quantity;
      const subtotal = item.realSubtotal || item.subtotal || kg * item.unitPrice;
      return {
        id: `item-${targetOrder.id}-${idx}`,
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        brand: item.brand || invoiceBrand,
        quantityKg: kg,
        unitPrice: item.unitPrice,
        subtotal,
        taxRate: 0,
      };
    });

    const totalKg = invoiceItems.reduce((s, i) => s + i.quantityKg, 0);
    const subtotal = invoiceItems.reduce((s, i) => s + i.subtotal, 0);
    const total = subtotal;

    const pType: InvoicePaymentType =
      paymentType || (targetOrder.paymentMethod as InvoicePaymentType) || "efectivo";
    const pDetails = paymentDetails || {
      cashAmount: pType === "efectivo" ? total : undefined,
      bankAmount: pType === "banco" ? total : undefined,
      creditAmount: pType === "credito" ? total : undefined,
      creditDays: pType === "credito" ? 30 : undefined,
    };

    const newInvoice = createInvoice({
      orderId: targetOrder.id,
      customerId: targetOrder.customerId,
      customerName: targetOrder.customerName,
      customerNit: targetCustomer?.nit || "901.684.219-3",
      customerPhone: targetCustomer?.phone,
      customerAddress: targetOrder.deliveryAddress || targetCustomer?.address,
      customerZone: targetOrder.zone || targetCustomer?.zone,
      items: invoiceItems,
      totalKg,
      subtotal,
      discountTotal: 0,
      taxTotal: 0,
      total,
      paymentType: pType,
      paymentDetails: pDetails,
      status: pType === "credito" ? "pendiente" : "pagada",
      origin: "despacho",
      brand: invoiceBrand,
      notes: `Factura de venta generada para el pedido ${targetOrder.orderNumber}. ${targetOrder.notes || ""}`,
      sellerName: targetOrder.driverName || "Despacho Báscula JD",
    });

    // Update order with invoice details & status ready
    const updatedOrders = allOrders.map((o) => {
      if (o.id === targetOrder.id) {
        return {
          ...o,
          invoiceId: newInvoice.id,
          invoiceNumber: newInvoice.number,
          isInvoiced: true,
          invoicedAt: newInvoice.issuedAt,
          status: o.status === "pending" || o.status === "preparing" ? ("ready" as OrderStatus) : o.status,
        };
      }
      return o;
    });

    setAllOrders(updatedOrders);
    setOrders(updatedOrders.filter((o) => o.customerId === customer.id));
    orderService.saveOrders(updatedOrders);

    sendSyncAction("STATE_UPDATED", {
      orders: updatedOrders,
      inventory,
      customers: allCustomers,
      routes,
      lastUpdated: Date.now(),
    });

    showToast(`✓ Factura ${newInvoice.number} emitida para ${targetOrder.customerName}. ¡Pedido listo para enrutar!`, "success");
    return newInvoice;
  };

  const invoiceAllPendingOrders = (): number => {
    const unInvoiced = allOrders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled" && !isOrderInvoiced(o)
    );

    if (unInvoiced.length === 0) {
      showToast("Todos los pedidos activos ya cuentan con factura emitida.", "info");
      return 0;
    }

    let count = 0;
    unInvoiced.forEach((order) => {
      invoiceOrder(order.id);
      count++;
    });

    showToast(`✓ Se facturaron ${count} pedidos exitosamente. ¡Rutas listas para armar!`, "success");
    return count;
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
        reorderRouteOrders,
        updateRouteStatus,
        createRoute,
        addInventoryBatch,
        updateInventoryStock,
        createCustomer,
        updateCustomerData,
        deleteCustomer,
        createProduct,
        updateProduct,
        deleteProduct,
        updateProductPrice,
        createManualOrder,
        clearDemoData,
        exportSystemBackup,
        importSystemBackup,
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
        invoiceOrder,
        invoiceAllPendingOrders,
        isOrderInvoiced,
        getOrderInvoice,
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
