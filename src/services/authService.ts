export interface AdminUserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "gerencia" | "comercial";
  roleTitle: string;
  avatar: string;
}

const ADMIN_AUTH_KEY = "jd_admin_authenticated_session_v1";

export const ADMIN_USERS: (AdminUserProfile & { passwordHash: string; validPasswords: string[] })[] = [
  {
    id: "dir-01",
    username: "direccion",
    name: "Dirección",
    email: "direccion@jddistribuidora.com",
    role: "admin",
    roleTitle: "Dirección General & Administración",
    avatar: "🏢",
    passwordHash: "direccion2026",
    validPasswords: ["direccion2026", "direccion", "admin2026", "jd2026", "123456"],
  },
];

export class AdminAuthService {
  static getCurrentSession(): AdminUserProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(ADMIN_AUTH_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading admin session:", e);
    }
    return null;
  }

  static login(passwordInput: string, usernameOrEmail?: string): { success: boolean; user?: AdminUserProfile; error?: string } {
    const cleanPass = passwordInput.trim();
    const targetUser = ADMIN_USERS[0];

    const isValid =
      targetUser.passwordHash === cleanPass ||
      targetUser.validPasswords.includes(cleanPass);

    if (isValid) {
      const { passwordHash, validPasswords, ...safeProfile } = targetUser;
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(safeProfile));
      }
      return { success: true, user: safeProfile };
    }

    return { success: false, error: "Contraseña incorrecta. Verifique la clave de Dirección." };
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }
}

// ==========================================
// AUTENTICACIÓN OPERATIVA: OPERADOR vs DOMICILIARIO
// ==========================================
export interface OperationsUserProfile {
  id: string;
  role: "operador" | "domiciliario";
  name: string;
  roleTitle: string;
  avatar: string;
  description: string;
}

const OPERATIONS_AUTH_KEY = "jd_operations_authenticated_session_v1";

export const OPERATIONS_USERS: (OperationsUserProfile & {
  passwordHash: string;
  validPasswords: string[];
})[] = [
  {
    id: "operador-01",
    role: "operador",
    name: "Operador de Planta & Bodega",
    roleTitle: "Control de Cargas, Báscula e Inventario",
    avatar: "👷",
    description: "Alistamiento de pedidos, pesaje en báscula digital, precintos INVIMA, inventario en frío y verificación de cargas a furgones",
    passwordHash: "operador2026",
    validPasswords: ["operador2026", "operador", "planta2026", "bodega2026", "planta", "bodega", "123456"],
  },
  {
    id: "domiciliario-01",
    role: "domiciliario",
    name: "Domiciliario / Conductor de Furgón",
    roleTitle: "Rutas GPS, Entregas y Recaudo",
    avatar: "🚚",
    description: "Navegación GPS por paradas, entrega con firma y foto de factura, control de canastillas, arqueo de caja y reporte de gastos",
    passwordHash: "domiciliario2026",
    validPasswords: ["domiciliario2026", "domiciliario", "conductor2026", "chofer2026", "conductor", "chofer", "123456"],
  },
];

export class OperationsAuthService {
  static getCurrentSession(): OperationsUserProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(OPERATIONS_AUTH_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading operations session:", e);
    }
    return null;
  }

  static login(
    role: "operador" | "domiciliario",
    passwordInput: string
  ): { success: boolean; user?: OperationsUserProfile; error?: string } {
    const cleanPass = passwordInput.trim();
    const targetUser = OPERATIONS_USERS.find((u) => u.role === role);

    if (!targetUser) {
      return { success: false, error: "Perfil de operación no encontrado." };
    }

    const isValid =
      targetUser.passwordHash === cleanPass ||
      targetUser.validPasswords.includes(cleanPass.toLowerCase());

    if (isValid) {
      const { passwordHash, validPasswords, ...safeProfile } = targetUser;
      if (typeof window !== "undefined") {
        localStorage.setItem(OPERATIONS_AUTH_KEY, JSON.stringify(safeProfile));
      }
      return { success: true, user: safeProfile };
    }

    return {
      success: false,
      error: `Contraseña incorrecta para ${targetUser.name}.`,
    };
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(OPERATIONS_AUTH_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }
}
