"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { orderService } from "@/services/orderService";
import { priceService } from "@/services/priceService";
import {
  Scale,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  Layers,
  ShoppingBag,
  Building2,
  PackageCheck,
  Receipt,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function AdminPickingPage() {
  const {
    allOrders,
    products,
    invoiceOrder,
    isOrderInvoiced,
    getOrderInvoice,
  } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"cuts" | "customers">("cuts");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [checkedOrders, setCheckedOrders] = useState<Record<string, boolean>>({});

  // Unique delivery dates from active orders
  const deliveryDates = useMemo(() => {
    const dates = new Set<string>();
    allOrders.forEach((o) => {
      if (o.status !== "cancelled" && o.status !== "delivered") {
        dates.add(o.deliveryDate);
      }
    });
    return Array.from(dates);
  }, [allOrders]);

  // Filtered orders
  const activeFilteredOrders = useMemo(() => {
    return allOrders.filter((o) => {
      const matchStatus = o.status !== "cancelled" && o.status !== "delivered";
      const matchDate = selectedDate === "all" || o.deliveryDate === selectedDate;
      return matchStatus && matchDate;
    });
  }, [allOrders, selectedDate]);

  // Consolidated picking summary
  const pickingSummary = useMemo(() => {
    const filterDate = selectedDate === "all" ? undefined : selectedDate;
    return orderService.getPickingSummary(filterDate);
  }, [allOrders, selectedDate]);

  const totalKgToCut = pickingSummary.reduce((sum, item) => sum + item.totalKg, 0);

  const toggleCheck = (productId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const toggleOrderCheck = (orderId: string) => {
    setCheckedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Scale className="w-7 h-7 text-amber-500" />
            <span>Planilla de Desposte & Empaque en Canastillas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consolidado para sala de desposte y desglose por cliente para armado de canastillas en furgón.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Planilla Oficial</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            Fecha de Entrega:
          </span>
          <button
            onClick={() => setSelectedDate("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDate === "all"
                ? "bg-brand-600 text-white shadow-md"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Todos los Activos
          </button>
          {deliveryDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate === date
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {date}
            </button>
          ))}
        </div>

        <div className="text-left md:text-right bg-slate-800/60 md:bg-transparent p-3 md:p-0 rounded-2xl border md:border-0 border-slate-700">
          <p className="text-xs text-slate-400">Total Kilos a Despostar / Despachar:</p>
          <p className="text-2xl font-black text-amber-400">
            {totalKgToCut.toLocaleString("es-CO")} <span className="text-sm text-slate-400">kg netos</span>
          </p>
        </div>
      </div>

      {/* Dual Tab Switcher: By Cut vs By Customer / Canastilla */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("cuts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === "cuts"
              ? "bg-brand-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Consolidado por Corte (Sala de Desposte)</span>
          <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px]">
            {pickingSummary.length} cortes
          </span>
        </button>

        <button
          onClick={() => setActiveTab("customers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === "customers"
              ? "bg-brand-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>2. Desglose por Canastilla / Cliente (Empaque)</span>
          <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px]">
            {activeFilteredOrders.length} pedidos
          </span>
        </button>
      </div>

      {/* Tab 1: Consolidated by Cut */}
      {activeTab === "cuts" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Cortes Cárnicos Requeridos ({pickingSummary.length})</span>
            </h3>
            <span className="text-xs text-slate-400">
              Marca el checkbox conforme alistes cada corte
            </span>
          </div>

          {pickingSummary.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="font-bold text-sm text-slate-300">No hay pedidos pendientes para esta fecha</p>
              <p className="text-xs text-slate-500">Selecciona "Todos los Activos" para ver los requerimientos globales.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {pickingSummary.map((item) => {
                const isChecked = checkedItems[item.productId] || false;
                const prod = products.find((p) => p.id === item.productId);

                return (
                  <div
                    key={item.productId}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isChecked ? "bg-emerald-950/20 opacity-75" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleCheck(item.productId)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all mt-1 ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-500 text-white"
                            : "border-slate-600 hover:border-brand-500 bg-slate-800"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400 font-bold">
                            {item.sku}
                          </span>
                          <h4
                            className={`font-bold text-base ${
                              isChecked ? "line-through text-slate-400" : "text-white"
                            }`}
                          >
                            {item.productName}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Presentación: {prod?.presentation || "Canastilla sanitaria"} • Temp: 0°C a 4°C
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] text-slate-400 font-medium">
                            Incluido en {item.orderCount} {item.orderCount === 1 ? "pedido" : "pedidos"}:
                          </span>
                          {item.orderNumbers.map((num) => (
                            <span
                              key={num}
                              className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right pl-10 sm:pl-0">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kilos Totales</p>
                      <p
                        className={`text-2xl font-black ${
                          isChecked ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {item.totalKg.toLocaleString("es-CO")} <span className="text-sm font-semibold text-slate-400">kg</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Breakdown by Customer / Canastilla */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          {activeFilteredOrders.map((order) => {
            const isOrderChecked = checkedOrders[order.id] || false;
            const totalKgOrder = order.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);

            return (
              <div
                key={order.id}
                className={`bg-slate-900 border rounded-3xl p-5 shadow-lg transition-all ${
                  isOrderChecked ? "border-emerald-500/50 bg-emerald-950/10" : "border-slate-800"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleOrderCheck(order.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isOrderChecked
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "border-slate-600 bg-slate-800"
                      }`}
                    >
                      {isOrderChecked && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-sm text-brand-400">
                          {order.orderNumber}
                        </span>
                        <h3 className="font-extrabold text-base text-white">
                          {order.customerName}
                        </h3>

                        {isOrderInvoiced(order) ? (
                          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <Receipt className="w-3 h-3 text-emerald-400" />
                            <span>Factura #{getOrderInvoice(order)?.number || order.invoiceNumber || "FAC-JD"}</span>
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Sin Facturar</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Entrega: <strong className="text-slate-300">{order.deliveryDate}</strong> • {order.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Canastilla:</span>
                      <p className="text-lg font-black text-amber-400">
                        {totalKgOrder.toFixed(1)} kg
                      </p>
                    </div>

                    {!isOrderInvoiced(order) && (
                      <button
                        type="button"
                        onClick={() => invoiceOrder(order.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all flex items-center gap-1 shadow-md shadow-emerald-950/40 active:scale-95"
                        title="Facturar pedido antes de armar la ruta"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Facturar</span>
                      </button>
                    )}

                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-brand-600 text-white text-xs font-bold transition-all border border-slate-700"
                    >
                      Ver Pedido
                    </Link>
                  </div>
                </div>

                {/* Items in this customer's crate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-xs">
                  {order.items.map((it) => (
                    <div
                      key={it.productId}
                      className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white">{it.productName}</p>
                        <p className="text-[10px] text-slate-400">SKU: {it.sku}</p>
                      </div>
                      <span className="font-extrabold text-sm text-emerald-400">
                        {it.realQuantity !== undefined ? it.realQuantity : it.quantity} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
