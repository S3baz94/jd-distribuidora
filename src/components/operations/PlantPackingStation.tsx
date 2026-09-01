"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { Order, DeliveryRoute } from "@/types";
import {
  Scale,
  PackageCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Printer,
  Edit3,
  Check,
  X,
  Layers,
  ShieldCheck,
  ThermometerSnowflake,
  ClipboardList,
  Save,
} from "lucide-react";

interface PlantPackingStationProps {
  selectedRouteId?: string;
  onRouteChange?: (routeId: string) => void;
}

export const PlantPackingStation: React.FC<PlantPackingStationProps> = ({
  selectedRouteId,
  onRouteChange,
}) => {
  const { routes, allOrders, updateOrderStatus, adjustOrderRealWeight, showToast } = useApp();

  const [activeRouteId, setActiveRouteId] = useState<string>(
    selectedRouteId || routes[0]?.id || "route-001"
  );

  // Modal for editing scale weight of a specific order
  const [editingOrderWeight, setEditingOrderWeight] = useState<Order | null>(null);
  const [weightsMap, setWeightsMap] = useState<{ [productId: string]: number }>({});
  const [basketCount, setBasketCount] = useState<number>(2);
  const [sealNumber, setSealNumber] = useState<string>("PREC-JD-8821");

  const currentRoute = routes.find((r) => r.id === activeRouteId) || routes[0];

  const routeOrders = allOrders.filter(
    (o) => o.routeId === currentRoute?.id || currentRoute?.orderIds.includes(o.id)
  );

  // Consolidated cuts required for this route (Planilla de Desposte)
  const consolidatedCuts = React.useMemo(() => {
    const map = new Map<string, { name: string; sku: string; brand: string; totalKg: number; ordersCount: number }>();

    routeOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = map.get(item.productId);
        const qty = item.realQuantity || item.quantity;
        if (existing) {
          existing.totalKg += qty;
          existing.ordersCount += 1;
        } else {
          map.set(item.productId, {
            name: item.productName,
            sku: item.sku,
            brand: item.brand || "jd_distribuidora",
            totalKg: qty,
            ordersCount: 1,
          });
        }
      });
    });

    return Array.from(map.values());
  }, [routeOrders]);

  const totalRouteKg = routeOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0),
    0
  );

  const readyOrdersCount = routeOrders.filter(
    (o) => o.status === "confirmed" || o.status === "ready" || o.status === "dispatched" || o.status === "delivered"
  ).length;

  const handleOpenScaleModal = (order: Order) => {
    setEditingOrderWeight(order);
    const initialWeights: { [productId: string]: number } = {};
    order.items.forEach((item) => {
      initialWeights[item.productId] = item.realQuantity || item.quantity;
    });
    const totalOrderKg = order.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);
    setBasketCount(Math.ceil(totalOrderKg / 25) || 1);
    setSealNumber(`PREC-JD-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSaveScaleWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrderWeight) return;

    // Update items with real weight from physical scale
    const realQuantities = editingOrderWeight.items.map((item) => ({
      productId: item.productId,
      realQuantity: weightsMap[item.productId] ?? (item.realQuantity || item.quantity),
    }));

    adjustOrderRealWeight(editingOrderWeight.id, realQuantities);
    updateOrderStatus(editingOrderWeight.id, "confirmed");

    showToast(
      `⚖️ Pesaje de báscula guardado para ${editingOrderWeight.customerName}. Kilos reales liquidados.`,
      "success"
    );
    setEditingOrderWeight(null);
  };

  const handleQuickMarkReady = (orderId: string, customerName: string) => {
    updateOrderStatus(orderId, "confirmed");
    showToast(`✅ Pedido de ${customerName} marcado como pesado y cargado al furgón`, "success");
  };

  return (
    <div className="space-y-5">
      {/* Route & Vehicle Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                PLANTA & SALA DE DESPOSTE
              </span>
              <h2 className="text-lg font-black text-white">Organización de Cargas & Báscula</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">Furgón:</span>
            <select
              value={activeRouteId}
              onChange={(e) => {
                setActiveRouteId(e.target.value);
                if (onRouteChange) onRouteChange(e.target.value);
              }}
              className="bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  🚛 {r.vehiclePlate} • {r.driverName} ({r.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Load KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Kilos en Furgón:</span>
            <strong className="text-xl font-black text-emerald-400 font-mono">
              {totalRouteKg.toFixed(1)} <span className="text-xs font-semibold text-slate-400">kg</span>
            </strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Paradas Asignadas:</span>
            <strong className="text-xl font-black text-white font-mono">
              {routeOrders.length} <span className="text-xs font-semibold text-slate-400">clientes</span>
            </strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Estado de Cargue:</span>
            <strong className="text-xl font-black text-amber-400 font-mono">
              {readyOrdersCount}/{routeOrders.length} <span className="text-xs font-semibold text-slate-400">listos</span>
            </strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cava Frigorífica:</span>
            <strong className="text-xl font-black text-cyan-400 font-mono">
              1.8°C <span className="text-xs font-semibold text-emerald-400">Óptimo</span>
            </strong>
          </div>
        </div>
      </div>

      {/* Planilla de Desposte Consolidada (Consolidated Cuts Required) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">
              Planilla de Desposte Consolidada para este Furgón
            </h3>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Imprimir Planilla</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Kilos totales por corte que los operarios deben sacar del cuarto frío y alistar para el furgón {currentRoute?.vehiclePlate}:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {consolidatedCuts.map((cut) => (
            <div
              key={cut.sku}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-white truncate max-w-[160px]">{cut.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {cut.sku} • {cut.ordersCount} pedidos
                </p>
              </div>
              <div className="text-right">
                <strong className="text-emerald-400 font-black text-sm font-mono block">
                  {cut.totalKg.toFixed(1)} kg
                </strong>
                <span className="text-[9px] uppercase font-bold text-slate-500">
                  {cut.brand === "gourmet_ahumados" ? "Ahumado" : "Crudo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Orders Breakdown & Digital Scale Adjustments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-cyan-400" />
            <span>Cargas por Cliente & Pesaje en Báscula ({routeOrders.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Toca &quot;Pesar en Báscula&quot; para ajustar kilos reales</span>
        </div>

        <div className="space-y-3">
          {routeOrders.map((order, idx) => {
            const orderKg = order.items.reduce(
              (sum, i) => sum + (i.realQuantity || i.quantity),
              0
            );
            const isReady = order.status === "confirmed" || order.status === "ready" || order.status === "dispatched" || order.status === "delivered";

            return (
              <div
                key={order.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                  isReady
                    ? "bg-slate-900/80 border-emerald-500/40 shadow-emerald-950/20"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        #{idx + 1} • {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          isReady
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {isReady ? "✓ Pesado & Cargado" : "Pendiente de Pesaje"}
                      </span>
                      {order.weightAdjusted && (
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          Báscula Ajustada
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-white">{order.customerName}</h4>
                    <p className="text-xs text-slate-400">{order.deliveryAddress}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenScaleModal(order)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Pesar en Báscula</span>
                    </button>

                    {!isReady && (
                      <button
                        type="button"
                        onClick={() => handleQuickMarkReady(order.id, order.customerName)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Cargar al Furgón</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Items in this order */}
                <div className="pt-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {order.items.map((item) => {
                      const displayQty = item.realQuantity || item.quantity;
                      return (
                        <div
                          key={item.productId}
                          className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-slate-200">{item.productName}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Solicitado: {item.quantity} kg
                            </span>
                          </div>
                          <div className="text-right">
                            <strong className="text-emerald-400 font-black text-sm font-mono block">
                              {displayQty.toFixed(1)} kg
                            </strong>
                            <span className="text-[10px] text-slate-400">
                              {priceService.formatCurrency(displayQty * item.unitPrice)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <span>
                      Total Carga: <strong className="text-white font-mono">{orderKg.toFixed(1)} kg</strong> (~{Math.ceil(orderKg / 25)} canastillas)
                    </span>
                    <span className="font-black text-white">
                      Liquidación: {priceService.formatCurrency(order.realTotal || order.total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for adjusting scale weight */}
      {editingOrderWeight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Pesaje de Báscula Física
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingOrderWeight.customerName} ({editingOrderWeight.orderNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingOrderWeight(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScaleWeight} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <p className="text-slate-300">
                Digita los kilos exactos que marcó la báscula para cada corte antes de montarlo a las canastillas del furgón:
              </p>

              <div className="space-y-3">
                {editingOrderWeight.items.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-sm">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">
                          Pedido por el cliente: <strong className="text-slate-300">{item.quantity} kg</strong>
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        ${item.unitPrice.toLocaleString()}/kg
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <label className="text-slate-400 font-bold text-xs whitespace-nowrap">
                        ⚖️ Kilos Reales en Báscula:
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        required
                        value={weightsMap[item.productId] ?? item.quantity}
                        onChange={(e) =>
                          setWeightsMap({
                            ...weightsMap,
                            [item.productId]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono font-black text-sm text-right focus:outline-none focus:border-amber-500"
                      />
                      <span className="font-bold text-slate-400">kg</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Basket count and Precinto */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    📦 Canastillas Asignadas:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={basketCount}
                    onChange={(e) => setBasketCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    🔒 Precinto de Seguridad:
                  </label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrderWeight(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Pesaje & Liquidar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
