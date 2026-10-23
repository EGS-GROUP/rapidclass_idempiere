const { getDatabase } = require('../db');

// Intelligent image resolver based on product names or categories
function resolvePwaAssets(name = '', categoryId = null) {
  const lower = name.toLowerCase();

  if (lower.includes('burger') || lower.includes('hamburguesa')) {
    return {
      categoryPwa: 'Especiales de la Casa',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      badge: '🍔 Nueva Burger',
      badgeType: 'special',
      calories: '750 kcal',
      prepTime: '10-12 min',
      pairing: 'Papas Rústicas y Cerveza'
    };
  }

  if (lower.includes('pizza') || lower.includes('margherita') || lower.includes('pepperoni')) {
    return {
      categoryPwa: 'Pizzas & Calzones',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      badge: '🍕 Horno de Piedra',
      badgeType: 'signature',
      calories: '850 kcal',
      prepTime: '15-18 min',
      pairing: 'Gaseosa Helada o Vino Tinto'
    };
  }

  if (lower.includes('fry') || lower.includes('fries') || lower.includes('papas') || lower.includes('rustic')) {
    return {
      categoryPwa: 'Loaded Fries',
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80',
      badge: '🍟 Extra Crujiente',
      badgeType: 'crispy',
      calories: '450 kcal',
      prepTime: '6-8 min',
      pairing: 'Dip de Queso Cheddar Fundido'
    };
  }

  if (lower.includes('shake') || lower.includes('drink') || lower.includes('bebida') || lower.includes('soda') || lower.includes('cooler')) {
    return {
      categoryPwa: 'Bebidas & Shakes',
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80',
      badge: '🥤 Refrescante',
      badgeType: 'fusion',
      calories: '320 kcal',
      prepTime: '4-5 min',
      pairing: 'Hielo Frappé'
    };
  }

  // Generic gourmet fallback
  return {
    categoryPwa: 'Especiales de la Casa',
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
    badge: '✨ Receta Gourmet',
    badgeType: 'special',
    calories: '680 kcal',
    prepTime: '10 min',
    pairing: 'Salsa Especial de la Casa'
  };
}

function buildUrl(serverUrl, endpoint, proxyUrl) {
  let cleanServer = (serverUrl || 'https://test.idempiere.org:443').replace(/\/+$/, '');
  let cleanEndpoint = endpoint.replace(/^\/+/, '');
  let fullUrl = `${cleanServer}/${cleanEndpoint}`;

  if (proxyUrl) {
    let cleanProxy = proxyUrl.trim();
    if (cleanProxy.endsWith('=')) {
      return `${cleanProxy}${encodeURIComponent(fullUrl)}`;
    }
    if (cleanProxy.endsWith('/?') || cleanProxy.endsWith('?')) {
      return `${cleanProxy}${fullUrl}`;
    }
    return `${cleanProxy}/${fullUrl}`;
  }
  return fullUrl;
}

/**
 * Synchronize products from iDempiere REST API v1 into local SQLite database.
 * 
 * @param {Object} options
 * @param {string} options.serverUrl - Target iDempiere REST base URL (e.g. https://test.idempiere.org:443)
 * @param {string} options.token - Bearer token obtained from /api/v1/auth/tokens
 * @param {string} [options.proxyUrl] - Optional CORS proxy
 * @param {boolean} [options.useCorsProxy] - Flag indicating proxy usage
 * @param {string} [options.corsProxyUrl] - Alternate name for proxyUrl
 * @param {number} [options.clientId] - Target tenant client ID (default 11)
 * @param {Array} [options.mockProducts] - Optional fallback payload for testing/offline sync
 */
async function syncProductsFromIdempiere(options = {}) {
  const db = getDatabase();
  const serverUrl = options.serverUrl || process.env.IDEMPIERE_SERVER_URL || 'https://test.idempiere.org:443';
  const token = options.token;
  const proxyUrl = options.proxyUrl || (options.useCorsProxy ? options.corsProxyUrl : null);
  const clientId = options.clientId || 11;

  let erpProducts = [];
  let pricesMap = new Map();

  try {
    if (options.mockProducts && Array.isArray(options.mockProducts)) {
      erpProducts = options.mockProducts;
    } else if (token) {
      // 1. Fetch products from iDempiere REST v1 using official dictionary column names
      const endpoint = `api/v1/models/m_product?$filter=IsActive eq true and AD_Client_ID eq ${clientId}&$select=M_Product_ID,Value,Name,Description,C_UOM_ID,M_Product_Category_ID`;
      const productsUrl = buildUrl(serverUrl, endpoint, proxyUrl);

      console.log(`📡 [Sync ERP] Consultando iDempiere REST: ${productsUrl}`);

      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch(productsUrl, { headers });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        let detail = res.statusText;
        try {
          const parsed = JSON.parse(errText);
          detail = parsed.detail || parsed.message || detail;
        } catch {
          if (errText) detail = errText.slice(0, 150);
        }
        throw new Error(`Error en API iDempiere: HTTP ${res.status} - ${detail}`);
      }

      const body = await res.json();
      erpProducts = body.records || body['records-summary'] || (Array.isArray(body) ? body : []);

      // 2. Fetch prices (optional M_ProductPrice)
      try {
        const priceEndpoint = `api/v1/models/m_productprice?$select=M_Product_ID,PriceStd,PriceList`;
        const pricesUrl = buildUrl(serverUrl, priceEndpoint, proxyUrl);
        const pRes = await fetch(pricesUrl, { headers });
        if (pRes.ok) {
          const pBody = await pRes.json();
          const pRecords = pBody.records || (Array.isArray(pBody) ? pBody : []);
          for (const pr of pRecords) {
            const pId = pr.M_Product_ID?.id || pr.M_Product_ID || pr.id;
            if (pId) {
              pricesMap.set(pId, {
                priceStd: parseFloat(pr.PriceStd) || null,
                priceList: parseFloat(pr.PriceList) || null
              });
            }
          }
        }
      } catch (errPrice) {
        console.warn('⚠️ [Sync ERP] No se pudieron cargar precios específicos, manteniendo precios base:', errPrice.message);
      }
    } else {
      throw new Error('Se requiere un Token Bearer corporativo válido de iDempiere para ejecutar la sincronización.');
    }

    if (!Array.isArray(erpProducts) || erpProducts.length === 0) {
      console.log('ℹ️ [Sync ERP] No se obtuvieron registros de productos nuevos de iDempiere.');
      return {
        success: true,
        message: 'No se encontraron nuevos registros para sincronizar',
        itemsTotal: 0,
        itemsCreated: 0,
        itemsUpdated: 0
      };
    }

    let itemsCreated = 0;
    let itemsUpdated = 0;

    // Prepared statements for high performance UPSERT
    const findStmt = db.prepare('SELECT id, name, image_url, category_pwa, badge, badge_type, calories, prep_time, pairing FROM products WHERE idempiere_product_id = ? OR sku = ?');

    const updateStmt = db.prepare(`
      UPDATE products SET
        idempiere_product_id = COALESCE(idempiere_product_id, ?),
        erp_name = ?,
        price = COALESCE(?, price),
        price_list = COALESCE(?, price_list),
        is_active = 1,
        sync_status = 'synced',
        last_synced_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const insertStmt = db.prepare(`
      INSERT INTO products (
        idempiere_product_id, sku, erp_name, name, category_pwa, badge, badge_type,
        price, price_list, uom, stock, rating, calories, prep_time, pairing,
        image_url, image_thumb, description, is_featured, display_order, sync_status, last_synced_at
      ) VALUES (
        @idempiere_product_id, @sku, @erp_name, @name, @category_pwa, @badge, @badge_type,
        @price, @price_list, @uom, @stock, @rating, @calories, @prep_time, @pairing,
        @image_url, @image_thumb, @description, @is_featured, @display_order, 'synced', CURRENT_TIMESTAMP
      )
    `);

    const syncTransaction = db.transaction((products) => {
      for (const prod of products) {
        const erpId = prod.id || prod.M_Product_ID;
        const sku = prod.Value || prod.value || `ERP-${erpId}`;
        const erpName = prod.Name || prod.name || 'Producto iDempiere';
        const priceInfo = pricesMap.get(erpId);
        const price = priceInfo?.priceStd || parseFloat(prod.price) || 12.00;
        const priceList = priceInfo?.priceList || parseFloat(prod.priceList) || 14.00;

        const existing = findStmt.get(erpId, sku);

        if (existing) {
          // UPDATE: Preserve all PWA local images & marketing fields!
          updateStmt.run(erpId, erpName, price, priceList, existing.id);
          itemsUpdated++;
        } else {
          // INSERT: Generate sensible PWA defaults
          const assets = resolvePwaAssets(erpName, prod.M_Product_Category_ID);
          insertStmt.run({
            idempiere_product_id: erpId,
            sku,
            erp_name: erpName,
            name: erpName,
            category_pwa: assets.categoryPwa,
            badge: assets.badge,
            badge_type: assets.badgeType,
            price,
            price_list: priceList,
            uom: prod.C_UOM_ID?.identifier || 'Unidad',
            stock: 25,
            rating: 4.8,
            calories: assets.calories,
            prep_time: assets.prepTime,
            pairing: assets.pairing,
            image_url: assets.imageUrl,
            image_thumb: assets.imageUrl,
            description: prod.Description || prod.description || 'Producto gastronómico oficial sincronizado con iDempiere ERP.',
            is_featured: 0,
            display_order: 50
          });
          itemsCreated++;
        }
      }
    });

    syncTransaction(erpProducts);

    // Record in sync_history
    const historyStmt = db.prepare(`
      INSERT INTO sync_history (sync_type, items_total, items_created, items_updated, status, error_details)
      VALUES (?, ?, ?, ?, 'SUCCESS', NULL)
    `);
    historyStmt.run('PRODUCTS_CATALOG', erpProducts.length, itemsCreated, itemsUpdated);

    console.log(`✅ [Sync ERP] Sincronización completada: ${erpProducts.length} procesados (${itemsCreated} creados, ${itemsUpdated} actualizados)`);

    return {
      success: true,
      itemsTotal: erpProducts.length,
      itemsCreated,
      itemsUpdated,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [Sync ERP] Fallo en sincronización con iDempiere:', error.message);

    try {
      const historyStmt = db.prepare(`
        INSERT INTO sync_history (sync_type, items_total, items_created, items_updated, status, error_details)
        VALUES (?, 0, 0, 0, 'ERROR', ?)
      `);
      historyStmt.run('PRODUCTS_CATALOG', error.message);
    } catch {
      // ignore
    }

    throw error;
  }
}

/**
 * Get sync history logs from SQLite
 */
function getSyncHistory(limit = 10) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM sync_history ORDER BY id DESC LIMIT ?').all(limit);
}

module.exports = {
  syncProductsFromIdempiere,
  getSyncHistory,
  resolvePwaAssets
};
