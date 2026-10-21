const express = require('express');
const router = express.Router();
const db = require('../db');

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

module.exports = router;
