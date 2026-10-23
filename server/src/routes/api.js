const express = require('express');
const router = express.Router();
const db = require('../db');
const { syncProductsFromIdempiere, getSyncHistory } = require('../services/productSyncService');

// Health Check Endpoint
router.get('/health', (req, res) => {
  const dbStatus = db.getDbStatus();
  res.json({
    status: 'healthy',
    brand: 'Hamburger Rapid',
    edition: 'Commercial v1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatus
  });
});

// List all hamburgers
router.get('/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new burger
router.post('/products', async (req, res) => {
  try {
    const { name, category, badge, price, stock, description, image, calories, prepTime } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Nombre y precio son requeridos.' });
    }
    const product = await db.addProduct({ name, category, badge, price, stock, description, image, calories, prepTime });
    res.status(201).json({ success: true, message: 'Hamburguesa agregada exitosamente', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update stock
router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    if (stock === undefined) {
      return res.status(400).json({ success: false, error: 'Stock requerido' });
    }
    const updated = await db.updateProductStock(id, stock);
    res.json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProduct(id);
    res.json({ success: true, message: `Hamburguesa ${id} eliminada.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Consumer and client consumption metrics
router.get('/metrics', (req, res) => {
  try {
    const metrics = db.getConsumerMetrics();
    const dbStatus = db.getDbStatus();
    res.json({
      success: true,
      metrics,
      database: dbStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset initial products catalog
router.post('/reset', async (req, res) => {
  try {
    await db.resetProducts();
    res.json({ success: true, message: 'Catálogo de Hamburger Rapid restablecido con éxito.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger ERP product catalog synchronization
router.post('/sync/products', async (req, res) => {
  try {
    const { serverUrl, token, proxyUrl, mockProducts } = req.body;
    const result = await syncProductsFromIdempiere({ serverUrl, token, proxyUrl, mockProducts });
    res.json({
      success: true,
      message: 'Sincronización con iDempiere completada exitosamente',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// View ERP sync history
router.get('/sync/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const history = getSyncHistory(limit);
    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List all orders (unified omnicanal)
router.get('/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new order
router.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const newOrder = await db.addOrder(orderData);
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente con soporte de tracking GPS',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get real-time GPS tracking telemetry & waypoints info for an order
router.get('/orders/:id/track', (req, res) => {
  try {
    const { id } = req.params;
    const tracking = db.getOrderTracking(id);
    if (!tracking) {
      return res.status(404).json({ success: false, error: `Orden ${id} no encontrada para tracking GPS` });
    }
    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

