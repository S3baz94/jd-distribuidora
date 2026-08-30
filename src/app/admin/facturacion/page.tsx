"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  Invoice,
  InvoiceItem,
  InvoicePaymentType,
  InvoiceStatus,
  Customer,
  Product,
} from "@/types";
import { InvoiceModal } from "@/components/admin/InvoiceModal";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  ChevronRight,
  Scale,
  ShoppingBag,
  UserCheck,
  Percent,
  Coins,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function FacturacionPage() {
  const {
    invoices,
    billingSettings,
    createInvoice,
    cancelInvoice,
    updateInvoicePayment,
    exportInvoicesCSV,
    allCustomers,
    products,
    getProductPrice,
    showToast,
  } = useApp();

  // State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | InvoicePaymentType>("all");

  // New Invoice Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("c1");
  const [isCounterSale, setIsCounterSale] = useState(false);
  const [counterCustomerName, setCounterCustomerName] = useState("Cliente Mostrador / Planta");
  const [counterCustomerNit, setCounterCustomerNit] = useState("222222222222");
  const [sellerName, setSellerName] = useState("Mostrador Planta Central");
  const [invoiceNotes, setInvoiceNotes] = useState("");

  // Items to invoice
  const [cartItems, setCartItems] = useState<{ productId: string; quantityKg: number }[]>([
    { productId: "p1", quantityKg: 15.0 }, // Bondiola
    { productId: "p2", quantityKg: 10.0 }, // Lomo
  ]);

  // Payment Form State
  const [paymentType, setPaymentType] = useState<InvoicePaymentType>("efectivo");
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [bankReference, setBankReference] = useState("");
  const [creditDays, setCreditDays] = useState<number>(30);

  // Financial Metrics
  const metrics = useMemo(() => {
    const totalFacturado = invoices
      .filter((i) => i.status !== "anulada")
      .reduce((sum, i) => sum + i.total, 0);

    const totalEfectivo = invoices
      .filter((i) => i.status === "pagada" && i.paymentType === "efectivo")
      .reduce((sum, i) => sum + i.total, 0);

    const totalBanco = invoices
      .filter((i) => i.status === "pagada" && i.paymentType === "banco")
      .reduce((sum, i) => sum + i.total, 0);

    const totalCarteraCredito = invoices
      .filter((i) => i.status === "pendiente" || i.paymentType === "credito")
      .reduce((sum, i) => sum + (i.paymentDetails.creditAmount || i.total), 0);

    const totalKilos = invoices
      .filter((i) => i.status !== "anulada")
      .reduce((sum, i) => sum + i.totalKg, 0);

    return {
      totalFacturado,
      totalEfectivo,
      totalBanco,
      totalCarteraCredito,
      totalKilos,
      totalCount: invoices.length,
    };
  }, [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerNit.includes(searchQuery);

      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || inv.paymentType === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [invoices, searchQuery, statusFilter, paymentFilter]);

  // Active customer for form
  const currentCustomer = useMemo(() => {
    return allCustomers.find((c) => c.id === selectedCustomerId) || allCustomers[0];
  }, [allCustomers, selectedCustomerId]);

  // Calculated items for New Invoice Form
  const calculatedItems = useMemo<InvoiceItem[]>(() => {
    return cartItems
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return null;
        const unitPrice = getProductPrice(prod.id);
        const subtotal = item.quantityKg * unitPrice;
        return {
          id: `item-${prod.id}`,
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          brand: prod.brand,
          quantityKg: item.quantityKg,
          unitPrice,
          subtotal,
          taxRate: 0,
        };
      })
      .filter(Boolean) as InvoiceItem[];
  }, [cartItems, products, getProductPrice]);

  const newInvoiceTotalKg = useMemo(() => {
    return calculatedItems.reduce((sum, i) => sum + i.quantityKg, 0);
  }, [calculatedItems]);

  const newInvoiceSubtotal = useMemo(() => {
    return calculatedItems.reduce((sum, i) => sum + i.subtotal, 0);
  }, [calculatedItems]);

  const cashChange = useMemo(() => {
    if (paymentType !== "efectivo" || cashGiven <= 0) return 0;
    return Math.max(0, cashGiven - newInvoiceSubtotal);
  }, [paymentType, cashGiven, newInvoiceSubtotal]);

  // Add cut to invoice form
  const handleAddProductToInvoice = (productId: string) => {
    const existing = cartItems.find((i) => i.productId === productId);
    if (existing) {
      setCartItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantityKg: i.quantityKg + 5 } : i))
      );
    } else {
      setCartItems((prev) => [...prev, { productId, quantityKg: 10 }]);
    }
  };

  const handleUpdateItemKg = (productId: string, kg: number) => {
    if (kg <= 0) {
      setCartItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantityKg: kg } : i))
      );
    }
  };

  // Submit and Issue Invoice
  const handleIssueInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedItems.length === 0) {
      showToast("Agrega al menos un corte de carne para facturar", "warning");
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + creditDays);

    const newInv = createInvoice({
      customerId: isCounterSale ? "counter" : currentCustomer.id,
      customerName: isCounterSale ? counterCustomerName : currentCustomer.businessName,
      customerNit: isCounterSale ? counterCustomerNit : currentCustomer.nit,
      customerPhone: isCounterSale ? "" : currentCustomer.phone,
      customerAddress: isCounterSale ? "Mostrador Planta" : currentCustomer.address,
      customerZone: isCounterSale ? "Planta Central" : currentCustomer.zone,
      items: calculatedItems,
      totalKg: newInvoiceTotalKg,
      subtotal: newInvoiceSubtotal,
      discountTotal: 0,
      taxTotal: 0,
      total: newInvoiceSubtotal,
      paymentType,
      paymentDetails: {
        cashAmount: paymentType === "efectivo" ? newInvoiceSubtotal : undefined,
        cashGiven: paymentType === "efectivo" ? cashGiven || newInvoiceSubtotal : undefined,
        cashChange: paymentType === "efectivo" ? cashChange : undefined,
        bankAmount: paymentType === "banco" ? newInvoiceSubtotal : undefined,
        bankReference: paymentType === "banco" ? bankReference || "QR Bancolombia" : undefined,
        creditAmount: paymentType === "credito" ? newInvoiceSubtotal : undefined,
        creditDays: paymentType === "credito" ? creditDays : undefined,
        creditDueDate: paymentType === "credito" ? dueDate.toISOString().slice(0, 10) : undefined,
      },
      status: paymentType === "credito" ? "pendiente" : "pagada",
      origin: isCounterSale ? "mostrador" : "despacho",
      sellerName,
      notes: invoiceNotes,
    });

    setIsNewInvoiceOpen(false);
    setSelectedInvoice(newInv);
    setIsInvoiceModalOpen(true);

    // Reset form
    setCartItems([
      { productId: "p1", quantityKg: 15.0 },
      { productId: "p2", quantityKg: 10.0 },
    ]);
    setCashGiven(0);
    setBankReference("");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30 flex-shrink-0">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-300 bg-brand-500/20 px-2.5 py-0.5 rounded-full border border-brand-500/30">
                SISTEMA POS & FACTURACIÓN CÁRNICA
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {billingSettings.prefix} {billingSettings.currentNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Facturación & Cuentas por Cobrar
            </h1>
            <p className="text-xs text-slate-400">
              Emisión de facturas por kilos, tirillas térmicas POS (80mm), arqueo y control de cartera.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportInvoicesCSV}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Exportar Libro (.CSV)
          </button>

          <button
            onClick={() => setIsNewInvoiceOpen(true)}
            className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-brand-950/50 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> NUEVA FACTURA POS
          </button>
        </div>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Facturado */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Facturado:</span>
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            ${metrics.totalFacturado.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.totalKilos.toFixed(1)} kg despachados
          </p>
        </div>

        {/* Recaudo Efectivo */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cobrado en Efectivo:</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            ${metrics.totalEfectivo.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Caja física de planta y ruta</p>
        </div>

        {/* Recaudo Banco / QR */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cobrado Banco / QR:</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
            ${metrics.totalBanco.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Transferencias confirmadas</p>
        </div>

        {/* Cartera Pendiente */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cartera por Cobrar:</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            ${metrics.totalCarteraCredito.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Créditos a 15 y 30 días</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por # factura, cliente o NIT..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === "all" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Todas ({invoices.length})
            </button>
            <button
              onClick={() => setStatusFilter("pagada")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === "pagada"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pagadas
            </button>
            <button
              onClick={() => setStatusFilter("pendiente")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === "pendiente"
                  ? "bg-amber-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cartera
            </button>
            <button
              onClick={() => setStatusFilter("anulada")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === "anulada"
                  ? "bg-rose-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Anuladas
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Factura #</th>
                <th className="p-4">Fecha & Hora</th>
                <th className="p-4">Cliente / Adquiriente</th>
                <th className="p-4 text-right">Kilos (KG)</th>
                <th className="p-4 text-right">Total Liquidado</th>
                <th className="p-4 text-center">Medio de Pago</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No se encontraron facturas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-black text-white text-sm">{inv.number}</div>
                      <span className="text-[10px] text-slate-500 uppercase">{inv.origin}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div>{new Date(inv.issuedAt).toLocaleDateString("es-CO")}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(inv.issuedAt).toLocaleTimeString("es-CO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">NIT: {inv.customerNit}</div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-200">
                      {inv.totalKg.toFixed(1)} kg
                    </td>
                    <td className="p-4 text-right font-mono font-black text-emerald-400 text-sm">
                      ${inv.total.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border inline-block ${
                          inv.paymentType === "efectivo"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : inv.paymentType === "banco"
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {inv.paymentType === "efectivo"
                          ? "💵 Efectivo"
                          : inv.paymentType === "banco"
                          ? "🏦 Banco / QR"
                          : "📝 Crédito 30D"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {inv.status === "pagada" ? (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ✓ Pagada
                        </span>
                      ) : inv.status === "pendiente" ? (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ⏳ En Cartera
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          ✕ Anulada
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="py-1.5 px-3 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" /> Tirilla
                        </button>

                        {inv.status === "pendiente" && (
                          <button
                            onClick={() =>
                              updateInvoicePayment(inv.id, "banco", {
                                bankAmount: inv.total,
                                bankReference: "Pago Recibido",
                              })
                            }
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold transition-all"
                            title="Marcar Pagada"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {inv.status !== "anulada" && (
                          <button
                            onClick={() => cancelInvoice(inv.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Anular Factura"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          MODAL DE NUEVA FACTURA POS (Venta Mostrador & Despacho)
          ========================================================= */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-[9995] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-5 sm:p-7 text-white my-auto max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30 font-black">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Nueva Factura de Venta POS</h2>
                  <p className="text-xs text-slate-400">
                    Liquidación de cortes de cerdo por kilos y emisión de tirilla
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleIssueInvoice} className="flex-1 overflow-y-auto py-4 space-y-5">
              {/* 1. Cliente */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-brand-400" /> 1. Adquiriente / Cliente:
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCounterSale}
                      onChange={(e) => setIsCounterSale(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Venta Directa de Mostrador / Consumidor Final</span>
                  </label>
                </div>

                {!isCounterSale ? (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-bold"
                  >
                    {allCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.businessName} — NIT {cust.nit} ({cust.zone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={counterCustomerName}
                      onChange={(e) => setCounterCustomerName(e.target.value)}
                      placeholder="Nombre del Cliente..."
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      value={counterCustomerNit}
                      onChange={(e) => setCounterCustomerNit(e.target.value)}
                      placeholder="NIT / Cédula..."
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* 2. Selector de Cortes y Kilos */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-brand-400" /> 2. Cortes de Cerdo & Kilos Reales:
                </label>

                {/* Quick Add Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {products.slice(0, 8).map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleAddProductToInvoice(prod.id)}
                      className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-all"
                    >
                      <span>+ {prod.name.split(" ")[0]}</span>
                      <span className="font-mono text-emerald-400">
                        (${getProductPrice(prod.id).toLocaleString()}/kg)
                      </span>
                    </button>
                  ))}
                </div>

                {/* Items List */}
                <div className="space-y-2 pt-2">
                  {cartItems.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    if (!prod) return null;
                    const price = getProductPrice(prod.id);
                    const subtotal = item.quantityKg * price;

                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 gap-3 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{prod.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ${price.toLocaleString()} / kg • SKU: {prod.sku}
                          </p>
                        </div>

                        {/* Quantity KG Input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={item.quantityKg}
                            onChange={(e) =>
                              handleUpdateItemKg(item.productId, parseFloat(e.target.value) || 0)
                            }
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right font-mono font-bold text-white text-xs focus:outline-none focus:border-brand-500"
                          />
                          <span className="text-slate-400 font-mono">kg</span>
                        </div>

                        {/* Subtotal */}
                        <div className="w-24 text-right font-mono font-bold text-emerald-400">
                          ${subtotal.toLocaleString()}
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleUpdateItemKg(item.productId, 0)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Forma de Pago & Arqueo */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-brand-400" /> 3. Medio de Pago & Liquidación:
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType("efectivo")}
                    className={`py-3 px-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      paymentType === "efectivo"
                        ? "bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-lg"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Coins className="w-5 h-5" />
                    <span>💵 EFECTIVO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("banco")}
                    className={`py-3 px-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      paymentType === "banco"
                        ? "bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-lg"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>🏦 BANCO / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("credito")}
                    className={`py-3 px-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      paymentType === "credito"
                        ? "bg-amber-600/30 border-amber-500 text-amber-300 shadow-lg"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    <span>📝 CRÉDITO</span>
                  </button>
                </div>

                {/* Sub-inputs based on payment type */}
                {paymentType === "efectivo" && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Efectivo Recibido:</label>
                      <input
                        type="number"
                        value={cashGiven || ""}
                        onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                        placeholder={`$${newInvoiceSubtotal.toLocaleString()}`}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Cambio / Vueltas:</label>
                      <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-emerald-400 text-xs">
                        ${cashChange.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {paymentType === "banco" && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                    <label className="text-slate-400 block mb-1">Código de Comprobante / Ref:</label>
                    <input
                      type="text"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      placeholder="Ej. Transferencia Bancolombia #98421"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                )}

                {paymentType === "credito" && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
                    <label className="text-slate-400">Plazo de Cartera:</label>
                    <select
                      value={creditDays}
                      onChange={(e) => setCreditDays(parseInt(e.target.value, 10))}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none font-bold"
                    >
                      <option value={8}>8 Días</option>
                      <option value={15}>15 Días</option>
                      <option value={30}>30 Días</option>
                      <option value={45}>45 Días</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Total Summary Footer */}
              <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Kilos Totales a Despachar:</span>
                  <span className="text-lg font-black text-white font-mono">
                    {newInvoiceTotalKg.toFixed(2)} kg
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Liquidado a Facturar:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    ${newInvoiceSubtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-sm shadow-xl shadow-brand-950/60 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> GENERAR & IMPRIMIR FACTURA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        settings={billingSettings}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
}
