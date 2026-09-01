# Plan de Auditoría Integral: JD Distribuidora & Gourmet Ahumados

## 1. Objetivos de la Auditoría
Evaluar de forma rigurosa y exhaustiva el ecosistema tecnológico de PorcoB2B (JD Distribuidora y Gourmet Ahumados), cubriendo los 3 pilares operativos:
1. **Administración (`/admin`)**: Seguridad, control de planta, telemetría, facturación POS, despacho, inventario y supervisión.
2. **Operación en Ruta (`/operacion`)**: App de cabina para furgones, despacho, entregas, firma táctil, registro de canastillas, arqueo y sincronización offline/PWA.
3. **Portal de Ventas B2B / Clientes (`/` y `/pedidos/[id]`)**: Experiencia de compra, catálogos duales, recurrencia en 1-clic, integración WhatsApp y rastreo satelital.
4. **Capa Técnica, Arquitectura y Seguridad**: Compilación limpia en Next.js 14 / TypeScript (`npm run build`), disponibilidad de 21 rutas con status 200, soporte PWA (manifest, service worker), persistencia en localStorage/BroadcastChannel y endpoint `/api/sync`.

---

## 2. Descomposición de Hitos y Tareas

### Hito 1: Auditoría Técnica, Build, Arquitectura & Seguridad
- **Alcance**:
  - Verificación y ejecución de `npm run build` sin errores TypeScript ni de empaquetado.
  - Comprobación de las 21 rutas del sistema (código 200).
  - Auditoría de PWA: `manifest.json`, `sw.js`, registro de Service Worker y funcionamiento offline.
  - Mecanismos de persistencia y sincronización: `localStorage`, `BroadcastChannel`, `/api/sync`.
  - Seguridad básica: manejo de claves (PIN 9401, contraseña direccion2026), sanitización y protección de datos.
- **Responsable delegado**: Explorer Técnico / Worker de Diagnóstico.

### Hito 2: Auditoría del Módulo de Administración (`/admin`)
- **Alcance**:
  - Login Dirección (`direccion2026`).
  - Báscula manual y pesaje de producto crudo/ahumado.
  - Precintos INVIMA y control de trazabilidad.
  - Telemetría en tiempo real (temperatura de frío 1.8°C, alertas).
  - Módulo POS (`/admin/facturacion`): facturación rápida, cobros, cuadre.
  - Devoluciones y Reintegros de producto.
  - Movimientos de stock y kardex en frío.
  - Módulos de Clientes, Pedidos y Rutas de despacho.
  - Bloqueo Remoto de furgón/operación (PIN 9401).
- **Responsable delegado**: Explorer de Administración / Reviewer Funcional.

### Hito 3: Auditoría de la App de Operación (`/operacion`)
- **Alcance**:
  - Experiencia en cabina móvil (UI táctil, ergonomía de conductor).
  - Integración GPS Google Maps / Waze con recálculo dinámico de trayecto.
  - Modal de entrega: captura/foto de remisión, formas de pago (Efectivo, QR Bancolombia/Nequi, Crédito B2B).
  - Manejo de devoluciones parciales y totales con recálculo en tiempo real del saldo a cobrar.
  - Control de canastillas JD (dejadas vs recogidas por cliente).
  - Firma táctil digital del receptor.
  - Arqueo de ruta de furgón y registro de gastos operativos (combustible, peajes, imprevistos).
- **Responsable delegado**: Explorer de Operaciones / Reviewer de Ruta.

### Hito 4: Auditoría del Portal de Ventas (`/` y `/pedidos/[id]`)
- **Alcance**:
  - Catálogos segmentados: JD Distribuidora (Crudos / Cortes) vs Gourmet Ahumados (Costillas, Tocinetas, etc.).
  - Selector de modo: Cliente Nuevo vs Recurrente.
  - Botón "Repetir Pedido en 1 Clic".
  - Precios por kilo y consulta de stock en frío.
  - Integración de pedidos a WhatsApp (+57 323 321 8831).
  - Vista de seguimiento satelital del pedido (`/pedidos/[id]`).
- **Responsable delegado**: Explorer de Ventas / Reviewer UX.

### Hito 5: Síntesis, Matriz de Calidad (0-100) e Informe Ejecutivo
- **Alcance**:
  - Consolidación de todos los reportes de auditoría.
  - Matriz de puntuación (0 a 100) por módulo y general.
  - Clasificación de hallazgos por severidad: Crítico, Medio, Menor, Oportunidad de Optimización.
  - Recomendaciones prioritarias para planta y furgones.
  - Redacción del reporte final ejecutivo y `handoff.md`.
