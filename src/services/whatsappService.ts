import { Order, Customer } from "@/types";
import { DEMO_COMPANY } from "./mockData";
import { priceService } from "./priceService";

export const whatsappService = {
  // Generate WhatsApp link for Client sending order to Distributor
  getClientOrderLink: (order: Order, distributorPhone: string = "573133923080") => {
    const itemsList = order.items
      .map(
        (i, idx) =>
          `${idx + 1}. *${i.productName}* (${i.sku}): ${i.quantity} kg x ${priceService.formatCurrency(i.unitPrice)} = ${priceService.formatCurrency(i.subtotal)}`
      )
      .join("\n");

    const totalKg = order.items.reduce((s, i) => s + i.quantity, 0);

    const message = `🥩 *NUEVO PEDIDO - ${DEMO_COMPANY.name.toUpperCase()}*\n\n` +
      `📋 *Pedido:* ${order.orderNumber}\n` +
      `🏢 *Cliente:* ${order.customerName}\n` +
      `📅 *Fecha de Entrega:* ${order.deliveryDate}\n` +
      `📍 *Dirección:* ${order.deliveryAddress}\n\n` +
      `📦 *CORTES SOLICITADOS (${totalKg} kg totales):*\n` +
      `${itemsList}\n\n` +
      `💰 *Total Estimado:* ${priceService.formatCurrency(order.total)}\n` +
      `⚖️ *Nota de Báscula:* Pendiente de pesaje digital en planta.\n` +
      (order.notes ? `📝 *Observaciones:* ${order.notes}\n\n` : `\n`) +
      `_Enviado desde el Portal de Clientes JD_`;

    const cleanPhone = distributorPhone.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  },

  // Generate WhatsApp link for Distributor notifying Client about Dispatch
  getAdminDispatchLink: (order: Order, customerPhone: string) => {
    const totalKgReal = order.items.reduce(
      (s, i) => s + (i.realQuantity !== undefined ? i.realQuantity : i.quantity),
      0
    );

    const itemsSummary = order.items
      .map((i) => `• ${i.productName}: *${i.realQuantity !== undefined ? i.realQuantity : i.quantity} kg*`)
      .join("\n");

    const message = `🚚 *¡TU PEDIDO VA EN CAMINO! - ${DEMO_COMPANY.name.toUpperCase()}*\n\n` +
      `Hola *${order.customerName}*,\n` +
      `Tu pedido *${order.orderNumber}* ya fue despostado, pesado en báscula y cargado en el furgón refrigerado.\n\n` +
      `🚛 *Datos de Despacho & Frío (0°C a 4°C):*\n` +
      `• Conductor: ${order.driverName || "Furgón Refrigerado JD"}\n` +
      `• Precinto INVIMA: ${order.sealNumber || "PREC-JD-8849"}\n` +
      `• Entrega: ${order.deliveryDate}\n\n` +
      `🥩 *Pesaje Liquidado (${totalKgReal.toFixed(1)} kg):*\n` +
      `${itemsSummary}\n\n` +
      `💰 *Total a Liquidar:* *${priceService.formatCurrency(order.realTotal || order.total)}*\n\n` +
      `Puedes ver el detalle en vivo en:\n` +
      `https://jd-distribuidora.vercel.app/pedidos/${order.id}\n\n` +
      `_¡Gracias por confiar en JD Distribuidora y Gourmet Ahumados!_`;

    const cleanPhone = (customerPhone || "573124567890").replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  },
};
