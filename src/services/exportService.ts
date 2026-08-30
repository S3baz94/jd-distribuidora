import { Order, Customer, InventoryItem, DeliveryRoute, Product, DriverExpense } from "@/types";

export const exportService = {
  // 1. Export Inventory to CSV (Excel compatible)
  exportInventoryToCSV: (inventory: InventoryItem[], products: Product[]) => {
    const headers = [
      "SKU",
      "Corte_Producto",
      "Linea_Marca",
      "Kilos_Fisicos_Bodega",
      "Kilos_Reservados_Pedidos",
      "Kilos_Disponibles_Venta",
      "Lote_Futuro_Programado",
      "Fecha_Proxima_Llegada",
      "Estado_Stock",
    ];

    const rows = products.map((p) => {
      const inv = inventory.find((i) => i.productId === p.id) || {
        physicalQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        futureQuantity: 0,
        nextAvailabilityDate: "",
      };

      const brandLabel =
        p.brand === "gourmet_ahumados" ? "Gourmet Ahumados" : "JD Distribuidora (Crudos)";

      const stockStatus =
        inv.availableQuantity <= 0
          ? "AGOTADO (0 kg)"
          : inv.availableQuantity <= 15
          ? "STOCK BAJO"
          : "DISPONIBLE";

      return [
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${brandLabel}"`,
        inv.physicalQuantity,
        inv.reservedQuantity,
        inv.availableQuantity,
        inv.futureQuantity,
        `"${inv.nextAvailabilityDate || "N/A"}"`,
        `"${stockStatus}"`,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    exportService.downloadFile(
      csvContent,
      `inventario_frigorifico_jd_${new Date().toISOString().split("T")[0]}.csv`,
      "text/csv;charset=utf-8;"
    );
  },

  // 2. Export Orders to CSV (Excel compatible)
  exportOrdersToCSV: (orders: Order[]) => {
    const headers = [
      "Numero_Pedido",
      "Fecha_Creacion",
      "Fecha_Entrega",
      "Cliente",
      "Direccion_Entrega",
      "Sector_Zona",
      "Linea_Comercial",
      "Cortes_Detalle",
      "Kilos_Totales",
      "Total_Liquidado_COP",
      "Estado_Pedido",
      "Domiciliario_Chofer",
      "Ruta_Asignada",
      "Ajustado_en_Bascula",
      "Notas_Pedido",
    ];

    const rows = orders.map((o) => {
      const totalKg = o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);
      const itemsDetail = o.items
        .map((i) => `${i.productName} (${i.realQuantity || i.quantity}kg @ $${i.unitPrice})`)
        .join(" | ");

      const brandLabel =
        o.brand === "gourmet_ahumados"
          ? "Gourmet Ahumados"
          : o.brand === "mixed"
          ? "Mixto (Crudos + Ahumados)"
          : "JD Distribuidora (Crudos)";

      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleDateString("es-CO")}"`,
        `"${o.deliveryDate}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.deliveryAddress.replace(/"/g, '""')}"`,
        `"${o.zone || "N/A"}"`,
        `"${brandLabel}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        totalKg.toFixed(1),
        o.realTotal || o.total,
        `"${o.status}"`,
        `"${o.driverName || "Sin asignar"}"`,
        `"${o.routeName || "Sin ruta"}"`,
        o.weightAdjusted ? "SI" : "NO",
        `"${(o.notes || "").replace(/"/g, '""')}"`,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    exportService.downloadFile(
      csvContent,
      `pedidos_jd_distribuidora_${new Date().toISOString().split("T")[0]}.csv`,
      "text/csv;charset=utf-8;"
    );
  },

  // 3. Export Daily Driver Movements & Billing Reconciliation
  exportDailyDriverReconciliationCSV: (
    orders: Order[],
    routes: DeliveryRoute[]
  ) => {
    const headers = [
      "Fecha_Movimiento",
      "Domiciliario_Chofer",
      "Placa_Vehiculo",
      "Ruta_Sector",
      "Numero_Pedido",
      "Cliente_Razon_Social",
      "Direccion_Entrega",
      "Kilos_Despachados_Total",
      "Total_Facturado_COP",
      "Forma_Pago_Esperada",
      "Monto_Recaudado_Chofer",
      "Saldo_Cartera_Pendiente",
      "Canastillas_Dejadas",
      "Canastillas_Recogidas",
      "Balance_Canastillas",
      "Estado_Entrega",
      "Ajustado_Bascula",
      "Firma_Digital_Registrada",
    ];

    const rows = orders.map((o) => {
      const totalKg = o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0);
      const route = routes.find((r) => r.id === o.routeId);
      const isDelivered = o.status === "delivered";
      const totalInvoiced = o.realTotal || o.total;
      const estimatedBaskets = Math.ceil(totalKg / 25) || 1;

      const collectedAmount = isDelivered ? totalInvoiced : 0;
      const pendingBalance = isDelivered ? 0 : totalInvoiced;

      return [
        `"${o.deliveryDate}"`,
        `"${o.driverName || route?.driverName || "Sin asignar"}"`,
        `"${route?.vehiclePlate || "Furgón JD"}"`,
        `"${o.routeName || route?.name || "Ruta General"}"`,
        `"${o.orderNumber}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.deliveryAddress.replace(/"/g, '""')}"`,
        totalKg.toFixed(1),
        totalInvoiced,
        `"Contado / Transferencia"`,
        collectedAmount,
        pendingBalance,
        estimatedBaskets,
        isDelivered ? estimatedBaskets : 0,
        isDelivered ? 0 : -estimatedBaskets,
        `"${isDelivered ? "ENTREGADO" : o.status === "dispatched" ? "EN RUTA" : "PENDIENTE"}"`,
        o.weightAdjusted ? "SI" : "NO",
        isDelivered ? "SI (Firma en celular)" : "NO",
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    exportService.downloadFile(
      csvContent,
      `movimientos_domiciliarios_conciliacion_facturacion_${new Date().toISOString().split("T")[0]}.csv`,
      "text/csv;charset=utf-8;"
    );
  },

  // 4. Export Customers Database to CSV
  exportCustomersToCSV: (customers: Customer[], allOrders: Order[]) => {
    const headers = [
      "ID_Cliente",
      "Razon_Social",
      "Contacto",
      "NIT",
      "Telefono",
      "Email",
      "Direccion",
      "Ciudad",
      "Sector_Zona",
      "Tarifa_Asignada",
      "Condicion_Pago",
      "Estado",
      "Total_Pedidos_Historicos",
      "Total_Kilos_Comprados",
      "Total_Facturado_COP",
    ];

    const rows = customers.map((c) => {
      const custOrders = allOrders.filter((o) => o.customerId === c.id);
      const totalKg = custOrders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + (i.realQuantity || i.quantity), 0),
        0
      );
      const totalInvoiced = custOrders.reduce(
        (sum, o) => sum + (o.realTotal || o.total),
        0
      );

      return [
        `"${c.id}"`,
        `"${c.businessName.replace(/"/g, '""')}"`,
        `"${c.contactName.replace(/"/g, '""')}"`,
        `"${c.nit}"`,
        `"${c.phone}"`,
        `"${c.email}"`,
        `"${c.address.replace(/"/g, '""')}"`,
        `"${c.city}"`,
        `"${c.zone}"`,
        `"${c.assignedPriceListName}"`,
        `"${c.paymentTerms}"`,
        `"${c.status}"`,
        custOrders.length,
        totalKg.toFixed(1),
        totalInvoiced,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    exportService.downloadFile(
      csvContent,
      `clientes_base_datos_jd_${new Date().toISOString().split("T")[0]}.csv`,
      "text/csv;charset=utf-8;"
    );
  },

  // 5. Export Driver Expenses & Receipts to CSV
  exportExpensesToCSV: (expenses: DriverExpense[]) => {
    const headers = [
      "ID_Gasto",
      "Fecha_Hora",
      "Domiciliario",
      "Ruta",
      "Tipo_Gasto",
      "Monto_COP",
      "Descripcion_Detalle",
      "Tiene_Foto_Soporte",
    ];

    const rows = expenses.map((e) => [
      `"${e.id}"`,
      `"${new Date(e.createdAt).toLocaleString("es-CO")}"`,
      `"${e.driverName.replace(/"/g, '""')}"`,
      `"${(e.routeName || "Ruta General").replace(/"/g, '""')}"`,
      `"${e.category.toUpperCase()}"`,
      e.amount,
      `"${e.description.replace(/"/g, '""')}"`,
      e.receiptPhoto ? "SI (Foto Adjunta)" : "NO",
    ].join(";"));

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    exportService.downloadFile(
      csvContent,
      `gastos_recibos_domiciliarios_${new Date().toISOString().split("T")[0]}.csv`,
      "text/csv;charset=utf-8;"
    );
  },

  // 6. Full JSON Database Backup
  exportFullBackupJSON: (data: {
    customers: Customer[];
    orders: Order[];
    inventory: InventoryItem[];
    routes: DeliveryRoute[];
    expenses?: DriverExpense[];
  }) => {
    const backupPayload = {
      version: "5.0",
      company: "JD Distribuidora y Gourmet Ahumados",
      exportDate: new Date().toISOString(),
      stats: {
        totalOrders: data.orders.length,
        totalCustomers: data.customers.length,
        totalRoutes: data.routes.length,
        totalInventoryItems: data.inventory.length,
        totalExpenses: (data.expenses || []).length,
      },
      database: data,
    };

    const jsonContent = JSON.stringify(backupPayload, null, 2);
    exportService.downloadFile(
      jsonContent,
      `backup_completo_jd_distribuidora_${new Date().toISOString().split("T")[0]}.json`,
      "application/json"
    );
  },

  // Helper trigger browser download
  downloadFile: (content: string, fileName: string, contentType: string) => {
    if (typeof window === "undefined") return;
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
