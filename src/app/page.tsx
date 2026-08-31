"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { RepeatOrderModal } from "@/components/catalog/RepeatOrderModal";
import { BrandSwitcher } from "@/components/layout/BrandSwitcher";
import { RepeatOrderValidationResult, Product } from "@/types";
import {
  RotateCcw,
  ShoppingBag,
  Plus,
  Check,
  Search,
  MessageCircle,
  MapPin,
  Flame,
  Layers,
  Truck,
  ArrowRight,
  Package,
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
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [validationResult, setValidationResult] = useState<RepeatOrderValidationResult | null>(null);
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [quickQtys, setQuickQtys] = useState<Record<string, number>>({});

  const isNewCustomer = customer.id === "cust-nuevo";

  // Filter products by selected brand and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesBrand = p.brand === selectedBrand;
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cutType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrand && matchesSearch;
    });
  }, [products, selectedBrand, searchQuery]);

  const handleAdd = (product: Product) => {
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
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Hola, {customer.contactName.split(" ")[0]} 👋 <span className="text-slate-300 font-bold">({customer.businessName})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Cortes en canal, piezas despostadas y costillas ahumadas con entrega directa en tu local.
          </p>
        </div>

        {/* Dirección de Entrega & Acceso a Perfil */}
        <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm font-black border border-emerald-500/30 flex-shrink-0">
              📍
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-xs sm:text-sm truncate">
                {customer.businessName}
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-300 font-bold truncate">
                {customer.address} • <span className="text-slate-400">{customer.zone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
            <Link
              href="/cuenta"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs whitespace-nowrap transition-colors border border-slate-700"
            >
              Editar Datos
            </Link>
            <Link
              href="/pedidos"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs whitespace-nowrap transition-colors border border-slate-700 flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Mis Pedidos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Onboarding Banner para Cliente Nuevo */}
      {isNewCustomer && (
        <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-xl text-white space-y-2 glow-emerald-card animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎉</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Primer Pedido
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
            <div>
              <p className="font-black text-white text-base">
                Pedido {activeOrder.orderNumber}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Total: <strong className="text-emerald-400 font-black">{priceService.formatCurrency(activeOrder.total)}</strong>
                {activeOrder.driverName && ` • Chofer: ${activeOrder.driverName}`}
              </p>
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

      {/* 4. Selector de Marca & Buscador */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedBrand("jd_distribuidora")}
            className={`p-3.5 rounded-2xl text-center font-black text-xs sm:text-sm transition-all border-2 flex items-center justify-center gap-2 shadow-sm ${
              selectedBrand === "jd_distribuidora"
                ? "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Layers className="w-4 h-4 text-rose-600" />
            <span>🥩 JD Cortes Crudos</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedBrand("gourmet_ahumados")}
            className={`p-3.5 rounded-2xl text-center font-black text-xs sm:text-sm transition-all border-2 flex items-center justify-center gap-2 shadow-sm ${
              selectedBrand === "gourmet_ahumados"
                ? "bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>🪵 Gourmet Ahumados</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por corte (Bondiola, Costilla, Panceta, Pierna, Chuleta)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-brand-600 font-medium bg-white text-slate-900 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 5. Catálogo Práctico con Tarjetas Blancas Vivas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-800">
            {selectedBrand === "jd_distribuidora" ? "🥩 Cortes Crudos en Cava" : "🪵 Ahumados al Leño"} ({filteredProducts.length})
          </h3>
          <span className="text-xs font-bold text-brand-700">Precios por kilo en COP</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const stock = getProductStock(product.id);
            const availKg = stock ? stock.availableQuantity : 0;
            const isOutOfStock = availKg <= 0;
            const unitPrice = getProductPrice(product.id);
            const currentQty = quickQtys[product.id] || product.minimumQuantity;
            const inCart = cart.find((i) => i.product.id === product.id);

            return (
              <div
                key={product.id}
                className={`bg-white rounded-3xl border-2 p-4 shadow-sm flex flex-col justify-between space-y-3 transition-all ${
                  inCart
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : isOutOfStock
                    ? "border-slate-200 bg-slate-50 opacity-70"
                    : "border-slate-200 hover:border-slate-300"
                }`}
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

                    <h4 className="font-black text-slate-950 text-base leading-snug mt-1 truncate">
                      {product.name}
                    </h4>

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

                {/* Controles de Selección de Kilos & Agregar */}
                {!isOutOfStock ? (
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Kilos:</span>
                      <div className="flex items-center gap-1">
                        {[10, 25, 50].map((quickVal) => (
                          <button
                            key={quickVal}
                            type="button"
                            onClick={() => setQuickQtys((prev) => ({ ...prev, [product.id]: quickVal }))}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold border transition-colors ${
                              currentQty === quickVal
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {quickVal}k
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
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
                        onClick={() => handleAdd(product)}
                        className={`py-2.5 px-4 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 flex-shrink-0 ${
                          inCart
                            ? "bg-emerald-700 hover:bg-emerald-600"
                            : "bg-emerald-600 hover:bg-emerald-500"
                        }`}
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>{inCart ? "ACTUALIZAR" : "AGREGAR"}</span>
                      </button>
                    </div>
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

      {/* 7. Barra Inferior Fija de Pedido / Carrito */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 z-40 shadow-2xl">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Tu Pedido Actual:</span>
              <p className="font-bold text-sm text-emerald-400 font-mono truncate">
                {cartKg.toFixed(1)} kg • {priceService.formatCurrency(cartTotal)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/40 flex items-center gap-2 active:scale-95 transition-all border border-emerald-400/30"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>CONFIRMAR PEDIDO ➔</span>
            </button>
          </div>
        </div>
      )}

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
