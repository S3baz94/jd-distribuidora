"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { RepeatOrderModal } from "@/components/catalog/RepeatOrderModal";
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
} from "lucide-react";

export default function HomePage() {
  const {
    customer,
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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-28">
      {/* 1. Cabecera Simple de Bienvenida & Destino */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Ventas B2B
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Stock en Frío Disponible
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
            Hola, {customer.contactName} • <span className="text-slate-400 font-normal">{customer.businessName}</span>
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>Entrega en: {customer.address} ({customer.zone})</span>
          </p>
        </div>

        <Link
          href="/pedidos"
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 text-center transition-colors flex-shrink-0"
        >
          Mis Pedidos Anteriores
        </Link>
      </div>

      {/* 2. Pedido Activo en Camino (Si existe) */}
      {activeOrder && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0">
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">
                  Pedido {activeOrder.orderNumber} en camino
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  {activeOrder.deliveryDate}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Total: <strong className="text-slate-200 font-mono">{priceService.formatCurrency(activeOrder.total)}</strong>
                {activeOrder.driverName && ` • Chofer: ${activeOrder.driverName}`}
              </p>
            </div>
          </div>

          <Link
            href={`/pedidos/${activeOrder.id}`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 text-center transition-colors flex items-center justify-center gap-1"
          >
            <span>Ver Estado</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Botón Directo: Repetir Último Pedido en 1 Clic */}
      {lastOrder && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>¿Pedir lo mismo de la semana pasada?</span>
              </h2>
              <p className="text-xs text-slate-400">
                Pedido {lastOrder.orderNumber} ({lastOrder.deliveryDate})
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-slate-200 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {priceService.formatCurrency(lastOrder.total)}
            </span>
          </div>

          {/* Resumen de cortes del último pedido */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex flex-wrap gap-2">
            {lastOrder.items.map((it, idx) => (
              <span key={idx} className="bg-slate-900 px-2 py-1 rounded-md border border-slate-800 text-slate-300 text-[11px]">
                {it.productName}: <strong className="text-slate-100 font-mono">{it.quantity} kg</strong>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRepeatLastOrder}
            disabled={isRepeating}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors active:scale-98 shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
            <span>{isRepeating ? "Cargando cortes..." : "🔁 Repetir este pedido con los mismos kilos"}</span>
          </button>
        </div>
      )}

      {/* 4. Selector Directo de Marca (2 Pestañas Grandes) */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedBrand("jd_distribuidora")}
            className={`p-3 rounded-xl text-center font-semibold text-xs sm:text-sm transition-all border flex items-center justify-center gap-2 ${
              selectedBrand === "jd_distribuidora"
                ? "bg-slate-900 text-slate-100 border-slate-700 shadow-sm"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>🥩 JD Cortes Crudos</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedBrand("gourmet_ahumados")}
            className={`p-3 rounded-xl text-center font-semibold text-xs sm:text-sm transition-all border flex items-center justify-center gap-2 ${
              selectedBrand === "gourmet_ahumados"
                ? "bg-slate-900 text-slate-100 border-slate-700 shadow-sm"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>🪵 Gourmet Ahumados</span>
          </button>
        </div>

        {/* Buscador Sencillo */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar corte cárnico (ej. Bondiola, Costilla, Tocino, Pierna)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 5. Catálogo Práctico de Productos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">
            {selectedBrand === "jd_distribuidora" ? "Cortes Disponibles en Cava" : "Ahumados al Leño"} ({filteredProducts.length})
          </h3>
          <span className="text-[11px] text-slate-500">Precios por kilo en COP</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className={`bg-slate-900 rounded-2xl border p-3.5 sm:p-4 space-y-3 shadow-sm transition-all flex flex-col justify-between ${
                  inCart
                    ? "border-slate-700 bg-slate-900"
                    : isOutOfStock
                    ? "border-slate-800/80 bg-slate-950/40 opacity-70"
                    : "border-slate-800 hover:border-slate-750"
                }`}
              >
                <div className="flex gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-800 flex-shrink-0 bg-slate-950"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 truncate">
                        {product.cutType}
                      </span>
                      {inCart && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1 flex-shrink-0">
                          <Check className="w-3 h-3" />
                          <span>{inCart.quantity} kg</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-100 text-sm mt-1 truncate">
                      {product.name}
                    </h4>

                    <p className="text-base font-bold font-mono text-slate-100 mt-0.5">
                      {priceService.formatCurrency(unitPrice)}{" "}
                      <span className="text-[11px] font-normal text-slate-400 font-sans">/ kg</span>
                    </p>

                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {isOutOfStock ? (
                        <span className="text-rose-400">Agotado por hoy</span>
                      ) : (
                        <span>Stock: <strong className="text-slate-200">{availKg} kg</strong></span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Controles de Selección de Kilos & Agregar */}
                {!isOutOfStock ? (
                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Kilos a pedir:</span>
                      <div className="flex items-center gap-1">
                        {[10, 25, 50].map((quickVal) => (
                          <button
                            key={quickVal}
                            type="button"
                            onClick={() => setQuickQtys((prev) => ({ ...prev, [product.id]: quickVal }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition-colors ${
                              currentQty === quickVal
                                ? "bg-slate-800 text-slate-200 border-slate-600"
                                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300"
                            }`}
                          >
                            {quickVal}k
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-950 rounded-xl p-1 border border-slate-800 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const step = product.quantityStep || 5;
                            const min = product.minimumQuantity || 5;
                            setQuickQtys((prev) => ({
                              ...prev,
                              [product.id]: Math.max(min, currentQty - step),
                            }));
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-xs text-slate-100">
                          {currentQty} kg
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const step = product.quantityStep || 5;
                            setQuickQtys((prev) => ({
                              ...prev,
                              [product.id]: Math.min(availKg, currentQty + step),
                            }));
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                          inCart
                            ? "bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700"
                            : "bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{inCart ? "Actualizar" : "Agregar"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                    Agotado por hoy en planta
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Soporte por WhatsApp Directo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
        <div>
          <p className="font-semibold text-slate-200">¿Prefieres pedir por WhatsApp o llamada?</p>
          <p className="text-slate-400 text-[11px]">Te tomamos el pedido por chat y lo cargamos al furgón</p>
        </div>
        <a
          href="https://wa.me/573233218831?text=Hola%20JD%20Distribuidora,%20quiero%20hacer%20un%20pedido%20de%20carne%20de%20cerdo"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs border border-slate-700 flex items-center gap-1.5 flex-shrink-0 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Pedir por WhatsApp</span>
        </a>
      </div>

      {/* 7. Barra Inferior Fija de Pedido / Carrito */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 z-40 shadow-2xl">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Tu Pedido Actual:</span>
              <p className="font-bold text-sm text-slate-100 font-mono truncate">
                {cartKg.toFixed(1)} kg • {priceService.formatCurrency(cartTotal)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 font-semibold text-xs border border-slate-700 flex items-center gap-2 shadow-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Ver Pedido y Confirmar ➔</span>
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
