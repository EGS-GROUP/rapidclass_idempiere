# 📦 Sincronización de Productos iDempiere ERP con App PWA mediante SQLite

Documento maestro de arquitectura y especificación técnica para la persistencia local de catálogo, desacoplamiento multimedia y sincronización omnicanal con iDempiere REST API v1.

---

## 🎯 1. Visión y Justificación Técnica: SQLite vs MySQL para el POC

Para la fase actual de **Prueba de Concepto (POC)** y la operación móvil en terreno mediante la **PWA de Preventa**, la adopción de **SQLite** como motor de base de datos en la capa backend Node.js aporta ventajas determinantes frente a un motor cliente-servidor tradicional como MySQL:

### Comparativa de Arquitectura

| Criterio | MySQL / MariaDB | SQLite (Recomendado para POC & PWA) |
| :--- | :--- | :--- |
| **Infraestructura** | Requiere demonio activo, servicio en puerto 3306, sockets y gestión de contenedor Docker. | **Zero-Config / Serverless:** Base de datos en un único archivo binario local (`data/rapidfood.sqlite`). |
| **Latencia de Consulta** | Sobrecarga de red TCP, autenticación handshake y serialización de sockets. | **In-Process Memory Speed (< 2ms):** Ejecución nativa directa dentro del proceso Node.js. |
| **Resiliencia & Fallback** | Si el servidor MySQL no responde, la app entra en modo degradado in-memory. | **100% Determinista:** Nunca falla por conexión rechazada o timeout de red. |
| **Portabilidad & Demos** | Requiere scripts de dump/restore, creación de usuarios y grants. | **Copia directa:** Respaldo y restauración instantánea clonando el archivo `.sqlite`. |
| **Alineación Offline-First** | Desconectado del paradigma de almacenamiento local móvil. | Simetría conceptual con `IndexedDB` en el cliente PWA para sincronización bidireccional. |

### Diagrama de Aislamiento y Réplica Intermedia (Datamart Local)

```
┌─────────────────────────────────┐
│       App Móvil PWA / Web       │
│  (IndexedDB / Local Cache PWA)  │
└────────────────┬────────────────┘
                 │ (Consultas ultra-rápidas < 5ms: GET /api/products)
                 ▼
┌─────────────────────────────────┐
│     Backend Node.js Express     │
│   ┌─────────────────────────┐   │
│   │   SQLite DB (Datamart)  │   │
│   │   `rapidfood.sqlite`    │   │
│   └────────────▲────────────┘   │
└────────────────┼────────────────┘
                 │
                 │ Sincronización Programada / Bajo Demanda
                 │ (REST API v1 con Token Bearer)
                 ▼
┌─────────────────────────────────┐
│   iDempiere ERP (REST API v1)   │
│   https://test.idempiere.org    │
│  - M_Product / M_ProductPrice   │
│  - C_UOM / M_StorageOnHand      │
└─────────────────────────────────┘
```

El backend con SQLite actúa como un **Datamart / Read-Replica local de alta velocidad**. La PWA nunca golpea directamente a iDempiere para leer el catálogo en cada render, protegiendo al ERP de sobrecarga y garantizando navegación instantánea a 60 FPS.

---

## 🎨 2. Enfoque de Imágenes y Multimedia Desacopladas

En ERPs como iDempiere, las imágenes suelen almacenarse como campos binarios BLOB en la tabla `AD_Image` o en carpetas locales del servidor. Descargarlas por REST API v1 (`/api/v1/models/ad_image`) consume ancho de banda excesivo, introduce alta latencia y rara vez están en formatos web optimizados (WebP/AVIF).

### Separación de Responsabilidades (Modelo Híbrido Enriquecido):

1. **iDempiere gobierna los datos comerciales y contables oficiales:**
   - Identificador único ERP: `M_Product_ID` (clave obligatoria para `C_OrderLine`).
   - Código SKU contable: `Value` (ej. `BUR-REY-001`, `PIZ-MARG-002`).
   - Nombre técnico contable: `Name`.
   - Precio de venta oficial: `PriceStd` y `PriceList` (de `M_ProductPrice`).
   - Unidad de medida contable: `C_UOM_ID`.
   - Estado de vigencia comercial: `IsActive` ('Y' / 'N').
   - Stock físico disponible: `QtyOnHand`.

2. **La App PWA gobierna la experiencia visual, gastronómica y de marketing:**
   - Rutas locales de imágenes en alta definición WebP (`/images/products/...`).
   - Miniaturas optimizadas para el carrito deslizante (`image_thumb`).
   - Insignias de autor (*Badges*): `👑 Corona de Oro`, `⭐ Clásica de Autor`, `🔥 Doble Impacto`.
   - Ficha nutricional y gourmet: Calorías (`980 kcal`), Tiempo de preparación (`10-12 min`), Maridaje sugerido (*Pairing*).
   - Categorización visual de consumo (`burgers`, `loaded-fries`, `wraps`, `sides`, `beverages`, `combos`, `desserts`).
   - Orden de presentación prioritario en el menú.

---

## 🏛️ 3. Estructura de la Capa de Modelo en SQLite (DDL)

### A. Tabla Maestra de Productos (`products`)

```sql
CREATE TABLE IF NOT EXISTS products (
    -- Identificadores Primarios y de Enlace ERP
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idempiere_product_id INTEGER UNIQUE,         -- M_Product_ID oficial de iDempiere (Clave para C_OrderLine)
    sku TEXT NOT NULL UNIQUE,                     -- 'Value' en iDempiere (ej: "BUR-REY-001", "PIZ-MARG-002")

    -- Atributos Comerciales Sincronizados de iDempiere
    erp_name TEXT NOT NULL,                       -- 'Name' oficial en iDempiere
    erp_description TEXT,                         -- 'Description' en iDempiere
    price REAL NOT NULL DEFAULT 0.0,              -- Precio de venta actual (PriceStd / PriceList)
    price_list REAL DEFAULT 0.0,                  -- Precio de lista de referencia
    uom TEXT DEFAULT 'Unidad',                    -- Nombre de la Unidad de Medida (C_UOM_ID)
    stock INTEGER NOT NULL DEFAULT 0,             -- Stock físico disponible
    is_active INTEGER NOT NULL DEFAULT 1,         -- Estado en ERP ('Y' = 1, 'N' = 0)

    -- Capa Desacoplada: Multimedia & Experiencia PWA (100% Local)
    name TEXT NOT NULL,                           -- Nombre comercial gourmet para la PWA
    description TEXT,                             -- Descripción gourmet atractiva
    image_url TEXT NOT NULL,                      -- Ruta estática local (ej: /images/products/rey-burgers.webp)
    image_thumb TEXT,                             -- Miniatura optimizada para carrito móvil
    category_pwa TEXT NOT NULL DEFAULT 'burgers', -- Categoría visual PWA ('burgers', 'pizzas', 'sides', etc.)
    badge TEXT,                                   -- Insignia ("👑 Edición Legendaria", "⭐ Clásica")
    badge_type TEXT DEFAULT 'special',            -- 'legendary', 'signature', 'double', 'gourmet', etc.
    calories TEXT,                                -- "980 kcal"
    prep_time TEXT,                               -- "10-12 min"
    pairing TEXT,                                 -- "Cerveza IPA Artesanal"
    rating REAL DEFAULT 4.8,
    is_featured INTEGER DEFAULT 0,                -- Destacado en carrusel o hero (1 = Sí, 0 = No)
    display_order INTEGER DEFAULT 0,              -- Orden de aparición en el menú

    -- Auditoría y Telemetría de Sincronización
    sync_status TEXT DEFAULT 'synced',            -- 'synced', 'pending_sync', 'local_only', 'conflict'
    last_synced_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_idempiere ON products(idempiere_product_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_pwa);
```

### B. Tabla de Mapeo de Categorías (`categories_mapping`)

```sql
CREATE TABLE IF NOT EXISTS categories_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,                    -- 'burgers', 'loaded-fries', 'wraps', 'sides', 'beverages'
    name TEXT NOT NULL,                           -- 'Hamburguesas', 'Papas Cargadas', 'Bebidas'
    idempiere_category_id INTEGER,                -- M_Product_Category_ID en iDempiere
    icon_image TEXT,                              -- Foto circular de la categoría
    display_order INTEGER DEFAULT 0
);
```

### C. Tabla de Auditoría de Sincronización (`sync_history`)

```sql
CREATE TABLE IF NOT EXISTS sync_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_type TEXT NOT NULL,                      -- 'PRODUCTS_CATALOG', 'PRICES_UPDATE', 'STOCK_UPDATE'
    items_total INTEGER DEFAULT 0,
    items_created INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    status TEXT NOT NULL,                         -- 'SUCCESS', 'ERROR'
    error_details TEXT,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 4. Mecánica de Sincronización Segura (*Smart UPSERT*)

Para garantizar que cada sincronización desde iDempiere **no borre ni sobreescriba las fotos locales ni las descripciones gastronómicas** de la PWA, se emplea una sentencia UPSERT selectiva:

```sql
INSERT INTO products (
    idempiere_product_id,
    sku,
    erp_name,
    name,
    price,
    stock,
    is_active,
    image_url,
    category_pwa,
    sync_status,
    last_synced_at
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', CURRENT_TIMESTAMP
)
ON CONFLICT(idempiere_product_id) DO UPDATE SET
    price = excluded.price,
    stock = excluded.stock,
    is_active = excluded.is_active,
    erp_name = excluded.erp_name,
    last_synced_at = CURRENT_TIMESTAMP,
    sync_status = 'synced';
```

### Asignación Inteligente de Imagen para Productos Nuevos
Cuando iDempiere entrega un producto nuevo que no existe en SQLite:
1. **Regla por Convención de Nombres/Categoría**:
   - Si la categoría es *Bebidas* $\rightarrow$ Asigna `/images/products/default-drink.webp`.
   - Si contiene la palabra *Burger* $\rightarrow$ Asigna `/images/products/default-burger.webp`.
   - Si contiene *Pizza* $\rightarrow$ Asigna `/images/products/default-pizza.webp`.
   - Si contiene *Fries / Papas* $\rightarrow$ Asigna `/images/products/default-fries.webp`.
2. Desde el **Panel de Administración**, el operador tiene la opción de asignarle una foto específica o cambiar su badge con un clic sin alterar los datos del ERP.

---

## 🚀 5. Flujo de Integración REST con iDempiere v1

1. **Consulta de Catálogo Activo**:
   - `GET {serverUrl}/api/v1/models/m_product?$filter=IsActive eq 'Y'&$select=M_Product_ID,Value,Name,Description,C_UOM_ID,M_Product_Category_ID`
   - Header: `Authorization: Bearer {token}`
2. **Consulta de Precios Vigentes**:
   - `GET {serverUrl}/api/v1/models/m_productprice?$filter=M_PriceList_Version_ID eq {versionId}&$select=M_Product_ID,PriceStd,PriceList`
3. **Procesamiento y Persistencia**:
   - Cruce de información en memoria e inserción/actualización en SQLite.
4. **Consumo desde la PWA**:
   - Endpoint local `/api/products` devuelve los datos en < 5ms con `M_Product_ID` listo para la creación de órdenes en `C_OrderLine`.
