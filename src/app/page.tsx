"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { RepeatOrderModal } from "@/components/catalog/RepeatOrderModal";
import { InstallAppPrompt } from "@/components/common/InstallAppPrompt";
import { BrandSwitcher } from "@/components/layout/BrandSwitcher";
import { RepeatOrderValidationResult, Product } from "@/types";
import {
  RotateCcw,
  ArrowRight,
  Layers,
  MessageCircle,
  Plus,
  Package,
} from "lucide-react";

export default function HomePage() {
  const {
    customer,
    activeOrder,
    lastOrder,
    products,
    selectedBrand,
    getProductStock,
    getProductPrice,
    addToCart,
    cart,
    repeatOrder,
    setIsCartOpen,
  } = useApp();

  const [validationResult, setValidationResult] = useState<RepeatOrderValidationResult | null>(null);
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [quickQtys, setQuickQtys] = useState<Record<string, number>>({});

  const filteredProducts = products.filter((p) => p.brand === selectedBrand);

  const displayProducts = filteredProducts.slice(0, 6);

  const handleQuickAdd = (product: Product) => {
    const qty = quickQtys[product.id] || product.minimumQuantity;
    addToCart(product, qty);
  };

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
    <div className="px-3 sm:px-4 py-4 md:py-6 space-y-5">
      {/* 1. Header Greeting with Executive Dark Glassmorphism */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-5 md:p-7 shadow-2xl border border-slate-800 space-y-4 glow-emerald-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md shadow-amber-950/40">
              VENTAS • CLIENTES
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700">
              JD & Gourmet Ahumados
            </span>
          </div>
          <span className="text-emerald-400 font-black text-xs flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Planta & Frigorífico en Vivo</span>
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Hola, {customer.contactName.split(" ")[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Cortes en canal, piezas despostadas y costillas ahumadas con entrega directa en furgón refrigerado.
          </p>
        </div>

        {/* Highlighted Delivery Address Pill */}
        <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm font-black border border-emerald-500/30 flex-shrink-0">
              📍
            </div>
            <div className="min-w-0">
              <p className="font-black text-white text-xs sm:text-sm truncate">
                {customer.businessName}
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-300 font-bold truncate">
                {customer.address} • <span className="text-slate-400">{customer.zone}</span>
              </p>
            </div>
          </div>

          <Link
            href="/cuenta"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs whitespace-nowrap flex-shrink-0 transition-colors border border-slate-700 active:scale-95"
          >
            Editar Datos
          </Link>
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <Link
            href="/comprar"
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 active:scale-98 border border-emerald-400/30"
          >
            <Layers className="w-5 h-5" />
            <span>VER CATÁLOGO COMPLETO</span>
          </Link>
          <Link
            href="/pedidos"
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-black text-sm border border-slate-750 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Package className="w-5 h-5 text-amber-400" />
            <span>Mis Pedidos & Historial</span>
          </Link>
        </div>
      </div>

      {/* 2. Brand Division Switcher: JD Distribuidora vs Gourmet Ahumados */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Línea de Compra Seleccionada:
          </p>
          <span className="text-[11px] text-amber-400 font-bold">2 Catálogos Disponibles</span>
        </div>
        <BrandSwitcher />
      </div>

      {/* 3. Giant 1-Tap Repeat Last Order Card (Matching Slide 6) */}
      {lastOrder && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-3xl border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-4 glow-amber-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>¿Pedir lo mismo de la semana pasada?</span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                Pedido anterior ({lastOrder.orderNumber}) del {lastOrder.deliveryDate}
              </p>
            </div>

            <span className="text-base sm:text-lg font-black text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-2xl border border-amber-500/30 self-start sm:self-auto">
              Total: {priceService.formatCurrency(lastOrder.total)}
            </span>
          </div>

          {/* Cuts list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            {lastOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 truncate pr-2">• {item.productName}</span>
                <span className="font-extrabold text-amber-400 flex-shrink-0">{item.quantity} kg</span>
              </div>
            ))}
          </div>

          {/* Giant Reorder Button */}
          <button
            type="button"
            onClick={handleRepeatLastOrder}
            disabled={isRepeating}
            className="w-full min-h-[56px] py-4 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-950/50 transition-all flex items-center justify-center gap-3 active:scale-98 tracking-wide border border-amber-300"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>{isRepeating ? "VERIFICANDO DISPONIBILIDAD..." : "🔁 REPETIR PEDIDO ANTERIOR EN 1 CLIC"}</span>
          </button>
        </div>
      )}

      {/* 4. Active In-Flight Order with Live Order Timeline (Matching Slide 6) */}
      {activeOrder && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-2xl space-y-4 glow-emerald-card text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span>Tu Pedido en Ruta de Frío</span>
            </span>
            <StatusBadge status={activeOrder.status} size="md" />
          </div>

          {/* Live Order Timeline Bar */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Progreso del Pedido:
            </p>
            <div className="grid grid-cols-4 gap-1 text-center text-[11px] font-bold">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ Registrado
              </div>
              <div className={`p-2 rounded-xl border ${activeOrder.status !== "pending" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                ⚖️ En Báscula
              </div>
              <div className={`p-2 rounded-xl border ${activeOrder.status === "dispatched" || activeOrder.status === "delivered" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                🚚 En Furgón
              </div>
              <div className={`p-2 rounded-xl border ${activeOrder.status === "delivered" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                🏁 Entregado
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="font-black text-white text-lg">
                Pedido {activeOrder.orderNumber}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">
                📅 Entrega: <strong className="text-white">{activeOrder.deliveryDate}</strong> • Total: <strong className="text-emerald-400 font-black">{priceService.formatCurrency(activeOrder.total)}</strong>
              </p>
              {activeOrder.driverName && (
                <p className="text-xs text-emerald-400 font-bold mt-1">
                  🚚 Domiciliario: {activeOrder.driverName}
                </p>
              )}
            </div>

            <Link
              href={`/pedidos/${activeOrder.id}`}
              className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>VER DETALLE EN VIVO</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* PWA Download Banner */}
      <InstallAppPrompt />

      {/* 5. Direct WhatsApp Support Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
            💬
          </div>
          <div>
            <p className="font-black text-white text-base">
              ¿Prefieres pedir por WhatsApp o llamada telefónica?
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Te atendemos directamente y registramos tu pedido por ti en el sistema.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/573133923080?text=Hola%20JD%20Distribuidora,%20quiero%20hacer%20un%20pedido%20de%20carne%20de%20cerdo"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>ABRIR WHATSAPP DIRECTO</span>
        </a>
      </div>

      {/* 6. Products Grid with Brand Awareness */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-950">
              {selectedBrand === "jd_distribuidora"
                ? "🥩 Cortes de Cerdo Crudo (JD Distribuidora)"
                : selectedBrand === "gourmet_ahumados"
                ? "🪵🔥 Costillas & Chuletas Ahumadas (Gourmet Ahumados)"
                : "Cortes & Ahumados Más Pedidos"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Agrega los kilos que necesitas con 1 solo toque
            </p>
          </div>
          <Link
            href="/comprar"
            className="text-xs sm:text-sm font-black text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayProducts.map((product) => {
            const stock = getProductStock(product.id);
            const availKg = stock ? stock.availableQuantity : 0;
            const isOutOfStock = availKg <= 0;
            const unitPrice = getProductPrice(product.id);
            const currentQty = quickQtys[product.id] || product.minimumQuantity;
            const inCart = cart.find((i) => i.product.id === product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border-2 border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      product.brand === "gourmet_ahumados"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-rose-100 text-rose-900 border border-rose-200"
                    }`}>
                      {product.brand === "gourmet_ahumados" ? "🪵 Gourmet Ahumados" : "🥩 Cerdo Crudo JD"}
                    </span>
                    <h3 className="font-black text-slate-950 text-base leading-snug mt-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-lg font-black text-brand-700 mt-0.5">
                      {priceService.formatCurrency(unitPrice)}{" "}
                      <span className="text-xs font-normal text-slate-500">/ kilo</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-black">🔴 Agotado por hoy</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          🟢 {availKg} kg en bodega
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {!isOutOfStock ? (
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Kilos:</span>
                      <QuantityStepper
                        value={currentQty}
                        min={product.minimumQuantity}
                        step={product.quantityStep}
                        max={availKg}
                        unit="kg"
                        onChange={(val) =>
                          setQuickQtys((prev) => ({ ...prev, [product.id]: val }))
                        }
                        size="sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{inCart ? "ACTUALIZAR KILOS" : `AGREGAR ${currentQty} KG`}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-700 font-bold">
                    Próxima llegada: {stock?.nextAvailabilityDate || "Pronto"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Repeat Order Warning Modal */}
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
