"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { DEMO_COMPANY } from "@/services/mockData";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Building2,
  Sparkles,
  MapPin,
  HelpCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { customer, allCustomers, switchCustomer, loginCustomerByIdentifier, showToast } = useApp();

  const [identifier, setIdentifier] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Live matching customer suggestions as user types
  const matchedCustomer = useMemo(() => {
    const cleanTerm = identifier.trim().toLowerCase().replace(/[\s\-\.]/g, "");
    if (cleanTerm.length < 3) return null;

    return (
      allCustomers.find((c) => {
        const cleanPhone = (c.phone || "").replace(/[\s\-\.]/g, "").toLowerCase();
        const cleanNit = (c.nit || "").replace(/[\s\-\.]/g, "").toLowerCase();
        return (
          cleanPhone === cleanTerm ||
          cleanPhone.endsWith(cleanTerm) ||
          cleanNit === cleanTerm ||
          cleanNit.includes(cleanTerm)
        );
      }) || null
    );
  }, [identifier, allCustomers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const result = loginCustomerByIdentifier(identifier);
    if (result.success && result.customer) {
      setTimeout(() => {
        setIsLoading(false);
        router.push("/");
      }, 300);
    } else {
      setIsLoading(false);
      setErrorMsg(
        result.error ||
          "No encontramos una cuenta con ese número de celular o NIT. Si eres cliente nuevo, contáctanos por WhatsApp."
      );
    }
  };

  const handleSelectDemo = (customerId: string) => {
    switchCustomer(customerId);
    const target = allCustomers.find((c) => c.id === customerId);
    if (target) {
      setIdentifier(target.phone);
      showToast(`Ingresando como ${target.businessName}...`, "success");
      setTimeout(() => {
        router.push("/");
      }, 300);
    }
  };

  const waSupportLink = `https://wa.me/573233218831?text=${encodeURIComponent(
    "Hola JD Distribuidora & Gourmet, deseo activar mi cuenta de cliente para hacer pedidos por la aplicación."
  )}`;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-md">
            🥩
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ACCESO ÁGIL SIN CONTRASEÑA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Portal de Pedidos B2B
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Carnes frescas de cerdo y cortes ahumados al leño para tu negocio
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-black text-slate-800 uppercase tracking-wider mb-1.5">
              1. Digita tu Número de Celular o NIT:
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Ej. 312 456 7890 ó 900.123.456-1"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border-2 border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-brand-600 shadow-sm"
                required
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              No requieres contraseñas difíciles. Tu número de teléfono o NIT identifica tu local.
            </p>
          </div>

          {/* Live Customer Recognition Card */}
          {matchedCustomer && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  🏪
                </div>
                <div>
                  <p className="font-black text-emerald-950 text-xs">{matchedCustomer.businessName}</p>
                  <p className="text-[10px] text-emerald-700">
                    {matchedCustomer.contactName} • {matchedCustomer.zone}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-1 rounded-lg">
                Reconocido ✓
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !identifier.trim()}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 tracking-wide uppercase disabled:opacity-50"
          >
            <span>{isLoading ? "CARGANDO TU NEGOCIO..." : "INGRESAR A PEDIR CARNE"}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        {/* WhatsApp Support for New Clients */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div>
            <p className="font-bold text-slate-800">¿Eres un cliente nuevo?</p>
            <p className="text-[10px] text-slate-500">Solicita tu registro o apertura de cupo comercial</p>
          </div>
          <a
            href={waSupportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Quick Demo Accounts Switcher */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cuentas de demostración rápida:</span>
            </span>
          </div>

          <div className="space-y-1.5">
            {allCustomers.slice(0, 3).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectDemo(c.id)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                  c.id === customer.id
                    ? "bg-slate-900 text-white font-bold border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div>
                  <p className="font-bold">{c.businessName}</p>
                  <p className="text-[10px] opacity-75">
                    {c.contactName} • Tel: {c.phone} • {c.zone}
                  </p>
                </div>
                <span className="text-[10px] bg-brand-600/20 text-brand-700 px-2 py-0.5 rounded font-bold border border-brand-500/30">
                  Entrar ➔
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
