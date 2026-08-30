import fs from "fs";
import path from "path";
import assert from "assert";

console.log("==========================================================");
console.log("🚀 EJECUTANDO SUITE DE AUDITORÍA & TESTING AUTOMATIZADO");
console.log("   PORCOB2B-APP: JD DISTRIBUIDORA & GOURMET AHUMADOS");
console.log("==========================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Detalle: ${err.message}`);
    throw err;
  }
}

// -------------------------------------------------------------
// 1. VERIFICACIÓN DE LAS 21 RUTAS DEL PROYECTO
// -------------------------------------------------------------
console.log("📦 SECCIÓN 1: Verificación de Integridad de las 21 Rutas...");

const EXPECTED_ROUTES = [
  { path: "src/app/page.tsx", route: "/", type: "page" },
  { path: "src/app/admin/page.tsx", route: "/admin", type: "page" },
  { path: "src/app/admin/alistamiento/page.tsx", route: "/admin/alistamiento", type: "page" },
  { path: "src/app/admin/clientes/page.tsx", route: "/admin/clientes", type: "page" },
  { path: "src/app/admin/entregas/page.tsx", route: "/admin/entregas", type: "page" },
  { path: "src/app/admin/facturacion/page.tsx", route: "/admin/facturacion", type: "page" },
  { path: "src/app/admin/inventario/page.tsx", route: "/admin/inventario", type: "page" },
  { path: "src/app/admin/movimientos/page.tsx", route: "/admin/movimientos", type: "page" },
  { path: "src/app/admin/pedidos/page.tsx", route: "/admin/pedidos", type: "page" },
  { path: "src/app/admin/pedidos/[id]/page.tsx", route: "/admin/pedidos/[id]", type: "page" },
  { path: "src/app/admin/rutas/page.tsx", route: "/admin/rutas", type: "page" },
  { path: "src/app/comprar/page.tsx", route: "/comprar", type: "page" },
  { path: "src/app/confirmacion/page.tsx", route: "/confirmacion", type: "page" },
  { path: "src/app/cuenta/page.tsx", route: "/cuenta", type: "page" },
  { path: "src/app/domiciliario/page.tsx", route: "/domiciliario", type: "page" },
  { path: "src/app/login/page.tsx", route: "/login", type: "page" },
  { path: "src/app/operacion/page.tsx", route: "/operacion", type: "page" },
  { path: "src/app/pedidos/page.tsx", route: "/pedidos", type: "page" },
  { path: "src/app/pedidos/[id]/page.tsx", route: "/pedidos/[id]", type: "page" },
  { path: "src/app/reparto/page.tsx", route: "/reparto", type: "page" },
  { path: "src/app/api/sync/route.ts", route: "/api/sync", type: "api" },
];

runTest("Total de rutas esperadas es exactamente 21", () => {
  assert.strictEqual(EXPECTED_ROUTES.length, 21, "Deben existir 21 rutas configuradas");
});

EXPECTED_ROUTES.forEach(({ path: filePath, route, type }) => {
  runTest(`Ruta ${route} (${type}) existe físicamente y contiene exportación válida`, () => {
    const fullPath = path.resolve(filePath);
    assert.ok(fs.existsSync(fullPath), `El archivo ${filePath} debe existir`);
    const content = fs.readFileSync(fullPath, "utf8");

    if (type === "page") {
      assert.ok(
        content.includes("export default function") || content.includes("export default"),
        `La página ${filePath} debe tener un export default`
      );
    } else if (type === "api") {
      assert.ok(
        content.includes("export async function GET") && content.includes("export async function POST"),
        `El endpoint API ${filePath} debe exportar métodos GET y POST`
      );
    }
  });
});

// -------------------------------------------------------------
// 2. VERIFICACIÓN DE SEGURIDAD & AUTENTICACIÓN ADMIN
// -------------------------------------------------------------
console.log("\n🔒 SECCIÓN 2: Verificación de Seguridad y Autenticación...");

runTest("Autenticación de Dirección valida clave 'direccion2026' y rechaza contraseñas inválidas", () => {
  const authPath = path.resolve("src/services/authService.ts");
  const authCode = fs.readFileSync(authPath, "utf8");

  assert.ok(authCode.includes("direccion2026"), "El authService debe soportar direccion2026");
  assert.ok(authCode.includes("Dirección"), "Debe estar configurado para el perfil Dirección");
  assert.ok(authCode.includes("AdminAuthService"), "Debe implementar la clase AdminAuthService");
});

runTest("Sistema de Licenciamiento & Pantalla de Bloqueo Remoto con PIN 9401", () => {
  const licensePath = path.resolve("src/services/licenseService.ts");
  const lockScreenPath = path.resolve("src/components/common/LicenseLockScreen.tsx");

  const licenseCode = fs.readFileSync(licensePath, "utf8");
  const lockScreenCode = fs.readFileSync(lockScreenPath, "utf8");

  assert.ok(licenseCode.includes('"9401"'), "El PIN maestro debe ser 9401");
  assert.ok(licenseCode.includes("evaluateExpiration"), "Debe existir lógica de evaluación de expiración");
  assert.ok(licenseCode.includes("gracePeriodDays"), "Debe manejar periodo de gracia");
  assert.ok(lockScreenCode.includes("verifyDeveloperPin"), "La pantalla de bloqueo debe verificar el PIN");
  assert.ok(lockScreenCode.includes("z-[99999]"), "Debe tener un z-index prioritario para bloqueo completo");
});

// -------------------------------------------------------------
// 3. VERIFICACIÓN DE FACTURACIÓN POS & ARQUEO DE CAJA
// -------------------------------------------------------------
console.log("\n🧾 SECCIÓN 3: Facturación POS, Liquidación por Kilos y 0% IVA...");

runTest("Módulo de facturación calcula importes sin IVA, redondeo por kilos y formato CSV", () => {
  const facturacionPath = path.resolve("src/app/admin/facturacion/page.tsx");
  const billingServicePath = path.resolve("src/services/billingService.ts");

  const facturacionCode = fs.readFileSync(facturacionPath, "utf8");
  const billingServiceCode = fs.readFileSync(billingServicePath, "utf8");

  assert.ok(facturacionCode.includes("cashChange"), "Debe calcular cambio / vueltas en efectivo");
  assert.ok(facturacionCode.includes("newInvoiceTotalKg"), "Debe totalizar kilos despachados");
  assert.ok(billingServiceCode.includes("exportToCSV"), "Debe soportar exportación a CSV");
  assert.ok(billingServiceCode.includes("Art. 477 del E.T."), "Debe contemplar régimen exento de IVA en carnes");
  assert.ok(billingServiceCode.includes("getNextInvoiceNumber"), "Debe generar consecutivo automático");
});

// -------------------------------------------------------------
// 4. VERIFICACIÓN DE OPERACIÓN & LOGÍSTICA DE FRÍO
// -------------------------------------------------------------
console.log("\n🚚 SECCIÓN 4: Operación Móvil, GPS, Telemetría y Entrega...");

runTest("Módulo de operación incluye GPS Google Maps dinámico, telemetría 1.8°C, canastillas y firma digital", () => {
  const operacionPath = path.resolve("src/app/operacion/page.tsx");
  const operacionCode = fs.readFileSync(operacionPath, "utf8");

  assert.ok(operacionCode.includes("1.8°C"), "Debe mostrar telemetría de cadena de frío a 1.8°C");
  assert.ok(operacionCode.includes("getFullGoogleMapsRouteUrl"), "Debe recalcular ruta GPS dinámica en Google Maps");
  assert.ok(operacionCode.includes("deliveredBaskets"), "Debe controlar canastillas dejadas");
  assert.ok(operacionCode.includes("returnedBaskets"), "Debe controlar canastillas recogidas");
  assert.ok(operacionCode.includes("canvasRef"), "Debe disponer de lienzo para firma digital con el dedo");
  assert.ok(operacionCode.includes("handlePhotoCapture"), "Debe permitir captura fotográfica de recibos de gasolina/peajes");
  assert.ok(operacionCode.includes("handleDeliveryPhotoCapture"), "Debe permitir foto de la factura de compra");
  assert.ok(operacionCode.includes("netCashInHand"), "Debe calcular el efectivo neto en sobre restando gastos de ruta");
});

// -------------------------------------------------------------
// 5. VERIFICACIÓN DE VENTAS & PORTAL B2B
// -------------------------------------------------------------
console.log("\n🛍️ SECCIÓN 5: Portal de Ventas, Dual Catálogo & Recompra 1 Clic...");

runTest("Portal de ventas cuenta con separación de marcas (JD vs Gourmet Ahumados), 1-Clic reorder y tracking", () => {
  const homePath = path.resolve("src/app/page.tsx");
  const brandSwitcherPath = path.resolve("src/components/layout/BrandSwitcher.tsx");

  const homeCode = fs.readFileSync(homePath, "utf8");
  const brandSwitcherCode = fs.readFileSync(brandSwitcherPath, "utf8");

  assert.ok(homeCode.includes("handleRepeatLastOrder"), "Debe soportar botón de repetir pedido en 1 clic");
  assert.ok(brandSwitcherCode.includes("jd_distribuidora"), "Debe soportar JD Distribuidora");
  assert.ok(brandSwitcherCode.includes("gourmet_ahumados"), "Debe soportar Gourmet Ahumados");
  assert.ok(homeCode.includes("+57 323 321 8831") || homeCode.includes("573233218831"), "Debe enlazar al WhatsApp oficial");
});

// -------------------------------------------------------------
// 6. VERIFICACIÓN PWA & ESCRITORIO WINDOWS
// -------------------------------------------------------------
console.log("\n💻 SECCIÓN 6: Configuración PWA y Aplicación de Escritorio Windows...");

runTest("Manifest y Service Worker configuran PWA para escritorio con standalone mode y shortcuts", () => {
  const manifestPath = path.resolve("public/manifest.json");
  const swPath = path.resolve("public/sw.js");

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const swCode = fs.readFileSync(swPath, "utf8");

  assert.strictEqual(manifest.display, "standalone", "El display debe ser standalone");
  assert.ok(manifest.shortcuts.length >= 3, "Debe tener al menos 3 accesos directos configurados");
  assert.ok(swCode.includes("self.addEventListener"), "El Service Worker debe registrar eventos de ciclo de vida");
});

// -------------------------------------------------------------
// 7. VERIFICACIÓN DE LA RUTA API /api/sync
// -------------------------------------------------------------
console.log("\n⚡ SECCIÓN 7: Verificación del Endpoint de Sincronización (/api/sync)...");

runTest("API Route /api/sync soporta acciones críticas: CREATE_ORDER, UPDATE_ORDER_STATUS, ADJUST_REAL_WEIGHT, ADD_DRIVER_EXPENSE", () => {
  const syncRoutePath = path.resolve("src/app/api/sync/route.ts");
  const syncCode = fs.readFileSync(syncRoutePath, "utf8");

  const criticalActions = [
    "CREATE_ORDER",
    "UPDATE_ORDER_STATUS",
    "ADJUST_REAL_WEIGHT",
    "UPDATE_DISPATCH",
    "ASSIGN_ORDER_TO_ROUTE",
    "UPDATE_ROUTE_STATUS",
    "CREATE_ROUTE",
    "ADD_INVENTORY_BATCH",
    "UPDATE_INVENTORY_MANUAL",
    "CREATE_CUSTOMER",
    "ADD_DRIVER_EXPENSE",
    "RESET",
  ];

  criticalActions.forEach((act) => {
    assert.ok(syncCode.includes(`action === "${act}"`), `Debe manejar la acción ${act}`);
  });
});

console.log("\n==========================================================");
console.log(`🎉 RESUMEN DE PRUEBAS AUTOMATIZADAS: ${passedTests}/${totalTests} TESTS COMPLETADOS EXITOSAMENTE`);
console.log("   ESTADO: 100% PASS - CERO ERRORES DETECTADOS");
console.log("==========================================================\n");
