"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { RepeatOrderModal } from "@/components/catalog/RepeatOrderModal";
import { BrandSwitcher } from "@/components/layout/BrandSwitcher";
import { BrandMascotBanner } from "@/components/common/BrandMascotBanner";
import { TrustBadgesBar } from "@/components/common/TrustBadgesBar";
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
          <h1 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider leading-none">
            HOLA, {customer.contactName.split(" ")[0].toUpperCase()} 👋 <span className="text-gold-400 text-2xl sm:text-3xl">({customer.businessName})</span>
          </h1>
          <p className="font-caveat text-base sm:text-lg text-slate-300 font-bold mt-1">
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
                  {customer.businessName}
                </p>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  {customer.assignedPriceListName || "Tarifa Mayorista"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                {customer.address} • <span className="text-slate-400">{customer.zone}</span> • NIT: {customer.nit}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                const link = getMagicLinkForCustomer(customer.id);
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-500/50 flex-shrink-0 bg-slate-900 shadow-md">
                <img
                  src="/images/branding/cerdito-furgon-despacho.jpg"
                  alt="Furgón Refrigerado en Ruta"
                  className="w-full h-full object-cover"
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

      {/* Compromiso de Calidad: 100% Despostado */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔪</span>
          <div>
            <p className="font-black text-white flex items-center gap-2">
              <span>Todo Se Vende 100% Despostado</span>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-700/60">
                Sin Mermas de Canal
              </span>
            </p>
            <p className="text-slate-400 text-[11px]">
              Cortes limpios sin hueso de desecho, pesados al kilo exacto en canastilla y listos para exhibir o cocinar.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 whitespace-nowrap hidden sm:inline-block">
          ⚖️ Kilos Netos Útiles
        </span>
      </div>

      {/* 4. Selector Oficial por Logotipos: Toca el Logo para Elegir Marca */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase text-gold-400 tracking-wider">
            Elige la Marca tocando su Logotipo:
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Catálogo al instante
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* LOGO BOTÓN 1: JD Comercializadora */}
          <button
            type="button"
            onClick={() => setSelectedBrand("jd_distribuidora")}
            className={`relative p-3.5 sm:p-4 rounded-3xl text-left transition-all duration-300 border-2 overflow-hidden group active:scale-[0.98] ${
              selectedBrand === "jd_distribuidora"
                ? "bg-gradient-to-br from-jdblue-950 via-slate-900 to-slate-950 border-gold-500 ring-4 ring-gold-500/30 shadow-2xl shadow-jdblue-950/80"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
            }`}
          >
            {selectedBrand === "jd_distribuidora" && (
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gold-500/15 rounded-full blur-2xl pointer-events-none" />
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="h-13 sm:h-15 flex items-center p-1.5 bg-black/40 rounded-2xl border border-white/5">
                <img
                  src="/images/branding/logo-jd-comercializadora.png"
                  alt="Logo Oficial JD Comercializadora"
                  className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_4px_10px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                    selectedBrand === "jd_distribuidora"
                      ? "bg-gold-500 text-slate-950 font-extrabold shadow-md shadow-gold-500/30"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  {selectedBrand === "jd_distribuidora" ? "✓ Catálogo Activo" : "Tocar para Ver"}
                </span>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  {products.filter((p) => p.brand === "jd_distribuidora").length} cortes de cerdo
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bebas text-lg sm:text-xl text-white tracking-wider leading-none">
                  JD COMERCIALIZADORA
                </h3>
                <p className="font-caveat text-sm sm:text-base text-gold-400 font-bold leading-tight">
                  Cortes 100% Despostados
                </p>
              </div>
              <span className="text-xs font-bold text-gold-300">
                🥩 Crudos
              </span>
            </div>
          </button>

          {/* LOGO BOTÓN 2: Ahumados Gourmet */}
          <button
            type="button"
            onClick={() => setSelectedBrand("gourmet_ahumados")}
            className={`relative p-3.5 sm:p-4 rounded-3xl text-left transition-all duration-300 border-2 overflow-hidden group active:scale-[0.98] ${
              selectedBrand === "gourmet_ahumados"
                ? "bg-gradient-to-br from-fire-950 via-slate-900 to-slate-950 border-fire-500 ring-4 ring-fire-500/30 shadow-2xl shadow-fire-950/80"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
            }`}
          >
            {selectedBrand === "gourmet_ahumados" && (
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-fire-500/15 rounded-full blur-2xl pointer-events-none" />
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="h-13 sm:h-15 flex items-center p-1.5 bg-black/40 rounded-2xl border border-white/5">
                <img
                  src="/images/branding/logo-ahumados-gourmet-oficial.png"
                  alt="Logo Oficial Ahumados Gourmet"
                  className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_4px_10px_rgba(220,38,38,0.35)] group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                    selectedBrand === "gourmet_ahumados"
                      ? "bg-fire-600 text-white font-extrabold shadow-md shadow-fire-600/30"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  {selectedBrand === "gourmet_ahumados" ? "✓ Catálogo Activo" : "Tocar para Ver"}
                </span>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  {products.filter((p) => p.brand === "gourmet_ahumados").length} productos al leño
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bebas text-lg sm:text-xl text-white tracking-wider leading-none">
                  AHUMADOS GOURMET
                </h3>
                <p className="font-caveat text-sm sm:text-base text-fire-400 font-bold leading-tight">
                  Costillas & Carnes al Leño
                </p>
              </div>
              <span className="text-xs font-bold text-fire-300">
                🪵 Ahumados
              </span>
            </div>
          </button>
        </div>

        {/* Buscador Dinámico */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar en catálogo oficial de ${selectedBrand === "gourmet_ahumados" ? "Ahumados Gourmet" : "JD Comercializadora"}...`}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* 5. Catálogo de Cortes por Kilos con Cerdito Chef Saludando */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 sm:p-4 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center gap-3">
            {/* Cerdito con delantal azul saludando (sin fondo blanco) */}
            <div className="w-14 sm:w-16 h-14 sm:h-16 flex-shrink-0 relative">
              <img
                src="/images/branding/cerdito-delantal-azul-bienvenida.png"
                alt="El Cerdito JD"
                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bebas text-2xl sm:text-3xl text-white tracking-wider uppercase">
                  {selectedBrand === "gourmet_ahumados" ? "🪵 LÍNEA AHUMADOS AL LEÑO" : "🥩 CORTES 100% DESPOSTADOS"}
                </span>
              </div>
              <p className="font-caveat text-sm sm:text-base text-gold-400 font-bold leading-none mt-0.5">
                {selectedBrand === "gourmet_ahumados" ? "Ahumado artesanal con madera de guayabo" : "Cortes frescos sin merma de canal"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="font-mono text-xs bg-slate-900 text-gold-300 font-bold px-3 py-1 rounded-full border border-slate-700">
              {filteredProducts.length} productos
            </span>
            <span className="font-caveat text-sm sm:text-base text-gold-400 font-bold hidden md:inline">
              ¡Precios por kilo exacto!
            </span>
          </div>
        </div>

        {/* Lista Vertical de Productos */}
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const unitPrice = getProductPrice(product.id);
            const availKg = getProductStock(product.id)?.availableQuantity || 0;
            const isOutOfStock = availKg <= 0;
            const currentQty = quickQtys[product.id] || product.minimumQuantity || 10;
            const itemInCart = cart.find((i) => i.product.id === product.id);

            return (
              <div
                key={product.id}
                className={`p-4 rounded-3xl bg-slate-950/90 border transition-all ${
                  itemInCart
                    ? "border-gold-500 ring-2 ring-gold-500/40 gold-glow-card"
                    : isOutOfStock
                    ? "border-white/5 opacity-60 bg-slate-950"
                    : "border-slate-800/90 hover:border-slate-700"
                }`}
              >
                <div className="flex gap-3.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-800 flex-shrink-0 shadow-md"
                  />

                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                      product.brand === "gourmet_ahumados"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}>
                      {product.brand === "gourmet_ahumados" ? "🪵 Gourmet Ahumados" : "🥩 Cerdo Crudo JD"}
                    </span>

                    <h4 className="font-bebas text-xl sm:text-2xl text-white tracking-wide mt-1 truncate">
                      {product.name}
                    </h4>

                    <p className="font-bebas text-2xl sm:text-3xl text-gold-400 mt-0.5 tracking-wider">
                      {priceService.formatCurrency(unitPrice)}{" "}
                      <span className="font-sans text-xs font-normal text-slate-400">/ kilo</span>
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {isOutOfStock ? (
                        <span className="text-rose-400 font-bold">🔴 Agotado por hoy</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">
                          🟢 {availKg} kg en frío
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Controles de Selección de Kilos & Agregar */}
                {!isOutOfStock ? (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Kilos rápidos:</span>
                      <div className="flex items-center gap-1">
                        {[10, 25, 50].map((quickVal) => (
                          <button
                            key={quickVal}
                            type="button"
                            onClick={() => setQuickQtys((prev) => ({ ...prev, [product.id]: quickVal }))}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-black border transition-colors ${
                              currentQty === quickVal
                                ? "bg-[#4edea3] text-slate-950 border-[#4edea3]"
                                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
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
                          min={product.minimumQuantity || 5}
                          step={product.quantityStep || 5}
                          max={availKg || 500}
                          unit="kg"
                          size="sm"
                          onChange={(newVal) =>
                            setQuickQtys((prev) => ({ ...prev, [product.id]: newVal }))
                          }
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        className={`px-4 py-2.5 rounded-2xl font-bebas text-base tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 flex-shrink-0 ${
                          itemInCart
                            ? "bg-gold-500 text-slate-950 border border-gold-300 shadow-md"
                            : "bg-gradient-to-r from-fire-600 via-fire-500 to-amber-600 hover:from-fire-500 hover:to-amber-500 text-white shadow-fire-950/60"
                        }`}
                      >
                        {itemInCart ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>AGREGADO</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>+ AGREGAR</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
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

      {/* Sello de Agradecimiento Oficial de la Marca */}
      <div className="text-center py-5 border-t border-slate-800/80">
        <p className="inline-flex items-center gap-2 text-sm sm:text-base text-gold-400 font-brush-accent italic">
          <Heart className="w-4 h-4 text-fire-500 fill-fire-500 animate-pulse" />
          <span>¡Gracias por preferirnos! • JD Comercializadora de Carnes & Ahumados Gourmet</span>
        </p>
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
