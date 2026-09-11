"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Order, Product } from "@/types";
import { priceService } from "@/services/priceService";
import {
  Scale,
  X,
  Plus,
  Trash2,
  Receipt,
  Copy,
  Check,
  Boxes,
  AlertTriangle,
  ChevronDown,
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
    tareDetails: {
      tareNote: string;
      totalGrossKg: number;
      totalTareKg: number;
      totalNetKg: number;
      breakdown: {
        productName: string;
        grossKg: number;
        tareKg: number;
        netKg: number;
        cratesCount: number;
      }[];
    }
  ) => void;
}

interface ProductWeighingState {
  productId: string;
  productName: string;
  unitPrice: number;
  grossWeights: number[];
  tareMode: "individual" | "standard";
  individualTares: number[];
  standardTarePerCrate: number;
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
  // Pedido activo en el modal (puede ser el que vino por props o uno seleccionado del desplegable)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order || null);

  useEffect(() => {
    setCurrentOrder(order || null);
  }, [order]);

  // Cortes a pesar calculados según el pedido activo o catálogo
  const itemsToWeigh = useMemo(() => {
    if (currentOrder && currentOrder.items && currentOrder.items.length > 0) {
      return currentOrder.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        unitPrice: it.unitPrice,
        orderedQty: it.realQuantity || it.quantity,
      }));
    }
    if (products.length > 0) {
      return products.slice(0, 10).map((p) => ({
        productId: p.id,
        productName: p.name,
        unitPrice: 22000,
        orderedQty: 25,
      }));
    }
    return [
      { productId: "prod-chuleta", productName: "Chuleta de cerdo fresca", unitPrice: 22000, orderedQty: 25 },
      { productId: "prod-costilla", productName: "Costilla San Luis cruda", unitPrice: 26000, orderedQty: 20 },
      { productId: "prod-lomo", productName: "Lomo fino magro", unitPrice: 24000, orderedQty: 30 },
      { productId: "prod-bondiola", productName: "Bondiola de cerdo fresca", unitPrice: 25000, orderedQty: 25 },
    ];
  }, [currentOrder, products]);

  const [activeProductId, setActiveProductId] = useState<string>(
    () => itemsToWeigh[0]?.productId || "prod-chuleta"
  );

  const [weighingMap, setWeighingMap] = useState<Record<string, ProductWeighingState>>({});
  const [isCopied, setIsCopied] = useState(false);

  // Sincronizar estado de pesaje cada vez que se abre el modal o cambia el pedido
  useEffect(() => {
    if (!isOpen) return;

    if (itemsToWeigh.length > 0) {
      setActiveProductId(itemsToWeigh[0].productId);
    }

    const map: Record<string, ProductWeighingState> = {};
    itemsToWeigh.forEach((item) => {
      const baseQty = item.orderedQty > 0 ? item.orderedQty : 25;
      map[item.productId] = {
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        grossWeights: [Number((baseQty + 2.0).toFixed(1))],
        tareMode: "standard",
        individualTares: [2.0],
        standardTarePerCrate: 2.0,
      };
    });
    setWeighingMap(map);
  }, [isOpen, currentOrder?.id, itemsToWeigh]);

  if (!isOpen) return null;

  const currentItem =
    itemsToWeigh.find((i) => i.productId === activeProductId) ||
    itemsToWeigh[0] || {
      productId: "prod-chuleta",
      productName: "Chuleta de Cerdo",
      unitPrice: 22000,
      orderedQty: 25,
    };

  const currentWeighing: ProductWeighingState = weighingMap[currentItem.productId] || {
    productId: currentItem.productId,
    productName: currentItem.productName,
    unitPrice: currentItem.unitPrice,
    grossWeights: [27.0],
    tareMode: "standard",
    individualTares: [2.0],
    standardTarePerCrate: 2.0,
  };

  // Helper para actualizar el estado del corte actual
  const updateCurrentWeighing = (updater: (prev: ProductWeighingState) => ProductWeighingState) => {
    setWeighingMap((prev) => {
      const existing = prev[currentItem.productId] || currentWeighing;
      return {
        ...prev,
        [currentItem.productId]: updater(existing),
      };
    });
  };

  // Operaciones de canastillas brutas con carne
  const handleAddGrossCrate = () => {
    updateCurrentWeighing((prev) => ({
      ...prev,
      grossWeights: [...prev.grossWeights, 25.0],
      individualTares: prev.tareMode === "individual" ? [...prev.individualTares, 2.0] : prev.individualTares,
    }));
  };

  const handleUpdateGrossWeight = (index: number, val: string) => {
    const num = parseFloat(val);
    updateCurrentWeighing((prev) => {
      const next = [...prev.grossWeights];
      next[index] = isNaN(num) ? 0 : Math.max(0, num);
      return { ...prev, grossWeights: next };
    });
  };

  const handleRemoveGrossCrate = (index: number) => {
    updateCurrentWeighing((prev) => {
      if (prev.grossWeights.length <= 1) return prev;
      const nextGross = prev.grossWeights.filter((_, i) => i !== index);
      const nextTares =
        prev.tareMode === "individual" && prev.individualTares.length > nextGross.length
          ? prev.individualTares.slice(0, nextGross.length)
          : prev.individualTares;
      return { ...prev, grossWeights: nextGross, individualTares: nextTares };
    });
  };

  // Operaciones de tara vacía a restar
  const handleAddEmptyTare = () => {
    updateCurrentWeighing((prev) => ({
      ...prev,
      individualTares: [...prev.individualTares, 2.0],
    }));
  };

  const handleUpdateTareWeight = (index: number, val: string) => {
    const num = parseFloat(val);
    updateCurrentWeighing((prev) => {
      const next = [...prev.individualTares];
      next[index] = isNaN(num) ? 0 : Math.max(0, num);
      return { ...prev, individualTares: next };
    });
  };

  const handleRemoveTareCrate = (index: number) => {
    updateCurrentWeighing((prev) => {
      if (prev.individualTares.length <= 1) return prev;
      return { ...prev, individualTares: prev.individualTares.filter((_, i) => i !== index) };
    });
  };

  // Cálculos para el corte actualmente activo en pantalla
  const totalGrossKg = currentWeighing.grossWeights.reduce((s, w) => s + w, 0);
  const totalTareKg =
    currentWeighing.tareMode === "individual"
      ? currentWeighing.individualTares.reduce((s, w) => s + w, 0)
      : currentWeighing.grossWeights.length * currentWeighing.standardTarePerCrate;

  const netGrammageKg = Math.max(0, Number((totalGrossKg - totalTareKg).toFixed(2)));
  const totalAmountCOP = Math.round(netGrammageKg * currentWeighing.unitPrice);

  // Resumen consolidado del pedido completo
  const orderConsolidated = useMemo(() => {
    const list: {
      productId: string;
      productName: string;
      unitPrice: number;
      grossKg: number;
      tareKg: number;
      netKg: number;
      amount: number;
      cratesCount: number;
    }[] = [];

    itemsToWeigh.forEach((it) => {
      const w = weighingMap[it.productId] || {
        productId: it.productId,
        productName: it.productName,
        unitPrice: it.unitPrice,
        grossWeights: [Number(((it.orderedQty || 25) + 2.0).toFixed(1))],
        tareMode: "standard",
        individualTares: [2.0],
        standardTarePerCrate: 2.0,
      };

      const gross = w.grossWeights.reduce((s, val) => s + val, 0);
      const tare =
        w.tareMode === "individual"
          ? w.individualTares.reduce((s, val) => s + val, 0)
          : w.grossWeights.length * w.standardTarePerCrate;
      const net = Math.max(0, Number((gross - tare).toFixed(2)));
      const amt = Math.round(net * it.unitPrice);

      list.push({
        productId: it.productId,
        productName: it.productName,
        unitPrice: it.unitPrice,
        grossKg: Number(gross.toFixed(2)),
        tareKg: Number(tare.toFixed(2)),
        netKg: net,
        amount: amt,
        cratesCount: w.grossWeights.length,
      });
    });

    const sumGross = list.reduce((s, i) => s + i.grossKg, 0);
    const sumTare = list.reduce((s, i) => s + i.tareKg, 0);
    const sumNet = list.reduce((s, i) => s + i.netKg, 0);
    const sumAmount = list.reduce((s, i) => s + i.amount, 0);

    return {
      items: list,
      totalGross: Number(sumGross.toFixed(2)),
      totalTare: Number(sumTare.toFixed(2)),
      totalNet: Number(sumNet.toFixed(2)),
      totalAmount: sumAmount,
    };
  }, [itemsToWeigh, weighingMap]);

  // Aplicar pesos netos calculados al pedido y factura
  const handleApplyToOrder = () => {
    const targetOrder = currentOrder || order;
    if (!targetOrder || !onApplyWeights) {
      onClose();
      return;
    }

    const payload = orderConsolidated.items.map((it) => ({
      productId: it.productId,
      realQuantity: it.netKg,
    }));

    const breakdownText = orderConsolidated.items
      .map(
        (it) =>
          `${it.productName}: ${it.cratesCount} canastillas brutas (${it.grossKg}kg) - tara (${it.tareKg}kg) = ${it.netKg}kg netos`
      )
      .join(" | ");

    const tareDetails = {
      tareNote: `Total Bruto: ${orderConsolidated.totalGross}kg - Tara: ${orderConsolidated.totalTare}kg = ${orderConsolidated.totalNet}kg netos. [${breakdownText}]`,
      totalGrossKg: orderConsolidated.totalGross,
      totalTareKg: orderConsolidated.totalTare,
      totalNetKg: orderConsolidated.totalNet,
      breakdown: orderConsolidated.items.map((it) => ({
        productName: it.productName,
        grossKg: it.grossKg,
        tareKg: it.tareKg,
        netKg: it.netKg,
        cratesCount: it.cratesCount,
      })),
    };

    onApplyWeights(targetOrder.id, payload, tareDetails);
    onClose();
  };

  // Copiar ticket de pesaje
  const handleCopyTicket = () => {
    const targetOrder = currentOrder || order;
    const text =
      `⚖️ TICKET DE PESAJE CON TARA - JD DISTRIBUIDORA\n` +
      `Cliente: ${targetOrder?.customerName || "Venta en Cabina / Planta"}\n` +
      `----------------------------------------\n` +
      orderConsolidated.items
        .map(
          (it) =>
            `• ${it.productName.toUpperCase()}\n` +
            `  - Canastillas: ${it.cratesCount} unds\n` +
            `  - Peso Bruto: ${it.grossKg.toFixed(2)} kg\n` +
            `  - Tara Vacías: -${it.tareKg.toFixed(2)} kg\n` +
            `  - GRAMAJE NETO: ${it.netKg.toFixed(2)} kg\n` +
            `  - Valor: ${priceService.formatCurrency(it.amount)} COP`
        )
        .join("\n\n") +
      `\n----------------------------------------\n` +
      `TOTAL BRUTO: ${orderConsolidated.totalGross.toFixed(2)} kg\n` +
      `TOTAL TARA: -${orderConsolidated.totalTare.toFixed(2)} kg\n` +
      `TOTAL NETO A FACTURAR: ${orderConsolidated.totalNet.toFixed(2)} kg\n` +
      `VALOR TOTAL LIQUIDADO: ${priceService.formatCurrency(orderConsolidated.totalAmount)} COP\n` +
      `Cadena de Frío Garantizada: 0°C a 4°C`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-6 text-white flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0 relative bg-amber-500/10 rounded-2xl border border-amber-500/30">
              <Scale className="w-7 h-7 text-amber-400 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-base sm:text-lg text-white">
                  Báscula Digital de Canastillas & Tara
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gramaje Neto Legal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentOrder
                  ? `Pedido ${currentOrder.orderNumber} • ${currentOrder.customerName}`
                  : "Pesaje de Lote en Planta / Venta en Cabina"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
            title="Cerrar báscula"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pedido si hay pedidos disponibles */}
        {availableOrders.length > 0 && (
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1.5 flex-shrink-0">
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>Pedido a Pesar:</span>
            </span>
            <div className="relative flex-1 max-w-sm">
              <select
                value={currentOrder?.id || ""}
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

        {/* Cuerpo con Scroll */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Explicación de la fórmula */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-white text-xs">
                Fórmula de Pesaje en Báscula:
              </p>
              <p className="text-[11px] text-amber-200/90">
                <strong>Peso Bruto (con producto)</strong> menos la <strong>Tara (Canastillas vacías)</strong> calcula los kilos netos exactos que se cobran en factura.
              </p>
            </div>
          </div>

          {/* Pestañas de Cortes cárnicos a pesar */}
          {itemsToWeigh.length > 1 && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Seleccionar Corte a Pesar:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {itemsToWeigh.map((item) => {
                  const isActive = item.productId === activeProductId;
                  const itemWeigh = weighingMap[item.productId];
                  const hasWeights = itemWeigh && itemWeigh.grossWeights.length > 0;
                  const itemNet = itemWeigh
                    ? Math.max(
                        0,
                        itemWeigh.grossWeights.reduce((s, w) => s + w, 0) -
                          (itemWeigh.tareMode === "individual"
                            ? itemWeigh.individualTares.reduce((s, w) => s + w, 0)
                            : itemWeigh.grossWeights.length * itemWeigh.standardTarePerCrate)
                      )
                    : 0;

                  return (
                    <button
                      key={item.productId}
                      type="button"
                      onClick={() => setActiveProductId(item.productId)}
                      className={`px-3 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border flex items-center gap-2 ${
                        isActive
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-950/40 font-black"
                          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750"
                      }`}
                    >
                      <span>🥩 {item.productName.split(" ")[0]}</span>
                      {hasWeights && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-slate-950 text-amber-300" : "bg-slate-900 text-emerald-400"
                          }`}
                        >
                          {itemNet.toFixed(1)} kg
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sección de Pesaje: 1. Peso Bruto vs 2. Tara Vacías */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. Canastillas con Carne (Peso Bruto) */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <h3 className="font-extrabold text-sm text-white">
                      1. Canastillas con Carne (Peso Bruto)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentItem.productName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddGrossCrate}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Canastilla</span>
                </button>
              </div>

              {/* Lista de canastillas brutas */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {currentWeighing.grossWeights.map((weight, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-750 p-2.5 rounded-2xl flex items-center justify-between gap-2"
                  >
                    <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-rose-400" />
                      <span>Canastilla #{idx + 1}:</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={weight || ""}
                          onChange={(e) => handleUpdateGrossWeight(idx, e.target.value)}
                          className="w-24 px-2.5 py-1.5 text-right font-mono font-black text-sm text-white bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-rose-500"
                          placeholder="0.0"
                        />
                        <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold pointer-events-none">
                          kg
                        </span>
                      </div>

                      {currentWeighing.grossWeights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGrossCrate(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Eliminar canastilla"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal Bruto */}
              <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-850">
                <span className="text-slate-400">
                  {currentWeighing.grossWeights.length} canastilla(s) brutas:
                </span>
                <span className="font-mono font-extrabold text-rose-300 bg-rose-950/50 px-2.5 py-1 rounded-xl border border-rose-800/50">
                  Total Bruto: {totalGrossKg.toFixed(2)} kg
                </span>
              </div>
            </div>

            {/* 2. Canastillas Vacías (Tara a Restar) */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <h3 className="font-extrabold text-sm text-white">
                      2. Canastillas Vacías (Tara)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tara de plástico a descontar
                  </p>
                </div>

                {/* Selector de modo tara */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => updateCurrentWeighing((prev) => ({ ...prev, tareMode: "standard" }))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                      currentWeighing.tareMode === "standard"
                        ? "bg-cyan-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Estándar 2kg
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCurrentWeighing((prev) => ({ ...prev, tareMode: "individual" }))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                      currentWeighing.tareMode === "individual"
                        ? "bg-cyan-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Individual
                  </button>
                </div>
              </div>

              {currentWeighing.tareMode === "individual" ? (
                <div className="space-y-2">
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                    {currentWeighing.individualTares.map((tareWeight, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-750 p-2.5 rounded-2xl flex items-center justify-between gap-2"
                      >
                        <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                          <Boxes className="w-4 h-4 text-cyan-400" />
                          <span>Tara Vacía #{idx + 1}:</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              value={tareWeight || ""}
                              onChange={(e) => handleUpdateTareWeight(idx, e.target.value)}
                              className="w-24 px-2.5 py-1.5 text-right font-mono font-black text-sm text-cyan-300 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500"
                              placeholder="2.0"
                            />
                            <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold pointer-events-none">
                              kg
                            </span>
                          </div>

                          {currentWeighing.individualTares.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTareCrate(idx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEmptyTare}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Canastilla vacía</span>
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-xs">
                      Tara Estándar Canastilla JD: 2.00 kg
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {currentWeighing.grossWeights.length} canastilla(s) × 2.0 kg = -
                      {(currentWeighing.grossWeights.length * 2.0).toFixed(2)} kg
                    </p>
                  </div>
                  <span className="font-mono font-black text-cyan-300 text-sm bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-800/40">
                    -{(currentWeighing.grossWeights.length * 2.0).toFixed(2)} kg
                  </span>
                </div>
              )}

              {/* Subtotal Tara */}
              <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-850">
                <span className="text-slate-400">Total Tara Canastillas Vacías:</span>
                <span className="font-mono font-extrabold text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded-xl border border-cyan-800/50">
                  -{totalTareKg.toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>

          {/* Pantalla Digital de Báscula Industrial */}
          <div className="bg-[#0b1326] border-2 border-emerald-500 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 glow-emerald">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#4edea3] animate-ping" />
                <span className="text-xs font-mono font-black uppercase tracking-wider text-[#4edea3]">
                  BÁSCULA INDUSTRIAL • GRAMAJE NETO LEGAL
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {currentItem.productName}
              </span>
            </div>

            {/* Fórmula Aritmética de 3 Columnas */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
              <div className="bg-slate-950 p-2.5 sm:p-3 rounded-2xl border border-slate-800 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-400 block truncate">
                  Peso Bruto
                </span>
                <span className="text-sm sm:text-base md:text-lg font-mono font-black text-rose-300 block truncate">
                  {totalGrossKg.toFixed(2)} <span className="text-[10px] sm:text-xs">kg</span>
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 sm:p-3 rounded-2xl border border-slate-800 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-400 block truncate">
                  (-) Tara Vacías
                </span>
                <span className="text-sm sm:text-base md:text-lg font-mono font-black text-cyan-300 block truncate">
                  -{totalTareKg.toFixed(2)} <span className="text-[10px] sm:text-xs">kg</span>
                </span>
              </div>

              <div className="bg-emerald-950/90 p-2.5 sm:p-3 rounded-2xl border-2 border-[#4edea3] shadow-inner min-w-0">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase font-black text-emerald-300 block truncate">
                  (=) NETO FACTURA
                </span>
                <span className="text-base sm:text-xl md:text-2xl font-mono font-black text-[#4edea3] block truncate">
                  {netGrammageKg.toFixed(2)} <span className="text-[10px] sm:text-xs">kg</span>
                </span>
              </div>
            </div>

            {/* Display Gigante */}
            <div className="py-2 text-center bg-slate-950/80 rounded-2xl border border-slate-800/80 p-3 sm:p-4">
              <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#4edea3] block mb-1 truncate">
                ⚖️ DISPLAY DIGITAL DE BÁSCULA
              </span>
              <div className="text-3xl sm:text-5xl md:text-6xl font-mono font-black text-[#4edea3] tracking-tight drop-shadow-[0_0_20px_rgba(78,222,163,0.5)] truncate">
                {netGrammageKg.toFixed(2)} <span className="text-xl sm:text-2xl font-bold text-emerald-300">kg</span>
              </div>
            </div>

            {/* Liquidación de Valor */}
            <div className="bg-slate-950 rounded-2xl p-3.5 sm:p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] sm:text-[11px] font-mono">
                  Tarifa Oficial de Desposte:
                </span>
                <strong className="text-white font-mono font-black text-xs sm:text-sm">
                  {priceService.formatCurrency(currentWeighing.unitPrice)} / kg
                </strong>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[#4edea3] block text-[10px] sm:text-[11px] font-mono font-bold uppercase">
                  Valor Total Liquidado:
                </span>
                <strong className="text-xl sm:text-2xl md:text-3xl font-mono font-black text-[#4edea3] break-words block">
                  {priceService.formatCurrency(totalAmountCOP)} COP
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con Botones de Acción */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopyTicket}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? "¡Copiado al Portapapeles!" : "Copiar Ticket de Pesaje"}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white font-bold text-xs transition-colors text-center"
            >
              Cerrar
            </button>

            {(currentOrder || order) && onApplyWeights ? (
              <button
                type="button"
                onClick={handleApplyToOrder}
                className="flex-1 sm:flex-none px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all text-center leading-tight cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-slate-950 flex-shrink-0" />
                <span>Aplicar Gramaje a Factura</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopyTicket}
                className="flex-1 sm:flex-none px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all text-center leading-tight"
              >
                <Check className="w-4 h-4 text-slate-950 flex-shrink-0" />
                <span>Pesaje Listo (Copiar)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
