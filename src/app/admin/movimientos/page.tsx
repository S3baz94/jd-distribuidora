"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { exportService } from "@/services/exportService";
import { DriverExpense } from "@/types";
import {
  FileSpreadsheet,
  Truck,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  Box,
  PenTool,
  Printer,
  Download,
  Building2,
  Camera,
  Receipt,
  Eye,
  Fuel,
} from "lucide-react";

export default function AdminMovementsPage() {
  const { allOrders, routes, expenses, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"entregas" | "gastos">("entregas");
  const [selectedDriver, setSelectedDriver] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [viewReceiptModal, setViewReceiptModal] = useState<DriverExpense | null>(null);

  // Filter orders by driver, payment method and search
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      if (selectedDriver !== "all") {
        const route = routes.find((r) => r.id === order.routeId);
        if (order.driverName !== selectedDriver && route?.driverName !== selectedDriver) {
          return false;
        }
      }
      if (selectedPaymentMethod !== "all") {
        const method = order.paymentMethod || "efectivo";
        if (method !== selectedPaymentMethod) return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchNum = order.orderNumber.toLowerCase().includes(q);
        const matchCust = order.customerName.toLowerCase().includes(q);
        const matchDriver = (order.driverName || "").toLowerCase().includes(q);
        if (!matchNum && !matchCust && !matchDriver) return false;
      }
      return true;
    });
  }, [allOrders, routes, selectedDriver, selectedPaymentMethod, searchTerm]);

  // Filter road expenses by driver and search
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (selectedDriver !== "all" && exp.driverName !== selectedDriver) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchDesc = exp.description.toLowerCase().includes(q);
        const matchDriver = exp.driverName.toLowerCase().includes(q);
        const matchCat = exp.category.toLowerCase().includes(q);
        if (!matchDesc && !matchDriver && !matchCat) return false;
      }
      return true;
    });
  }, [expenses, selectedDriver, searchTerm]);

  // Reconciliation summary calculations
  const totalInvoiced = filteredOrders.reduce(
    (sum, o) => sum + (o.realTotal || o.total),
    0
  );
  const totalKg = filteredOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0),
    0
  );
  const deliveredOrders = filteredOrders.filter((o) => o.status === "delivered");
  
  // Customer purchase payments breakdown
  const totalCashCollected = deliveredOrders
    .filter((o) => o.paymentMethod === "efectivo" || !o.paymentMethod)
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);

  const totalBankCollected = deliveredOrders
    .filter((o) => o.paymentMethod === "banco")
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);

  const totalCreditOrders = deliveredOrders
    .filter((o) => o.paymentMethod === "credito")
    .reduce((sum, o) => sum + (o.realTotal || o.total), 0);
  
  // Total road expenses
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Net physical cash in hand to deliver in plant envelope = Customer cash collections minus road expenses
  const netCashInHand = Math.max(0, totalCashCollected - totalExpenses);
  const totalPendingCredit = totalInvoiced - totalCashCollected;
  const totalBaskets = Math.ceil(totalKg / 25) || 1;

  const handleExportReconciliation = () => {
    exportService.exportDailyDriverReconciliationCSV(filteredOrders, routes);
    showToast("📥 Planilla de Movimientos y Conciliación exportada a Excel (.CSV)", "success");
  };

  const handleExportExpenses = () => {
    exportService.exportExpensesToCSV(filteredExpenses);
    showToast("📥 Planilla de Gastos y Recibos exportada a Excel (.CSV)", "success");
  };

  const handleValidateTurn = () => {
    setIsValidated(true);
    showToast("✅ Turno diario conciliado y validado con éxito contra facturación", "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Movimientos de Domiciliarios & Conciliación
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Bitácora de entregas, recibos fotográficos de gastos (Efectivo, Banco, Crédito), control de canastillas y auditoría
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {activeTab === "entregas" ? (
            <button
              onClick={handleExportReconciliation}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              title="Descargar base de datos conciliada"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Planilla Conciliación (.CSV)</span>
            </button>
          ) : (
            <button
              onClick={handleExportExpenses}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Gastos & Recibos (.CSV)</span>
            </button>
          )}

          <button
            onClick={handleValidateTurn}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
              isValidated
                ? "bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default"
                : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isValidated ? "✓ Turno Conciliado & Validado" : "Validar y Cerrar Turno"}</span>
          </button>
        </div>
      </div>

      {/* Daily Reconciliation Balance Cards with Payment Method Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Facturado Día:</span>
          <p className="text-lg sm:text-xl font-black text-brand-400">
            {priceService.formatCurrency(totalInvoiced)}
          </p>
          <span className="text-[11px] text-slate-500 font-bold">{filteredOrders.length} órdenes generadas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Recaudo Efectivo en Ruta:</span>
          <p className="text-lg sm:text-xl font-black text-emerald-400">
            {priceService.formatCurrency(totalCashCollected)}
          </p>
          <span className="text-[11px] text-emerald-500 font-bold">Cobrado de contado</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Gastos de Ruta (Gasolina/Peajes):</span>
          <p className="text-lg sm:text-xl font-black text-rose-400">
            -{priceService.formatCurrency(totalExpenses)}
          </p>
          <span className="text-[11px] text-slate-400 font-bold">
            {filteredExpenses.length} recibos adjuntos
          </span>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-3xl space-y-1 shadow-lg">
          <span className="text-[10px] uppercase font-black text-emerald-300 block">Efectivo Neto en Planta:</span>
          <p className="text-lg sm:text-xl font-black text-emerald-300">
            {priceService.formatCurrency(netCashInHand)}
          </p>
          <span className="text-[11px] text-emerald-400 font-bold">Efectivo Cobrado (-) Gastos</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-lg col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Canastillas JD en Calle:</span>
          <p className="text-lg sm:text-xl font-black text-cyan-300">
            ~{totalBaskets} canastillas
          </p>
          <span className="text-[11px] text-cyan-400 font-bold">{totalKg.toFixed(1)} kg despachados</span>
        </div>
      </div>

      {/* Tabs Switcher: Entregas vs Gastos con Fotos */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("entregas")}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === "entregas"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>📦 Planilla de Entregas & Facturación de Clientes ({filteredOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("gastos")}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === "gastos"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-950/40"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>📸 Gastos Operativos de Ruta & Recibos ({filteredExpenses.length})</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar cliente, orden #, o chofer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Filter by Driver */}
          <div>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-2xl p-3 focus:outline-none focus:border-brand-500"
            >
              <option value="all">🚚 Todos los Domiciliarios</option>
              {routes.map((r) => (
                <option key={r.id} value={r.driverName}>
                  {r.driverName} ({r.name})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Customer Purchase Payment Method (Crédito, Banco, Efectivo) */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full bg-slate-800 border border-emerald-500/50 text-emerald-300 font-black text-xs rounded-2xl p-3 focus:outline-none focus:border-emerald-400"
            >
              <option value="all">💳 Forma de Pago de Facturas (Todas)</option>
              <option value="efectivo">💵 Facturas Pagadas en Efectivo</option>
              <option value="banco">🏦 Facturas Pagadas por Banco / Transferencia</option>
              <option value="credito">📝 Facturas Emitidas a Crédito (15-30d)</option>
            </select>
          </div>
        </div>
      </div>

      {/* View 1: Deliveries & Billing Table */}
      {activeTab === "entregas" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px]">
                  <th className="p-4">Pedido / Fecha</th>
                  <th className="p-4">Domiciliario / Furgón</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4 text-right">Kilos</th>
                  <th className="p-4 text-right">Total Factura</th>
                  <th className="p-4 text-center">Forma de Pago</th>
                  <th className="p-4 text-right">Recaudo Efectivo</th>
                  <th className="p-4 text-center">Canastillas</th>
                  <th className="p-4 text-center">Firma POD</th>
                  <th className="p-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrders.map((ord) => {
                  const orderKg = ord.items.reduce(
                    (sum, i) => sum + (i.realQuantity || i.quantity),
                    0
                  );
                  const isDelivered = ord.status === "delivered";
                  const total = ord.realTotal || ord.total;
                  const baskets = Math.ceil(orderKg / 25) || 1;
                  const isCash = ord.paymentMethod === "efectivo" || !ord.paymentMethod;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Order & Date */}
                      <td className="p-4">
                        <span className="font-mono font-black text-white text-sm block">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">{ord.deliveryDate}</span>
                      </td>

                      {/* Driver & Vehicle */}
                      <td className="p-4">
                        <strong className="text-white font-bold block">
                          {ord.driverName || "Carlos Pérez (Furgón #1)"}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {ord.routeName || "Ruta Norte 01"}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <strong className="text-slate-100 font-extrabold block">
                          {ord.customerName}
                        </strong>
                        <span className="text-[11px] text-emerald-400 truncate max-w-[200px] block">
                          {ord.deliveryAddress}
                        </span>
                      </td>

                      {/* Kilos */}
                      <td className="p-4 text-right">
                        <strong className="text-white font-black text-sm">
                          {orderKg.toFixed(1)} kg
                        </strong>
                      </td>

                      {/* Invoiced Total */}
                      <td className="p-4 text-right">
                        <strong className="text-brand-400 font-black text-sm">
                          {priceService.formatCurrency(total)}
                        </strong>
                      </td>

                      {/* Payment Method Badge */}
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm ${
                          ord.paymentMethod === "banco"
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                            : ord.paymentMethod === "credito"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }`}>
                          {ord.paymentMethod === "banco"
                            ? "🏦 BANCO / QR"
                            : ord.paymentMethod === "credito"
                            ? "📝 CRÉDITO 30D"
                            : "💵 EFECTIVO"}
                        </span>
                      </td>

                      {/* Collected Cash */}
                      <td className="p-4 text-right">
                        {isDelivered && isCash ? (
                          <strong className="text-emerald-400 font-black text-sm">
                            {priceService.formatCurrency(total)}
                          </strong>
                        ) : isDelivered ? (
                          <span className="text-slate-400 text-xs font-bold">
                            {ord.paymentMethod === "banco" ? "💳 Transferencia" : "📝 A Cartera"}
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold">$ 0 (Pendiente)</span>
                        )}
                      </td>

                      {/* Baskets */}
                      <td className="p-4 text-center">
                        <span className="bg-slate-800 text-cyan-300 px-2 py-1 rounded-lg font-black text-[11px] border border-slate-700">
                          {baskets} JD
                        </span>
                      </td>

                      {/* Signature */}
                      <td className="p-4 text-center">
                        {isDelivered ? (
                          <span className="text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                            <PenTool className="w-3 h-3" />
                            <span>Firmado</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Sin firma</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        {isDelivered ? (
                          <span className="bg-emerald-500/20 text-emerald-300 font-black text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/30">
                            Entregado
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-300 font-black text-[10px] px-2.5 py-1 rounded-full border border-amber-500/30">
                            En Camino
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Driver Road Expenses & Receipt Photos Gallery */}
      {activeTab === "gastos" && (
        <div className="space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-2">
              <Camera className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-black text-white text-base">No hay gastos reportados para el filtro actual</h3>
              <p className="text-xs text-slate-400">
                Cuando los domiciliarios tomen fotos de recibos de gasolina, peajes o viáticos desde su celular, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header: Category */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                        {exp.category === "combustible"
                          ? "⛽ Combustible / ACPM"
                          : exp.category === "peajes"
                          ? "🛣️ Peajes"
                          : exp.category === "parqueadero"
                          ? "🅿️ Parqueadero"
                          : exp.category === "viaticos"
                          ? "🍽️ Viáticos"
                          : "🔧 Mantenimiento"}
                      </span>

                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(exp.createdAt).toLocaleTimeString("es-CO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Amount & Description */}
                    <div>
                      <h4 className="text-2xl font-black text-white">
                        {priceService.formatCurrency(exp.amount)}
                      </h4>
                      <p className="text-xs font-bold text-slate-200 mt-1 leading-snug">
                        {exp.description}
                      </p>
                    </div>

                    {/* Driver info */}
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Chofer: <strong className="text-white font-bold">{exp.driverName}</strong></span>
                      <span className="text-slate-400">Ruta: <strong className="text-brand-300 font-bold">{exp.routeName || "Ruta 1"}</strong></span>
                    </div>
                  </div>

                  {/* Receipt Photo / Preview button */}
                  <div className="pt-2">
                    {exp.receiptPhoto ? (
                      <button
                        onClick={() => setViewReceiptModal(exp)}
                        className="w-full py-3 px-3 rounded-2xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 border border-amber-500/30 transition-all active:scale-95 shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver Foto del Recibo / Tirilla 📸</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 text-center text-[11px] text-slate-500 font-medium">
                        (Recibo registrado sin foto física)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Receipt Photo Modal Viewer */}
      {viewReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/40">
                    {viewReceiptModal.category === "combustible"
                      ? "⛽ Gasolina / ACPM"
                      : viewReceiptModal.category === "peajes"
                      ? "🛣️ Peaje"
                      : "📦 Gasto Operativo"}
                  </span>
                </div>
                <h3 className="font-black text-lg text-white mt-1">
                  {viewReceiptModal.description}
                </h3>
                <p className="text-xs text-amber-400 font-extrabold">
                  {priceService.formatCurrency(viewReceiptModal.amount)} • Chofer: {viewReceiptModal.driverName}
                </p>
              </div>
              <button
                onClick={() => setViewReceiptModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {viewReceiptModal.receiptPhoto ? (
              <div className="rounded-2xl overflow-hidden bg-black p-2 border border-slate-800 max-h-[60vh] flex items-center justify-center">
                <img
                  src={viewReceiptModal.receiptPhoto}
                  alt="Recibo"
                  className="max-h-[55vh] w-auto object-contain rounded-xl shadow-2xl"
                />
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-850 rounded-2xl text-slate-400 text-xs font-bold">
                No se adjuntó archivo de fotografía para este registro.
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Registrado: {new Date(viewReceiptModal.createdAt).toLocaleString("es-CO")}
              </span>
              <button
                onClick={() => setViewReceiptModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
