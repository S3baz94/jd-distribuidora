"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Order, Product } from "@/types";
import { priceService } from "@/services/priceService";
import {
  Scale,
  X,
  Plus,
  Minus,
  Camera,
  CheckCircle2,
  Trash2,
  Receipt,
  Boxes,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";

export interface CratesTareScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  availableOrders?: Order[];
  onSelectOrder?: (order: Order) => void;
  products?: Product[];
  onApplyWeights?: (
    orderId: string,
    realQuantities: { productId: string; realQuantity: number }[],
    tareDetails?: {
      tareNote?: string;
      totalGrossKg?: number;
      totalTareKg?: number;
      totalNetKg?: number;
      scalePhoto?: string;
      breakdown?: {
        productName: string;
        grossKg: number;
        tareKg: number;
        netKg: number;
        cratesCount: number;
      }[];
    }
  ) => void;
}

export const CratesTareScaleModal: React.FC<CratesTareScaleModalProps> = ({
  isOpen,
  onClose,
  order,
  availableOrders = [],
  onSelectOrder,
  products = [],
  onApplyWeights,
}) => {
  // 1. TODOS LOS HOOKS DECLARADOS AL INICIO (SIN CONDICIONES)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order || null);
  const [weightsMap, setWeightsMap] = useState<Record<string, number>>({});
  const [scalePhoto, setScalePhoto] = useState<string>("");
  const [basketsCount, setBasketsCount] = useState<number>(1);
  const [deductBasketTare, setDeductBasketTare] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sincronizar pedido cuando cambie la prop order
  useEffect(() => {
    setCurrentOrder(order || null);
    if (order?.scalePhoto) {
      setScalePhoto(order.scalePhoto);
    } else {
      setScalePhoto("");
    }
  }, [order]);

  // Lista de cortes a pesar
  const itemsToWeigh = useMemo(() => {
    const target = currentOrder || order;
    if (target && target.items && target.items.length > 0) {
      return target.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        unitPrice: it.unitPrice,
        orderedQty: it.quantity,
        currentRealQty: it.realQuantity !== undefined ? it.realQuantity : it.quantity,
      }));
    }
    if (products.length > 0) {
      return products.slice(0, 6).map((p) => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        unitPrice: 22000,
        orderedQty: 25,
        currentRealQty: 25,
      }));
    }
    return [
      { productId: "prod-chuleta", productName: "Chuleta de cerdo fresca", sku: "CHU-001", unitPrice: 22000, orderedQty: 25, currentRealQty: 25 },
      { productId: "prod-costilla", productName: "Costilla San Luis cruda", sku: "COS-002", unitPrice: 26000, orderedQty: 20, currentRealQty: 20 },
      { productId: "prod-lomo", productName: "Lomo fino magro", sku: "LOM-003", unitPrice: 24000, orderedQty: 30, currentRealQty: 30 },
    ];
  }, [currentOrder, order, products]);

  // Inicializar pesos cuando se abra el modal o cambie el pedido
  useEffect(() => {
    if (!isOpen) return;

    const initialMap: Record<string, number> = {};
    itemsToWeigh.forEach((it) => {
      initialMap[it.productId] = it.currentRealQty;
    });
    setWeightsMap(initialMap);

    const totalEstKg = itemsToWeigh.reduce((s, i) => s + i.orderedQty, 0);
    setBasketsCount(Math.max(1, Math.ceil(totalEstKg / 25)));
  }, [isOpen, currentOrder?.id, itemsToWeigh]);

  // Manejador de cambio manual de kilos
  const handleWeightChange = (productId: string, val: number) => {
    setWeightsMap((prev) => ({
      ...prev,
      [productId]: Math.max(0, Number(val.toFixed(2))),
    }));
  };

  // Ajuste rápido con botones
  const handleQuickAdjust = (productId: string, delta: number) => {
    setWeightsMap((prev) => {
      const current = prev[productId] !== undefined ? prev[productId] : 0;
      return {
        ...prev,
        [productId]: Math.max(0, Number((current + delta).toFixed(2))),
      };
    });
  };

  // Manejo de captura fotográfica de la báscula física real
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setScalePhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Totales consolidados de kilos y valor
  const totals = useMemo(() => {
    let totalKg = 0;
    let totalAmount = 0;

    const breakdown = itemsToWeigh.map((it) => {
      const grossKg = weightsMap[it.productId] !== undefined ? weightsMap[it.productId] : it.orderedQty;
      // Si se descuenta tara de canastilla (2 kg por canastilla proporcionalmente o global)
      const netKg = grossKg;
      const amount = Math.round(netKg * it.unitPrice);

      totalKg += netKg;
      totalAmount += amount;

      return {
        productId: it.productId,
        productName: it.productName,
        grossKg,
        tareKg: 0,
        netKg,
        amount,
        cratesCount: 1,
      };
    });

    return {
      totalKg: Number(totalKg.toFixed(2)),
      totalAmount,
      breakdown,
    };
  }, [itemsToWeigh, weightsMap]);

  // Guardar pesaje manual en el pedido y la factura
  const handleSaveWeights = () => {
    const target = currentOrder || order;
    if (!target || !onApplyWeights) {
      onClose();
      return;
    }

    const payload = totals.breakdown.map((item) => ({
      productId: item.productId,
      realQuantity: item.netKg,
    }));

    const tareDetails = {
      tareNote: `Pesaje manual en báscula física: ${totals.totalKg} kg netos liquidados.${scalePhoto ? " [Foto de báscula adjunta]" : ""}`,
      totalGrossKg: totals.totalKg,
      totalTareKg: 0,
      totalNetKg: totals.totalKg,
      scalePhoto: scalePhoto || undefined,
      breakdown: totals.breakdown,
    };

    onApplyWeights(target.id, payload, tareDetails);
    onClose();
  };

  // 2. EL RETURN CONDICIONAL ESTÁ JUSTO ANTES DEL JSX (NUNCA ANTES DE LOS HOOKS)
  if (!isOpen) return null;

  const targetOrder = currentOrder || order;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-6 text-white flex flex-col max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0 shadow-md">
              <Scale className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-base sm:text-lg text-white leading-tight">
                  Pesaje Manual de Pedido & Foto de Báscula
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sin Sincronización Automática
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {targetOrder
                  ? `Pedido ${targetOrder.orderNumber} • ${targetOrder.customerName}`
                  : "Ingresa los pesos reales que marcó la báscula física"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pedido (si hay pedidos de planta disponibles) */}
        {availableOrders.length > 0 && (
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1.5 flex-shrink-0">
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>Pedido a Pesar:</span>
            </span>
            <div className="relative flex-1 max-w-sm">
              <select
                value={targetOrder?.id || ""}
                onChange={(e) => {
                  const found = availableOrders.find((o) => o.id === e.target.value);
                  if (found) {
                    setCurrentOrder(found);
                    if (onSelectOrder) onSelectOrder(found);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold appearance-none pr-8 focus:outline-none focus:border-amber-500"
              >
                {availableOrders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    {ord.orderNumber} • {ord.customerName} ({ord.items.length} cortes)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Instrucciones claras */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-amber-200">
            <Scale className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-white text-xs">
                Modo de Pesaje en Planta:
              </p>
              <p className="text-[11px] text-amber-200/90">
                Pesa la carne en tu <strong>báscula física</strong>. Digita los <strong>kilos reales</strong> en cada corte o toma una <strong>fotografía de la pantalla de la báscula</strong> como soporte legal para facturación.
              </p>
            </div>
          </div>

          {/* SECCIÓN 1: FOTOGRAFÍA DE LA BÁSCULA REAL */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">
                  Foto de la Báscula Física Real (Opcional)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Soporte con la cámara</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />

            {scalePhoto ? (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-black max-h-48 flex items-center justify-center">
                  <img
                    src={scalePhoto}
                    alt="Foto de Báscula"
                    className="w-full h-auto max-h-48 object-contain"
                  />
                  <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                    ✓ FOTO ADJUNTA
                  </span>
                  <button
                    type="button"
                    onClick={() => setScalePhoto("")}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tomar Otra Foto</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-900 hover:bg-slate-850 text-slate-300 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-white">📸 Tomar Foto a la Pantalla de la Báscula</span>
                <span className="text-[10px] text-slate-400">
                  Usa la cámara del teléfono para capturar los números que marca la báscula física
                </span>
              </button>
            )}
          </div>

          {/* SECCIÓN 2: DIGITAR KILOS REALES POR CORTE */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Cortes del Pedido & Kilos Pesados</span>
            </h3>

            <div className="space-y-2.5">
              {itemsToWeigh.map((item) => {
                const currentKg = weightsMap[item.productId] !== undefined ? weightsMap[item.productId] : item.orderedQty;
                const diff = currentKg - item.orderedQty;
                const subtotal = Math.round(currentKg * item.unitPrice);

                return (
                  <div
                    key={item.productId}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold">
                            {item.sku}
                          </span>
                          <h4 className="font-bold text-white text-sm truncate">{item.productName}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Pedido original: <strong className="text-slate-300">{item.orderedQty.toFixed(1)} kg</strong> • Tarifa: {priceService.formatCurrency(item.unitPrice)}/kg
                        </p>
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="text-xs font-mono font-black text-emerald-400 block">
                          {priceService.formatCurrency(subtotal)} COP
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            diff === 0 ? "text-slate-400" : diff > 0 ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {diff === 0 ? "Exacto al pedido" : diff > 0 ? `+${diff.toFixed(2)} kg (sobrante)` : `${diff.toFixed(2)} kg (merma)`}
                        </span>
                      </div>
                    </div>

                    {/* Controles de Ingreso de Kilos */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-850">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-amber-300">
                          Kilos Reales en Báscula:
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={currentKg}
                            onChange={(e) => handleWeightChange(item.productId, parseFloat(e.target.value) || 0)}
                            className="w-28 px-3 py-1.5 text-right font-mono font-black text-sm text-white bg-slate-900 border border-amber-500/60 rounded-xl focus:outline-none focus:border-amber-400 shadow-inner"
                          />
                          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none">
                            kg
                          </span>
                        </div>
                      </div>

                      {/* Botones rápidos de ajuste */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.productId, -1)}
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-750"
                          title="Restar 1 kg"
                        >
                          -1kg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.productId, -0.5)}
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-750"
                          title="Restar 0.5 kg"
                        >
                          -0.5kg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.productId, +0.5)}
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-750"
                          title="Sumar 0.5 kg"
                        >
                          +0.5kg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.productId, +1)}
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-750"
                          title="Sumar 1 kg"
                        >
                          +1kg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.productId, +5)}
                          className="px-2 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-bold border border-amber-700/50"
                          title="Sumar 5 kg"
                        >
                          +5kg
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarjeta de Resumen Total */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                TOTAL LIQUIDACIÓN DE BÁSCULA
              </span>
              <p className="text-xs text-slate-300 mt-0.5">
                {itemsToWeigh.length} corte(s) listos para facturación y despacho
              </p>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Kilos:</span>
                <strong className="text-lg font-mono font-black text-white">
                  {totals.totalKg.toFixed(2)} kg
                </strong>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Total Factura:</span>
                <strong className="text-lg sm:text-xl font-mono font-black text-emerald-400">
                  {priceService.formatCurrency(totals.totalAmount)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con Botones de Acción Directa */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs transition-colors text-center"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveWeights}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 active:scale-95 transition-all text-center cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950 flex-shrink-0" />
            <span>Guardar Pesaje de Báscula</span>
          </button>
        </div>
      </div>
    </div>
  );
};
