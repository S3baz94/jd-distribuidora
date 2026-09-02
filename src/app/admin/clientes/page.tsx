"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { exportService } from "@/services/exportService";
import { Customer, Invoice } from "@/types";
import {
  Users,
  UserPlus,
  Building,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  CreditCard,
  Download,
  FileSpreadsheet,
  Package,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Receipt,
  FileText,
  Printer,
  MessageCircle,
  QrCode,
  Copy,
  Share2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function AdminCustomersPage() {
  const {
    allCustomers,
    allOrders,
    invoices,
    updateInvoicePayment,
    createCustomer,
    updateCustomerData,
    getMagicLinkForCustomer,
    showToast,
  } = useApp();
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);
  const [qrCustomer, setQrCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    businessName: "",
    contactName: "",
    nit: "",
    phone: "",
    email: "",
    address: "",
    city: "Bogotá D.C.",
    zone: "Zona Norte (Cedritos - Usaquén)",
    priceListId: "list-famas-a",
    assignedPriceListName: "Tarifa Institucional JD - Nivel A (Famas & Salsamentarias)",
    paymentTerms: "Crédito 15 días / Transferencia",
    minOrderAmount: 300000,
    deliveryDays: "Lunes a Sábado",
    status: "active",
  });

  // Calculate Global Financial & Portfolio Metrics
  const globalTotalInvoiced = invoices.filter(i => i.status !== "anulada").reduce((s, i) => s + i.total, 0);
  const pendingCreditInvoices = invoices.filter(
    (i) => i.status === "pendiente" || (i.paymentType === "credito" && i.status !== "pagada" && i.status !== "anulada")
  );
  const globalTotalPendingDebt = pendingCreditInvoices.reduce((s, i) => s + i.total, 0);

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueInvoices = pendingCreditInvoices.filter((i) => {
    if (!i.paymentDetails.creditDueDate) return false;
    return i.paymentDetails.creditDueDate < todayStr;
  });
  const globalTotalOverdue = overdueInvoices.reduce((s, i) => s + i.total, 0);

  const handleExportCustomersCSV = () => {
    exportService.exportCustomersToCSV(allCustomers, allOrders);
    showToast("📥 Base de datos de clientes exportada a Excel (CSV)", "success");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.nit) return;

    const newId = `cust-${Date.now()}`;
    const fullCustomer: Customer = {
      id: newId,
      companyId: "dist-001",
      businessName: formData.businessName || "Nuevo Cliente",
      contactName: formData.contactName || "Contacto",
      nit: formData.nit || "",
      phone: formData.phone || "300 000 0000",
      email: formData.email || "contacto@empresa.com",
      address: formData.address || "Bogotá",
      city: formData.city || "Bogotá D.C.",
      zone: formData.zone || "Zona Centro & Chapinero",
      priceListId: formData.priceListId || "list-famas-a",
      assignedPriceListName: formData.assignedPriceListName || "Tarifa Institucional JD",
      status: "active",
      paymentTerms: formData.paymentTerms || "Contado contra entrega",
      minOrderAmount: formData.minOrderAmount || 300000,
      deliveryDays: formData.deliveryDays || "Lunes a Sábado",
    };

    createCustomer(fullCustomer);
    setIsNewCustModalOpen(false);
    setFormData({
      businessName: "",
      contactName: "",
      nit: "",
      phone: "",
      email: "",
      address: "",
      city: "Bogotá D.C.",
      zone: "Zona Norte (Cedritos - Usaquén)",
      priceListId: "list-famas-a",
      assignedPriceListName: "Tarifa Institucional JD - Nivel A (Famas & Salsamentarias)",
      paymentTerms: "Crédito 15 días / Transferencia",
      minOrderAmount: 300000,
      deliveryDays: "Lunes a Sábado",
      status: "active",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    updateCustomerData(editingCustomer.id, editingCustomer);
    setEditingCustomer(null);
    showToast("✓ Datos del cliente actualizados correctamente", "success");
  };

  const handleRegisterPayment = (invoice: Invoice) => {
    updateInvoicePayment(invoice.id, "banco", {
      ...invoice.paymentDetails,
      bankReference: `PAGO-CARTERA-${Date.now().toString().slice(-4)}`,
    });
    showToast(`✓ Pago de ${priceService.formatCurrency(invoice.total)} registrado para la factura ${invoice.number}`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-500" />
            <span>Directorio de Clientes</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Famas, carnicerías, salsamentarias, asaderos y restaurantes con historial de pedidos y base de datos descargable.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCustomersCSV}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            title="Descargar base de datos de clientes en Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Clientes (.CSV)</span>
          </button>

          <button
            onClick={() => setIsNewCustModalOpen(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-brand-950/50 transition-all active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Global Financial & Portfolio KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cartera por Cobrar:</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {priceService.formatCurrency(globalTotalPendingDebt)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {pendingCreditInvoices.length} facturas a crédito vigentes
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cartera Vencida (Mora):</span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            {priceService.formatCurrency(globalTotalOverdue)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {overdueInvoices.length} facturas vencidas
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Facturado Histórico:</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {priceService.formatCurrency(globalTotalInvoiced)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            En {invoices.length} facturas comerciales emitidas
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Directorio Activo:</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {allCustomers.length} <span className="text-xs font-semibold text-slate-400">clientes</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Famas, carnicerías y asaderos
          </p>
        </div>
      </div>

      {/* Customer Cards Grid with Historical Stats & Portfolio Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allCustomers.map((cust) => {
          const custOrders = allOrders.filter((o) => o.customerId === cust.id);
          const totalKg = custOrders.reduce(
            (sum, o) => sum + o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0),
            0
          );
          const totalInvoiced = custOrders.reduce(
            (sum, o) => sum + (o.realTotal || o.total),
            0
          );

          // Customer specific portfolio and invoice calculation
          const custInvoices = invoices.filter(
            (i) => i.customerId === cust.id || i.customerNit === cust.nit
          );
          const custPendingInvoices = custInvoices.filter(
            (i) => i.status === "pendiente" || (i.paymentType === "credito" && i.status !== "pagada" && i.status !== "anulada")
          );
          const custDebt = custPendingInvoices.reduce((s, i) => s + i.total, 0);

          const custOverdue = custPendingInvoices.filter((i) => {
            if (!i.paymentDetails.creditDueDate) return false;
            return i.paymentDetails.creditDueDate < todayStr;
          });
          const custOverdueDebt = custOverdue.reduce((s, i) => s + i.total, 0);

          const avgTicket = custOrders.length > 0 ? totalInvoiced / custOrders.length : 0;

          return (
            <div
              key={cust.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center font-black text-brand-400 text-lg border border-slate-700 shadow-inner flex-shrink-0">
                      {cust.businessName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-white">
                        {cust.businessName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        NIT: <span className="font-mono text-slate-300 font-bold">{cust.nit}</span>
                      </p>
                    </div>
                  </div>

                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                    {cust.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <p className="flex items-center gap-2 text-slate-400">
                    <Building className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                    <span>Contacto: <strong className="text-white">{cust.contactName}</strong></span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Teléfono / WhatsApp: <strong className="text-white">{cust.phone}</strong></span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>{cust.address} <strong className="text-emerald-400">({cust.zone})</strong></span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-400">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>Condición Comercial: <strong className="text-slate-200">{cust.paymentTerms}</strong></span>
                  </p>
                </div>

                {/* Financial & Portfolio Status Card */}
                <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                  custOverdueDebt > 0
                    ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                    : custDebt > 0
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                    : "bg-slate-950 border-slate-800 text-slate-300"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5">
                      {custOverdueDebt > 0 ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400">⚠️ CARTERA EN MORA</span>
                        </>
                      ) : custDebt > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-400">SALDO PENDIENTE POR COBRAR</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">CARTERA AL DÍA (SIN DEUDA)</span>
                        </>
                      )}
                    </span>
                    <strong className={`font-mono text-sm font-black ${
                      custOverdueDebt > 0
                        ? "text-rose-400"
                        : custDebt > 0
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}>
                      {priceService.formatCurrency(custDebt)}
                    </strong>
                  </div>

                  {custDebt > 0 && (
                    <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>{custPendingInvoices.length} facturas pendientes</span>
                      <span>
                        {custOverdueDebt > 0 ? (
                          <strong className="text-rose-400">Mora: {priceService.formatCurrency(custOverdueDebt)}</strong>
                        ) : (
                          <strong className="text-slate-300">Vigente a plazo</strong>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Accumulated Historical Stats */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-3 gap-2 bg-slate-850 p-3 rounded-2xl border border-slate-750 text-xs text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pedidos:</span>
                    <strong className="text-white font-black text-sm">{custOrders.length}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Kilos Totales:</span>
                    <strong className="text-emerald-400 font-black text-sm">{totalKg.toFixed(0)} kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Ticket Promedio:</span>
                    <strong className="text-brand-300 font-black text-xs sm:text-sm">
                      {priceService.formatCurrency(avgTicket)}
                    </strong>
                  </div>
                </div>

                {/* Acceso Directo B2B & Enlace Mágico */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Acceso Directo / Sin Clave:</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-[130px]">
                      ?c={cust.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <a
                      href={`https://wa.me/57${(cust.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hola ${cust.contactName}, este es tu enlace exclusivo para pedir carne en JD Distribuidora & Gourmet para ${cust.businessName}:\n\n${getMagicLinkForCustomer(cust.id)}\n\n¡Toca el enlace para entrar sin contraseñas!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-sm transition-colors text-center"
                      title="Enviar enlace al WhatsApp del cliente"
                    >
                      <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        const link = getMagicLinkForCustomer(cust.id);
                        navigator.clipboard.writeText(link);
                        showToast(`¡Enlace copiado para ${cust.businessName}!`, "success");
                      }}
                      className="py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors border border-slate-700 text-center"
                      title="Copiar enlace directo"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Copiar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQrCustomer(cust)}
                      className="py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-amber-950/60 hover:text-amber-300 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors border border-slate-700 text-center"
                      title="Ver e imprimir código QR de mostrador"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>QR Sticker</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatementCustomer(cust)}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-500/30"
                    title="Ver extracto y facturas de cartera"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Cartera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingCustomer(cust)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Editar</span>
                  </button>

                  <Link
                    href={`/admin/pedidos`}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    title="Ver pedidos de este cliente"
                  >
                    <Package className="w-3.5 h-3.5 text-brand-400" />
                    <span>Pedidos</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Customer Modal */}
      {isNewCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Registrar Cliente Institucional
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fama, carnicería, salsamentaria o restaurante
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewCustModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Razón Social / Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Asadero y Piqueteadero Don Mario"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">NIT / Cédula *</label>
                  <input
                    type="text"
                    required
                    placeholder="900.123.456-1"
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre de Contacto</label>
                  <input
                    type="text"
                    placeholder="Mario Quintero"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="310 987 6543"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="compras@donmario.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Dirección de Entrega (Ruta de Frío)
                </label>
                <input
                  type="text"
                  placeholder="Avenida 1 de Mayo # 24-10, Restrepo"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Zona / Sector de Despacho</label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="Zona Norte (Cedritos - Usaquén)">Zona Norte (Cedritos - Usaquén)</option>
                  <option value="Zona Centro & Chapinero (Galerías)">Zona Centro & Chapinero (Galerías - Teusaquillo)</option>
                  <option value="Zona Occidente (Fontibón - Modelia)">Zona Occidente (Fontibón - Modelia)</option>
                  <option value="Zona Sur (Kennedy - Restrepo)">Zona Sur (Kennedy - Restrepo)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Condiciones de Pago</label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="Crédito 15 días / Transferencia">Crédito 15 días / Transferencia</option>
                  <option value="Crédito 30 días">Crédito 30 días</option>
                  <option value="Contado contra entrega / Transferencia">Contado contra entrega / Transferencia</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Modificar Datos de Cliente
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingCustomer.businessName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Razón Social / Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.businessName}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, businessName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">NIT / Cédula *</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.nit}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, nit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre de Contacto</label>
                  <input
                    type="text"
                    value={editingCustomer.contactName}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, contactName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Dirección de Entrega (Ruta de Frío)
                </label>
                <input
                  type="text"
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Zona / Sector</label>
                  <select
                    value={editingCustomer.zone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, zone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Zona Norte (Cedritos - Usaquén)">Zona Norte (Cedritos - Usaquén)</option>
                    <option value="Zona Centro & Chapinero (Galerías)">Zona Centro & Chapinero (Galerías)</option>
                    <option value="Zona Occidente (Fontibón - Modelia)">Zona Occidente (Fontibón - Modelia)</option>
                    <option value="Zona Sur (Kennedy - Restrepo)">Zona Sur (Kennedy - Restrepo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Estado</label>
                  <select
                    value={editingCustomer.status}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value as "active" | "inactive" })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Condiciones de Pago</label>
                <select
                  value={editingCustomer.paymentTerms}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, paymentTerms: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Crédito 15 días / Transferencia">Crédito 15 días / Transferencia</option>
                  <option value="Crédito 30 días">Crédito 30 días</option>
                  <option value="Contado contra entrega / Transferencia">Contado contra entrega / Transferencia</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Financial Statement & Portfolio (Cartera) Modal */}
      {statementCustomer && (() => {
        const custInvoices = invoices.filter(
          (i) => i.customerId === statementCustomer.id || i.customerNit === statementCustomer.nit
        );
        const custTotalInvoiced = custInvoices.filter(i => i.status !== "anulada").reduce((s, i) => s + i.total, 0);
        const custPaidInvoices = custInvoices.filter(i => i.status === "pagada");
        const custTotalPaid = custPaidInvoices.reduce((s, i) => s + i.total, 0);
        const custPendingInvoices = custInvoices.filter(
          (i) => i.status === "pendiente" || (i.paymentType === "credito" && i.status !== "pagada" && i.status !== "anulada")
        );
        const custDebt = custPendingInvoices.reduce((s, i) => s + i.total, 0);
        const custOverdue = custPendingInvoices.filter((i) => {
          if (!i.paymentDetails.creditDueDate) return false;
          return i.paymentDetails.creditDueDate < todayStr;
        });
        const custOverdueDebt = custOverdue.reduce((s, i) => s + i.total, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ESTADO DE CUENTA & CARTERA
                    </span>
                    <h3 className="font-black text-lg text-white mt-0.5">
                      {statementCustomer.businessName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      NIT: <span className="font-mono text-slate-300 font-bold">{statementCustomer.nit}</span> • {statementCustomer.paymentTerms}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStatementCustomer(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Financial KPIs Banner */}
              <div className="p-4 bg-slate-850 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Facturado:</span>
                  <strong className="text-emerald-400 font-black text-sm font-mono block">
                    {priceService.formatCurrency(custTotalInvoiced)}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Pagado:</span>
                  <strong className="text-white font-black text-sm font-mono block">
                    {priceService.formatCurrency(custTotalPaid)}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Saldo en Cartera:</span>
                  <strong className={`font-black text-sm font-mono block ${custDebt > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {priceService.formatCurrency(custDebt)}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Saldo Vencido (Mora):</span>
                  <strong className={`font-black text-sm font-mono block ${custOverdueDebt > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {priceService.formatCurrency(custOverdueDebt)}
                  </strong>
                </div>
              </div>

              {/* Invoices List / Statement */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wide">
                    Historial de Facturas Comerciales ({custInvoices.length})
                  </h4>
                  <span className="text-xs text-slate-400">
                    {custPendingInvoices.length} pendientes por recaudar
                  </span>
                </div>

                {custInvoices.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-xs text-slate-400">No hay facturas emitidas para este cliente</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {custInvoices.map((inv) => {
                      const isPending = inv.status === "pendiente" || (inv.paymentType === "credito" && inv.status !== "pagada" && inv.status !== "anulada");
                      const isOverdue = isPending && inv.paymentDetails.creditDueDate && inv.paymentDetails.creditDueDate < todayStr;

                      return (
                        <div
                          key={inv.id}
                          className={`p-3.5 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isOverdue
                              ? "bg-rose-950/20 border-rose-500/40"
                              : isPending
                              ? "bg-amber-950/20 border-amber-500/40"
                              : "bg-slate-950 border-slate-800"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-white text-xs">
                                {inv.number}
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  inv.status === "pagada"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : isOverdue
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {inv.status === "pagada" ? "✓ Pagada" : isOverdue ? "⚠️ Vencida en Mora" : "⏳ Crédito Vigente"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {inv.totalKg.toFixed(1)} kg
                              </span>
                            </div>

                            <p className="text-xs text-slate-400">
                              Emisión: <strong className="text-slate-300">{new Date(inv.issuedAt).toLocaleDateString("es-CO")}</strong>
                              {inv.paymentDetails.creditDueDate && (
                                <span> • Vence: <strong className={isOverdue ? "text-rose-400" : "text-slate-300"}>{inv.paymentDetails.creditDueDate}</strong></span>
                              )}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                            <span className="font-black text-sm text-white font-mono">
                              {priceService.formatCurrency(inv.total)}
                            </span>

                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleRegisterPayment(inv)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 shadow-md active:scale-95 transition-all"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Registrar Pago</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Imprimir Extracto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatementCustomer(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Customer Magic Link & Counter QR Sticker */}
      {qrCustomer && (() => {
        const clientLink = getMagicLinkForCustomer(qrCustomer.id);
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(clientLink)}`;
        const cleanPhone = (qrCustomer.phone || "").replace(/\D/g, "");

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 text-white">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Sticker QR & Enlace Mágico</h3>
                    <p className="text-xs text-slate-400">Acceso exclusivo sin contraseña</p>
                  </div>
                </div>
                <button
                  onClick={() => setQrCustomer(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Physical Sticker Card Preview */}
                <div className="p-5 rounded-2xl bg-white text-slate-950 text-center space-y-3 border-4 border-slate-900 shadow-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                    <span>🥩 JD DISTRIBUIDORA & GOURMET</span>
                  </div>

                  <h4 className="font-black text-lg text-slate-950 leading-tight">
                    {qrCustomer.businessName}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-bold">
                    {qrCustomer.contactName} • {qrCustomer.zone}
                  </p>

                  <div className="p-2 bg-slate-50 rounded-xl inline-block border-2 border-slate-200">
                    <img
                      src={qrImgUrl}
                      alt="Código QR de Acceso"
                      className="w-44 h-44 mx-auto object-contain"
                    />
                  </div>

                  <p className="text-xs font-black text-emerald-800 bg-emerald-50 py-1 px-3 rounded-lg border border-emerald-200">
                    📸 Apunta tu cámara aquí para pedir carne en 1 toque
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Tarifa asignada: {qrCustomer.assignedPriceListName}
                  </p>
                </div>

                {/* Direct Link Box */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Enlace directo para enviar:</span>
                  <div className="text-xs font-mono text-emerald-400 font-bold truncate">
                    {clientLink}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/57${cleanPhone}?text=${encodeURIComponent(
                      `Hola ${qrCustomer.contactName}, este es tu enlace directo para pedir carne fresca en JD Distribuidora & Gourmet con los precios mayoristas de tu local (${qrCustomer.businessName}):\n\n${clientLink}\n\n¡Toca el enlace para abrir tu cuenta!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar a WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(clientLink);
                      showToast(`¡Enlace copiado para ${qrCustomer.businessName}!`, "success");
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Enlace</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Printer className="w-4 h-4 stroke-[2.5]" />
                  <span>IMPRIMIR STICKER DE MOSTRADOR</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
