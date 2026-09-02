"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { whatsappService } from "@/services/whatsappService";
import { DEMO_COMPANY } from "@/services/mockData";
import { StatusBadge } from "@/components/common/StatusBadge";
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
  Navigation,
  Receipt,
} from "lucide-react";
import { InvoiceModal } from "@/components/admin/InvoiceModal";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const {
    allOrders,
    allCustomers,
    invoiceOrder,
    isOrderInvoiced,
    getOrderInvoice,
    billingSettings,
  } = useApp();

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const order = allOrders.find(
    (o) => o.id === orderId || o.orderNumber === orderId || o.orderNumber === `#${orderId}`
  );

  const customer = allCustomers.find((c) => c.id === order?.customerId);

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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Pedido {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />

              {/* Invoice Status Pill */}
              {isOrderInvoiced(order) ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Factura #{getOrderInvoice(order)?.number || order.invoiceNumber || "FAC-JD"}</span>
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <span>Sin Facturar</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Cliente: <strong className="text-white">{order.customerName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Invoice Action Button */}
          {isOrderInvoiced(order) ? (
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-colors shadow-md shadow-cyan-950/40"
            >
              <Receipt className="w-4 h-4" />
              <span>Ver Factura #{getOrderInvoice(order)?.number || order.invoiceNumber || "FAC-JD"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                invoiceOrder(order.id);
                setIsInvoiceModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-950/50 active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>Facturar Pedido al Cliente</span>
            </button>
          )}

          {/* WhatsApp Direct Notification */}
          <a
            href={adminWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-colors shadow-md shadow-emerald-950/40"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Notificar al Cliente (WhatsApp)</span>
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Remisión</span>
          </button>
        </div>
      </div>

      {/* Status Pipeline Visual Timeline (Read-only monitoring) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Seguimiento Operativo en Tiempo Real (Planta, Báscula & Despacho)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
            📡 Estado gestionado en vivo desde la App de Operación
          </span>
        </div>

        {/* Pipeline Visual Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stages.map((stage, idx) => {
            const isCurrent = stage.key === order.status;
            const isPast = currentIdx > idx;

            return (
              <div
                key={stage.key}
                className={`p-3 rounded-2xl text-xs font-extrabold text-center transition-all flex flex-col items-center gap-1 border ${
                  isCurrent
                    ? "bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-950/50 ring-2 ring-brand-400/40"
                    : isPast
                    ? "bg-slate-800/80 text-emerald-400 border-slate-700"
                    : "bg-slate-950 text-slate-600 border-slate-800"
                }`}
              >
                <div className="flex items-center gap-1">
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  ) : null}
                  <span>Paso {idx + 1}</span>
                </div>
                <span className="truncate max-w-[110px]">{stage.label}</span>
              </div>
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

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Chofer & Furgón Asignado:</span>
                <strong className="text-white font-bold text-xs">{order.driverName || "Furgón Refrigerado JD (Carlos Pérez)"}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Precinto de Seguridad INVIMA:</span>
                <strong className="text-cyan-300 font-mono font-bold text-xs">{order.sealNumber || "PREC-JD-8849"}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Telemetría de Cava / Furgón:</span>
                <strong className="text-emerald-400 font-mono font-bold text-xs">❄️ 1.8°C (Rango Óptimo 0°C a 4°C)</strong>
              </div>

              {order.internalNotes && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Observaciones de Planta:</span>
                  <p className="text-slate-300 italic text-xs">{order.internalNotes}</p>
                </div>
              )}
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
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span>{order.deliveryAddress}</span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      order.deliveryAddress
                    )}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold text-xs mt-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Trazar ruta desde ubicación actual →</span>
                  </a>
                </div>
              </div>
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

      {/* Invoice Modal */}
      <InvoiceModal
        invoice={getOrderInvoice(order) || null}
        settings={billingSettings}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
}
