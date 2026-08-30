"use client";

import React from "react";
import { Customer } from "@/types";
import { priceService } from "@/services/priceService";
import {
  DollarSign,
  Calendar,
  CreditCard,
  Tag,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

interface CommercialConditionsProps {
  customer: Customer;
}

export const CommercialConditions: React.FC<CommercialConditionsProps> = ({ customer }) => {
  return (
    <div className="space-y-4">
      {/* Customer Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
              {customer.businessName.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg leading-tight">
                {customer.businessName}
              </h2>
              <p className="text-xs text-slate-500">NIT: {customer.nit}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Cliente Activo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Contacto: <strong className="text-slate-900">{customer.contactName}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Teléfono: <strong className="text-slate-900">{customer.phone}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Correo: <strong className="text-slate-900">{customer.email}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Dirección: <strong className="text-slate-900">{customer.address}, {customer.city}</strong></span>
          </div>
        </div>
      </div>

      {/* Commercial Terms */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Condiciones Comerciales Pactadas
        </h3>
        <p className="text-xs text-slate-500">
          Términos y condiciones asignados por la distribuidora para tu cuenta de cliente.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Price List */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>Lista de Precios Asignada</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {customer.assignedPriceListName}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tus precios en el catálogo se calculan automáticamente con esta lista.
            </p>
          </div>

          {/* Min Order */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Pedido Mínimo por Despacho</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {priceService.formatCurrency(customer.minOrderAmount)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sin costo de flete en Bogotá dentro del perímetro urbano.
            </p>
          </div>

          {/* Delivery Days */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Días y Horarios de Entrega</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {customer.deliveryDays}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rutas con furgones refrigerados a temperatura controlada.
            </p>
          </div>

          {/* Payment Terms */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span>Forma de Pago Acordada</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {customer.paymentTerms}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pagos mediante transferencia bancaria o contra entrega certificada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
