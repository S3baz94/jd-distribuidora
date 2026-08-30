"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { DEMO_COMPANY } from "@/services/mockData";
import { Lock, Phone, Mail, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { customer, allCustomers, switchCustomer, showToast } = useApp();

  const [identifier, setIdentifier] = useState(customer.email || "3124567890");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      showToast(`¡Bienvenido de nuevo, ${customer.contactName}!`, "success");
      router.push("/");
    }, 400);
  };

  const handleSelectDemo = (customerId: string) => {
    switchCustomer(customerId);
    const target = allCustomers.find((c) => c.id === customerId);
    if (target) {
      setIdentifier(target.phone);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-md">
            🥩
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
            <span>{DEMO_COMPANY.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Compra directamente con nosotros
          </h1>
          <p className="text-xs text-slate-500">
            Portal de Clientes
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Número de celular o correo
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ej. 312 456 7890 o negocio@correo.com"
                className="w-full pl-3.5 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() =>
                  showToast(
                    "Para recuperar tu acceso demo, contacta a tu asesor o selecciona uno de los perfiles demo abajo.",
                    "info"
                  )
                }
                className="text-[11px] text-brand-600 hover:text-brand-700 font-bold"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu clave"
                className="w-full pl-3.5 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 tracking-wide uppercase"
          >
            <span>{isLoading ? "INGRESANDO..." : "INGRESAR AL PORTAL"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Accounts Switcher */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Acceso rápido para demostración:
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
              Acceso Demo
            </span>
          </div>

          <div className="space-y-1.5">
            {allCustomers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectDemo(c.id)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                  c.id === customer.id
                    ? "bg-slate-900 text-white font-bold border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div>
                  <p className="font-bold">{c.businessName}</p>
                  <p className="text-[10px] opacity-75">{c.contactName} • {c.phone}</p>
                </div>
                {c.id === customer.id ? (
                  <span className="text-[10px] bg-brand-600 px-2 py-0.5 rounded text-white font-bold">
                    Seleccionado
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Usar</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
