"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { Order } from "@/types";
import {
  CheckCircle2,
  Clock,
  MapPin,
  PenTool,
  Box,
  DollarSign,
  Truck,
  ShieldCheck,
  Search,
  Check,
  Flame,
  AlertTriangle,
  ArrowRight,
  Printer,
  Sparkles,
} from "lucide-react";

export default function AdminEntregasPage() {
  const { allOrders, routes, showToast } = useApp();

  const [selectedDriver, setSelectedDriver] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending_check" | "verified">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [verifiedOrderIds, setVerifiedOrderIds] = useState<Record<string, boolean>>({
    "ord-10450": true,
  });

  // Delivered and dispatched orders eligible for verification
  const deliveredOrders = allOrders.filter(
    (o) => o.status === "delivered" || o.status === "dispatched"
  );

  // Filtered list
  const filteredOrders = deliveredOrders.filter((order) => {
    // Driver filter
    if (selectedDriver !== "all") {
      const route = routes.find((r) => r.id === order.routeId);
      if (route?.driverId !== selectedDriver) return false;
    }

    // Status filter
    const isVerified = verifiedOrderIds[order.id];
    if (statusFilter === "pending_check" && isVerified) return false;
    if (statusFilter === "verified" && !isVerified) return false;

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCustomer = order.customerName.toLowerCase().includes(term);
      const matchNumber = order.orderNumber.toLowerCase().includes(term);
      const matchAddress = order.deliveryAddress.toLowerCase().includes(term);
      if (!matchCustomer && !matchNumber && !matchAddress) return false;
    }

    return true;
  });

  const totalDelivered = deliveredOrders.filter((o) => o.status === "delivered").length;
  const totalVerified = Object.keys(verifiedOrderIds).filter((id) =>
    deliveredOrders.some((o) => o.id === id)
  ).length;
  const totalPendingCheck = totalDelivered - totalVerified;

  const totalCashDelivered = deliveredOrders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);

  const handleVerifyOrder = (orderId: string, customerName: string) => {
    setVerifiedOrderIds((prev) => ({ ...prev, [orderId]: true }));
    showToast(`✅ Entrega #${orderId} de ${customerName} auditada y verificada por Planta.`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl glow-emerald-card">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 tracking-wider">
                ADMINISTRACIÓN • PROOF OF DELIVERY (POD)
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
                Chequeo & Auditoría de Entregas en Tiempo Real
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Verificación de firmas digitales de clientes, canje de canastillas plásticas, recaudo en calle y telemetría de frío.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/rutas"
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-black text-xs sm:text-sm flex items-center gap-2 border border-cyan-500/30 shadow-md transition-all active:scale-95"
          >
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>Ver Rastreo GPS</span>
          </Link>
          <Link
            href="/admin/movimientos"
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-amber-300 font-black text-xs sm:text-sm flex items-center gap-2 border border-amber-500/30 shadow-md transition-all active:scale-95"
          >
            <span>📸 Recibos de Gasolina</span>
          </Link>
        </div>
      </div>

      {/* Verification KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-xl glow-emerald-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Entregas Completadas:</span>
          <p className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2">
            <span>{totalDelivered}</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              en calle hoy
            </span>
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Con firma o comprobante</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-3xl space-y-1 shadow-xl glow-amber-card">
          <span className="text-[10px] uppercase font-bold text-amber-300 block">Pendientes de Chequeo:</span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {totalPendingCheck}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Requieren visto bueno de planta</span>
        </div>

        <div className="bg-slate-900 border border-cyan-500/30 p-4 rounded-3xl space-y-1 shadow-xl glow-cyan-card">
          <span className="text-[10px] uppercase font-bold text-cyan-300 block">Verificadas por Planta:</span>
          <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono flex items-center gap-1.5">
            <span>{totalVerified}</span>
            <Check className="w-5 h-5 text-cyan-400 stroke-[3]" />
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Auditadas y conformes</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Dinero Entregado en Ruta:</span>
          <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
            {priceService.formatCurrency(totalCashDelivered)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Recaudado por choferes</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por cliente, dirección o número de orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-750 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Driver Selector */}
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-slate-950 border border-slate-750 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">🚚 Todos los Choferes</option>
            {routes.map((r) => (
              <option key={r.driverId} value={r.driverId}>
                {r.driverName} ({r.vehiclePlate})
              </option>
            ))}
          </select>

          {/* Status buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todas ({deliveredOrders.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending_check")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === "pending_check"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Por Chequear ({totalPendingCheck})
            </button>
            <button
              onClick={() => setStatusFilter("verified")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === "verified"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Verificadas ({totalVerified})
            </button>
          </div>
        </div>
      </div>

      {/* Main Delivery Proof-of-Delivery Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-2 p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-black text-white text-base">No hay entregas pendientes con estos filtros</h3>
            <p className="text-xs text-slate-400">
              Todas las entregas están auditadas o no coinciden con los términos de búsqueda.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isVerified = verifiedOrderIds[order.id];
            const route = routes.find((r) => r.id === order.routeId);
            const totalKg = order.items.reduce(
              (sum, i) => sum + (i.realQuantity || i.quantity),
              0
            );
            const basketsLeft = Math.ceil(totalKg / 25) || 2;
            const basketsCollected = Math.max(0, basketsLeft - 1);

            return (
              <div
                key={order.id}
                className={`bg-slate-900 border-2 rounded-3xl p-5 space-y-4 shadow-xl transition-all ${
                  isVerified
                    ? "border-cyan-500/40 glow-cyan-card"
                    : order.status === "delivered"
                    ? "border-emerald-500/40 glow-emerald-card"
                    : "border-slate-800"
                }`}
              >
                {/* Header: Order & Status */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-base sm:text-lg">
                        {order.customerName}
                      </h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {order.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>{order.deliveryAddress}</span>
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    {isVerified ? (
                      <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>VERIFICADO POR PLANTA</span>
                      </span>
                    ) : order.status === "delivered" ? (
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ENTREGADO • PENDIENTE REVISIÓN</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                        🚚 EN FURGÓN
                      </span>
                    )}

                    <span className="text-[10px] text-cyan-300 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      ❄️ 1.8°C (Refrigerado OK)
                    </span>
                  </div>
                </div>

                {/* Proof of Delivery Details (POD) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Digital Signature Card */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                      <PenTool className="w-3 h-3 text-emerald-400" />
                      <span>Firma de Recibido en Pantalla:</span>
                    </span>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 h-16 flex items-center justify-center relative overflow-hidden">
                      <span className="font-serif italic text-lg text-emerald-400 font-bold select-none tracking-widest">
                        {order.customerName.split(" ")[0]} Vargas
                      </span>
                      <span className="absolute bottom-1 right-2 text-[9px] text-slate-500 font-mono">
                        Validado ✓
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate">
                      Recibió: <strong className="text-white font-bold">{order.customerName} (Administrador)</strong>
                    </p>
                  </div>

                  {/* Payment & Baskets Balance */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                        Factura de Compra & Forma de Pago:
                      </span>
                      <div className="flex items-center justify-between">
                        <strong className="text-emerald-400 font-black text-sm sm:text-base">
                          {priceService.formatCurrency(order.realTotal || order.total)}
                        </strong>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-sm ${
                          order.paymentMethod === "banco"
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                            : order.paymentMethod === "credito"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }`}>
                          {order.paymentMethod === "banco"
                            ? "🏦 BANCO / TRANSF."
                            : order.paymentMethod === "credito"
                            ? "📝 FACTURA CRÉDITO"
                            : "💵 EFECTIVO EN SOBRE"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-850 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1 font-bold">
                        <Box className="w-3.5 h-3.5 text-brand-400" />
                        <span>Canastillas JD:</span>
                      </span>
                      <span className="font-black text-white">
                        {basketsLeft} Dejadas / {basketsCollected} Recogidas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver and Meat Cuts Summary */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Domiciliario / Furgón:</span>
                    <strong className="text-white font-black flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{route?.driverName || "Carlos Pérez"} ({route?.vehiclePlate || "KLP-541"})</span>
                    </strong>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Cortes Entregados:</span>
                    <span className="font-extrabold text-amber-400">
                      {totalKg} kg en {order.items.length} cortes
                    </span>
                  </div>
                </div>

                {/* Audit Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>Hora entrega:</span>
                    <strong className="text-slate-200 font-mono">10:45 AM</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
                    >
                      Ver Detalle Pedido
                    </Link>

                    {!isVerified && order.status === "delivered" && (
                      <button
                        type="button"
                        onClick={() => handleVerifyOrder(order.id, order.customerName)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all active:scale-95 border border-emerald-400/40"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>APROBAR & AUDITAR ENTREGA</span>
                      </button>
                    )}

                    {isVerified && (
                      <span className="text-xs text-cyan-400 font-black flex items-center gap-1 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Auditada por Planta</span>
                      </span>
                    )}
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

