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
  RotateCcw,
  Landmark,
} from "lucide-react";
import { ProductionReadyModal } from "@/components/admin/ProductionReadyModal";

export default function FacturacionPage() {
  const {
    invoices,
    billingSettings,
    createInvoice,
    cancelInvoice,
    updateInvoicePayment,
    processInvoiceRefund,
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
  const [isProductionReadyOpen, setIsProductionReadyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus | "devolucion">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | InvoicePaymentType>("all");
  const [brandFilter, setBrandFilter] = useState<"all" | "jd_distribuidora" | "gourmet_ahumados">("all");

  // Refund / Devolución State
  const [refundInvoice, setRefundInvoice] = useState<Invoice | null>(null);
  const [refundType, setRefundType] = useState<"total" | "parcial">("total");
  const [refundReason, setRefundReason] = useState<string>("Rechazo de calidad / Merma en pesaje");
  const [refundItemsKg, setRefundItemsKg] = useState<{ [productId: string]: number }>({});
  const [bankEntity, setBankEntity] = useState<string>("Bancolombia (QR / Transferencia)");

  // New Invoice Form State
  const [invoiceBrand, setInvoiceBrand] = useState<"jd_distribuidora" | "gourmet_ahumados">("jd_distribuidora");
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
    const activeInvoices = invoices.filter(
      (i) => i.status !== "anulada" && i.status !== "devuelta_total"
    );

    const totalFacturado = activeInvoices.reduce((sum, i) => sum + i.total, 0);

    const facturadoJD = activeInvoices
      .filter((i) => (i.brand || "jd_distribuidora") === "jd_distribuidora")
      .reduce((sum, i) => sum + i.total, 0);

    const facturadoGourmet = activeInvoices
      .filter((i) => i.brand === "gourmet_ahumados")
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

    const totalKilos = activeInvoices.reduce((sum, i) => sum + i.totalKg, 0);

    return {
      totalFacturado,
      facturadoJD,
      facturadoGourmet,
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
      const matchesBrand =
        brandFilter === "all" || (inv.brand || "jd_distribuidora") === brandFilter;

      const matchesSearch =
        inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerNit.includes(searchQuery);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "devolucion"
          ? inv.status === "devuelta_total" || inv.status === "devuelta_parcial"
          : inv.status === statusFilter);

      const matchesPayment = paymentFilter === "all" || inv.paymentType === paymentFilter;

      return matchesBrand && matchesSearch && matchesStatus && matchesPayment;
    });
  }, [invoices, brandFilter, searchQuery, statusFilter, paymentFilter]);

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

    const formattedBankRef =
      paymentType === "banco"
        ? `${bankEntity}${bankReference ? ` - Ref: ${bankReference}` : " - Transferencia Aprobada"}`
        : undefined;

    const newInv = createInvoice({
      brand: invoiceBrand,
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
        bankReference: formattedBankRef,
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

  // Open Refund Modal
  const handleOpenRefundModal = (inv: Invoice) => {
    setRefundInvoice(inv);
    setRefundType("total");
    setRefundReason("Rechazo de calidad / Merma en pesaje");
    const initialMap: { [productId: string]: number } = {};
    inv.items.forEach((it) => {
      initialMap[it.productId] = it.quantityKg;
    });
    setRefundItemsKg(initialMap);
  };

  // Process Refund Submit
  const handleProcessRefundSubmit = () => {
    if (!refundInvoice) return;

    if (refundType === "total") {
      processInvoiceRefund(refundInvoice.id, {
        type: "total",
        refundedAmount: refundInvoice.total,
        refundedKg: refundInvoice.totalKg,
        reason: refundReason,
        refundedItems: refundInvoice.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          quantityKg: it.quantityKg,
          amount: it.subtotal,
        })),
      });
      setRefundInvoice(null);
    } else {
      // Parcial
      const refundedItems: {
        productId: string;
        productName: string;
        quantityKg: number;
        amount: number;
      }[] = [];

      let totalRefundAmount = 0;
      let totalRefundKg = 0;

      refundInvoice.items.forEach((it) => {
        const kg = refundItemsKg[it.productId] || 0;
        if (kg > 0) {
          const itemAmount = kg * it.unitPrice;
          refundedItems.push({
            productId: it.productId,
            productName: it.productName,
            quantityKg: kg,
            amount: itemAmount,
          });
          totalRefundAmount += itemAmount;
          totalRefundKg += kg;
        }
      });

      if (refundedItems.length === 0 || totalRefundAmount <= 0) {
        showToast("Selecciona al menos un corte y los kilos a devolver", "warning");
        return;
      }

      processInvoiceRefund(refundInvoice.id, {
        type: "parcial",
        refundedAmount: totalRefundAmount,
        refundedKg: totalRefundKg,
        reason: refundReason,
        refundedItems,
      });
      setRefundInvoice(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Corporate Separation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30 flex-shrink-0">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-300 bg-brand-500/20 px-2.5 py-0.5 rounded-full border border-brand-500/30">
                SISTEMA POS & FACTURACIÓN COMERCIAL
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                2 Empresas Independientes (JD & Gourmet)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Facturación & Cuentas por Cobrar
            </h1>
            <p className="text-xs text-slate-400">
              Emisión de facturas separadas por empresa con NIT, consecutivos independientes (FAC-JD y FAC-GA) y libro contable.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsProductionReadyOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-black text-xs flex items-center gap-2 border border-cyan-500/30 transition-all active:scale-95 shadow-lg shadow-cyan-950/30"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Puesta en Marcha (Datos Reales)</span>
          </button>

          <button
            onClick={() => exportInvoicesCSV(brandFilter)}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
            title="Exporta el libro de ventas en formato CSV para contabilidad"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>
              Exportar {brandFilter === "jd_distribuidora" ? "JD" : brandFilter === "gourmet_ahumados" ? "Gourmet" : "Consolidado"} (.CSV)
            </span>
          </button>

          <button
            onClick={() => setIsNewInvoiceOpen(true)}
            className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-brand-950/50 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> NUEVA FACTURA POS
          </button>
        </div>
      </div>

      {/* Selector de Empresa Emisora (Facturación Separada) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setBrandFilter("all")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            brandFilter === "all"
              ? "bg-slate-800 text-white shadow-md border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>Consolidado Grupo ({invoices.length} Facturas)</span>
        </button>

        <button
          onClick={() => setBrandFilter("jd_distribuidora")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            brandFilter === "jd_distribuidora"
              ? "bg-rose-700 text-white shadow-lg shadow-rose-950/50 border border-rose-500/50"
              : "text-slate-400 hover:text-rose-300"
          }`}
        >
          <span className="text-base">🥩</span>
          <div className="text-left">
            <span className="block leading-tight font-extrabold">JD DISTRIBUIDORA S.A.S.</span>
            <span className="text-[10px] opacity-80 font-mono">NIT: 901.684.219-3 • FAC-JD (Crudos)</span>
          </div>
        </button>

        <button
          onClick={() => setBrandFilter("gourmet_ahumados")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            brandFilter === "gourmet_ahumados"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-950/50 border border-amber-400/50"
              : "text-slate-400 hover:text-amber-300"
          }`}
        >
          <span className="text-base">🔥</span>
          <div className="text-left">
            <span className="block leading-tight font-extrabold">GOURMET AHUMADOS S.A.S.</span>
            <span className="text-[10px] opacity-80 font-mono">NIT: 901.792.845-1 • FAC-GA (Ahumados)</span>
          </div>
        </button>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Facturado */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>
              {brandFilter === "jd_distribuidora"
                ? "Total JD Distribuidora:"
                : brandFilter === "gourmet_ahumados"
                ? "Total Gourmet Ahumados:"
                : "Total Facturado Grupo:"}
            </span>
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            $
            {(brandFilter === "jd_distribuidora"
              ? metrics.facturadoJD
              : brandFilter === "gourmet_ahumados"
              ? metrics.facturadoGourmet
              : metrics.totalFacturado
            ).toLocaleString()}
          </p>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
            <span>🥩 JD: ${metrics.facturadoJD.toLocaleString()}</span>
            <span>•</span>
            <span>🔥 GA: ${metrics.facturadoGourmet.toLocaleString()}</span>
          </div>
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
                statusFilter === "all" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Todas ({invoices.length})
            </button>
            <button
              onClick={() => setStatusFilter("pagada")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === "pagada"
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pagadas
            </button>
            <button
              onClick={() => setStatusFilter("pendiente")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === "pendiente"
                  ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              A Crédito
            </button>
            <button
              onClick={() => setStatusFilter("devolucion")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === "devolucion"
                  ? "bg-indigo-950/60 text-indigo-400 border border-indigo-800/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Devoluciones
            </button>
            <button
              onClick={() => setStatusFilter("anulada")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === "anulada"
                  ? "bg-rose-950/60 text-rose-400 border border-rose-800/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Anuladas
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <th className="p-3.5">Factura #</th>
                <th className="p-3.5">Fecha & Hora</th>
                <th className="p-3.5">Cliente / Adquiriente</th>
                <th className="p-3.5 text-right">Kilos (KG)</th>
                <th className="p-3.5 text-right">Total Liquidado</th>
                <th className="p-3.5 text-center">Medio de Pago</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-right">Acciones</th>
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
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{inv.number}</span>
                        {inv.brand === "gourmet_ahumados" ? (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 font-bold">
                            🔥 Gourmet
                          </span>
                        ) : (
                          <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30 font-bold">
                            🥩 JD
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{inv.origin}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <div>{new Date(inv.issuedAt).toLocaleDateString("es-CO")}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(inv.issuedAt).toLocaleTimeString("es-CO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white text-xs">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">NIT: {inv.customerNit}</div>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-200">
                      {inv.totalKg.toFixed(1)} kg
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-100 text-xs">
                      ${inv.total.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-md border inline-block ${
                          inv.paymentType === "efectivo"
                            ? "bg-slate-800 text-slate-300 border-slate-700"
                            : inv.paymentType === "banco"
                            ? "bg-cyan-950/40 text-cyan-400 border-cyan-800/40"
                            : "bg-amber-950/40 text-amber-400 border-amber-800/40"
                        }`}
                      >
                        {inv.paymentType === "efectivo"
                          ? "💵 Efectivo"
                          : inv.paymentType === "banco"
                          ? "🏦 Banco / QR"
                          : `📝 Crédito ${inv.paymentDetails.creditDays || 30}D`}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {inv.status === "pagada" ? (
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                          ✓ Pagada
                        </span>
                      ) : inv.status === "pendiente" ? (
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-400 border border-amber-800/40">
                          ⏳ A Crédito
                        </span>
                      ) : inv.status === "devuelta_total" ? (
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-400 border border-purple-800/40">
                          ↩ Devuelta (Total)
                        </span>
                      ) : inv.status === "devuelta_parcial" ? (
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-md bg-indigo-950/40 text-indigo-400 border border-indigo-800/40">
                          ↩ Dev. Parcial
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-md bg-rose-950/40 text-rose-400 border border-rose-800/40">
                          ✕ Anulada
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 flex items-center gap-1 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tirilla</span>
                        </button>

                        {inv.status === "pendiente" && (
                          <button
                            onClick={() =>
                              updateInvoicePayment(inv.id, "banco", {
                                bankAmount: inv.total,
                                bankReference: "Pago Recibido",
                              })
                            }
                            className="py-1 px-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 text-xs font-medium transition-all"
                            title="Marcar Pagada"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {inv.status !== "anulada" && inv.status !== "devuelta_total" && (
                          <button
                            onClick={() => handleOpenRefundModal(inv)}
                            className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 text-xs font-medium transition-all"
                            title="Gestionar Devolución (Total o Parcial)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {inv.status !== "anulada" && (
                          <button
                            onClick={() => cancelInvoice(inv.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
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
              {/* 1. Selección de Empresa Emisora */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>1. Empresa Emisora de la Factura:</span>
                  <span className="text-[10px] text-brand-400 font-mono font-bold">
                    {invoiceBrand === "jd_distribuidora" ? "FAC-JD (Crudos)" : "FAC-GA (Ahumados)"}
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceBrand("jd_distribuidora");
                      setCartItems([{ productId: "p1", quantityKg: 15.0 }]);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      invoiceBrand === "jd_distribuidora"
                        ? "bg-rose-950/80 border-rose-500 text-white shadow-lg ring-2 ring-rose-500/50"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">🥩</span>
                    <div>
                      <p className="font-black text-xs text-white">JD DISTRIBUIDORA S.A.S.</p>
                      <p className="text-[10px] text-rose-300 font-mono">NIT: 901.684.219-3 • Cortes Crudos</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceBrand("gourmet_ahumados");
                      const firstGourmet = products.find((p) => p.brand === "gourmet_ahumados");
                      if (firstGourmet) {
                        setCartItems([{ productId: firstGourmet.id, quantityKg: 10.0 }]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      invoiceBrand === "gourmet_ahumados"
                        ? "bg-amber-950/80 border-amber-500 text-white shadow-lg ring-2 ring-amber-500/50"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">🔥</span>
                    <div>
                      <p className="font-black text-xs text-white">GOURMET AHUMADOS S.A.S.</p>
                      <p className="text-[10px] text-amber-300 font-mono">NIT: 901.792.845-1 • Ahumados</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Cliente */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-brand-400" /> 2. Adquiriente / Cliente:
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

              {/* 3. Selector de Cortes y Kilos */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-brand-400" /> 3. Cortes & Kilos de {invoiceBrand === "jd_distribuidora" ? "JD Distribuidora (Crudos)" : "Gourmet Ahumados (Leño)"}:
                  </span>
                  <span className="text-[10px] text-slate-400">Clic para agregar corte</span>
                </label>

                {/* Quick Add Buttons for selected enterprise */}
                <div className="flex flex-wrap gap-1.5">
                  {products
                    .filter((p) => p.brand === invoiceBrand)
                    .map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleAddProductToInvoice(prod.id)}
                        className={`py-1 px-2.5 rounded-lg text-[11px] border flex items-center gap-1 transition-all ${
                          invoiceBrand === "gourmet_ahumados"
                            ? "bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border-amber-800/50"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700"
                        }`}
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
                    className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentType === "efectivo"
                        ? "bg-slate-800 border-slate-600 text-white shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                    }`}
                  >
                    <Coins className="w-4 h-4 text-slate-300" />
                    <span>💵 Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("banco")}
                    className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentType === "banco"
                        ? "bg-slate-800 border-slate-600 text-white shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-slate-300" />
                    <span>🏦 Banco / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("credito")}
                    className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentType === "credito"
                        ? "bg-slate-800 border-slate-600 text-white shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                    }`}
                  >
                    <Clock className="w-4 h-4 text-slate-300" />
                    <span>📝 Crédito</span>
                  </button>
                </div>

                {/* Sub-inputs based on payment type */}
                {paymentType === "efectivo" && (
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Efectivo Recibido:</label>
                        <input
                          type="number"
                          value={cashGiven || ""}
                          onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                          placeholder={`$${newInvoiceSubtotal.toLocaleString()}`}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-3 py-2 font-mono text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Cambio / Vueltas:</label>
                        <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-emerald-400 text-xs flex items-center justify-between">
                          <span>${cashChange.toLocaleString()}</span>
                          {cashChange >= 0 && cashGiven > 0 && (
                            <span className="text-[10px] text-emerald-500 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              ✓ Vueltas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Bill Denominations for Colombian Currency */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Billetes:</span>
                      {[50000, 100000, 200000].map((bill) => (
                        <button
                          key={bill}
                          type="button"
                          onClick={() => setCashGiven(bill)}
                          className="py-1 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono font-bold transition-colors"
                        >
                          ${bill.toLocaleString()}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCashGiven(newInvoiceSubtotal)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 text-[11px] font-bold transition-colors"
                      >
                        Pago Exacto
                      </button>
                    </div>
                  </div>
                )}

                {paymentType === "banco" && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Entidad / Canal Bancario:</label>
                      <select
                        value={bankEntity}
                        onChange={(e) => setBankEntity(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                      >
                        <option value="Bancolombia (QR / Transferencia)">Bancolombia (QR / Transferencia)</option>
                        <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                        <option value="Davivienda">Davivienda</option>
                        <option value="BBVA Colombia">BBVA Colombia</option>
                        <option value="Banco de Bogotá">Banco de Bogotá</option>
                        <option value="Datafono POS Tarjeta">Datáfono POS Tarjeta</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Código de Comprobante / Ref:</label>
                      <input
                        type="text"
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                        placeholder="Ej. Aprobación #98421"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-3 py-2 font-mono text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentType === "credito" && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-400">Plazo de Cartera:</label>
                      <span className="text-amber-400 font-mono font-medium text-[11px]">
                        Vence: {new Date(Date.now() + creditDays * 24 * 60 * 60 * 1000).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[8, 15, 30, 45].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setCreditDays(d)}
                          className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            creditDays === d
                              ? "bg-slate-800 border-slate-600 text-white shadow-sm"
                              : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                          }`}
                        >
                          {d} Días
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Total Summary Footer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Kilos Totales a Despachar:</span>
                  <span className="text-base font-bold text-slate-100 font-mono">
                    {newInvoiceTotalKg.toFixed(2)} kg
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Liquidado a Facturar:</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    ${newInvoiceSubtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span>EMITIR FACTURA POS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE DEVOLUCIÓN DE FACTURA (TOTAL O PARCIAL)
          ========================================================= */}
      {refundInvoice && (
        <div className="fixed inset-0 z-[9996] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-white my-auto flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700 text-amber-500 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-100">
                    Gestionar Devolución / Nota Crédito
                  </h2>
                  <p className="text-xs text-slate-400">
                    Factura N° {refundInvoice.number} • {refundInvoice.customerName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRefundInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Selector: Devolución Total vs Devolución Parcial */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRefundType("total")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  refundType === "total"
                    ? "bg-slate-800 border-slate-600 text-white shadow-sm"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Devolución Total</span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">100%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  Devuelve ${refundInvoice.total.toLocaleString()} COP e ingresa {refundInvoice.totalKg} kg al inventario.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRefundType("parcial")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  refundType === "parcial"
                    ? "bg-slate-800 border-slate-600 text-white shadow-sm"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Devolución Parcial</span>
                  <span className="text-[10px] font-mono text-slate-400">Por Cortes</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  Digita los kilos devueltos de cortes específicos para liquidar el saldo proporcional.
                </p>
              </button>
            </div>

            {/* Motivo */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Motivo de la Devolución:
              </label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Rechazo de calidad / Merma en pesaje">Rechazo de calidad / Merma en pesaje</option>
                <option value="Devolución voluntaria del cliente">Devolución voluntaria del cliente</option>
                <option value="Ajuste de báscula en punto de entrega">Ajuste de báscula en punto de entrega</option>
                <option value="Error en digitación de pedido / Facturación">Error en digitación de pedido / Facturación</option>
                <option value="Cierre imprevisto de establecimiento">Cierre imprevisto de establecimiento</option>
              </select>
            </div>

            {/* If Parcial, Cut selector with Kg inputs */}
            {refundType === "parcial" && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 max-h-52 overflow-y-auto">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Indica los kilos a devolver por cada corte:
                </span>

                {refundInvoice.items.map((it) => {
                  const currentRefundKg = refundItemsKg[it.productId] ?? 0;
                  const itemRefundSubtotal = currentRefundKg * it.unitPrice;

                  return (
                    <div
                      key={it.productId}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-200 truncate">{it.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Facturado: {it.quantityKg} kg • ${it.unitPrice.toLocaleString()}/kg
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] text-slate-400">Devolver:</label>
                        <input
                          type="number"
                          min="0"
                          max={it.quantityKg}
                          step="0.5"
                          value={currentRefundKg}
                          onChange={(e) => {
                            const val = Math.min(it.quantityKg, Math.max(0, parseFloat(e.target.value) || 0));
                            setRefundItemsKg((prev) => ({ ...prev, [it.productId]: val }));
                          }}
                          className="w-16 bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-lg px-2 py-1 text-right font-mono text-white text-xs"
                        />
                        <span className="text-slate-500 font-mono text-xs">kg</span>
                      </div>

                      <div className="w-20 text-right font-mono font-bold text-amber-400 text-xs">
                        ${itemRefundSubtotal.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resumen de la Devolución */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Total a Reintegrar al Cliente:</span>
                <strong className="text-sm sm:text-base font-bold text-amber-400 font-mono">
                  {refundType === "total"
                    ? `$${refundInvoice.total.toLocaleString()} COP`
                    : `$${refundInvoice.items
                        .reduce((sum, it) => sum + (refundItemsKg[it.productId] || 0) * it.unitPrice, 0)
                        .toLocaleString()} COP`}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Kilos que reingresan al Stock:</span>
                <strong className="text-slate-200 font-mono">
                  {refundType === "total"
                    ? `${refundInvoice.totalKg} kg`
                    : `${refundInvoice.items
                        .reduce((sum, it) => sum + (refundItemsKg[it.productId] || 0), 0)
                        .toFixed(1)} kg`}
                </strong>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRefundInvoice(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleProcessRefundSubmit}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-700 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Procesar Devolución</span>
              </button>
            </div>
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

      {/* Production Ready Modal */}
      <ProductionReadyModal
        isOpen={isProductionReadyOpen}
        onClose={() => setIsProductionReadyOpen(false)}
      />
    </div>
  );
}
