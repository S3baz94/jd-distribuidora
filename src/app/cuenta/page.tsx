"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_COMPANY } from "@/services/mockData";
import { Customer } from "@/types";
import {
  Store,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Building2,
  MessageCircle,
  Plus,
  Sparkles,
  ShieldCheck,
  Truck,
  QrCode,
  Copy,
  Share2,
  Printer,
  ExternalLink,
} from "lucide-react";

export default function AccountPage() {
  const {
    customer,
    allCustomers,
    switchCustomer,
    updateCustomerData,
    createCustomer,
    getMagicLinkForCustomer,
    showToast,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [businessName, setBusinessName] = useState(customer.businessName);
  const [contactName, setContactName] = useState(customer.contactName);
  const [phone, setPhone] = useState(customer.phone);
  const [address, setAddress] = useState(customer.address);
  const [zone, setZone] = useState(customer.zone || "Zona Centro & Chapinero (Galerías)");
  const [businessType, setBusinessType] = useState<string>("Carnicería / Fama");
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const zones = [
    { id: "Zona Norte (Cedritos - Usaquén - Suba)", label: "🏙️ Zona Norte (Cedritos, Usaquén, Suba)" },
    { id: "Zona Centro & Chapinero (Galerías)", label: "🏛️ Zona Centro & Chapinero (Galerías, Teusaquillo)" },
    { id: "Zona Occidente (Fontibón - Modelia)", label: "✈️ Zona Occidente (Fontibón, Engativá, Modelia)" },
    { id: "Zona Sur (Kennedy - Restrepo)", label: "🚌 Zona Sur (Kennedy, Bosa, Restrepo)" },
  ];

  const businessTypes = [
    "🥩 Carnicería / Fama",
    "🥓 Salsamentaria",
    "🍖 Asadero / Piqueteadero",
    "🍽️ Restaurante / Parrilla",
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim() || !address.trim()) {
      showToast("Por favor escribe el nombre de tu negocio y la dirección", "error");
      return;
    }

    if (isCreatingNew) {
      const newCust: Customer = {
        id: `cust-${Date.now().toString(36)}`,
        companyId: "dist-001",
        businessName: businessName.trim(),
        contactName: contactName.trim() || "Propietario",
        nit: "900." + Math.floor(100000 + Math.random() * 900000) + "-1",
        phone: phone.trim() || "310 000 0000",
        email: "contacto@" + businessName.toLowerCase().replace(/\s+/g, "") + ".com",
        address: address.trim(),
        city: "Bogotá D.C.",
        zone: zone,
        priceListId: "list-famas-a",
        assignedPriceListName: "Tarifa Institucional JD - Nivel A",
        status: "active",
        paymentTerms: "Contado contra entrega / Transferencia",
        minOrderAmount: 300000,
        deliveryDays: "Lunes a Sábado",
      };

      createCustomer(newCust);
      switchCustomer(newCust.id);
      setIsCreatingNew(false);
      setIsEditing(false);
      setIsSavedRecently(true);
      showToast("¡Nuevo local registrado y guardado con éxito!", "success");
    } else {
      updateCustomerData(customer.id, {
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        zone: zone,
      });

      setIsEditing(false);
      setIsSavedRecently(true);
      showToast("¡Datos de tu negocio actualizados con éxito!", "success");
    }

    setTimeout(() => {
      setIsSavedRecently(false);
    }, 4000);
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setIsEditing(true);
    setBusinessName("");
    setContactName("");
    setPhone("");
    setAddress("");
    setZone("Zona Centro & Chapinero (Galerías)");
  };

  return (
    <div className="px-3 sm:px-4 py-4 md:py-6 space-y-6 max-w-3xl mx-auto">
      {/* 1. Clear Title for Older Eyes */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl shadow-inner flex-shrink-0">
            🏪
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Datos de Mi Negocio & Dirección de Entrega
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Aquí configuras el nombre de tu local y dónde el furgón debe llevarte la carne
            </p>
          </div>
        </div>
      </div>

      {/* 2. Success Alert after saving */}
      {isSavedRecently && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-3xl flex items-center gap-3 animate-in fade-in shadow-md">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-black text-emerald-950 text-sm sm:text-base">
              ¡Datos guardados correctamente!
            </p>
            <p className="text-xs text-emerald-800 font-medium">
              La distribuidora y los furgones ya tienen tu dirección lista para tu próximo pedido.
            </p>
          </div>
        </div>
      )}

      {/* 3. Main Business Profile Form */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 p-5 sm:p-7 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <span>{isCreatingNew ? "➕ Registrar Nuevo Local / Carnicería" : "🏪 Información de tu Negocio"}</span>
          </h2>

          {!isEditing && !isCreatingNew && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-all"
            >
              Modificar Datos
            </button>
          )}
        </div>

        {isEditing ? (
          /* EDIT / CREATE FORM */
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Field 1: Business Name */}
            <div className="space-y-1.5">
              <label className="block text-sm sm:text-base font-black text-slate-950">
                1. ¿Cómo se llama tu negocio, fama o restaurante? *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Carnicería y Fama El Roble"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-4 text-base sm:text-lg font-black text-slate-950 rounded-2xl border-2 border-slate-300 focus:border-brand-600 focus:outline-none bg-slate-50 shadow-inner"
              />
            </div>

            {/* Field 2: Contact Name */}
            <div className="space-y-1.5">
              <label className="block text-sm sm:text-base font-black text-slate-950">
                2. ¿A nombre de quién entregamos la carne? *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Don Carlos Rodríguez / Doña María"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full p-4 text-sm sm:text-base font-bold text-slate-950 rounded-2xl border-2 border-slate-300 focus:border-brand-600 focus:outline-none bg-slate-50"
              />
            </div>

            {/* Field 3: Phone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="block text-sm sm:text-base font-black text-slate-950">
                3. Número de Teléfono o WhatsApp (Para avisarte la llegada) *
              </label>
              <input
                type="tel"
                required
                placeholder="Ej. 312 456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 text-base sm:text-lg font-black text-slate-950 rounded-2xl border-2 border-slate-300 focus:border-brand-600 focus:outline-none bg-slate-50"
              />
            </div>

            {/* Field 4: Physical Address */}
            <div className="space-y-1.5">
              <label className="block text-sm sm:text-base font-black text-slate-950">
                4. Dirección exacta de entrega en Bogotá (Calle, Carrera, Barrio) *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Ej. Carrera 45 # 68-22, Barrio Galerías (Frente a la plaza de mercado)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-4 text-sm sm:text-base font-bold text-slate-950 rounded-2xl border-2 border-slate-300 focus:border-brand-600 focus:outline-none bg-slate-50"
              />
            </div>

            {/* Field 5: Sector / Zone Selector */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-black text-slate-950">
                5. ¿En qué sector de Bogotá queda tu local?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {zones.map((z) => {
                  const isSelected = zone === z.id || zone.includes(z.id.split(" ")[1]);
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setZone(z.id)}
                      className={`p-3.5 rounded-2xl border-2 text-left font-black text-xs sm:text-sm transition-all flex items-center justify-between active:scale-95 ${
                        isSelected
                          ? "bg-brand-50 border-brand-600 text-slate-950 shadow-md ring-2 ring-brand-600/30"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span>{z.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 6: Type of Business */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-black text-slate-950">
                6. ¿Qué tipo de negocio manejas?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map((type) => {
                  const isSelected = businessType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBusinessType(type)}
                      className={`p-3 rounded-2xl border-2 text-left font-black text-xs transition-all flex items-center justify-between active:scale-95 ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-600 text-slate-950 shadow-md ring-2 ring-emerald-600/30"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span>{type}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-slate-200">
              <button
                type="submit"
                className="w-full sm:flex-1 min-h-[56px] py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-950/20 transition-all flex items-center justify-center gap-3 active:scale-98"
              >
                <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                <span>GUARDAR DATOS DE MI NEGOCIO</span>
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        ) : (
          /* READ-ONLY DISPLAY CARD */
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-700 bg-brand-100 px-2.5 py-0.5 rounded-full border border-brand-300">
                    Local Principal Activo
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                    {customer.businessName}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-2 border-t border-slate-200 text-slate-700">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px] font-bold">Quién recibe:</span>
                    <strong className="text-slate-900 font-extrabold">{customer.contactName}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px] font-bold">Teléfono / WhatsApp:</span>
                    <strong className="text-slate-900 font-extrabold">{customer.phone}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px] font-bold">Dirección de entrega del furgón:</span>
                    <strong className="text-slate-950 font-black text-sm">{customer.address}</strong>
                    <p className="text-emerald-700 font-bold text-xs mt-0.5">Sector: {customer.zone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions: Edit or Register Another Branch */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>EDITAR DIRECCIÓN O TELÉFONO</span>
              </button>

              <button
                type="button"
                onClick={handleStartCreateNew}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>REGISTRAR OTRA SEDE / LOCAL</span>
              </button>
            </div>

            {/* 📲 Magic Link & QR Code Card for Business */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/30 text-white space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/30 flex-shrink-0">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ACCESO EXCLUSIVO DE TU NEGOCIO
                    </span>
                    <h4 className="font-black text-base text-white mt-0.5">
                      Enlace Mágico & QR de Mostrador
                    </h4>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Cualquier persona de tu negocio (administrador, cajero o despostador) puede abrir este enlace desde su celular para hacer pedidos directamente con tus precios y dirección sin escribir claves.
              </p>

              {/* Enlace Box */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="w-full sm:w-auto truncate text-xs font-mono text-emerald-400 font-bold">
                  {getMagicLinkForCustomer(customer.id)}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const link = getMagicLinkForCustomer(customer.id);
                      navigator.clipboard.writeText(link);
                      showToast("¡Enlace directo copiado al portapapeles!", "success");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hola, este es el enlace directo para hacer pedidos de carne para ${customer.businessName}: ${getMagicLinkForCustomer(
                        customer.id
                      )}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir por WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* QR Preview & Sticker Print */}
              <div className="p-4 rounded-xl bg-white text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-slate-200">
                <div className="flex items-center gap-3.5">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      getMagicLinkForCustomer(customer.id)
                    )}`}
                    alt="Código QR de tu negocio"
                    className="w-20 h-20 rounded-lg border-2 border-slate-900 object-contain shadow-sm"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      STICKER DE MOSTRADOR
                    </span>
                    <h5 className="font-black text-sm text-slate-950 mt-1">{customer.businessName}</h5>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Escanea con la cámara del celular para pedir carne en 1 toque.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-white font-black text-xs flex items-center gap-2 shadow-md transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Sticker</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Switch between other registered branches (if multiple) */}
      {allCustomers.length > 1 && !isEditing && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>Tus otros locales registrados en Bogotá:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allCustomers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => switchCustomer(c.id)}
                className={`p-3 rounded-2xl border-2 text-left text-xs transition-all flex items-center justify-between active:scale-95 ${
                  c.id === customer.id
                    ? "bg-brand-50 border-brand-600 text-slate-950 font-bold ring-1 ring-brand-600"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div>
                  <p className="font-black text-slate-950">{c.businessName}</p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{c.address}</p>
                </div>
                {c.id === customer.id && (
                  <span className="text-[10px] bg-brand-600 text-white font-black px-2 py-0.5 rounded-full">
                    Activo
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Direct Help / Assistance Hotline */}
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
            💬
          </div>
          <div>
            <h4 className="font-black text-slate-950 text-base">
              ¿Quieres que te ayudemos a configurar tu local?
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              Llámanos o escríbenos al WhatsApp de la distribuidora y lo hacemos por ti de inmediato.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/573233218831?text=Hola%20JD%20Distribuidora,%20necesito%20ayuda%20para%20configurar%20la%20direcci%C3%B3n%20de%20mi%20negocio"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>CONTACTAR ASESOR JD</span>
        </a>
      </div>
    </div>
  );
}
