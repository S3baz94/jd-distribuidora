import { Order, OrderStatus, RepeatOrderValidationResult, PickingSummaryItem, BrandType } from "@/types";
import { INITIAL_ORDERS } from "./mockData";
import { inventoryService } from "./inventoryService";
import { priceService } from "./priceService";
import { productService } from "./productService";

const ORDERS_KEY = "porcob2b_orders_state_v5";

export const orderService = {
  getOrders: (customerId?: string): Order[] => {
    if (typeof window === "undefined") {
      return customerId
        ? INITIAL_ORDERS.filter((o) => o.customerId === customerId)
        : INITIAL_ORDERS;
    }

    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (stored) {
        const orders: Order[] = JSON.parse(stored);
        if (orders.length > 0) {
          return customerId ? orders.filter((o) => o.customerId === customerId) : orders;
        }
      }
    } catch {
      // Fallback
    }

    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    return customerId
      ? INITIAL_ORDERS.filter((o) => o.customerId === customerId)
      : INITIAL_ORDERS;
  },

  getAllOrders: (): Order[] => {
    return orderService.getOrders();
  },

  getOrderById: (orderId: string): Order | undefined => {
    const orders = orderService.getOrders();
    return orders.find((o) => o.id === orderId || o.orderNumber === orderId || o.orderNumber === `#${orderId}`);
  },

  saveOrders: (orders: Order[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      } catch (e) {
        console.error("Error saving orders", e);
      }
    }
  },

  createOrder: async (data: {
    companyId: string;
    customerId: string;
    customerName: string;
    brand?: BrandType | "mixed";
    items: {
      productId: string;
      brand?: BrandType;
      sku: string;
      productName: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[];
    subtotal: number;
    total: number;
    deliveryDate: string;
    deliveryAddress: string;
    zone?: string;
    notes: string;
  }): Promise<Order> => {
    const allOrders = orderService.getOrders();
    const nextOrderNum = 10542 + allOrders.length - INITIAL_ORDERS.length;
    const orderNumber = `#${nextOrderNum}`;

    const newOrder: Order = {
      id: `ord-${nextOrderNum}`,
      orderNumber,
      companyId: data.companyId,
      customerId: data.customerId,
      customerName: data.customerName,
      brand: data.brand || "jd_distribuidora",
      items: data.items,
      subtotal: data.subtotal,
      total: data.total,
      deliveryDate: data.deliveryDate,
      deliveryAddress: data.deliveryAddress,
      zone: data.zone,
      notes: data.notes,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct inventory
    inventoryService.deductStock(
      data.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    );

    // Prepend new order
    const updatedOrders = [newOrder, ...allOrders];
    orderService.saveOrders(updatedOrders);

    return newOrder;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus): Order | undefined => {
    const allOrders = orderService.getOrders();
    let updatedOrder: Order | undefined;

    const updatedOrders = allOrders.map((ord) => {
      if (ord.id === orderId || ord.orderNumber === orderId || ord.orderNumber === `#${orderId}`) {
        updatedOrder = {
          ...ord,
          status,
          updatedAt: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return ord;
    });

    if (updatedOrder) {
      orderService.saveOrders(updatedOrders);
    }

    return updatedOrder;
  },

  confirmDelivery: (
    orderId: string,
    details: {
      paymentMethod?: "efectivo" | "banco" | "credito";
      receivedByName?: string;
      deliveredBasketsLeft?: number;
      emptyBasketsCollected?: number;
      invoicePhoto?: string;
      customerSignature?: string;
    }
  ): Order | undefined => {
    const allOrders = orderService.getOrders();
    let updatedOrder: Order | undefined;

    const updatedOrders = allOrders.map((ord) => {
      if (ord.id === orderId || ord.orderNumber === orderId || ord.orderNumber === `#${orderId}`) {
        updatedOrder = {
          ...ord,
          status: "delivered",
          paymentMethod: details.paymentMethod || ord.paymentMethod || "efectivo",
          receivedByName: details.receivedByName || ord.customerName,
          deliveredBasketsLeft: details.deliveredBasketsLeft !== undefined ? details.deliveredBasketsLeft : 2,
          emptyBasketsCollected: details.emptyBasketsCollected !== undefined ? details.emptyBasketsCollected : 2,
          invoicePhoto: details.invoicePhoto || ord.invoicePhoto,
          customerSignature: details.customerSignature || ord.customerSignature,
          updatedAt: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return ord;
    });

    if (updatedOrder) {
      orderService.saveOrders(updatedOrders);
    }

    return updatedOrder;
  },

  adjustRealWeight: (
    orderId: string,
    realQuantities: { productId: string; realQuantity: number }[]
  ): Order | undefined => {
    const allOrders = orderService.getOrders();
    let updatedOrder: Order | undefined;

    const updatedOrders = allOrders.map((ord) => {
      if (ord.id === orderId || ord.orderNumber === orderId || ord.orderNumber === `#${orderId}`) {
        const updatedItems = ord.items.map((item) => {
          const adj = realQuantities.find((q) => q.productId === item.productId);
          if (adj && adj.realQuantity > 0) {
            const realSubtotal = adj.realQuantity * item.unitPrice;
            return {
              ...item,
              realQuantity: adj.realQuantity,
              realSubtotal,
            };
          }
          return item;
        });

        const realTotal = updatedItems.reduce(
          (sum, i) => sum + (i.realSubtotal !== undefined ? i.realSubtotal : i.subtotal),
          0
        );

        updatedOrder = {
          ...ord,
          items: updatedItems,
          realTotal,
          weightAdjusted: true,
          updatedAt: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return ord;
    });

    if (updatedOrder) {
      orderService.saveOrders(updatedOrders);
    }

    return updatedOrder;
  },

  updateDispatchDetails: (
    orderId: string,
    details: { driverName?: string; sealNumber?: string; internalNotes?: string }
  ): Order | undefined => {
    const allOrders = orderService.getOrders();
    let updatedOrder: Order | undefined;

    const updatedOrders = allOrders.map((ord) => {
      if (ord.id === orderId || ord.orderNumber === orderId || ord.orderNumber === `#${orderId}`) {
        updatedOrder = {
          ...ord,
          ...details,
          updatedAt: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return ord;
    });

    if (updatedOrder) {
      orderService.saveOrders(updatedOrders);
    }

    return updatedOrder;
  },

  getPickingSummary: (deliveryDate?: string): PickingSummaryItem[] => {
    const orders = orderService.getOrders();
    const activeOrders = orders.filter(
      (o) =>
        o.status !== "cancelled" &&
        (!deliveryDate || o.deliveryDate.toLowerCase().includes(deliveryDate.toLowerCase()))
    );

    const summaryMap: Record<string, PickingSummaryItem> = {};

    for (const ord of activeOrders) {
      for (const item of ord.items) {
        if (!summaryMap[item.productId]) {
          summaryMap[item.productId] = {
            productId: item.productId,
            brand: item.brand,
            sku: item.sku,
            productName: item.productName,
            category: "cortes_magros",
            unit: "kg",
            totalKg: 0,
            realTotalKg: 0,
            orderCount: 0,
            orderNumbers: [],
          };
        }
        summaryMap[item.productId].totalKg += item.quantity;
        summaryMap[item.productId].realTotalKg =
          (summaryMap[item.productId].realTotalKg || 0) + (item.realQuantity || item.quantity);
        summaryMap[item.productId].orderCount += 1;
        if (!summaryMap[item.productId].orderNumbers.includes(ord.orderNumber)) {
          summaryMap[item.productId].orderNumbers.push(ord.orderNumber);
        }
      }
    }

    return Object.values(summaryMap).sort((a, b) => b.totalKg - a.totalKg);
  },

  validateRepeatOrder: async (
    order: Order,
    priceListId: string
  ): Promise<RepeatOrderValidationResult> => {
    const currentInventory = inventoryService.getInventory();
    const products = await productService.getProducts(order.companyId);

    const warnings: string[] = [];
    let hasPriceChanges = false;
    let hasStockIssues = false;

    const adjustedItems = order.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const stock = currentInventory.find((inv) => inv.productId === item.productId);
      const currentPrice = priceService.getPriceForCustomer(priceListId, item.productId);

      const availableQty = stock ? stock.availableQuantity : 0;
      const priceChanged = currentPrice !== item.unitPrice;
      const stockLimited = availableQty < item.quantity;

      let finalQty = item.quantity;

      if (priceChanged) {
        hasPriceChanges = true;
        warnings.push(
          `El precio de "${item.productName}" cambió de ${priceService.formatCurrency(item.unitPrice)} a ${priceService.formatCurrency(currentPrice)}/kg.`
        );
      }

      if (availableQty <= 0) {
        hasStockIssues = true;
        finalQty = 0;
        warnings.push(`"${item.productName}" está actualmente AGOTADO (se excluyó del carrito).`);
      } else if (stockLimited) {
        hasStockIssues = true;
        const step = product?.quantityStep || 5;
        finalQty = Math.floor(availableQty / step) * step;
        if (finalQty < (product?.minimumQuantity || 5)) {
          finalQty = availableQty;
        }
        warnings.push(
          `Stock insuficiente para "${item.productName}". Se ajustó de ${item.quantity} kg a ${finalQty} kg disponibles.`
        );
      }

      return {
        productId: item.productId,
        productName: item.productName,
        requestedQty: item.quantity,
        availableQty,
        oldPrice: item.unitPrice,
        currentPrice,
        finalQty,
        priceChanged,
        stockLimited,
      };
    });

    const canRepeat = adjustedItems.some((item) => item.finalQty > 0);

    return {
      canRepeat,
      hasPriceChanges,
      hasStockIssues,
      warnings,
      adjustedItems,
    };
  },

  resetOrders: (): Order[] => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    }
    return INITIAL_ORDERS;
  },
};
