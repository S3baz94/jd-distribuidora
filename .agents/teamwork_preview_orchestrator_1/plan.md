# Plan de Auditoría Integral: JD Distribuidora & Gourmet Ahumados

## Objetivos
Realizar la auditoría técnica, funcional, de seguridad, arquitectura y UX de las tres herramientas del ecosistema:
1. **Administración (`/admin`)**
2. **Operación (`/operacion`)**
3. **Ventas (`/`)**
4. **Infraestructura Técnica, PWA, Seguridad y Sincronización**
5. **Generación de Matriz de Calidad e Informe Ejecutivo**

---

## Fases del Plan

### Fase 1: Despacho y Exploración Técnica & Funcional Paralela
- **Explorer 1 (Admin & Seguridad)**:
  - Verificar login con perfil Dirección (`direccion2026`).
  - Evaluar Centro de Control & Despacho (Báscula manual, Precintos INVIMA, Telemetría 1.8°C).
  - Evaluar Facturación & POS (`/admin/facturacion`): emisión por kilos, consecutivo, cálculo de vueltas, crédito a 30 días, formatos de impresión (Tirilla 80mm y Carta), exportación CSV.
  - Evaluar `/admin/movimientos`, `/admin/inventario`, `/admin/clientes`, `/admin/pedidos`.
  - Evaluar sistema de bloqueo remoto (`LicenseLockScreen`) y PIN `9401`.
- **Explorer 2 (Operación & Cabina Chofer)**:
  - Evaluar app móvil táctil de cabina (`/operacion`).
  - Navegación GPS (Google Maps y Waze) con recálculo de paradas restantes.
  - Modal de entrega: captura fotográfica de facturas, medios de pago (efectivo en sobre, Banco/QR, Factura a crédito), balance de canastillas JD (dejadas vs recogidas), firma digital táctil.
  - Arqueo de caja de ruta y reporte fotográfico de gastos operativos (combustible y peajes).
- **Explorer 3 (Ventas & PWA & Arquitectura)**:
  - Evaluar portal de clientes (`/`), catálogos duales (JD Distribuidora vs Gourmet Ahumados).
  - Repetir Pedido en 1 Clic, catálogo por kilo, stock en frío, carrito.
  - Seguimiento satelital en tiempo real (`/pedidos/[id]`).
  - PWA (`manifest.json`, `sw.js`, instalación nativa en Windows Desktop).
  - Integración WhatsApp (`+57 323 321 8831`).
  - Sincronización (`localStorage`, `/api/sync`) y estado global.
- **Worker 1 (Verificación Técnica de Compilación & Rutas)**:
  - Ejecutar `npm run build` para verificar compilación limpia sin errores de TS/Next.js.
  - Probar las 21 rutas de la aplicación y verificar códigos de estado HTTP 200 y ausencia de errores.

### Fase 2: Auditoría Forense de Integridad y Verificación Cruzada
- **Auditor Forense (`teamwork_preview_auditor`)**:
  - Validar autenticidad de la implementación (sin mocks vacíos, sin hardcoding indebido).
  - Validar lógica de bloqueo remoto `LicenseLockScreen` y persistencia.
  - Validar cálculos matemáticos de facturación, peso, totales y cambio.
  - Validar persistencia de firmas, fotos y sincronización.

### Fase 3: Síntesis, Matriz de Calidad e Informe Ejecutivo
- Consolidar hallazgos clasificados por severidad (Crítico, Medio, Menor, Optimización).
- Calcular puntaje de calidad (0 a 100) para cada una de las 3 herramientas.
- Redactar recomendaciones técnicas y operativas para el despliegue final.
- Generar `handoff.md` e informe final.
