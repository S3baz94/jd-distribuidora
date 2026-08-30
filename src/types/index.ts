export type ProductCategory =
  | "cortes_magros"
  | "cortes_con_hueso"
  | "tocinos_grasas"
  | "subproductos_crudos"
  | "ahumados_costillas"
  | "ahumados_chuletas";

export type BrandType = "jd_distribuidora" | "gourmet_ahumados";

export type OrderStatus =
  | "pending" // Pedido recibido
  | "confirmed" // Confirmado por la distribuidora
  | "preparing" // En alistamiento / Desposte / Ahumado
  | "ready" // Listo para furgón
  | "dispatched" // Despachado en ruta de frío
  | "delivered" // Entregado en punto de venta
  | "cancelled"; // Cancelado

export type StockAvailabilityStatus = "available" | "limited" | "out_of_stock";

export type AdminRole = "admin" | "operador_bodega" | "vendedor" | "domiciliario";

export interface Product {
  id: string;
  companyId: string;
  brand: BrandType; // "jd_distribuidora" (Crudos) o "gourmet_ahumados" (Costillas y Chuletas ahumadas)
  sku: string;
  name: string;
  cutType: string; // ej. "Corte 100% magro crudo" o "Ahumado artesanal al leño"
  presentation: string; // ej. "Pieza entera fresca al vacío"
  temperature: string; // ej. "Refrigerado 0°C a 4°C"
  description: string;
  category: ProductCategory;
  image: string;
  unit: "kg";
  minimumQuantity: number; // Pedido mínimo en kg
  quantityStep: number; // Múltiplos en kg
  active: boolean;
  isFrequent?: boolean;
}

export interface InventoryItem {
  productId: string;
  companyId: string;
  physicalQuantity: number; // kg físicos en bodega
  reservedQuantity: number; // kg comprometidos en pedidos pendientes
  availableQuantity: number; // kg disponibles para venta inmediata
  futureQuantity: number; // kg proyectados del próximo beneficio
  nextAvailabilityDate?: string; // Fecha de llegada
  canReserveFuture: boolean;
}

export interface PriceEntry {
  priceListId: string;
  productId: string;
  pricePerUnit: number; // COP / kg
}

export interface Customer {
  id: string;
  companyId: string;
  businessName: string;
  contactName: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zone: string; // ej. "Norte - Cedritos / Usaquén", "Centro - Galerías", "Occidente - Fontibón"
  lat?: number;
  lng?: number;
  priceListId: string;
  assignedPriceListName: string;
  status: "active" | "inactive" | "blocked";
  paymentTerms: string; // ej. "Transferencia / Crédito 15 días"
  minOrderAmount: number; // COP
  deliveryDays: string;
}

export interface OrderItem {
  productId: string;
  brand?: BrandType;
  sku: string;
  productName: string;
  unit: string;
  quantity: number; // kg pedidos originalmente
  realQuantity?: number; // kg reales pesados en báscula
  unitPrice: number; // COP por kg
  subtotal: number;
  realSubtotal?: number; // subtotal ajustado con peso real
}

export interface Order {
  id: string;
  orderNumber: string;
  companyId: string;
  brand?: BrandType | "mixed";
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  realTotal?: number; // Total final con peso de báscula
  deliveryDate: string;
  deliveryAddress: string;
  zone?: string; // Zona para despacho logístico
  lat?: number;
  lng?: number;
  routeId?: string; // ID de la ruta asignada
  routeName?: string; // Nombre de la ruta asignada (ej. "Ruta Norte #1")
  stopOrder?: number; // Parada #1, #2, #3 en la ruta
  notes: string;
  internalNotes?: string; // Notas de bodega / furgón
  status: OrderStatus;
  driverName?: string;
  driverPhone?: string;
  sealNumber?: string; // Número de precinto de seguridad del furgón
  weightAdjusted?: boolean;
  paymentMethod?: "efectivo" | "banco" | "credito"; // Forma de pago de la compra del cliente
  receivedByName?: string;
  deliveredBasketsLeft?: number;
  emptyBasketsCollected?: number;
  invoicePhoto?: string; // Foto de la factura de venta / remisión firmada
  customerSignature?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRoute {
  id: string;
  name: string; // ej. "Ruta Norte 01 (Cedritos - Suba)"
  zone: string; // ej. "Norte / Suba / Usaquén"
  driverId: string;
  driverName: string; // ej. "Carlos Pérez (Furgón #1)"
  driverPhone: string;
  vehiclePlate: string; // ej. "WDL-842"
  vehicleType: "furgon_frio" | "moto_frio" | "camion";
  orderIds: string[]; // Order IDs ordenados por parada
  status: "planned" | "in_transit" | "completed";
  departureTime?: string;
  date: string;
  notes?: string;
}

export interface DriverMovement {
  id: string;
  date: string;
  routeId: string;
  routeName: string;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  zone: string;
  deliveredKg: number;
  invoicedTotal: number;
  paymentMethod: "Efectivo" | "Transferencia" | "Crédito 15d" | "Crédito 30d";
  amountCollected: number;
  pendingBalance: number;
  deliveredBaskets: number;
  returnedBaskets: number;
  basketsDifference: number;
  receivedBy: string;
  deliveryTime: string;
  status: "completed" | "incident" | "pending";
  incidentReason?: string;
  signatureCaptured: boolean;
}

export type CustomerPaymentMethod = "efectivo" | "banco" | "credito";

export interface DriverExpense {
  id: string;
  driverId: string;
  driverName: string;
  routeId?: string;
  routeName?: string;
  category: "combustible" | "peajes" | "parqueadero" | "mantenimiento" | "viaticos" | "otros";
  amount: number;
  description: string;
  receiptPhoto?: string; // base64 / data URL
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface DeliverySlot {
  id: string;
  dateKey: string;
  dayName: string;
  dateFormatted: string;
  status: "available" | "limited" | "unavailable";
  statusText: string;
  note: string;
}

export interface RepeatOrderValidationResult {
  canRepeat: boolean;
  hasPriceChanges: boolean;
  hasStockIssues: boolean;
  warnings: string[];
  adjustedItems: {
    productId: string;
    productName: string;
    requestedQty: number;
    availableQty: number;
    oldPrice: number;
    currentPrice: number;
    finalQty: number;
    priceChanged: boolean;
    stockLimited: boolean;
  }[];
}

export interface PickingSummaryItem {
  productId: string;
  brand?: BrandType;
  sku: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  totalKg: number;
  realTotalKg?: number;
  orderCount: number;
  orderNumbers: string[];
}
