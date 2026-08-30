import { NextResponse } from "next/server";
import { getServerState, updateServerState, resetServerState } from "@/services/serverState";
import { Order, InventoryItem, Customer, DeliveryRoute, DriverExpense } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const since = parseInt(searchParams.get("since") || "0", 10);

  const state = getServerState();

  return NextResponse.json({
    orders: state.orders,
    inventory: state.inventory,
    customers: state.customers,
    routes: state.routes || [],
    expenses: state.expenses || [],
    lastUpdated: state.lastUpdated,
    hasChanged: state.lastUpdated > since,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    const current = getServerState();

    if (action === "RESET") {
      const reset = resetServerState();
      return NextResponse.json(reset);
    }

    if (action === "CREATE_ORDER") {
      const newOrder: Order = payload.order;
      const updatedOrders = [newOrder, ...current.orders];

      // Deduct inventory
      const updatedInventory = current.inventory.map((inv) => {
        const item = newOrder.items.find((i) => i.productId === inv.productId);
        if (!item) return inv;
        return {
          ...inv,
          availableQuantity: Math.max(0, inv.availableQuantity - item.quantity),
          reservedQuantity: inv.reservedQuantity + item.quantity,
        };
      });

      const updated = updateServerState({
        orders: updatedOrders,
        inventory: updatedInventory,
      });
      return NextResponse.json(updated);
    }

    if (action === "UPDATE_ORDER_STATUS") {
      const { orderId, status } = payload;
      const targetOrder = current.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
      const isNowDelivered = status === "delivered" && targetOrder && targetOrder.status !== "delivered";

      const updatedOrders = current.orders.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? { ...o, status, updatedAt: new Date().toISOString() }
          : o
      );

      let updatedInventory = current.inventory;
      if (isNowDelivered && targetOrder) {
        updatedInventory = current.inventory.map((inv) => {
          const item = targetOrder.items.find((i) => i.productId === inv.productId);
          if (!item) return inv;
          const qty = item.realQuantity || item.quantity;
          return {
            ...inv,
            physicalQuantity: Math.max(0, inv.physicalQuantity - qty),
            reservedQuantity: Math.max(0, inv.reservedQuantity - qty),
          };
        });
      }

      const updated = updateServerState({ orders: updatedOrders, inventory: updatedInventory });
      return NextResponse.json(updated);
    }

    if (action === "ADJUST_REAL_WEIGHT") {
      const { orderId, realQuantities } = payload;
      const updatedOrders = current.orders.map((ord) => {
        if (ord.id === orderId || ord.orderNumber === orderId) {
          const updatedItems = ord.items.map((item) => {
            const adj = realQuantities.find(
              (q: { productId: string; realQuantity: number }) => q.productId === item.productId
            );
            if (adj && adj.realQuantity > 0) {
              return {
                ...item,
                realQuantity: adj.realQuantity,
                realSubtotal: adj.realQuantity * item.unitPrice,
              };
            }
            return item;
          });

          const realTotal = updatedItems.reduce(
            (sum, i) => sum + (i.realSubtotal !== undefined ? i.realSubtotal : i.subtotal),
            0
          );

          return {
            ...ord,
            items: updatedItems,
            realTotal,
            weightAdjusted: true,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      });

      const updated = updateServerState({ orders: updatedOrders });
      return NextResponse.json(updated);
    }

    if (action === "UPDATE_DISPATCH") {
      const { orderId, driverName, driverPhone, sealNumber, internalNotes } = payload;
      const updatedOrders = current.orders.map((ord) =>
        ord.id === orderId || ord.orderNumber === orderId
          ? {
              ...ord,
              driverName,
              driverPhone: driverPhone || ord.driverPhone,
              sealNumber,
              internalNotes,
              updatedAt: new Date().toISOString(),
            }
          : ord
      );
      const updated = updateServerState({ orders: updatedOrders });
      return NextResponse.json(updated);
    }

    if (action === "ASSIGN_ORDER_TO_ROUTE") {
      const { orderId, routeId, routeName, driverName, driverPhone, stopOrder } = payload;
      
      // Update the order with route & driver
      const updatedOrders = current.orders.map((ord) =>
        ord.id === orderId || ord.orderNumber === orderId
          ? {
              ...ord,
              routeId,
              routeName,
              driverName: driverName || ord.driverName,
              driverPhone: driverPhone || ord.driverPhone,
              stopOrder,
              updatedAt: new Date().toISOString(),
            }
          : ord
      );

      // Update the routes collection
      const updatedRoutes = (current.routes || []).map((r) => {
        const filtered = r.orderIds.filter((id) => id !== orderId);
        if (r.id === routeId) {
          return {
            ...r,
            orderIds: [...filtered, orderId],
          };
        }
        return { ...r, orderIds: filtered };
      });

      const updated = updateServerState({ orders: updatedOrders, routes: updatedRoutes });
      return NextResponse.json(updated);
    }

    if (action === "UPDATE_ROUTE_STATUS") {
      const { routeId, status } = payload;
      const updatedRoutes = (current.routes || []).map((r) =>
        r.id === routeId ? { ...r, status } : r
      );
      const updated = updateServerState({ routes: updatedRoutes });
      return NextResponse.json(updated);
    }

    if (action === "CREATE_ROUTE") {
      const newRoute: DeliveryRoute = payload.route;
      const updatedRoutes = [...(current.routes || []), newRoute];
      const updated = updateServerState({ routes: updatedRoutes });
      return NextResponse.json(updated);
    }

    if (action === "ADD_INVENTORY_BATCH") {
      const { productId, addedKg } = payload;
      const updatedInventory = current.inventory.map((inv) =>
        inv.productId === productId
          ? {
              ...inv,
              physicalQuantity: inv.physicalQuantity + addedKg,
              availableQuantity: inv.availableQuantity + addedKg,
            }
          : inv
      );
      const updated = updateServerState({ inventory: updatedInventory });
      return NextResponse.json(updated);
    }

    if (action === "UPDATE_INVENTORY_MANUAL") {
      const { productId, updates } = payload;
      const updatedInventory = current.inventory.map((inv) =>
        inv.productId === productId ? { ...inv, ...updates } : inv
      );
      const updated = updateServerState({ inventory: updatedInventory });
      return NextResponse.json(updated);
    }

    if (action === "CREATE_CUSTOMER") {
      const newCust: Customer = payload.customer;
      const updatedCustomers = [...current.customers, newCust];
      const updated = updateServerState({ customers: updatedCustomers });
      return NextResponse.json(updated);
    }

    if (action === "ADD_DRIVER_EXPENSE") {
      const newExpense: DriverExpense = payload.expense;
      const updatedExpenses = [newExpense, ...(current.expenses || [])];
      const updated = updateServerState({ expenses: updatedExpenses });
      return NextResponse.json(updated);
    }

    // Direct full sync fallback
    if (payload?.orders || payload?.inventory || payload?.customers || payload?.routes) {
      const updated = updateServerState({
        orders: payload.orders,
        inventory: payload.inventory,
        customers: payload.customers,
        routes: payload.routes,
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json(current);
  } catch (error) {
    console.error("Error in sync API route", error);
    return NextResponse.json({ error: "Failed to process sync" }, { status: 500 });
  }
}
