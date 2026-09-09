"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { RepeatOrderModal } from "@/components/catalog/RepeatOrderModal";
import { BrandMascotBanner } from "@/components/common/BrandMascotBanner";
import { TrustBadgesBar } from "@/components/common/TrustBadgesBar";
import { PromotionsBoard } from "@/components/promotions/PromotionsBoard";
import { RepeatOrderValidationResult } from "@/types";
import {
  RotateCcw,
  MessageCircle,
  Layers,
  ArrowRight,
  Package,
  Heart,
} from "lucide-react";

export default function HomePage() {
  const {
    customer,
    allCustomers,
    switchCustomer,
    activeOrder,
    lastOrder,
    products,
    selectedBrand,
    setSelectedBrand,
    getProductStock,
    getProductPrice,
    addToCart,
    cart,
    cartTotal,
    cartKg,
    repeatOrder,
    setIsCartOpen,
    getMagicLinkForCustomer,
    showToast,
  } = useApp();

  const [validationResult, setValidationResult] = useState<RepeatOrderValidationResult | null>(null);
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const isNewCustomer = customer?.id === "cust-nuevo";

  const handleRepeatLastOrder = async () => {
    if (!lastOrder) return;
    setIsRepeating(true);

    try {
      const result = await repeatOrder(lastOrder);
      if (result.warnings.length > 0) {
        setValidationResult(result);
        setIsRepeatModalOpen(true);
      } else {
        setIsCartOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRepeating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-5 pb-28">
      {/* 1. Header con Colores Vivos y Selector de Cliente */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-5 md:p-6 shadow-2xl border border-slate-800 space-y-3.5 glow-emerald-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md shadow-amber-950/40">
              VENTAS • CLIENTES
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700">
              JD & Gourmet Ahumados
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isNewCustomer ? (
              <button
                type="button"
                onClick={() => switchCustomer("cust-carlos")}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-1 rounded-full border border-slate-700 transition-colors"
                title="Cambiar a cliente con historial"
              >
                🔄 Ver como Cliente Recurrente
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchCustomer("cust-nuevo")}
                className="text-[11px] bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-700/60 transition-colors flex items-center gap-1.5"
                title="Probar experiencia limpia sin pedidos previos"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>🆕 Probar como Cliente Nuevo</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <h1 className="font-bebas text-2xl sm:text-4xl text-white tracking-wider leading-tight break-words">
            HOLA, {(customer?.contactName || "CLIENTE").split(" ")[0].toUpperCase()} 👋 <span className="text-gold-400 text-xl sm:text-3xl block sm:inline mt-1 sm:mt-0">({customer?.businessName || "JD Comercializadora"})</span>
          </h1>
          <p className="font-caveat text-sm sm:text-base md:text-lg text-slate-300 font-bold mt-1">
            Cortes de cerdo 100% despostados y costillas ahumadas con entrega directa en furgón refrigerado.
          </p>
        </div>

        {/* Dirección de Entrega & Acceso a Perfil */}
        <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm font-black border border-emerald-500/30 flex-shrink-0">
              📍
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-white text-xs sm:text-sm truncate">
                  {customer?.businessName || "Cliente Mayorista"}
                </p>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  {customer?.assignedPriceListName || "Tarifa Mayorista"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                {customer?.address || "Bogotá D.C."} • <span className="text-slate-400">{customer?.zone || "Zona Norte"}</span> • NIT: {customer?.nit || "900.000.000-1"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                const link = getMagicLinkForCustomer(customer?.id || "cust-carlos");
                navigator.clipboard.writeText(link);
                showToast("¡Enlace directo de tu negocio copiado!", "success");
              }}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap transition-colors shadow-sm flex items-center gap-1"
              title="Copiar tu enlace directo de WhatsApp"
            >
              <span>📲 Mi Link</span>
            </button>
            <Link
              href="/cuenta"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs whitespace-nowrap transition-colors border border-slate-700"
            >
              Mi QR & Perfil
            </Link>
            <Link
              href="/pedidos"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs whitespace-nowrap transition-colors border border-slate-700 flex items-center gap-1"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Pedidos</span>
            </Link>
            <Link
              href="/login"
              className="px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 font-bold text-[11px] whitespace-nowrap transition-colors border border-slate-800"
              title="Salir o cambiar a otro cliente"
            >
              Salir
            </Link>
          </div>
        </div>
      </div>

      {/* Banner Publicitario Oficial: Pizarra, Mascota Cerdito Chef & Promociones */}
      <BrandMascotBanner />

      {/* Los 4 Sellos Dorados de Garantía y Calidad */}
      <TrustBadgesBar />

      {/* Tablero Oficial de Anuncios de Promociones Diarias, Semanales y Mensuales */}
      <PromotionsBoard />

      {/* 2. Onboarding Banner para Cliente Nuevo */}
      {isNewCustomer && (
        <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-xl text-white space-y-2 glow-emerald-card animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-14 sm:w-16 h-18 sm:h-22 flex-shrink-0 relative">
              <img
                src="/images/branding/cerdito-cliente-ropa.png"
                alt="Bienvenido a tu primer pedido"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Primer Pedido • Cliente B2B
              </span>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                ¡Bienvenido a JD Distribuidora & Gourmet Ahumados!
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Estás listo para realizar tu primer pedido. Explora abajo los cortes frescos de cerdo o las costillas ahumadas al leño, selecciona los kilos que necesitas y confírmalo para despacho en furgón refrigerado.
          </p>
        </div>
      )}

      {/* 3. Pedido Activo en Camino (Si existe) */}
      {activeOrder && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 glow-emerald-card text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Tu Pedido en Ruta de Frío</span>
            </span>
            <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
              {activeOrder.deliveryDate}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-500/50 flex-shrink-0 bg-slate-900 shadow-md">
                <img
                  src="/images/branding/cerdito-furgon-despacho.png"
                  alt="Furgón Refrigerado en Ruta"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-black text-white text-base">
                  Pedido {activeOrder.orderNumber}
                </p>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Total: <strong className="text-emerald-400 font-black">{priceService.formatCurrency(activeOrder.total)}</strong>
                  {activeOrder.driverName && ` • Chofer: ${activeOrder.driverName}`}
                </p>
              </div>
            </div>

            <Link
              href={`/pedidos/${activeOrder.id}`}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>VER DETALLE EN VIVO</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Recompra en 1 Clic (Tarjeta Dorada / Ámbar Vibrante) */}
      {lastOrder && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-3xl border-2 border-amber-500/40 p-4 sm:p-5 shadow-2xl space-y-3.5 glow-amber-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>¿Pedir lo mismo de la semana pasada?</span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                Pedido anterior ({lastOrder.orderNumber}) del {lastOrder.deliveryDate}
              </p>
            </div>

            <span className="text-sm sm:text-base font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 self-start sm:self-auto">
              Total: {priceService.formatCurrency(lastOrder.total)}
            </span>
          </div>

          {/* Cortes en pastillas claras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
            {lastOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 truncate pr-2">• {item.productName}</span>
                <span className="font-extrabold text-amber-400 flex-shrink-0">{item.quantity} kg</span>
              </div>
            ))}
          </div>

          {/* Botón Maestro de Repetir Pedido */}
          <button
            type="button"
            onClick={handleRepeatLastOrder}
            disabled={isRepeating}
            className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-950/50 transition-all flex items-center justify-center gap-2.5 active:scale-98 tracking-wide border border-amber-300"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{isRepeating ? "VERIFICANDO DISPONIBILIDAD..." : "🔁 REPETIR PEDIDO ANTERIOR EN 1 CLIC"}</span>
          </button>
        </div>
      )}

      {/* Acceso Directo al Catálogo Completo para Cortes Regulares */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-2xl flex-shrink-0">
            🥩
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              ¿Buscas cortes adicionales fuera de promoción?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Explora todo nuestro inventario en frío de lomos, bondiolas, pancetas, solomitos y costillas al leño.
            </p>
          </div>
        </div>

        <Link
          href="/comprar"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-950/40 transition-all active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Layers className="w-4 h-4 text-slate-950" />
          <span>VER CATÁLOGO COMPLETO</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 6. Soporte por WhatsApp Directo */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
            💬
          </div>
          <div>
            <p className="font-black text-white text-base">
              ¿Prefieres pedir por WhatsApp o llamada?
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Te atendemos directamente y registramos tu pedido por ti en el sistema.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/573233218831?text=Hola%20JD%20Distribuidora,%20quiero%20hacer%20un%20pedido%20de%20carne%20de%20cerdo"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>ABRIR WHATSAPP DIRECTO</span>
        </a>
      </div>

      {/* Sello de Agradecimiento Oficial de la Marca */}
      <div className="text-center py-5 border-t border-slate-800/80">
        <p className="inline-flex items-center gap-2 text-sm sm:text-base text-gold-400 font-brush-accent italic">
          <Heart className="w-4 h-4 text-fire-500 fill-fire-500 animate-pulse" />
          <span>¡Gracias por preferirnos! • JD Comercializadora de Carnes & Ahumados Gourmet</span>
        </p>
      </div>

      {/* Modal de Advertencia de Repetir Pedido */}
      {validationResult && (
        <RepeatOrderModal
          validationResult={validationResult}
          isOpen={isRepeatModalOpen}
          onClose={() => setIsRepeatModalOpen(false)}
          onContinueToCart={() => setIsCartOpen(true)}
        />
      )}
    </div>
  );
}
