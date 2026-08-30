import { Order, InventoryItem, Customer, DeliveryRoute, DriverExpense } from "@/types";
import { INITIAL_ORDERS, INITIAL_INVENTORY, INITIAL_CUSTOMERS, INITIAL_ROUTES } from "./mockData";

export const INITIAL_EXPENSES: DriverExpense[] = [
  {
    id: "exp-001",
    driverId: "drv-carlos",
    driverName: "Carlos Pérez",
    routeId: "route-norte-01",
    routeName: "Ruta 1 - Zona Norte",
    category: "combustible",
    amount: 185700,
    description: "Tanqueada 45.3 L ACPM - Estación de Servicio El Sol",
    receiptPhoto: "/images/recibo-acpm.jpg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-002",
    driverId: "drv-carlos",
    driverName: "Carlos Pérez",
    routeId: "route-norte-01",
    routeName: "Ruta 1 - Zona Norte",
    category: "peajes",
    amount: 18500,
    description: "Peaje Andes Autopista Norte (Entrada Bogotá)",
    receiptPhoto: "/images/recibo-peaje.jpg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-003",
    driverId: "drv-andres",
    driverName: "Andrés Roa",
    routeId: "route-occidente-03",
    routeName: "Ruta 3 - Occidente",
    category: "mantenimiento",
    amount: 95000,
    description: "Cambio de bombillo halógeno y calibración de neumáticos furgón",
    createdAt: new Date().toISOString(),
  },
];

// Global server state singleton in Node runtime
declare global {
  // eslint-disable-next-line no-var
  var __GLOBAL_PORCOB2B_STATE: {
    orders: Order[];
    inventory: InventoryItem[];
    customers: Customer[];
    routes: DeliveryRoute[];
    expenses: DriverExpense[];
    lastUpdated: number;
  } | undefined;
}

const getInitialState = () => ({
  orders: [...INITIAL_ORDERS],
  inventory: [...INITIAL_INVENTORY],
  customers: [...INITIAL_CUSTOMERS],
  routes: [...INITIAL_ROUTES],
  expenses: [...INITIAL_EXPENSES],
  lastUpdated: Date.now(),
});

export const getServerState = () => {
  if (!global.__GLOBAL_PORCOB2B_STATE) {
    global.__GLOBAL_PORCOB2B_STATE = getInitialState();
  }
  return global.__GLOBAL_PORCOB2B_STATE;
};

export const updateServerState = (updates: {
  orders?: Order[];
  inventory?: InventoryItem[];
  customers?: Customer[];
  routes?: DeliveryRoute[];
  expenses?: DriverExpense[];
}) => {
  const current = getServerState();
  if (updates.orders) current.orders = updates.orders;
  if (updates.inventory) current.inventory = updates.inventory;
  if (updates.customers) current.customers = updates.customers;
  if (updates.routes) current.routes = updates.routes;
  if (updates.expenses) current.expenses = updates.expenses;
  current.lastUpdated = Date.now();
  return current;
};

export const resetServerState = () => {
  global.__GLOBAL_PORCOB2B_STATE = getInitialState();
  return global.__GLOBAL_PORCOB2B_STATE;
};
