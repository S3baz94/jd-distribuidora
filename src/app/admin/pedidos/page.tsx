"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { exportService } from "@/services/exportService";
import { OrderStatus } from "@/types";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Scale,
  Calendar,
  AlertCircle,
  Download,
  Database,
  Building2,
  FileSpreadsheet,
  Flame,
  Layers,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

export default function AdminOrdersPage() {
  const { allOrders, allCustomers, inventory, routes, showToast } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      // Filter by status
      if (selectedFilter !== "all" && order.status !== selectedFilter) {
        return false;
      }
      // Filter by customer
      if (selectedCustomerId !== "all" && order.customerId !== selectedCustomerId) {
        return false;
      }
      // Filter by brand
      if (selectedBrandFilter !== "all") {
        if (selectedBrandFilter === "gourmet_ahumados" && order.brand !== "gourmet_ahumados") {
          return false;
        }
        if (selectedBrandFilter === "jd_distribuidora" && order.brand !== "jd_distribuidora" && order.brand) {
          return false;
        }
      }
      // Filter by search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesNum = order.orderNumber.toLowerCase().includes(query);
        const matchesCust = order.customerName.toLowerCase().includes(query);
        const matchesItems = order.items.some((i) =>
          i.productName.toLowerCase().includes(query)
        );
        if (!matchesNum && !matchesCust && !matchesItems) return false;
      }
      return true;
    });
  }, [allOrders, selectedFilter, selectedCustomerId, selectedBrandFilter, searchTerm]);

  // Specific customer stats if selected
  const customerStats = useMemo(() => {
    if (selectedCustomerId === "all") return null;
    const custOrders = allOrders.filter((o) => o.customerId === selectedCustomerId);
    const targetCust = allCustomers.find((c) => c.id === selectedCustomerId);
    const totalKg = custOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0),
      0
    );
    const totalInvoiced = custOrders.reduce(
      (sum, o) => sum + (o.realTotal || o.total),
      0
    );

    return {
      customer: targetCust,
      orderCount: custOrders.length,
      totalKg,
      totalInvoiced,
    };
  }, [selectedCustomerId, allOrders, allCustomers]);

  const counts = {
    all: allOrders.length,
    pending: allOrders.filter((o) => o.status === "pending").length,
    confirmed: allOrders.filter((o) => o.status === "confirmed").length,
    preparing: allOrders.filter((o) => o.status === "preparing").length,
    ready: allOrders.filter((o) => o.status === "ready").length,
    dispatched: allOrders.filter((o) => o.status === "dispatched").length,
    delivered: allOrders.filter((o) => o.status === "delivered").length,
  };

  const handleExportCSV = () => {
    exportService.exportOrdersToCSV(filteredOrders);
    showToast("📥 Base de datos de pedidos exportada a Excel (CSV)", "success");
  };

  const handleExportFullBackup = () => {
    exportService.exportFullBackupJSON({
      customers: allCustomers,
      orders: allOrders,
      inventory,
      routes,
    });
    showToast("💾 Copia de seguridad completa (JSON) descargada con éxito", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-brand-500" />
            <span>Historial & Gestión de Pedidos</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro histórico de compras por cliente, liquidación de pesaje en báscula y exportación a base de datos
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <Link
            href="/admin/facturacion"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all active:scale-95"
          >
            <span>➕ Crear Pedido / Factura POS</span>
          </Link>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            title="Descargar base de datos para Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar en Excel (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Customer Filter Card if Specific Customer Selected */}
      {customerStats && customerStats.customer && (
        <div className="bg-slate-850 border-2 border-brand-500/50 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                🏪
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded-full border border-brand-500/30">
                  Historial de Cliente Activo
                </span>
                <h2 className="text-xl font-black text-white">
                  {customerStats.customer.businessName}
                </h2>
                <p className="text-xs text-slate-400">
                  {customerStats.customer.contactName} • Tel: {customerStats.customer.phone} • {customerStats.customer.address}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomerId("all")}
              className="text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl self-start sm:self-auto"
            >
              Mostrar Todos los Clientes
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-750 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-750">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Pedidos:</span>
              <strong className="text-white text-base font-black">{customerStats.orderCount} órdenes</strong>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-750">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Kilos Comprados:</span>
              <strong className="text-emerald-400 text-base font-black">{customerStats.totalKg.toFixed(1)} kg</strong>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-750">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Facturado Histórico:</span>
              <strong className="text-brand-300 text-base font-black">
                {priceService.formatCurrency(customerStats.totalInvoiced)}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search input */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar # pedido, cliente, corte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-brand-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Filter by Customer dropdown */}
          <div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-2xl p-3 focus:outline-none focus:border-brand-500"
            >
              <option value="all">👥 Filtrar por Cliente (Todos los clientes)</option>
              {allCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.zone})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Brand */}
          <div>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-2xl p-3 focus:outline-none focus:border-brand-500"
            >
              <option value="all">🥩🪵 Todas las Líneas Comerciales</option>
              <option value="jd_distribuidora">🥩 Solo Cerdo Crudo (JD Distribuidora)</option>
              <option value="gourmet_ahumados">🪵🔥 Solo Ahumados (Gourmet Ahumados)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800 pt-3">
          {[
            { id: "all", label: "Todos", count: counts.all },
            { id: "pending", label: "Pendientes", count: counts.pending, color: "text-amber-400" },
            { id: "confirmed", label: "Confirmados", count: counts.confirmed, color: "text-blue-400" },
            { id: "preparing", label: "En Desposte", count: counts.preparing, color: "text-purple-400" },
            { id: "ready", label: "Listos p/ Furgón", count: counts.ready, color: "text-indigo-400" },
            { id: "dispatched", label: "Despachados", count: counts.dispatched, color: "text-cyan-400" },
            { id: "delivered", label: "Entregados", count: counts.delivered, color: "text-emerald-400" },
          ].map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-md"
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white text-brand-700" : "bg-slate-900 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="font-bold text-sm text-slate-300">No se encontraron pedidos con estos filtros</p>
            <p className="text-xs text-slate-500">Prueba cambiando el cliente, estado o término de búsqueda.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const totalKg = order.items.reduce(
              (sum, item) => sum + (item.realQuantity || item.quantity),
              0
            );

            return (
              <div
                key={order.id}
                className="p-5 hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-base text-white">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />

                    {/* Brand indicator tag */}
                    {order.brand === "gourmet_ahumados" ? (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>Gourmet Ahumados</span>
                      </span>
                    ) : (
                      <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-500/30">
                        🥩 JD Cerdo Crudo
                      </span>
                    )}

                    {order.weightAdjusted ? (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Báscula Verificada
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                        Peso Teórico
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                      <span>{order.customerName}</span>
                      {order.zone && (
                        <span className="text-[11px] font-bold text-emerald-400">
                          ({order.zone})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dirección: <span className="text-slate-300">{order.deliveryAddress}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      Entrega: {order.deliveryDate}
                    </span>
                    <span>•</span>
                    <span>{order.items.length} productos</span>
                    <span>•</span>
                    <span className="font-bold text-white">{totalKg.toFixed(1)} kg total</span>
                    {order.driverName && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {order.driverName}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Items preview tag list */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {order.items.map((item) => (
                      <span
                        key={item.productId}
                        className="text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700"
                      >
                        {item.realQuantity || item.quantity}kg {item.productName.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Actions & Amount */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-slate-400">Total Liquidado</p>
                    <p className="text-lg font-black text-emerald-400">
                      {priceService.formatCurrency(order.realTotal || order.total)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-all border border-slate-700 flex items-center gap-1.5"
                    >
                      <span>Ver Detalle & Remisión</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
