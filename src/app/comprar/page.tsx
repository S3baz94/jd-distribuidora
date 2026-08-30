"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { ProductCard } from "@/components/catalog/ProductCard";
import { InstallAppPrompt } from "@/components/common/InstallAppPrompt";
import { BrandSwitcher } from "@/components/layout/BrandSwitcher";
import { productService } from "@/services/productService";
import { Search, Layers, ThermometerSnowflake, Flame } from "lucide-react";

export default function CatalogPage() {
  const { products, customer, selectedBrand } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    if (selectedBrand === "gourmet_ahumados") {
      return [
        { id: "all", label: "🪵🔥 Todos los Ahumados" },
        { id: "ahumados_costillas", label: "🍖 Costillas Ahumadas" },
        { id: "ahumados_chuletas", label: "🥩 Chuletas Ahumadas" },
      ];
    }

    if (selectedBrand === "jd_distribuidora") {
      return [
        { id: "all", label: "🥩 Todos los Cortes Crudos" },
        { id: "cortes_magros", label: "Lomos & Bondiolas" },
        { id: "cortes_con_hueso", label: "Costillas & Chuletas Crudas" },
        { id: "tocinos_grasas", label: "Panceta & Tocinos" },
      ];
    }

    return [
      { id: "all", label: "✨ Todo el Catálogo" },
      { id: "cortes_magros", label: "Lomos & Bondiolas" },
      { id: "cortes_con_hueso", label: "Costillas & Chuletas Crudas" },
      { id: "tocinos_grasas", label: "Panceta & Tocinos" },
      { id: "ahumados_costillas", label: "🪵 Costillas Ahumadas" },
      { id: "ahumados_chuletas", label: "🪵 Chuletas Ahumadas" },
    ];
  }, [selectedBrand]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesBrand = p.brand === selectedBrand;
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchesQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cutType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrand && matchesCategory && matchesQuery;
    });
  }, [products, selectedBrand, selectedCategory, searchQuery]);

  return (
    <div className="px-3 sm:px-4 py-4 md:py-6 space-y-5">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {selectedBrand === "jd_distribuidora"
                ? "Cortes de Cerdo Fresco Crudo"
                : selectedBrand === "gourmet_ahumados"
                ? "Costillas & Chuletas Gourmet Ahumadas"
                : "Catálogo de Productos JD & Gourmet"}
            </h1>
            <span className="text-xs font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              {filteredProducts.length} productos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium flex items-center gap-1.5">
            {selectedBrand === "gourmet_ahumados" ? (
              <>
                <Flame className="w-4 h-4 text-amber-600 fill-current" />
                <span>Ahumados artesanales al leño de roble para <strong>{customer.businessName}</strong></span>
              </>
            ) : (
              <>
                <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />
                <span>Desposte diario en cadena de frío (0°C a 4°C) para <strong>{customer.businessName}</strong></span>
              </>
            )}
          </p>
        </div>

        {/* Large Accessible Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por corte o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-8 py-3 text-sm rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-brand-600 font-medium bg-white shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700 font-black p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Brand Switcher Card */}
      <BrandSwitcher />

      {/* Category Tabs (Large touch buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 active:scale-95 shadow-sm ${
                isActive
                  ? "bg-slate-950 text-white border-2 border-slate-950 shadow-md"
                  : "bg-white text-slate-800 border-2 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* PWA Download Banner */}
      <InstallAppPrompt />

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Layers className="w-14 h-14 mx-auto text-slate-300" />
          <div>
            <p className="font-black text-slate-900 text-lg">No encontramos productos con ese filtro</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Prueba cambiando la línea de marca o seleccionando otra categoría.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-black transition-colors"
          >
            VER TODOS LOS PRODUCTOS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
