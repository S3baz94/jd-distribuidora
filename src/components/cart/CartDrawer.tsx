"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { QuantityStepper } from "../common/QuantityStepper";
import { INITIAL_DELIVERY_SLOTS } from "@/services/mockData";
import { deliverySlotService } from "@/services/deliverySlotService";
import { DeliveryHourSlot } from "@/types";
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
  Clock,
  Zap,
  Sparkles,
  Loader2,
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
    allOrders,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getProductStock,
    placeOrder,
    showToast,
  } = useApp();

  const deliverySlots = INITIAL_DELIVERY_SLOTS;

  const minOrder = customer?.minOrderAmount || 100000;
  const isMinimumMet = cartTotal >= minOrder;

  const [selectedDate, setSelectedDate] = useState<string>(
    deliverySlots.find((s) => s.status === "available")?.dateFormatted || "Jueves 27 de agosto"
  );
  const [selectedAddress, setSelectedAddress] = useState<string>(customer?.address || "Bogotá D.C.");
  const [urgency, setUrgency] = useState<"normal" | "urgente">("normal");
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("slot-0730-0900");
  const [collisionAlert, setCollisionAlert] = useState<{
    occupiedSlotLabel: string;
    suggestedSlot: DeliveryHourSlot;
  } | null>(null);
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

  const timeSlotAvailabilities = useMemo(() => {
    return deliverySlotService.getSlotAvailability(selectedDate, customer?.zone || "Bogotá D.C.", allOrders);
  }, [selectedDate, customer?.zone, allOrders]);

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      showToast("Tu carrito está vacío. Agrega productos para confirmar.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      const chosenSlot =
        deliverySlotService.getStandardSlots().find((s) => s.id === selectedTimeSlotId) ||
        deliverySlotService.getStandardSlots()[1];

      const deliveryNotePrefix = !isMinimumMet
        ? "[PEDIDO PARCIAL / SUJETO A CONSOLIDACIÓN LOGÍSTICA]. "
        : "";

      const order = await placeOrder({
        deliveryDate: selectedDate,
        deliveryAddress: selectedAddress || customer?.address || "Bogotá D.C.",
        deliveryTimeWindow: chosenSlot.label,
        deliverySlotId: chosenSlot.id,
        urgency,
        promisedDeliveryHour: chosenSlot.shortLabel,
        notes: `${deliveryNotePrefix}${urgency === "urgente" ? "🚨 PEDIDO PRIORITARIO / URGENTE. " : ""}Horario preferido: ${chosenSlot.label}. ${notes.trim() || "Despachar en furgón refrigerado JD"}`,
      });
      setIsCartOpen(false);
      showToast(`¡Pedido ${order.orderNumber} confirmado exitosamente!`, "success");
      router.push(`/confirmacion?orderId=${order.id}`);
    } catch (err) {
      console.error("Error submitting order", err);
      showToast("Ocurrió un error al procesar el pedido. Por favor intenta de nuevo.", "error");
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

                  {/* Minimum order progress bar */}
                  <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-emerald-600" />
                        <span>Progreso Pedido Mayorista:</span>
                      </span>
                      <strong className={isMinimumMet ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                        {Math.min(100, Math.round((cartTotal / (minOrder || 1)) * 100))}%
                      </strong>
                    </div>

                    {/* Visual Progress Track */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isMinimumMet
                            ? "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, (cartTotal / (minOrder || 1)) * 100))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-slate-500">
                        Mínimo: <strong>{priceService.formatCurrency(minOrder)}</strong>
                      </span>
                      {isMinimumMet ? (
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>¡Mínimo alcanzado!</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-black">
                          Faltan {priceService.formatCurrency(Math.max(0, minOrder - cartTotal))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Plastic Baskets Estimator */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📦</span>
                      <div>
                        <span className="font-bold text-slate-900 block">Canastillas Refrigeradas JD:</span>
                        <span className="text-[11px] text-slate-600">Equivale a aprox. <strong>{Math.ceil(cartKg / 20) || 1} canastillas</strong> ({cartKg.toFixed(1)} kg)</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg border border-emerald-200">
                      Capacidad 20-25 kg c/u
                    </span>
                  </div>
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

                  {/* Selector de Nivel de Urgencia */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5 text-amber-600 fill-current" />
                      <span>¿Qué tan urgente es tu pedido?</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setUrgency("normal")}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 active:scale-98 ${
                          urgency === "normal"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600/20 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-lg">🟢</span>
                        <div>
                          <p className="font-black text-xs">Jornada Estándar</p>
                          <p className="text-[10px] text-slate-500 font-medium">Entrega en turno regular</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUrgency("urgente")}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 active:scale-98 ${
                          urgency === "urgente"
                            ? "bg-amber-50 border-amber-600 text-amber-950 ring-2 ring-amber-600/30 shadow-sm"
                            : "bg-white border-slate-200 hover:border-amber-300 text-slate-700"
                        }`}
                      >
                        <span className="text-lg">🚨</span>
                        <div>
                          <p className="font-black text-xs text-amber-800">Urgente / Prioritario</p>
                          <p className="text-[10px] text-amber-700 font-medium">Recepción para apertura</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Selector de Franja Horaria de Entrega */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        <span>Franja Horaria de Entrega Deseada</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-bold">
                        Cupos en {customer?.zone ? customer.zone.split("(")[0]?.trim() : "tu zona"}
                      </span>
                    </div>

                    {/* Alerta de Colisión: Si seleccionó o intentó una hora ocupada */}
                    {collisionAlert && (
                      <div className="p-3.5 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-2 border-amber-400 rounded-2xl space-y-2 text-xs animate-in zoom-in-95">
                        <div className="flex items-start gap-2 text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-black">
                              ⚠️ La franja de {collisionAlert.occupiedSlotLabel} ya está completa en tu zona.
                            </p>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                              Para garantizar tu despacho a tiempo, te ofrecemos la siguiente hora más cercana con cupo disponible:
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-white/95 p-2.5 rounded-xl border border-amber-300">
                          <div className="flex items-center gap-2">
                            <span className="text-base">⚡</span>
                            <div>
                              <p className="font-black text-slate-900 text-xs">
                                {collisionAlert.suggestedSlot.label}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {collisionAlert.suggestedSlot.description}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTimeSlotId(collisionAlert.suggestedSlot.id);
                              setCollisionAlert(null);
                            }}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-lg active:scale-95 transition-all shadow-sm flex items-center gap-1 shrink-0"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Tomar esta hora</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Cuadrícula de Franjas Horarias */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {timeSlotAvailabilities.map(({ slot, isAvailable, occupiedCount, maxCapacity, nextClosestSlot }) => {
                        const isSelected = selectedTimeSlotId === slot.id;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => {
                              if (isAvailable) {
                                setSelectedTimeSlotId(slot.id);
                                setCollisionAlert(null);
                              } else if (nextClosestSlot) {
                                setCollisionAlert({
                                  occupiedSlotLabel: slot.label,
                                  suggestedSlot: nextClosestSlot,
                                });
                              }
                            }}
                            className={`p-3 rounded-2xl border-2 text-left transition-all relative overflow-hidden active:scale-98 ${
                              isSelected
                                ? "bg-brand-50 border-brand-600 text-slate-950 shadow-md ring-2 ring-brand-600/30"
                                : !isAvailable
                                ? "bg-slate-100/80 border-slate-200 text-slate-400 opacity-75 hover:border-amber-300"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-black text-xs sm:text-sm">
                                {slot.label}
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                              )}
                            </div>

                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {slot.description}
                            </p>

                            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              {isAvailable ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span>{maxCapacity - occupiedCount} cupo(s) libre(s)</span>
                                </span>
                              ) : (
                                <span className="text-amber-700 font-extrabold flex items-center gap-1">
                                  <span>⚠️ Ocupado (Ver cercana)</span>
                                </span>
                              )}

                              {slot.isUrgentSlot && (
                                <span className="bg-amber-500/10 text-amber-700 px-1.5 py-0.2 rounded font-black text-[9px] uppercase border border-amber-500/20">
                                  Temprano
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Address Reminder with Direct Edit Option */}
                  <div className="p-3.5 bg-slate-100 border-2 border-slate-200 rounded-2xl text-xs flex items-center justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate">{customer?.businessName || "Cliente Mayorista"}</p>
                        <p className="text-slate-600 truncate">{selectedAddress || customer?.address || "Bogotá D.C."}</p>
                        <p className="text-emerald-700 font-bold text-[11px]">{customer?.zone || "Bogotá D.C."}</p>
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

              {/* Minimum Order Notice if not met */}
              {!isMinimumMet ? (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Pedido menor al mínimo mayorista ({priceService.formatCurrency(minOrder)}):</p>
                    <p className="text-[11px] text-amber-800">
                      Puedes confirmar tu pedido ahora. Se despachará sujeto a consolidación de ruta o flete logístico programado.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Zero online payment reminder */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-950 font-bold">
                <span className="text-base">📋</span>
                <span>Confirmación de Pedido: No pagas nada en la app. El pedido se liquida al recibir la carne según el pesaje en báscula.</span>
              </div>

              <button
                type="button"
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleConfirmOrder}
                className="w-full min-h-[56px] py-4 px-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-950/20 transition-all flex flex-col sm:flex-row items-center justify-center gap-2 active:scale-98 tracking-wide"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin stroke-[2.5]" />
                    <span>ENVIANDO PEDIDO A PLANTA...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                    <div className="text-center sm:text-left">
                      <span>CONFIRMAR Y ENVIAR PEDIDO</span>
                      {!isMinimumMet && (
                        <span className="block text-[10px] font-medium opacity-90 tracking-normal">
                          (Sujeto a consolidación logística)
                        </span>
                      )}
                    </div>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
