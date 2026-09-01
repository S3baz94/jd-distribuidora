"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { exportService } from "@/services/exportService";
import { Customer } from "@/types";
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
} from "lucide-react";

export default function AdminCustomersPage() {
  const { allCustomers, allOrders, createCustomer, updateCustomerData, showToast } = useApp();
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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

      {/* Customer Cards Grid with Historical Stats */}
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
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Facturado:</span>
                    <strong className="text-brand-300 font-black text-xs sm:text-sm">
                      {priceService.formatCurrency(totalInvoiced)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(cust)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>Editar Cliente</span>
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
    </div>
  );
}
