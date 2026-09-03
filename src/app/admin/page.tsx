"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import {
  TrendingUp,
  Scale,
  Boxes,
  Truck,
  AlertTriangle,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  Database,
  ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { NewBatchModal } from "@/components/admin/NewBatchModal";
import { NewProductModal } from "@/components/admin/NewProductModal";
import { ProductionReadyModal } from "@/components/admin/ProductionReadyModal";
import { ManualOrderModal } from "@/components/admin/ManualOrderModal";
import { RouteMap } from "@/components/admin/RouteMap";

export default function AdminDashboardPage() {
  const { allOrders, inventory, products, routes, addInventoryBatch, createProduct } = useApp();
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isProductionReadyOpen, setIsProductionReadyOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);

  // Metrics
  const activeOrders = allOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  );
  const pendingOrders = allOrders.filter((o) => o.status === "pending");
  const preparingOrders = allOrders.filter((o) => o.status === "preparing");

  const totalKgToday = activeOrders.reduce((sum, ord) => {
    return sum + ord.items.reduce((iSum, item) => iSum + item.quantity, 0);
  }, 0);

  const totalValueActive = activeOrders.reduce((sum, ord) => sum + ord.total, 0);

  const outOfStockProducts = inventory.filter((i) => i.availableQuantity <= 0);
  const lowStockProducts = inventory.filter(
    (i) => i.availableQuantity > 0 && i.availableQuantity <= 15
  );

  return (
    <div className="space-y-6">
      {/* Header / Date Context matching Stitch */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-ping" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4edea3]">
              DIRECCIÓN GENERAL • JD DISTRIBUIDORA & GOURMET AHUMADOS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Resumen Operativo
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor de distribución, logística y despacho de carne 100% despostada en tiempo real.
          </p>
        </div>

        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 text-xs">
          <Calendar className="w-4 h-4 text-[#4edea3]" />
          <span className="font-mono text-slate-200 font-bold">Hoy - Despacho en Vivo</span>
        </div>
      </header>

      {/* Quick Action Buttons for Production & Modals */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsProductionReadyOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 border border-cyan-400/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>Puesta en Marcha (Datos Reales)</span>
        </button>

        <button
          type="button"
          onClick={() => setIsNewProductOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 border border-amber-400/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Crear Corte / Producto</span>
        </button>

        <button
          type="button"
          onClick={() => setIsManualOrderOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 border border-purple-400/30"
        >
          <ClipboardList className="w-4 h-4" />
          <span>Tomar Pedido Manual</span>
        </button>

        <button
          type="button"
          onClick={() => setIsNewBatchOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 border border-emerald-400/30"
        >
          <Scale className="w-4 h-4" />
          <span>Ingresar Lote Báscula</span>
        </button>
      </div>

      {/* KPI Row matching Stitch (4 cards with glass-panel, rim-light-emerald, rim-light-amber) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas del Día */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4edea3]/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#4edea3]/20 transition-all duration-500" />
          <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center justify-between">
            <span>Ventas del Día</span>
            <TrendingUp className="w-4 h-4 text-[#4edea3]" />
          </h3>
          <div className="text-2xl font-mono font-black text-white rim-light-emerald rounded-xl px-3 py-1.5 bg-[#0d1c2d]/60">
            {priceService.formatCurrency(totalValueActive)} <span className="text-xs text-slate-400 font-normal">COP</span>
          </div>
          <div className="flex items-center gap-1.5 mt-auto pt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4edea3]/15 text-[#4edea3]">
              ▲ 12.5%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">vs ayer</span>
          </div>
        </div>

        {/* KPI 2: Kilos Despachados */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2">
          <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center justify-between">
            <span>Kilos Despachados</span>
            <Scale className="w-4 h-4 text-slate-400" />
          </h3>
          <div className="text-2xl font-mono font-black text-white py-1.5">
            {totalKgToday.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kg netos</span>
          </div>
          <div className="flex items-center gap-1.5 mt-auto pt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4edea3]/15 text-[#4edea3]">
              ▲ 4.2%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">objetivo diario</span>
          </div>
        </div>

        {/* KPI 3: Furgones en Ruta */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffb95f]/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#ffb95f]/20 transition-all duration-500" />
          <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center justify-between">
            <span>Furgones en Ruta</span>
            <Truck className="w-4 h-4 text-[#ffb95f]" />
          </h3>
          <div className="text-2xl font-mono font-black text-white rim-light-amber rounded-xl px-3 py-1.5 bg-[#0d1c2d]/60">
            {routes.filter((r) => r.status === "in_transit").length || 1} <span className="text-xs text-slate-400 font-normal">Activos</span>
          </div>
          <div className="flex items-center gap-1.5 mt-auto pt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ffb95f]/15 text-[#ffb95f]">
              NQR-482
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Carlos Pérez</span>
          </div>
        </div>

        {/* KPI 4: Telemetría Frío */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2">
          <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center justify-between">
            <span>Telemetría Frío</span>
            <Sparkles className="w-4 h-4 text-[#4edea3]" />
          </h3>
          <div className="text-2xl font-mono font-black text-white py-1.5">
            1.8°C <span className="text-xs text-[#4edea3] font-bold">Estable</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-auto">
            <div className="h-full bg-[#4edea3] w-[85%] rounded-full shadow-[0_0_8px_#4edea3]" />
          </div>
        </div>
      </section>

      {/* Main Split View matching Stitch: Map (Left 60%) & Dispatch Table (Right 40%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left (7 cols / ~60%): Interactive Satellite Route Map */}
        <div className="lg:col-span-7 glass-panel rounded-2xl overflow-hidden flex flex-col border border-white/5 shadow-2xl relative">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0d1c2d]/60 z-10">
            <h2 className="text-xs uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse" />
              <span>Rutas Activas - Bogotá</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/30">
                Furgón NQR-482 • 1.8°C INVIMA
              </span>
              <Link
                href="/admin/rutas"
                className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
              >
                <span>Gestionar</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="flex-1 min-h-[380px] p-2 bg-[#060e20]">
            {routes.length > 0 ? (
              <RouteMap
                route={routes.find((r) => r.status === "in_transit") || routes[0]}
                orders={allOrders.filter((o) => (routes.find((r) => r.status === "in_transit") || routes[0]).orderIds?.includes(o.id))}
                showReorderButton={true}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Truck className="w-12 h-12 text-slate-600 mb-2" />
                <p className="font-bold text-white text-sm">Flota en Base Central</p>
                <p className="text-xs mt-1">Las rutas se arman automáticamente al despachar pedidos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right (5 cols / ~40%): Dispatch Table matching Stitch */}
        <div className="lg:col-span-5 glass-panel rounded-2xl flex flex-col border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0d1c2d]/60">
            <h2 className="text-xs uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#4edea3]" />
              <span>Despachos en Tiempo Real</span>
            </h2>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-[#4edea3] border border-white/5">
              Auto-sync
            </span>
          </div>

          <div className="flex-1 overflow-auto max-h-[420px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0d1c2d]/95 backdrop-blur z-10 border-b border-white/10 text-xs">
                <tr>
                  <th className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">Factura</th>
                  <th className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">Cliente</th>
                  <th className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">Corte / Peso</th>
                  <th className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">Estado</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-white/5">
                {allOrders.slice(0, 6).map((order) => {
                  const totalKg = order.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);
                  const invoiceNum = `FAC-JD-${order.orderNumber.replace(/[^0-9]/g, "") || "892"}`;
                  const cutName = order.items[0]?.productName?.split(" ")[0] || "Corte";

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.04] transition-colors cursor-pointer group">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#4edea3] group-hover:text-emerald-300">
                        {invoiceNum}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">{order.customerName}</div>
                        <div className="text-[10px] text-slate-400">{order.deliveryAddress?.split(",")[0] || "Bogotá"}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-200">{cutName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{totalKg.toFixed(1)} kg</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-white/10 bg-[#0d1c2d]/50 flex justify-center">
            <Link
              href="/admin/pedidos"
              className="text-xs font-mono font-bold text-[#4edea3] hover:text-emerald-300 flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Ver todos los despachos ({allOrders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Secondary Row: Cold Storage Inventory Watch (Left) & Active Fleet Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Stock Alert Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Estado de Bodega en Frío</span>
            </h3>
            <Link
              href="/admin/inventario"
              className="text-xs text-slate-400 hover:text-white font-bold"
            >
              Inventario ➔
            </Link>
          </div>

          <div className="space-y-2.5">
            {inventory.slice(0, 5).map((inv) => {
              const prod = products.find((p) => p.id === inv.productId);
              if (!prod) return null;

              const isOut = inv.availableQuantity <= 0;
              const isLow = inv.availableQuantity > 0 && inv.availableQuantity <= 15;

              return (
                <div
                  key={inv.productId}
                  className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white truncate max-w-[180px]">
                      {prod.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Reserva: {inv.reservedQuantity} kg
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-extrabold ${
                        isOut
                          ? "text-rose-400"
                          : isLow
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {inv.availableQuantity} kg disp.
                    </span>
                    {inv.nextAvailabilityDate && isOut && (
                      <p className="text-[10px] text-slate-400">
                        Llega: {inv.nextAvailabilityDate}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Fleet / Delivery Routes Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Flota Refrigerada & Rutas</span>
            </h3>
            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              1.8°C Frío
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {routes.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-white">{r.driverName}</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Furgón {r.vehiclePlate} • {r.orderIds ? r.orderIds.length : 0} paradas
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {r.status === "in_transit" ? "En Ruta" : r.status === "completed" ? "Completada" : "Planificada"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals for Production & Real Data */}
      <NewBatchModal
        products={products}
        isOpen={isNewBatchOpen}
        onClose={() => setIsNewBatchOpen(false)}
        onSave={addInventoryBatch}
      />

      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onSave={createProduct}
      />

      <ProductionReadyModal
        isOpen={isProductionReadyOpen}
        onClose={() => setIsProductionReadyOpen(false)}
      />

      <ManualOrderModal
        isOpen={isManualOrderOpen}
        onClose={() => setIsManualOrderOpen(false)}
      />
    </div>
  );
}
