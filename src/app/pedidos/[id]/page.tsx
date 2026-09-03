"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { whatsappService } from "@/services/whatsappService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { RepeatOrderModal } from "@/components/catalog/RepeatOrderModal";
import { RepeatOrderValidationResult } from "@/types";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  RotateCcw,
  Package,
  Printer,
  Scale,
  Truck,
  ShieldCheck,
  MessageCircle,
  Edit3,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Navigation,
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { orders, repeatOrder, setIsCartOpen, updateOrderStatus, showToast } = useApp();

  const order = orders.find(
    (o) =>
      o.id === orderId ||
      o.orderNumber === orderId ||
      o.orderNumber === `#${orderId}`
  );

  const [validationResult, setValidationResult] = useState<RepeatOrderValidationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Error en cantidades o cortes");
  const [otherReason, setOtherReason] = useState("");

  if (!order) {
    return (
      <div className="px-4 py-12 text-center">
        <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Pedido no encontrado</h2>
        <p className="text-xs text-slate-500 mt-1">
          No se encontró ningún pedido con el identificador solicitado.
        </p>
        <Link
          href="/pedidos"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Mis Pedidos</span>
        </Link>
      </div>
    );
  }

  const handleRepeat = async () => {
    setIsProcessing(true);
    try {
      const result = await repeatOrder(order);
      if (result.warnings.length > 0) {
        setValidationResult(result);
        setIsModalOpen(true);
      } else {
        setIsCartOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModifyOrder = async () => {
    setIsProcessing(true);
    try {
      await repeatOrder(order);
      showToast("Puedes ajustar los kilos o cortes en el carrito para actualizar tu pedido", "info");
      setIsCartOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCancellation = () => {
    const finalReason = cancelReason === "Otro" ? otherReason : cancelReason;
    updateOrderStatus(order.id, "cancelled");
    setShowCancelModal(false);
    showToast(`Pedido ${order.orderNumber} anulado correctamente (${finalReason})`, "info");
  };

  const isCancellable = order.status === "pending" || order.status === "confirmed";
  const isModifiable = order.status === "pending" || order.status === "confirmed";

  const waLink = whatsappService.getClientOrderLink(order);
  const totalKgTheoretical = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const totalKgReal = order.items.reduce(
    (acc, i) => acc + (i.realQuantity !== undefined ? i.realQuantity : i.quantity),
    0
  );

  return (
    <div className="px-4 py-5 md:py-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a pedidos</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Enviar por WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Client Quick Action Banner (Confirm / Modify / Cancel) */}
      {isCancellable && (
        <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-amber-500/10 border border-brand-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                ¿Deseas gestionar o cambiar este pedido?
              </h3>
              <p className="text-[11px] text-slate-600">
                Tu pedido está en etapa previa al pesaje en báscula. Puedes modificar cortes o anularlo sin costo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isModifiable && (
              <button
                type="button"
                onClick={handleModifyOrder}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                <span>Modificar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Anular Pedido</span>
            </button>
          </div>
        </div>
      )}

      {/* If Order is in Transit / Preparing notice */}
      {(order.status === "ready" || order.status === "dispatched") && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-200">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <strong className="text-white">Pedido en alistamiento en frío o en furgón refrigerado.</strong>
              <p className="text-[11px] text-slate-400">
                Si requieres un cambio urgente, comunícate directamente con la central de despachos.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/573233218831?text=Hola%20JD%20Distribuidora,%20necesito%20coordinar%20un%20cambio%20urgente%20en%20mi%20pedido"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Contactar Despacho</span>
          </a>
        </div>
      )}

      {/* Main Order Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900">
                Pedido {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} size="md" />
              <span className="font-mono text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-300">
                🧾 Factura: FAC-JD-2026-{order.orderNumber.replace(/[^0-9]/g, "") || "1045"}
              </span>
              {order.weightAdjusted && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                  Báscula Liquidada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registrado el{" "}
              {new Date(order.createdAt).toLocaleDateString("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-xs text-slate-500 block">Total a Pagar</span>
            <span className="text-2xl font-black text-brand-600">
              {priceService.formatCurrency(order.realTotal || order.total)}
            </span>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="py-2">
          <OrderStatusTimeline status={order.status} />
        </div>

        {/* Dispatch Info Box if active */}
        {(order.driverName || order.routeName || order.sealNumber) && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wide">
                <Truck className="w-4 h-4" />
                <span>Ruta de Frío & Domiciliario Asignado</span>
              </div>
              {order.routeName && (
                <span className="bg-brand-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {order.routeName}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <p>
                Domiciliario / Chofer: <strong className="text-white">{order.driverName || "Furgón Refrigerado JD"}</strong>
                {order.driverPhone && <span className="text-emerald-400 font-bold ml-1">({order.driverPhone})</span>}
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Precinto INVIMA: <strong className="text-white font-mono">{order.sealNumber || "PREC-JD-8849"}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delivery & Commercial Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Delivery Slot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Fecha de Entrega</span>
          </div>
          <p className="text-base font-extrabold text-slate-900">{order.deliveryDate}</p>
          <p className="text-xs text-slate-500">
            Ruta de frío matutina con furgón refrigerado (0°C a 4°C).
          </p>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Dirección de Despacho</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{order.deliveryAddress}</p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              order.deliveryAddress
            )}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Trazar Ruta GPS desde Ubicación Actual →</span>
          </a>
          <p className="text-xs text-slate-500">Cliente: {order.customerName}</p>
        </div>
      </div>

      {/* Order Notes (if any) */}
      {order.notes && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Observaciones registradas por el cliente:</span>
          </div>
          <p className="italic text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/70">
            &quot;{order.notes}&quot;
          </p>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-extrabold text-slate-900 text-sm">
            Cortes y Cantidades ({order.items.length} cortes • {totalKgReal.toFixed(1)} kg)
          </span>
          {order.weightAdjusted && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              Pesaje Real de Planta
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => {
            const hasReal = item.realQuantity !== undefined && item.realQuantity !== item.quantity;
            const finalQty = item.realQuantity !== undefined ? item.realQuantity : item.quantity;
            const finalSub = item.realSubtotal !== undefined ? item.realSubtotal : item.subtotal;

            return (
              <div
                key={idx}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                  <p className="text-xs text-slate-500">
                    SKU: {item.sku} • {priceService.formatCurrency(item.unitPrice)}/kg
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Pedido: {item.quantity} kg
                    </span>
                    {hasReal && (
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        Báscula: {item.realQuantity} kg
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="font-extrabold text-slate-900 text-base">
                    {priceService.formatCurrency(finalSub)}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {finalQty.toFixed(1)} kg facturados
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal de carne:</span>
            <span className="font-bold text-slate-900">
              {priceService.formatCurrency(order.realTotal || order.total)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Flete / Despacho refrigerado:</span>
            <span className="font-bold text-emerald-700">INCLUIDO ($0)</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>TOTAL LIQUIDADO:</span>
            <span className="text-brand-600 text-xl font-black">
              {priceService.formatCurrency(order.realTotal || order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={handleRepeat}
          disabled={isProcessing}
          className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isProcessing ? "Verificando..." : "REPETIR ESTE PEDIDO"}</span>
        </button>

        <Link
          href="/comprar"
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors text-center"
        >
          Ir al Catálogo
        </Link>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 text-slate-900 animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">¿Anular este Pedido?</h3>
                <p className="text-xs text-slate-500">Pedido #{order.orderNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Al confirmar, el pedido quedará cancelado inmediatamente y el inventario reservado volverá a estar disponible en planta.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Selecciona el motivo de anulación:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              >
                <option value="Error en cantidades o cortes">Error en cantidades o cortes</option>
                <option value="Cambio de fecha / horario">Cambio de fecha u horario de entrega</option>
                <option value="Cancelación de evento / cierre">Cancelación de evento o cierre de local</option>
                <option value="Otro">Otro motivo...</option>
              </select>

              {cancelReason === "Otro" && (
                <input
                  type="text"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Escribe brevemente el motivo..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500 mt-2"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                No, Mantener Pedido
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-colors"
              >
                Sí, Anular Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repeat Order Warning Modal */}
      {validationResult && (
        <RepeatOrderModal
          validationResult={validationResult}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onContinueToCart={() => setIsCartOpen(true)}
        />
      )}
    </div>
  );
}
