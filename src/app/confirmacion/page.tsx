"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { whatsappService } from "@/services/whatsappService";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Scale,
  MessageCircle,
  Receipt,
} from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { orders, customer, getOrderInvoice } = useApp();

  const order = orders.find(
    (o) =>
      o.id === orderId ||
      o.orderNumber === orderId ||
      o.orderNumber === `#${orderId}`
  ) || orders[0];

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No se encontró información del pedido.</p>
        <Link href="/comprar" className="mt-4 inline-block text-brand-600 font-bold">
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  const totalKg = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const waLink = whatsappService.getClientOrderLink(order);

  return (
    <div className="max-w-xl mx-auto px-4 py-6 md:py-10 space-y-5">
      {/* Big Green Success Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center shadow-lg space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wide">
            ✓ Pedido Registrado en Planta
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            ¡Tu pedido {order.orderNumber} fue enviado!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Notificamos al equipo de desposte y báscula de JD Distribuidora y Gourmet Ahumados.
          </p>
        </div>

        {/* WhatsApp Direct Share Button */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-950/20 transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>ENVIAR COPIA POR WHATSAPP A LA DISTRIBUIDORA</span>
        </a>

        {/* Key order details box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">Estado actual:</span>
            <StatusBadge status={order.status} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-600" />
              Fecha de entrega:
            </span>
            <span className="font-extrabold text-slate-900">{order.deliveryDate}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              Dirección:
            </span>
            <span className="font-semibold text-slate-900 truncate max-w-[200px]">
              {order.deliveryAddress}
            </span>
          </div>

          {/* Factura Automática Emitida */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Factura Comercial Emitida:
            </span>
            <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {order.invoiceNumber || getOrderInvoice(order)?.number || "FAC-JD-2026-AUTO"}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-bold">
            <span className="text-slate-700">Total Liquidado ({totalKg} kg):</span>
            <span className="text-brand-600 text-base font-black">
              {priceService.formatCurrency(order.total)}
            </span>
          </div>
        </div>

        {/* Scale Tolerance Notice */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-left text-[11px] text-amber-900 flex items-start gap-2">
          <Scale className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Aviso de Liquidación en Báscula:</p>
            <p className="text-amber-800">
              Al tratarse de cortes de carne cruda fresca, el valor final se ajustará exactamente con los kilogramos que marque la báscula digital de planta (+/- 3% a 5%) al momento del desposte.
            </p>
          </div>
        </div>

        {/* Zero Payment Confirmation Note */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-xs text-emerald-950 flex items-start gap-2.5">
          <span className="text-base">💳</span>
          <div>
            <p className="font-black text-xs">Sin cobros en la aplicación:</p>
            <p className="text-emerald-800 text-[11px]">
              Este pedido no generó ningún cobro por internet. La liquidación se realiza al recibir la carne en tu negocio de acuerdo a las condiciones acordadas.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <Link
            href={`/pedidos/${order.id}`}
            className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>VER ESTADO EN VIVO</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/comprar"
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>SEGUIR COMPRANDO</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando confirmación...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
