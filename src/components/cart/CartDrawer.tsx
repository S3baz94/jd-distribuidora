"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { QuantityStepper } from "../common/QuantityStepper";
import { INITIAL_DELIVERY_SLOTS } from "@/services/mockData";
import {
  X,
  ShoppingBag,
  Trash2,
  Calendar,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from "lucide-react";

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartTotal,
    cartKg,
    cartItemsCount,
    customer,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getProductStock,
    placeOrder,
  } = useApp();

  const deliverySlots = INITIAL_DELIVERY_SLOTS;

  const [selectedDate, setSelectedDate] = useState<string>(
    deliverySlots.find((s) => s.status === "available")?.dateFormatted || "Jueves 27 de agosto"
  );
  const [selectedAddress, setSelectedAddress] = useState<string>(customer.address);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const isMinimumMet = cartTotal >= customer.minOrderAmount;

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const handleConfirmOrder = async () => {
    if (!isMinimumMet || cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        deliveryDate: selectedDate,
        deliveryAddress: selectedAddress || customer.address,
        notes: notes.trim() || "Despachar en furgón refrigerado JD",
      });
      setIsCartOpen(false);
      router.push(`/confirmacion?orderId=${order.id}`);
    } catch (err) {
      console.error("Error submitting order", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const butcherChips = [
    "Entero al vacío",
    "Porcionado estándar",
    "Despostado sin hueso",
    "Marcado para chicharrón",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shadow-md flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-black text-lg shadow-inner">
                🥩
              </div>
              <div>
                <h2 className="font-black text-lg sm:text-xl leading-tight">
                  Tu Pedido de Carne
                </h2>
                <p className="text-xs text-slate-300">
                  {cartItemsCount} {cartItemsCount === 1 ? "corte" : "cortes"} • {cartKg} kg totales
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Cerrar pedido"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Single Scrollable Body (No complex multi-steps) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-4">
                <ShoppingBag className="w-16 h-16 mx-auto text-slate-300" />
                <div>
                  <p className="font-black text-slate-900 text-xl">Tu pedido está vacío</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Selecciona los cortes que necesitas en el catálogo.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-6 py-3.5 bg-brand-600 text-white font-black text-sm rounded-2xl hover:bg-brand-500 transition-all shadow-md active:scale-95"
                >
                  IR A VER LOS CORTES DE CERDO
                </button>
              </div>
            ) : (
              <>
                {/* 1. Selected Meat Cuts Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">
                        1
                      </span>
                      <span>Tus Cortes Seleccionados</span>
                    </h3>
                    <button
                      onClick={clearCart}
                      className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Borrar todo</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {cart.map((item) => {
                      const stock = getProductStock(item.product.id);
                      const maxAvail = stock ? stock.availableQuantity : item.quantity;

                      return (
                        <div
                          key={item.product.id}
                          className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 space-y-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-slate-950 text-base leading-tight">
                                {item.product.name}
                              </h4>
                              <p className="text-sm font-extrabold text-brand-700 mt-0.5">
                                {priceService.formatCurrency(item.unitPrice)}{" "}
                                <span className="text-xs font-normal text-slate-500">/ kilo</span>
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-black text-slate-950 text-lg">
                                {priceService.formatCurrency(item.quantity * item.unitPrice)}
                              </p>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-rose-600 font-bold text-xs mt-1 hover:underline flex items-center gap-1 justify-end ml-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Quitar</span>
                              </button>
                            </div>
                          </div>

                          {/* Big Stepper */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <span className="text-xs font-bold text-slate-700">
                              Kilos a pedir:
                            </span>
                            <QuantityStepper
                              value={item.quantity}
                              min={item.product.minimumQuantity}
                              step={item.product.quantityStep}
                              max={maxAvail}
                              unit="kg"
                              onChange={(val) => updateCartQuantity(item.product.id, val)}
                              size="md"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Minimum order check */}
                  {!isMinimumMet && (
                    <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-sm">
                          Pedido mínimo: {priceService.formatCurrency(customer.minOrderAmount)}
                        </p>
                        <p className="text-amber-800 mt-0.5 font-medium">
                          Te faltan {priceService.formatCurrency(customer.minOrderAmount - cartTotal)} para poder enviar tu pedido.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Delivery Day Selector (Big simple touch buttons) */}
                <div className="space-y-3 pt-2">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">
                        2
                      </span>
                      <span>¿Qué día te llevamos el pedido?</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {deliverySlots.map((slot) => {
                      const isSelected = selectedDate === slot.dateFormatted || selectedDate.includes(slot.dayName);
                      const isUnavailable = slot.status === "unavailable";

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => setSelectedDate(slot.dateFormatted)}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between touch-manipulation active:scale-98 ${
                            isUnavailable
                              ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                              : isSelected
                              ? "bg-brand-50 border-brand-600 text-slate-950 shadow-md ring-2 ring-brand-600/30"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                              isSelected ? "bg-brand-600 text-white font-black" : "bg-slate-100 text-slate-600"
                            }`}>
                              🚚
                            </div>
                            <div>
                              <p className="font-black text-sm sm:text-base">
                                {slot.dayName}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                Fecha: {slot.dateFormatted}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            {isSelected && (
                              <span className="text-xs font-black text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full border border-brand-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Seleccionado</span>
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Delivery Address Reminder with Direct Edit Option */}
                  <div className="p-3.5 bg-slate-100 border-2 border-slate-200 rounded-2xl text-xs flex items-center justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate">{customer.businessName}</p>
                        <p className="text-slate-600 truncate">{selectedAddress || customer.address}</p>
                        <p className="text-emerald-700 font-bold text-[11px]">{customer.zone}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/cuenta");
                      }}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-[11px] font-black text-slate-800 hover:bg-slate-50 flex-shrink-0"
                    >
                      Editar
                    </button>
                  </div>
                </div>

                {/* 3. Butchery Preparation Instructions */}
                <div className="space-y-3 pt-2">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">
                        3
                      </span>
                      <span>¿Cómo necesitas el corte? (Opcional)</span>
                    </h3>
                  </div>

                  {/* Big Quick Chips */}
                  <div className="grid grid-cols-2 gap-2">
                    {butcherChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() =>
                          setNotes((prev) =>
                            prev.includes(chip) ? prev : prev ? `${prev}, ${chip}` : chip
                          )
                        }
                        className="p-2.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-brand-50 hover:border-brand-300 text-slate-800 text-xs font-extrabold text-left transition-all active:scale-95 shadow-sm"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    maxLength={150}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escribe aquí cualquier indicación para el despostador..."
                    className="w-full text-xs sm:text-sm p-3 rounded-2xl border-2 border-slate-200 focus:border-brand-600 focus:outline-none text-slate-900 font-medium"
                  />
                </div>

                {/* 4. Scale Notice */}
                <div className="p-3.5 bg-amber-50 border-2 border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                  <Scale className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-xs">Nota de Pesaje en Báscula:</p>
                    <p className="text-amber-800 mt-0.5">
                      Al ser carne fresca cortada al momento, el valor final se ajustará exactamente con los kilos que marque la báscula (+/- 3% a 5%) al recibirla en tu negocio.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Giant Sticky Bottom Confirmation Button */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-slate-50 border-t-2 border-slate-200 space-y-3 flex-shrink-0">
              <div className="flex justify-between items-baseline text-slate-900">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500">
                    Total Estimado ({cartKg} kg de carne):
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-brand-700">
                    {priceService.formatCurrency(cartTotal)}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                  Flete Frigorífico Gratis
                </span>
              </div>

              {/* Zero online payment reminder */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-950 font-bold">
                <span className="text-base">📋</span>
                <span>Confirmación de Pedido: No pagas nada en la app. El pedido se liquida al recibir la carne según el pesaje en báscula.</span>
              </div>

              <button
                type="button"
                disabled={!isMinimumMet || isSubmitting}
                onClick={handleConfirmOrder}
                className="w-full min-h-[56px] py-4 px-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-950/20 transition-all flex items-center justify-center gap-3 active:scale-98 tracking-wide"
              >
                <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                <span>
                  {isSubmitting
                    ? "ENVIANDO PEDIDO..."
                    : "ENVIAR PEDIDO A LA DISTRIBUIDORA"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
