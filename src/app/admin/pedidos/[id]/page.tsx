"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { whatsappService } from "@/services/whatsappService";
import { DEMO_COMPANY } from "@/services/mockData";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WeightAdjustmentModal } from "@/components/admin/WeightAdjustmentModal";
import { OrderStatus } from "@/types";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  Truck,
  Scale,
  Printer,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const {
    allOrders,
    allCustomers,
    updateOrderStatus,
    adjustOrderRealWeight,
    updateOrderDispatch,
  } = useApp();

  const order = allOrders.find(
    (o) => o.id === orderId || o.orderNumber === orderId || o.orderNumber === `#${orderId}`
  );

  const customer = allCustomers.find((c) => c.id === order?.customerId);

  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [driverName, setDriverName] = useState(order?.driverName || "Juan Camilo Méndez (Furgón #3 JD)");
  const [sealNumber, setSealNumber] = useState(order?.sealNumber || "PREC-JD-8849");
  const [internalNotes, setInternalNotes] = useState(order?.internalNotes || "");
  const [isSavingDispatch, setIsSavingDispatch] = useState(false);

  if (!order) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-extrabold text-white">Pedido no encontrado</h2>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Pedidos</span>
        </Link>
      </div>
    );
  }

  const stages: { key: OrderStatus; label: string }[] = [
    { key: "pending", label: "Recibido" },
    { key: "confirmed", label: "Confirmado" },
    { key: "preparing", label: "Desposte & Báscula" },
    { key: "ready", label: "Listo en Bahía" },
    { key: "dispatched", label: "En Furgón Frío" },
    { key: "delivered", label: "Entregado" },
  ];

  const currentIdx = stages.findIndex((s) => s.key === order.status);

  const totalKgTheoretical = order.items.reduce((s, i) => s + i.quantity, 0);
  const totalKgReal = order.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);

  const handleSaveDispatch = () => {
    setIsSavingDispatch(true);
    updateOrderDispatch(order.id, {
      driverName,
      sealNumber,
      internalNotes,
    });
    setTimeout(() => {
      setIsSavingDispatch(false);
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  const adminWaLink = whatsappService.getAdminDispatchLink(
    order,
    customer?.phone || "3124567890"
  );

  return (
    <div className="space-y-6">
      {/* Top bar navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pedidos"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Pedido {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-400">
              Cliente: <strong className="text-white">{order.customerName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* WhatsApp Direct Notification */}
          <a
            href={adminWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-colors shadow-md shadow-emerald-950/40"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Notificar Despacho (WhatsApp)</span>
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Remisión</span>
          </button>

          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-lg shadow-amber-950/50 transition-all active:scale-98"
          >
            <Scale className="w-4 h-4" />
            <span>Ajustar Pesaje Báscula</span>
          </button>
        </div>
      </div>

      {/* Status Pipeline Controller Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Línea Operativa de Planta & Despacho
          </span>
          <span className="text-xs text-slate-400">
            Haz clic en un estado para avanzar el pedido
          </span>
        </div>

        {/* Pipeline Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stages.map((stage, idx) => {
            const isCurrent = stage.key === order.status;
            const isPast = currentIdx > idx;

            return (
              <button
                key={stage.key}
                onClick={() => updateOrderStatus(order.id, stage.key)}
                className={`p-3 rounded-2xl text-xs font-extrabold text-center transition-all flex flex-col items-center gap-1 border ${
                  isCurrent
                    ? "bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-950/50 scale-102"
                    : isPast
                    ? "bg-slate-800/80 text-emerald-400 border-slate-700 hover:bg-slate-700"
                    : "bg-slate-900/50 text-slate-500 border-slate-800 hover:bg-slate-800/80 hover:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-1">
                  {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Paso {idx + 1}</span>
                </div>
                <span className="truncate max-w-[100px]">{stage.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Meat Cuts List with Scale Real Weight */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>Cortes de Cerdo en Alistamiento</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Desposte del día • Verificación en báscula digital
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">Kilos Totales</p>
                <p className="text-base font-extrabold text-white">
                  {totalKgReal.toFixed(1)} kg{" "}
                  {order.weightAdjusted && (
                    <span className="text-xs text-emerald-400 font-bold">(Pesado en Báscula)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800">
              {order.items.map((item, i) => {
                const isAdjusted = item.realQuantity !== undefined && item.realQuantity !== item.quantity;
                const activeQty = item.realQuantity !== undefined ? item.realQuantity : item.quantity;
                const activeSubtotal = item.realSubtotal !== undefined ? item.realSubtotal : item.subtotal;

                return (
                  <div
                    key={item.productId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center border border-slate-700 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{item.productName}</p>
                        <p className="text-xs text-slate-400">
                          SKU: <span className="font-mono text-slate-300">{item.sku}</span> • {priceService.formatCurrency(item.unitPrice)}/kg
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                            Pedido: <strong>{item.quantity} kg</strong>
                          </span>
                          {isAdjusted && (
                            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                              Báscula: {item.realQuantity} kg
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-extrabold text-white">
                        {priceService.formatCurrency(activeSubtotal)}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {activeQty.toFixed(1)} kg facturados
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals box */}
            <div className="p-5 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Condición de Pago:</p>
                <p className="text-xs font-bold text-white">
                  {customer?.paymentTerms || "Crédito 15 días / Transferencia"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Liquidado:</p>
                <p className="text-2xl font-black text-emerald-400">
                  {priceService.formatCurrency(order.realTotal || order.total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Dispatch, Cold Chain Seal & Customer */}
        <div className="space-y-6">
          {/* Dispatch Vehicle & Seal Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-md">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-400" />
              <span>Despacho & Cadena de Frío</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Chofer y Vehículo Frigorífico
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  No. Precinto de Seguridad INVIMA
                </label>
                <input
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Notas Internas de Despacho
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ej. Entregar antes de las 9am por la puerta de descarga lateral."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500 placeholder:text-slate-500"
                />
              </div>

              <button
                onClick={handleSaveDispatch}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md transition-colors"
              >
                {isSavingDispatch ? "Guardando..." : "Actualizar Datos de Despacho"}
              </button>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 text-xs">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Datos del Cliente</span>
            </h3>

            <div className="space-y-2 text-slate-300">
              <p className="font-bold text-sm text-white">{order.customerName}</p>
              <p className="text-slate-400">NIT: <strong className="text-slate-200">{customer?.nit || "900.542.118-4"}</strong></p>
              <p className="text-slate-400">Teléfono: <strong className="text-slate-200">{customer?.phone || "312 456 7890"}</strong></p>
              <p className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Fecha Programada: <strong className="text-white">{order.deliveryDate}</strong></span>
              </p>
              {order.notes && (
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                  <p className="font-bold text-slate-400 mb-0.5">Instrucciones del Cliente:</p>
                  <p className="italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adjusting scale weight */}
      <WeightAdjustmentModal
        order={order}
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        onSave={(realQuantities) => adjustOrderRealWeight(order.id, realQuantities)}
      />
    </div>
  );
}
