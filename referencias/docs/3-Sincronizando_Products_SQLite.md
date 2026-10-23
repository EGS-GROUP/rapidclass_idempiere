# 📦 Estrategia de Aprovisionamiento y Sincronización de Catálogo iDempiere ERP

Documento técnico que define la creación de categorías y productos en iDempiere REST API v1 y la sincronización bidireccional con el Datamart SQLite de la PWA.

---

### 1. Justificación y Alcance

Para que la Prueba de Concepto (POC) opere con realismo empresarial frente a una instancia de iDempiere (`test.idempiere.org:443` con tenant `GardenWorld`):
- Los productos predeterminados de la base de prueba corresponden a jardinería (*Oak Tree, Azalea Bush, Lawn Mower, etc.*).
- La solución óptima consiste en **sembrar (*Seed / Bootstrap*) el catálogo de Hamburger Rapid en iDempiere** mediante llamadas REST seguras:
  1. Creación de las 5 categorías oficiales (`M_Product_Category`).
  2. Creación de las 10 hamburguesas de autor (`M_Product`) con atributos de venta e inventario (`ProductType = 'I'`, `IsSold = true`).
  3. Fijación de precios en lista de venta estándar (`M_ProductPrice`).
  4. Sincronización de los identificadores oficiales contables generados (`M_Product_Category_ID` y `M_Product_ID`) hacia SQLite Datamart, preservando las fotos e interfaces de la PWA.

---

### 2. Flujo de Endpoints REST de iDempiere v1

```
                                  PASO 1: CATEGORÍAS
                   POST {baseUrl}/api/v1/models/m_product_category
                                        │
                                        ▼ Retorna M_Product_Category_ID
                                  PASO 2: PRODUCTOS
                      POST {baseUrl}/api/v1/models/m_product
                                        │
                                        ▼ Retorna M_Product_ID
                                  PASO 3: PRECIOS
                    POST {baseUrl}/api/v1/models/m_productprice
                                        │
                                        ▼
                                  PASO 4: SMART SYNC
                      Sincronización hacia SQLite Datamart
```

---

### 3. Especificación de Endpoints y Payloads

#### A. Crear las 5 Categorías en iDempiere (`M_Product_Category`)
- **Endpoint**: `POST {serverUrl}/api/v1/models/m_product_category`
- **Headers**:
  ```http
  Authorization: Bearer {token}
  Content-Type: application/json
  Accept: application/json
  ```
- **Catálogo de Categorías**:
  | Código (`Value`) | Nombre oficial (`Name`) |
  | :--- | :--- |
  | `CAT-ESP` | **Especiales de la Casa** |
  | `CAT-CLA` | **Clásicas** |
  | `CAT-GOU` | **Gourmet** |
  | `CAT-POL` | **Pollo & Crispy** |
  | `CAT-VEG` | **Vegetariana** |

- **Payload JSON Estándar**:
  ```json
  {
    "AD_Client_ID": 11,
    "AD_Org_ID": 11,
    "Value": "CAT-ESP",
    "Name": "Especiales de la Casa",
    "IsActive": true
  }
  ```

---

#### B. Crear los 10 Productos en iDempiere (`M_Product`)
- **Endpoint**: `POST {serverUrl}/api/v1/models/m_product`
- **Payload Estándar**:
  ```json
  {
    "AD_Client_ID": 11,
    "AD_Org_ID": 11,
    "Value": "BUR-001",
    "Name": "Rey de las Burgers",
    "Description": "Doble medallón Angus Black 100% flameada al roble vivo con cheddar inglés añejado.",
    "M_Product_Category_ID": 1000101,
    "C_UOM_ID": 100,
    "ProductType": "I",
    "IsActive": true,
    "IsSold": true,
    "IsPurchased": true
  }
  ```

---

#### C. Asignar Precios en iDempiere (`M_ProductPrice`)
- **Endpoint**: `POST {serverUrl}/api/v1/models/m_productprice`
- **Payload**:
  ```json
  {
    "M_PriceList_Version_ID": 101,
    "M_Product_ID": 1000550,
    "PriceList": 16.50,
    "PriceStd": 14.99,
    "PriceLimit": 12.00
  }
  ```

---

### 4. Modelo de Datos SQLite Integrado

El Datamart local en SQLite cuenta con las tablas listas:
- `categories_mapping`: Contiene el campo `idempiere_category_id INTEGER` para almacenar la correlación contable.
- `products`: Contiene `idempiere_product_id INTEGER UNIQUE`, `sku TEXT UNIQUE`, datos ERP y atributos locales PWA (`image_url`, `badge`, `calories`, `pairing`).

---

### 5. Plan de Implementación

1. **Servicio Sembrador en Backend (`server/src/services/idempiereSeedService.js`)**:
   - Automatización de consultas y creación condicional (para evitar duplicados).
   - Generación de categorías y productos con token Bearer activo.
   - Smart UPSERT inmediato en la base SQLite.
2. **Endpoint REST**: `POST /api/erp/bootstrap`.
3. **Integración UI en el Panel de Administración**:
   - Acceso ejecutivo para sembrar y sincronizar el catálogo con 1 solo clic.
