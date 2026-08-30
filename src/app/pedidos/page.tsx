"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { OrderCard } from "@/components/orders/OrderCard";
import { Package, Search, Plus, Filter, ShoppingBag } from "lucide-react";

export default function OrdersPage() {
  const { orders, customer } = useApp();
  const [filterTab, setFilterTab] = useState<"all" | "active" | "delivered">("all");
  const [search, setSearch] = useState<string>("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (filterTab === "active") {
        if (order.status === "delivered" || order.status === "cancelled") return false;
      } else if (filterTab === "delivered") {
        if (order.status !== "delivered") return false;
      }

      // Search filter
      if (search) {
        const matchesNum = order.orderNumber.toLowerCase().includes(search.toLowerCase());
        const matchesDate = order.deliveryDate.toLowerCase().includes(search.toLowerCase());
        const matchesItem = order.items.some((i) =>
          i.productName.toLowerCase().includes(search.toLowerCase())
        );
        return matchesNum || matchesDate || matchesItem;
      }

      return true;
    });
  }, [orders, filterTab, search]);

  return (
    <div className="px-4 py-5 md:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Mis Pedidos</span>
            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historial de despachos y estado en tiempo real de tus pedidos
          </p>
        </div>

        <Link
          href="/comprar"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NUEVO PEDIDO</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-fit">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilterTab("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "active"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            En Curso (
            {orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length}
            )
          </button>
          <button
            onClick={() => setFilterTab("delivered")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "delivered"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Entregados ({orders.filter((o) => o.status === "delivered").length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por # pedido o corte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-brand-500 bg-white"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-800 text-base">No hay pedidos para mostrar</p>
          <p className="text-xs text-slate-500 mt-1">
            No encontramos pedidos que coincidan con los filtros seleccionados.
          </p>
          <Link
            href="/comprar"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Hacer un Pedido Ahora</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
