"use client";

import React, { useState } from "react";
import { Product, InventoryItem } from "@/types";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { AvailabilityBadge } from "../common/AvailabilityBadge";
import { QuantityStepper } from "../common/QuantityStepper";
import { FutureStockModal } from "./FutureStockModal";
import { ShoppingBag, Calendar, Check, ThermometerSnowflake, Plus, Flame } from "lucide-react";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    getProductStock,
    getProductPrice,
    addToCart,
    cart,
  } = useApp();

  const stock: InventoryItem = getProductStock(product.id) || {
    productId: product.id,
    companyId: product.companyId,
    physicalQuantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    futureQuantity: 0,
    nextAvailabilityDate: undefined,
    canReserveFuture: false,
  };

  const unitPrice = getProductPrice(product.id);
  const cartItem = cart.find((item) => item.product.id === product.id);

  const [selectedQty, setSelectedQty] = useState<number>(
    cartItem ? cartItem.quantity : product.minimumQuantity
  );
  const [isFutureModalOpen, setIsFutureModalOpen] = useState(false);

  const isOutOfStock = stock.availableQuantity <= 0;
  const isStockLimited = stock.availableQuantity > 0 && stock.availableQuantity <= 15;

  const handleAdd = () => {
    addToCart(product, selectedQty);
  };

  const handleQuickAdd = (qty: number) => {
    setSelectedQty(qty);
    addToCart(product, qty);
  };

  return (
    <>
      <div
        className={`bg-white rounded-3xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-md ${
          cartItem
            ? "border-brand-500 ring-2 ring-brand-500/20"
            : isOutOfStock
            ? "border-slate-200 bg-slate-50 opacity-70"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        {/* Big Product Image */}
        <div className="relative w-full h-48 sm:h-52 bg-slate-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover ${
              isOutOfStock ? "grayscale opacity-60" : ""
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Availability badge top left */}
          <div className="absolute top-3 left-3">
            <AvailabilityBadge
              status={
                isOutOfStock
                  ? "out_of_stock"
                  : isStockLimited
                  ? "limited"
                  : "available"
              }
              availableKg={stock.availableQuantity}
            />
          </div>

          {/* If already in cart, big clear badge */}
          {cartItem && (
            <div className="absolute top-3 right-3 bg-emerald-600 text-white font-black text-xs sm:text-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{cartItem.quantity} kg en tu pedido</span>
            </div>
          )}

          {/* Meat temperature and Brand Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1">
            <div className="text-white text-[11px] font-bold flex items-center gap-1 bg-black/70 px-2.5 py-1 rounded-xl backdrop-blur-sm">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-300" />
              <span>0°C a 4°C</span>
            </div>
            {product.companyId === "gourmet_ahumados" ? (
              <span className="text-[11px] font-black text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-xl backdrop-blur-sm border border-amber-500/40 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>Gourmet Ahumado</span>
              </span>
            ) : (
              <span className="text-[11px] font-black text-rose-300 bg-rose-950/80 px-2.5 py-1 rounded-xl backdrop-blur-sm border border-rose-500/40">
                🥩 JD Crudo Certificado
              </span>
            )}
          </div>
        </div>

        {/* Card Body with Big Friendly Typography */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-black text-slate-950 text-lg sm:text-xl leading-tight">
              {product.name}
            </h3>

            <p className="text-sm text-slate-600 mt-1 font-medium line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Price Box in Giant Font */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
            <span className="text-xs uppercase font-bold text-slate-500 block">
              Precio por kilo:
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <p className="text-2xl sm:text-3xl font-black text-brand-700">
                {priceService.formatCurrency(unitPrice)}
                <span className="text-sm font-bold text-slate-600 ml-1">/ kilo</span>
              </p>
              <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                Mínimo: {product.minimumQuantity} kg
              </span>
            </div>
          </div>

          {/* Action Zone */}
          {isOutOfStock ? (
            <div className="space-y-2">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                <p className="text-sm font-black text-rose-800">🔴 Agotado por hoy</p>
                {stock.nextAvailabilityDate && (
                  <p className="text-xs text-rose-700 mt-0.5 font-semibold">
                    Llega de granja el: <strong>{stock.nextAvailabilityDate}</strong>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsFutureModalOpen(true)}
                className="w-full py-3 px-3 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>RESERVAR PARA PRÓXIMA FECHA</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {/* Stepper with clear label */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  ¿Cuántos kilos necesitas?
                </span>
                <QuantityStepper
                  value={selectedQty}
                  min={product.minimumQuantity}
                  step={product.quantityStep}
                  max={stock.availableQuantity}
                  unit="kg"
                  onChange={setSelectedQty}
                  size="lg"
                />

                {/* Quick-add Canastillas buttons */}
                <div className="flex items-center gap-1.5 w-full pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-0.5">Rápido:</span>
                  {[5, 10, 25].map((addKg) => (
                    <button
                      key={addKg}
                      type="button"
                      onClick={() => setSelectedQty((prev) => Math.min(stock.availableQuantity, prev + addKg))}
                      className="flex-1 py-1.5 px-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 active:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-black transition-colors"
                      title={`Sumar ${addKg} kg a la cantidad`}
                    >
                      +{addKg} kg
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedQty(product.minimumQuantity)}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold"
                    title="Restablecer al mínimo"
                  >
                    Mín
                  </button>
                </div>
              </div>

              {/* Big Direct Action Button with Live Price */}
              <button
                type="button"
                onClick={handleAdd}
                className={`w-full min-h-[50px] py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                  cartItem
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20"
                }`}
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                <span className="truncate">
                  {cartItem
                    ? `ACTUALIZAR (${selectedQty} KG = ${priceService.formatCurrency(selectedQty * unitPrice)})`
                    : `AGREGAR (${selectedQty} KG = ${priceService.formatCurrency(selectedQty * unitPrice)})`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for future availability */}
      <FutureStockModal
        product={product}
        stock={stock}
        isOpen={isFutureModalOpen}
        onClose={() => setIsFutureModalOpen(false)}
      />
    </>
  );
};
