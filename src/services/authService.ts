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

export const ADMIN_USERS: (AdminUserProfile & { passwordHash: string })[] = [
  {
    id: "adm-01",
    username: "admin",
    name: "Sebastián (Gerencia General)",
    email: "gerencia@jddistribuidora.com",
    role: "admin",
    roleTitle: "Administrador General & Gerencia",
    avatar: "👑",
    passwordHash: "admin2026",
  },
  {
    id: "adm-02",
    username: "comercial",
    name: "Dirección Comercial & Facturación",
    email: "facturacion@jddistribuidora.com",
    role: "comercial",
    roleTitle: "Jefe de Facturación & Cartera",
    avatar: "📊",
    passwordHash: "jd2026",
  },
];

export class AdminAuthService {
  static getCurrentSession(): AdminUserProfile | null {
    if (typeof window === "undefined") return ADMIN_USERS[0];
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

  static login(usernameOrEmail: string, passwordInput: string): { success: boolean; user?: AdminUserProfile; error?: string } {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    const matchedUser = ADMIN_USERS.find(
      (u) =>
        (u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser) &&
        u.passwordHash === cleanPass
    );

    if (matchedUser) {
      const { passwordHash, ...safeProfile } = matchedUser;
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(safeProfile));
      }
      return { success: true, user: safeProfile };
    }

    return { success: false, error: "Usuario, correo o contraseña incorrectos" };
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
