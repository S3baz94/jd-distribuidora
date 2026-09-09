"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Calendar,
  Trophy,
  Clock,
  ShoppingBag,
  Check,
  ArrowRight,
  Truck,
  Percent,
  MessageCircle,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { promotionService } from "@/services/promotionService";
import { priceService } from "@/services/priceService";
import { Promotion, PromotionPeriod } from "@/types";

export const PromotionsBoard: React.FC = () => {
  const { products, addToCart, cart, setIsCartOpen, showToast, setSelectedBrand } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<PromotionPeriod | "todas">("todas");

  const promotions = useMemo(() => {
    const all = promotionService.getAllPromotions();
    if (selectedPeriod === "todas") return all;
    return all.filter((p) => p.period === selectedPeriod);
  }, [selectedPeriod]);

  // Contadores para las pestañas
  const counts = useMemo(() => {
    const all = promotionService.getAllPromotions();
    return {
      todas: all.length,
      diaria: all.filter((p) => p.period === "diaria").length,
      semanal: all.filter((p) => p.period === "semanal").length,
      mensual: all.filter((p) => p.period === "mensual").length,
    };
  }, []);

  const handleApplyPromotion = (promo: Promotion) => {
    if (promo.productId) {
      const product = products.find((p) => p.id === promo.productId);
      if (product) {
        const qty = promo.minKgRequirement || product.minimumQuantity || 5;
        addToCart(product, qty);
        showToast(
          `¡Promoción agregada! ${qty} kg de ${product.name} en tu pedido.`,
          "success"
        );
        setIsCartOpen(true);
        return;
      }
    }

    // Si es una marca específica, cambiamos al catálogo
    if (promo.brand === "gourmet_ahumados") {
      setSelectedBrand("gourmet_ahumados");
    } else if (promo.brand === "jd_distribuidora") {
      setSelectedBrand("jd_distribuidora");
    }

    showToast("Explora los cortes disponibles en el catálogo para esta promoción.", "info");
  };

  const getWhatsAppLink = (promo: Promotion) => {
    const text = encodeURIComponent(
      `Hola JD Distribuidora & Gourmet Ahumados, quiero aprovechar la promoción: "${promo.title}" (${promo.badge}). Por favor coordinar mi pedido.`
    );
    return `https://wa.me/573233218831?text=${text}`;
  };

  return (
    <section className="space-y-4 pt-1" aria-label="Tablero de Promociones">
      {/* Encabezado Principal del Tablero */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-gold-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Resplandor de fondo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-fire-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-14 sm:w-14 sm:h-16 flex-shrink-0 relative">
              <img
                src="/images/branding/cerdito-gourmet-ahumados.png"
                alt="Cerdito Chef Promociones"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-gold-500 px-2.5 py-0.5 rounded-full shadow-sm">
                  ★ PIZARRA COMERCIAL MAYORISTA ★
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                  Precios por Kilo & Despachos en Frío
                </span>
              </div>
              <h2 className="font-bebas text-2xl sm:text-3xl lg:text-4xl text-white tracking-wider uppercase mt-1 leading-none break-words">
                ANUNCIOS & PROMOCIONES <span className="text-gold-400">OFICIALES</span>
              </h2>
              <p className="font-caveat text-base sm:text-lg text-slate-300 font-bold leading-tight mt-0.5">
                ¡Aprovecha los descuentos diarios, las semanas de ahorro y los planes mensuales!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">Furgón Refrigerado 0°C a 4°C</span>
          </div>
        </div>

        {/* Pestañas de Filtrado por Período */}
        <div className="relative z-10 pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedPeriod("todas")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              selectedPeriod === "todas"
                ? "bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 shadow-lg shadow-gold-500/20 ring-2 ring-gold-400/40"
                : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todas las Ofertas</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
              {counts.todas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPeriod("diaria")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              selectedPeriod === "diaria"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40"
                : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>⚡ Promociones Diarias</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
              {counts.diaria}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPeriod("semanal")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              selectedPeriod === "semanal"
                ? "bg-gradient-to-r from-fire-600 to-fire-500 text-white shadow-lg shadow-fire-600/30 ring-2 ring-fire-400/40"
                : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-fire-400" />
            <span>📅 Especiales Semanales</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
              {counts.semanal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPeriod("mensual")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              selectedPeriod === "mensual"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/40"
                : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-300" />
            <span>🏆 Planes Mensuales</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
              {counts.mensual}
            </span>
          </button>
        </div>
      </div>

      {/* Rejilla de Tarjetas de Anuncios Promocionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo) => {
          const cartItem = promo.productId
            ? cart.find((item) => item.product.id === promo.productId)
            : undefined;

          return (
            <article
              key={promo.id}
              className={`rounded-3xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-xl relative cartoon-card group ${
                promo.period === "diaria"
                  ? "bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/50 hover:border-amber-400"
                  : promo.period === "semanal"
                  ? "bg-gradient-to-br from-slate-900 via-slate-900 to-fire-950/40 border-fire-500/50 hover:border-fire-400"
                  : "bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/50 hover:border-emerald-400"
              }`}
            >
              {/* Resplandor decorativo interno */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40 ${
                  promo.themeColor === "fire"
                    ? "bg-fire-600"
                    : promo.themeColor === "emerald"
                    ? "bg-emerald-500"
                    : promo.themeColor === "blue"
                    ? "bg-blue-600"
                    : "bg-amber-500"
                }`}
              />

              <div className="p-4 sm:p-5 space-y-3.5 relative z-10 flex-1 flex flex-col justify-between">
                {/* Cabecera de la Tarjeta: Badge de Período y Marca */}
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border tracking-wider shadow-sm flex items-center gap-1 ${
                        promo.period === "diaria"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : promo.period === "semanal"
                          ? "bg-fire-600/20 text-fire-300 border-fire-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {promo.period === "diaria" && <Flame className="w-3 h-3 fill-current" />}
                      {promo.period === "semanal" && <Calendar className="w-3 h-3" />}
                      {promo.period === "mensual" && <Trophy className="w-3 h-3" />}
                      <span>{promo.badge}</span>
                    </span>

                    {/* Badge de Marca */}
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                      {promo.brand === "gourmet_ahumados"
                        ? "🪵 Ahumados Gourmet"
                        : promo.brand === "jd_distribuidora"
                        ? "🥩 JD Despostados"
                        : "🤝 JD & Gourmet"}
                    </span>
                  </div>

                  {/* Título de la Promoción */}
                  <h3 className="font-bebas text-xl sm:text-2xl text-white tracking-wide leading-tight group-hover:text-gold-300 transition-colors break-words">
                    {promo.title}
                  </h3>

                  <p className="font-caveat text-sm sm:text-base text-gold-400 font-bold leading-tight mt-0.5">
                    {promo.subtitle}
                  </p>

                  <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
                    {promo.description}
                  </p>
                </div>

                {/* Bloque Central: Precios / Ahorro o Beneficio Especial */}
                <div className="space-y-2 pt-2">
                  {promo.specialPricePerKg ? (
                    <div className="bg-slate-950/90 rounded-2xl p-3 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Precio regular:</span>
                        {promo.regularPricePerKg && (
                          <span className="line-through font-mono">
                            {priceService.formatCurrency(promo.regularPricePerKg)}/kg
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                            Precio de Oferta:
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                            {priceService.formatCurrency(promo.specialPricePerKg)}
                            <span className="text-xs text-slate-300 font-sans ml-1">/ kg</span>
                          </span>
                        </div>

                        {promo.discountPercentage && (
                          <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-xl">
                            -{promo.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/90 rounded-2xl p-3 border border-slate-800 flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-gold-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-black text-gold-400 block leading-tight">
                          Beneficio Institucional:
                        </span>
                        <p className="text-xs font-bold text-white truncate">
                          {promo.giftText || "Plan Preferencial para Clientes"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Fila de Requisitos y Vigencia */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 flex-wrap gap-1">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{promo.validityText}</span>
                    </span>

                    {promo.minKgRequirement && (
                      <span className="font-bold text-gold-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Mínimo {promo.minKgRequirement} kg
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Acción Inferior */}
              <div className="p-3 bg-slate-950/95 border-t border-slate-800/80 relative z-10">
                {promo.productId ? (
                  <button
                    type="button"
                    onClick={() => handleApplyPromotion(promo)}
                    className={`w-full py-2.5 px-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                      cartItem
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40"
                        : promo.period === "diaria"
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-950/50"
                        : promo.period === "semanal"
                        ? "bg-gradient-to-r from-fire-600 to-fire-500 hover:from-fire-500 hover:to-amber-600 text-white shadow-fire-950/60"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50"
                    }`}
                  >
                    {cartItem ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>EN TU PEDIDO ({cartItem.quantity} KG) • VER CARRITO</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>APROVECHAR OFERTA ({promo.minKgRequirement || 5} KG)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <a
                    href={getWhatsAppLink(promo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-200 fill-current" />
                    <span>SOLICITAR PLAN POR WHATSAPP</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
