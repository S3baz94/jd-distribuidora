"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order, RepeatOrderValidationResult } from "@/types";
import { useApp } from "@/context/AppContext";
import { priceService } from "@/services/priceService";
import { StatusBadge } from "../common/StatusBadge";
import { RepeatOrderModal } from "../catalog/RepeatOrderModal";
import {
  Calendar,
  RotateCcw,
  ArrowRight,
  Package,
  Clock,
  ChevronRight,
} from "lucide-react";

interface OrderCardProps {
  order: Order;
  highlight?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, highlight = false }) => {
  const { repeatOrder, setIsCartOpen } = useApp();
  const [validationResult, setValidationResult] = useState<RepeatOrderValidationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalKg = order.items.reduce((sum, i) => sum + i.quantity, 0);

  const handleRepeat = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProcessing(true);

    try {
      const result = await repeatOrder(order);
      if (result.warnings.length > 0) {
        setValidationResult(result);
        setIsModalOpen(true);
      } else {
        setIsCartOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md overflow-hidden ${
          highlight
            ? "border-brand-300 ring-2 ring-brand-100"
            : "border-slate-200"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-slate-900 text-base">
              Pedido {order.orderNumber}
            </span>
            <StatusBadge status={order.status} size="sm" />
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-900">
              {priceService.formatCurrency(order.total)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Delivery date info */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Entrega programada:</span>
            </div>
            <span className="font-bold text-slate-900">{order.deliveryDate}</span>
          </div>

          {/* Items snippet */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700">
                <span className="font-medium truncate max-w-[200px]">
                  • {item.productName}
                </span>
                <span className="font-semibold text-slate-900">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleRepeat}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs rounded-xl border border-brand-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isProcessing ? "Verificando..." : "REPETIR PEDIDO"}</span>
            </button>

            <Link
              href={`/pedidos/${order.id}`}
              className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <span>VER DETALLE</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {validationResult && (
        <RepeatOrderModal
          validationResult={validationResult}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onContinueToCart={() => setIsCartOpen(true)}
        />
      )}
    </>
  );
};
