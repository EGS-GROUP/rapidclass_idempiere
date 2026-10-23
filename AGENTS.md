# 🤖 AGENTS.md — Hamburger Rapid / Tasty Bites & iDempiere ERP

Documento maestro de arquitectura, especificaciones técnicas, convenciones operativas y guía de desarrollo para **Agentes de Inteligencia Artificial** y desarrolladores del proyecto **Hamburger Rapid / Tasty Bites**.

---

## 🎯 1. Visión General del Proyecto

**Hamburger Rapid / Tasty Bites** es una plataforma omnicanal de comercio gastronómico gourmet y gestión de pedidos integrada con el ERP corporativo **iDempiere** mediante su API REST v1. 

El repositorio está estructurado como un **monorepo desacoplado** de alto rendimiento con 3 capas front-end especializadas y un servidor backend centralizado:

```
                                 ┌────────────────────────────────────────┐
                                 │       iDempiere ERP (REST API v1)      │
                                 │    https://test.idempiere.org:443      │
                                 └───────────────────▲────────────────────┘
                                                     │ (Tokens, Roles, Orgs, C_Order)
                                                     │
 ┌────────────────────────┐      ┌───────────────────┴────────────────────┐      ┌────────────────────────┐
 │   1. Capa E-commerce   │      │     3. Panel de Administración         │      │    2. Capa PWA Pedidos │
 │    (Portal Clientes)   │      │        (Backoffice & ERP Sync)         │      │  (Preventa / Terreno)  │
 │      Astro 4 / JS      │      │          React 18 + Vite               │      │     React 18 + Vite    │
 │       Puerto 4321      │      │            Puerto 5173                 │      │       Puerto 5174      │
 └───────────┬────────────┘      └───────────────────┬────────────────────┘      └───────────┬────────────┘
             │                                       │                                       │
             └───────────────────────┬───────────────┴───────────────────────────────────────┘
                                     │ Artefactos compilados /dist
                                     ▼
                        ┌───────────────────────────────┐
                        │     Backend Node.js/Express   │
                        │    (Servidor Unificado :3000) │
                        │  - /       -> E-commerce      │
                        │  - /app    -> PWA Mobile      │
                        │  - /admin  -> Panel Admin     │
                        │  - /api/*  -> REST API & DB   │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │   SQLite DB (better-sqlite3)  │
                        │   (Datamart Local & Sync ERP) │
                        └───────────────────────────────┘
```

---

## 🏗️ 2. Arquitectura de las 3 Capas

### Capa 1: Landing E-commerce (`apps/ecommerce`)
- **Tecnología**: [Astro 4.16](https://astro.build/) (Static Site Generation con interactividad Vanilla JS).
- **Ruta en producción**: `http://localhost:3000/` | **Dev server**: `http://localhost:4321/`
- **Diseño visual**: Replicación fiel de la estética *Tasty Bites*:
  - **Hero Section**: Fondo oscuro gourmet (`#141210`) con iluminación ámbar cálida, tipografía manuscrita `Food Made with Love ♡` (`Caveat`), doodles animados (`Best Burger in Town`), foto de hamburguesa gigante con papas y dip sobre tabla de madera, y tres insignias de valor (*Fresh Ingredients*, *Fast Delivery*, *Hygienic & Safe*).
  - **Carrusel de Categorías ("Something for Every Craving")**: 7 selectores circulares con fotografía (*Burgers, Loaded Fries, Wraps, Sides, Beverages, Combos, Desserts*).
  - **Menú de Especialidades ("Popular Menu")**: Tarjetas réplica con insignias rojas/doradas:
    - *Margherita Pizza* ($12.99 / ₹ 249) con queso fundido estirado.
    - *Classic Burger* ($9.99 / ₹ 199).
    - *French Fries* ($4.99 / ₹ 129).
    - *Chocolate Shake* ($5.99 / ₹ 149).
  - **Catálogo de 10 Hamburguesas de Autor**: Conservación integral de las 10 hamburguesas de la franquicia (*Rey de las Burgers, Burger Real Clásica, Doble Impacto, Trufa & Portobello, Crispy Smokehouse, etc.*) con filtros por categoría (*Especiales, Clásicas, Gourmet, Pollo, Plant-Based*).
  - **Banners Divididos (Side-by-Side)**: `COMBO IT BETTER` (Dark) y `SWEET ENDINGS` (Cream, doodle `Happiness Comes in Scoops ♡`).
  - **Pilares de Confianza (4 Pilares)**: *Freshly Made, Quality Ingredients, Great Ambience, Food for Everyone*.
  - **Banner Inferior ("Crave It? We'll Deliver It!")**: Banner curvo con mesa servida, pizza, mojito de menta y doodle `Good Food ♡ Good Vibes! ✧ ✦`.
  - **Carrito Deslizante (Slide-In Cart Drawer)**: Panel lateral interactivo con cálculo de subtotal, delivery gratuito, control de cantidades (`+`/`-`), badge numérico reactivo y confirmación de compra.
  - **Modal de Detalle Nutricional**: Desglose de ingredientes, tiempo de preparación, calorías y maridaje de autor.
  - **Búsqueda Dinámica**: Búsqueda en vivo de platillos e ingredientes.

### Capa 2: PWA de Pedidos Móvil (`apps/pwa`)
- **Tecnología**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/).
- **Ruta en producción**: `http://localhost:3000/app`
- **Objetivo**: Aplicación móvil orientada a vendedores en terreno (preventa) y clientes finales:
  - Navegación por 4 pestañas: **Menú**, **Ofertas**, **Órdenes**, **Perfil**.
  - Simulador de carrito, personalizador de ingredientes y tracking de pedidos en tiempo real.
  - Arquitectura preparada para operar en modo offline-first con sincronización posterior.

### Capa 3: Panel de Administración & Control ERP (`apps/admin`)
- **Tecnología**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/).
- **Ruta en producción**: `http://localhost:3000/admin` | **Dev server**: `http://localhost:5173/admin/`
- **Módulo de Autenticación Blindado & Control de Acceso (`LoginModal.jsx`)**:
  - **Blindaje contra Atacantes (Zero Backend Leak)**: Oculta la dirección del servidor y los parámetros de conexión de la pantalla pública de login; elimina cualquier rastro del backend utilizado (sin exponer nombres de servidores ni botones de demo).
  - **Interfaz Unificada & Ejecutiva**: Solo solicita Usuario y Contraseña corporativos.
  - **Doble Comportamiento Configurable**:
    - *Modo 1 (Directo / 1 Paso)*: Si está configurado en el perfil, autentica directamente usando los parámetros corporativos guardados de forma transparente.
    - *Modo 2 (Asistido Multi-Tenant)*: Si está activado en el perfil, al validar usuario y contraseña despliega selectores dinámicos en cascada (Tenant ➔ Rol ➔ Organización ➔ Almacén).
  - **Servicio Desacoplado (`apps/admin/src/services/authService.js`)**: Diseñado como módulo portátil para ser reutilizado en la PWA de pedidos. Soporta:
    - `loginDirect(...)`: Envío directo en 1 paso con parámetros normalizados.
    - `loginStep1(...)`: Validación previa de usuario y contraseña con emisión de token temporal.
    - `fetchRoles(...)`, `fetchOrganizations(...)`, `fetchWarehouses(...)`: Consultas en cascada para multitenant dinámico.
    - `getErpConfig()`, `saveErpConfig(...)`: Persistencia local de servidor, proxy CORS y parámetros de contexto.
    - `saveSession(...)`, `getSession(...)`, `logout(...)`: Persistencia de sesión en `sessionStorage` y `localStorage`.
  - **Sección de Perfil & Conexión Corporativa (`ProfileSection.jsx`)**:
    - Pestaña dedicada en el panel para administradores autenticados.
    - Asignación segura y privada de la URL del Servidor (`serverUrl`), con soporte de Proxy CORS configurable y botón de diagnóstico de conectividad (`ping / probe`).
    - Definición de parámetros predeterminados de acceso (Tenant ID, Rol ID, Org ID, Almacén ID, Idioma).
    - Conmutador checkbox para alternar entre Login Directo en 1 Paso o Modo Asistido Multi-Tenant.
  - **Guard de Protección (`AuthGuard.jsx`)**: Intercepta el acceso; si no hay token Bearer válido exige autenticación; si la sesión es válida, inyecta el contexto de trabajo y provee el botón de **Cerrar Sesión**.
- **Bandeja Central de Gestión de Pedidos & ERP (`OrdersManagement.jsx`)**:
  - Supervisión omnicanal de pedidos unificados.
  - Filtro por origen: 🔄 **Todos**, 📱 **PWA Preventa / Vendedores**, 🌐 **E-commerce Directo**.
  - Sincronización hacia iDempiere ERP: Botón **"🔄 Sincronizar ERP"** que procesa la orden y genera el número de documento oficial `C_Order`.
  - Visualizador de Payload JSON REST: Ventana modal con el cuerpo exacto para `POST /api/v1/models/c_order` contextualizado con el token Bearer activo.
- **Gestión de Menú & Telemetría**:
  - Control de stock y disponibilidad de hamburguesas en tiempo real.
  - Métricas de consumidores segmentados por tiers (Oro VIP, Plata Frecuente, Bronce Nuevo).
  - Telemetría de base de datos (MySQL vs Fallback In-Memory).

---

## 🔌 3. Integración con iDempiere REST API v1

Los endpoints validados y operativos contra `https://test.idempiere.org:443` son:

### 1. Autenticación Directa (1 Paso)
- **Endpoint**: `POST {baseUrl}/api/v1/auth/tokens`
- **Headers**:
  ```http
  Content-Type: application/json
  Accept: application/json
  ```
- **Payload**:
  ```json
  {
    "userName": "admin @ gardenworld.com",
    "password": "GardenAdmin",
    "parameters": {
      "clientId": 11,
      "roleId": 102,
      "organizationId": 11,
      "warehouseId": 103,
      "language": "en_US"
    }
  }
  ```
  *(Nota técnica: el DTO `LoginParameters` de iDempiere v1 requiere `"organizationId"` en vez de `"orgId"`)*.
- **Respuesta (200 OK)**:
  ```json
  {
    "userId": 101,
    "language": "en_US",
    "menuTreeId": 10,
    "token": "eyJraWQiOiJpZGVtcGllcmUiLCJhbGciOi...",
    "refresh_token": "eyJraWQiOiJpZGVtcGllcmUi..."
  }
  ```

### 2. Autenticación Asistida (2 Pasos - Multitenant)
- **Paso 1**: `POST /api/v1/auth/tokens` enviando solo `{ "userName": "...", "password": "..." }`.
  - Retorna `clients: [{ id, name }]` y un token temporal.
- **Paso 2 (Consultas en Cascada)**:
  - `GET /api/v1/auth/roles?client={clientId}` (con `Authorization: Bearer {tempToken}`)
  - `GET /api/v1/auth/organizations?client={clientId}&role={roleId}`
  - `GET /api/v1/auth/warehouses?client={clientId}&role={roleId}&organization={organizationId}`
- **Confirmación**: `POST /api/v1/auth/tokens` enviando los parámetros seleccionados para emitir el token definitivo.

### 3. Creación de Pedidos de Venta (`C_Order`)
- **Endpoint**: `POST {baseUrl}/api/v1/models/c_order`
- **Headers**:
  ```http
  Authorization: Bearer {token}
  Content-Type: application/json
  Accept: application/json
  ```
- **Payload estándar generado**:
  ```json
  {
    "documentAction": "CO",
    "standardDocType": "SO",
    "AD_Client_ID": 11,
    "AD_Org_ID": 11,
    "M_Warehouse_ID": 103,
    "C_BPartner_ID": 1000001,
    "C_PaymentTerm_ID": 105,
    "POReference": "ORD-2026-101",
    "Description": "[PWA PREVENTA] Pedido ID: ORD-2026-101 - Vendedor Zona Norte",
    "DateOrdered": "2026-10-21",
    "Lines": [
      {
        "Line": 10,
        "M_Product_ID": 1000,
        "Description": "Rey de las Burgers (Pack x10)",
        "QtyOrdered": 3,
        "PriceEntered": 140.00,
        "PriceActual": 140.00
      }
    ]
  }
  ```

---

## 📁 4. Estructura del Repositorio

```
rapidfood_idempiere/
├── apps/
│   ├── ecommerce/               # CAPA 1: E-COMMERCE (Astro 4)
│   │   ├── src/
│   │   │   ├── env.d.ts
│   │   │   └── pages/
│   │   │       └── index.astro  # Landing Tasty Bites completa + Carrito + Modal
│   │   ├── astro.config.mjs
│   │   └── package.json
│   │
│   ├── pwa/                     # CAPA 2: PWA PREVENTA (React 18 + Vite)
│   │   ├── src/                 # Vistas: Menú, Ofertas, Órdenes, Perfil
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   └── admin/                   # CAPA 3: PANEL ADMIN (React 18 + Vite)
│       ├── src/
│       │   ├── services/
│       │   │   └── authService.js         # Servicio reutilizable iDempiere REST
│       │   ├── components/
│       │   │   ├── AuthGuard.jsx          # Protección de rutas y contexto
│       │   │   ├── LoginModal.jsx         # Login 1 paso / 2 pasos asistido
│       │   │   └── OrdersManagement.jsx   # Bandeja central de pedidos & sync ERP
│       │   ├── App.jsx                    # Dashboard administrativo unificado
│       │   ├── main.jsx
│       │   └── index.css
│       ├── vite.config.js       # Base path: /admin/
│       └── package.json
│
├── server/                      # BACKEND UNIFICADO & ASSET HOSTING (Node/Express)
│   ├── src/
│   │   ├── app.js               # Rutas estáticas (/ , /app , /admin) y API
│   │   ├── db.js                # Driver MySQL + In-Memory Fallback
│   │   └── routes/
│   │       └── api.js           # Endpoints /api/health, /api/products, /api/metrics
│   ├── public/                  # Artefactos compilados servidos por Express
│   │   ├── ecommerce/
│   │   ├── pwa/
│   │   └── admin/
│   └── package.json
│
├── referencias/                 # Activos y mockups visuales del proyecto
├── AGENTS.md                    # Este documento maestro de instrucciones
├── README.md                    # Descripción general y comandos
├── Dockerfile                   # Configuración de despliegue contenerizado Dokploy
└── package.json                 # Scripts raíz del monorepo
```

---

## 🛠️ 5. Guía de Comandos y Flujo de Trabajo para Agentes

### Instalación de Dependencias
```bash
# Instalar dependencias en todas las capas
npm run install:all

# O por aplicación específica:
npm install --prefix apps/ecommerce
npm install --prefix apps/pwa
npm install --prefix apps/admin
npm install --prefix server
```

### Compilación y Sincronización
```bash
# Compilar todo y sincronizar a server/public
npm run build:all

# Compilaciones individuales:
npm run build:ecommerce
npm run build:pwa
npm run build:admin
```

### Ejecución de Servidores en Local

| Capa | Comando | URL de Acceso | Notas |
| :--- | :--- | :--- | :--- |
| **Plataforma Integral** | `npm start` (o `node server/src/app.js`) | `http://localhost:3000/` | Sirve E-commerce (`/`), PWA (`/app`), Admin (`/admin`) y API (`/api/*`) |
| **E-commerce Dev** | `npm run dev --prefix apps/ecommerce` | `http://localhost:4321/` | Astro con Hot Module Reloading |
| **Admin Dev** | `npx vite --port 5173` (en `apps/admin`) | `http://localhost:5173/admin/` | Vite con HMR para desarrollo ágil |
| **PWA Dev** | `npm run dev --prefix apps/pwa` | `http://localhost:5174/app/` | Vite dev para la capa móvil |

---

## 📜 6. Reglas Críticas para Agentes de IA

1. **Aislamiento de Capas**:
   - Cuando una instrucción indique modificar una capa específica (ej. *"Modifica el panel de administración"*), **NO MODIFICAR** las capas no solicitadas (E-commerce o PWA).
2. **Reutilización del Servicio de Autenticación**:
   - [`apps/admin/src/services/authService.js`](file:///d:/BDeveloper/CursoIAnoProg/rapidfood_idempiere/apps/admin/src/services/authService.js) es el módulo oficial de conexión con iDempiere REST. Si se requiere autenticación en la PWA, reutilizar o sincronizar este servicio en lugar de reescribir llamadas HTTP ad-hoc.
3. **Parámetros de iDempiere REST**:
   - Siempre enviar `organizationId` en el objeto `parameters` de autenticación hacia iDempiere v1 (el backend de iDempiere rechaza `orgId` en ese DTO con error 400).
4. **Manejo de CORS**:
   - Mantener el selector y soporte de Proxy CORS configurable para garantizar que los entornos de prueba contra servidores remotos o locales sin headers preflight funcionen sin bloqueo del navegador.
5. **Sincronización de Artefactos de Build**:
   - Al ejecutar `npm run build:all` o compilar una aplicación individual para probar en el servidor Node.js en `:3000`, verificar que los archivos de `dist/` se copien en `server/public/{ecommerce|pwa|admin}`.

---

## 🛰️ 7. Módulo de Seguimiento GPS en Tiempo Real & Ruteo Satelital

Módulo transversal omnicanal integrado en las 3 capas para la demostración de logística y entregas en Lima, Perú:

### Parámetros Geográficos Base
- **Punto Fijo (Almacén Central San Isidro)**: `-12.0969, -77.0354` (Av. Rivera Navarrete 501, San Isidro, Lima).
- **Límites Geográficos Estrictos (Perú)**: `[[-18.35, -81.33], [-0.03, -68.65]]`, `minZoom: 6`.
- **Mosaicos Cartográficos**: Carto Voyager (`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4pm2_1_200f6c4d689008428bc823c8`) con fallback a Carto Positron y OpenStreetMap.
- **Geocodificación**: Nominatim OSM con `countrycodes=pe` y fallback determinista en Lima Metropolitana (Miraflores, San Borja, Surco, Jesús María, Begonias, etc.).
- **Ruteo Vial**: OSRM (`/route/v1/driving/`) con polilínea en azul azure (`#0284c7`, 4px) y generación de ruta urbana simulada de alta fidelidad.

### Selector de Vehículos y Telemetría
- **🛵 Moto Reparto**: 45 km/h base, ETA ágil.
- **🚗 Auto Express**: 35 km/h base, ETA regular.
- **🚚 Camión Logístico**: 25 km/h base, mayor tiempo estimado.
- **Controles de Simulación**: Pausar/Reanudar, Reiniciar, multiplicadores `1x`, `2x`, `5x` para demos ágiles.
- **Métricas (`tabular-nums`)**: Distancia restante (km), tiempo regresivo (ETA MM:SS), velocidad (km/h) y barra de avance porcentual (0% a 100%).
- **Estado de Entrega**: Al completar el 100%, conmuta a `"¡Pedido Entregado con Éxito!"`.

### Puntos de Acceso en las 3 Capas
1. **E-commerce (`/`)**: Botón satelital con texto e indicador en vivo en el navbar (`#gpsNavTriggerBtn`) y modal interactivo automático al confirmar compra en el carrito.
2. **PWA Mobile (`/app`)**: Botón `"🗺️ Ver Seguimiento GPS Satelital en Vivo"` en cada orden activa de la pestaña *Órdenes*.
3. **Panel Admin (`/admin`)**: Botón `"🗺️ Ver GPS / Ruta"` en la bandeja central de pedidos omnicanal (`OrdersManagement.jsx`).
4. **Backend API (`/api/orders`, `/api/orders/:id/track`)**: Endpoints REST con datos de origen, destino y vehículo asignado.

---

## 📦 8. Sincronización de Productos iDempiere ERP & SQLite Datamart

Estrategia omnicanal de persistencia y catálogo híbrido desacoplado para alto rendimiento:

### Principios de Arquitectura
1. **SQLite como Datamart Local (`server/data/rapidfood.sqlite`)**:
   - Gestionado con `better-sqlite3` con modo WAL (`PRAGMA journal_mode = WAL;`).
   - Sirve lecturas ultra-rápidas (< 2ms) para la PWA móvil y E-commerce sin saturar el ERP.
   - Zero-config y 100% portable para demostraciones y entornos POC.
2. **Desacoplamiento Multimedia & Marketing**:
   - **iDempiere (Fuente de la Verdad Contable)**: `M_Product_ID`, `Value` (SKU), `Name`, `PriceStd`, `PriceList`, `C_UOM_ID`, `IsActive`, `QtyOnHand`.
   - **PWA/App (Fuente de la Verdad Visual & UX)**: `image_url` (WebP locales HD), `image_thumb`, `badge`, `badge_type`, `calories`, `prep_time`, `pairing`, `category_pwa`, `display_order`.
   - Evita la descarga de BLOBs pesados desde `AD_Image` en iDempiere y garantiza carga instantánea a 60 FPS.
3. **Mecánica de Sincronización Segura (*Smart UPSERT*)**:
   - Al sincronizar vía `POST /api/sync/products` o mediante `productSyncService.js`:
     - **Si el producto existe** (`idempiere_product_id` o `sku`): Solo actualiza precio, vigencia y nombre oficial ERP. **Preserva intactas** las fotos locales, insignias, calorías y atributos gastronómicos de la PWA.
     - **Si es un producto nuevo**: Asigna automáticamente activos por defecto de acuerdo a su nombre/categoría (hamburguesa, pizza, papas, bebidas) con `sync_status = 'synced'`.
   - Registro de auditoría en la tabla `sync_history`.

### Endpoints REST de Catálogo, Siembra & Sincronización
- `GET /api/products`: Catálogo completo unificado compatible con PWA, Admin y E-commerce.
- `POST /api/erp/bootstrap`: Aprovisionamiento automático (*Seed*) de las 5 categorías oficiales (`CAT-ESP`, `CAT-CLA`, `CAT-GOU`, `CAT-POL`, `CAT-VEG`) y las 10 hamburguesas de autor en iDempiere ERP (`M_Product`, `M_ProductPrice`), enlazando los `M_Product_ID` reales con SQLite.
- `POST /api/sync/products`: Dispara la sincronización contra iDempiere REST API v1 (`{ serverUrl, token }`).
- `GET /api/sync/history`: Historial de ejecuciones de sincronización con métricas de altas y actualizaciones.

