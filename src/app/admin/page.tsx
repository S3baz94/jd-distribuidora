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
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { NewBatchModal } from "@/components/admin/NewBatchModal";

export default function AdminDashboardPage() {
  const { allOrders, inventory, products, addInventoryBatch } = useApp();
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);

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
      {/* Top Banner / Welcome with Executive Command Center Styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl glow-emerald-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              COMMAND CENTER • PLANTA DE DESPOSTE & FRIGORÍFICO CENTRAL JD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
            Centro de Control & Despacho
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitoreo en tiempo real de pesaje en báscula, inventario en frío (1.8°C) y control de flota.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/entregas"
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs px-4 py-3.5 rounded-2xl shadow-xl shadow-cyan-950/50 transition-all active:scale-98 border border-cyan-400/40"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Chequear Entregas (POD)</span>
          </Link>
          <button
            onClick={() => setIsNewBatchOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white font-black text-xs px-4 py-3.5 rounded-2xl shadow-xl shadow-emerald-950/50 transition-all active:scale-98 border border-emerald-400/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ingresar Lote</span>
          </button>
          <Link
            href="/admin/alistamiento"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-700 text-slate-950 font-black text-xs px-4 py-3.5 rounded-2xl shadow-xl shadow-amber-950/50 transition-all active:scale-98 border border-amber-300"
          >
            <Scale className="w-4 h-4" />
            <span>Ingresar Pesaje Manual</span>
          </Link>
        </div>
      </div>

      {/* Digital Scale Station Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pesaje & Ajuste de Kilos Reales */}
        <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-xl space-y-3 glow-emerald-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              ⚖️ Pesaje & Ajuste de Kilos Reales
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">DIGITACIÓN EN PLANTA</span>
          </div>
          <div className="flex items-baseline justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-400 text-xs block font-bold">Kilos Pesados en Turno:</span>
              <strong className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                345.0 <span className="text-lg font-bold text-slate-400">kg</span>
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-400 font-black uppercase block">Lotes Pesados:</span>
              <span className="text-xs text-white font-bold">Lomo, Bondiola, Costilla</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>El operario digita los kilos de la báscula física para ajustar la factura exacta.</span>
          </p>
        </div>

        {/* Precintos y Preparación */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              🔒 Precintos de Seguridad
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">PREC-JD-8821</span>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold">Furgón Asignado:</span>
              <strong className="text-white font-black">KLP-541 (Carlos Pérez)</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold">Temperatura:</span>
              <strong className="text-emerald-400 font-mono font-black">1.8°C (Óptimo)</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Etiquetado y precinto térmico numerado para garantizar trazabilidad de cadena de frío.
          </p>
        </div>

        {/* Niveles de Precios por Cliente */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              💲 Tarifas por Segmento
            </span>
            <span className="text-xs text-slate-400 font-bold">3 Niveles</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <span className="font-bold">⭐ Clientes VIP (Supermercados):</span>
              <strong className="font-black">-15% dto.</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
              <span className="font-bold">🏪 Famas & Carnicerías:</span>
              <strong className="font-black">-10% dto.</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              <span className="font-bold">🥩 Asaderos & Restaurantes:</span>
              <strong className="font-black">Tarifa Base</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl glow-emerald-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Kilos en Alistamiento</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalKgToday.toLocaleString("es-CO")} <span className="text-sm font-semibold text-slate-400">kg</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            En {activeOrders.length} pedidos activos
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pedidos Pendientes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {pendingOrders.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {preparingOrders.length} en desposte y pesaje
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl glow-cyan-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Valor en Ruta</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
            {priceService.formatCurrency(totalValueActive)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Total facturación activa
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Alertas de Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {outOfStockProducts.length + lowStockProducts.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {outOfStockProducts.length} agotados • {lowStockProducts.length} críticos
          </p>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-400" />
              <h2 className="text-base font-extrabold text-white">
                Pedidos Recientes de Famas & Salsamentarias
              </h2>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Ver todos ({allOrders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800 shadow-md">
            {allOrders.slice(0, 5).map((order) => {
              const totalKg = order.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);

              return (
                <div
                  key={order.id}
                  className="p-4 hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-sm text-white">
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} />
                      {order.weightAdjusted && (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Báscula OK
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-slate-200">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Entrega: <strong className="text-slate-300">{order.deliveryDate}</strong></span>
                      <span>•</span>
                      <span>{order.items.length} cortes ({totalKg.toFixed(1)} kg)</span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <span className="font-black text-sm text-white">
                      {priceService.formatCurrency(order.realTotal || order.total)}
                    </span>
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 hover:border-transparent"
                    >
                      Gestionar
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Inventory Watch & Quick Actions (1 col) */}
        <div className="space-y-6">
          {/* Critical Stock Alert Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
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
                      <p className="font-bold text-white truncate max-w-[140px]">
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

          {/* Quick Shortcuts */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-white">Accesos Directos</h3>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <Link
                href="/admin/entregas"
                className="p-3 rounded-2xl bg-slate-800/90 hover:bg-cyan-950/60 border border-cyan-500/30 text-slate-200 hover:text-cyan-300 transition-all text-center flex flex-col items-center gap-1.5"
              >
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>POD & Entregas</span>
              </Link>
              <Link
                href="/admin/alistamiento"
                className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all text-center flex flex-col items-center gap-1.5"
              >
                <Scale className="w-5 h-5 text-amber-400" />
                <span>Picking</span>
              </Link>
              <Link
                href="/admin/clientes"
                className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all text-center flex flex-col items-center gap-1.5"
              >
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Clientes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding batch */}
      <NewBatchModal
        products={products}
        isOpen={isNewBatchOpen}
        onClose={() => setIsNewBatchOpen(false)}
        onSave={addInventoryBatch}
      />
    </div>
  );
}
