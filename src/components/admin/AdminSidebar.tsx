"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Users,
  X,
  Scale,
  Truck,
  FileSpreadsheet,
  ShieldCheck,
  Receipt,
  KeyRound,
} from "lucide-react";
import { LicenseMasterModal } from "./LicenseMasterModal";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { allOrders, inventory, routes, adminRole, license } = useApp();
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  const pendingOrders = allOrders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing"
  ).length;

  const lowStockCount = inventory.filter((i) => i.availableQuantity <= 15).length;

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      badge: null,
      role: "all",
    },
    {
      label: "Gestión de Pedidos",
      href: "/admin/pedidos",
      icon: ClipboardList,
      badge: pendingOrders > 0 ? pendingOrders : null,
      badgeColor: "bg-amber-500 text-slate-900",
      role: "all",
    },
    {
      label: "Alistamiento & Desposte",
      href: "/admin/alistamiento",
      icon: Scale,
      badge: "Picking",
      badgeColor: "bg-brand-500/20 text-brand-400 border border-brand-500/30",
      role: "all",
    },
    {
      label: "Control & Rastreo Domiciliarios",
      href: "/admin/rutas",
      icon: Truck,
      badge: "GPS En Vivo",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      role: "all",
    },
    {
      label: "Chequeo de Entregas",
      href: "/admin/entregas",
      icon: ShieldCheck,
      badge: "POD & Firmas",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
      role: "all",
    },
    {
      label: "Facturación & POS",
      href: "/admin/facturacion",
      icon: Receipt,
      badge: "POS",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      role: "all",
    },
    {
      label: "Auditoría & Arqueo",
      href: "/admin/movimientos",
      icon: FileSpreadsheet,
      badge: "Arqueo",
      badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
      role: "all",
    },
    {
      label: "Inventario & Lotes",
      href: "/admin/inventario",
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} alertas` : null,
      badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
      role: "all",
    },
    {
      label: "Clientes",
      href: "/admin/clientes",
      icon: Users,
      badge: null,
      role: "admin",
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-black text-white text-sm">
              JD
            </div>
            <span className="font-extrabold text-sm text-white">Menú Operativo</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-4 m-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Rol Activo:</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300">
              {adminRole === "admin" ? "Administrador" : "Operador"}
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-1 truncate">
            {adminRole === "admin" ? "Jefe Comercial / Gerencia" : "Planta Desposte & Báscula"}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all group ${
                  isActive
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-900/40"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white text-brand-700 font-extrabold" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-300 uppercase tracking-wider">ADMINISTRACIÓN</p>
            <p className="text-[11px] mt-0.5 text-slate-400">JD Distribuidora & Gourmet Ahumados</p>
          </div>
          <button
            onClick={() => setIsLicenseModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-slate-800 transition-colors"
            title="Llave Maestra de Licenciamiento (Sebastián)"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* License Master Modal */}
      <LicenseMasterModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
      />
    </>
  );
};
