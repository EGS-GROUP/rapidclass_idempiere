const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Endpoints
app.use('/api', apiRoutes);

// Define paths for the 3 compiled frontends
const pwaPath = path.join(__dirname, '../public/pwa');
const adminPath = path.join(__dirname, '../public/admin');
const ecommercePath = path.join(__dirname, '../public/ecommerce');

function hasBuild(dir) {
  return fs.existsSync(path.join(dir, 'index.html'));
}

// 1. Mobile PWA under /app
app.use('/app', (req, res, next) => {
  if (hasBuild(pwaPath)) {
    return express.static(pwaPath)(req, res, next);
  }
  next();
});
app.get('/app*', (req, res) => {
  if (hasBuild(pwaPath)) {
    return res.sendFile(path.join(pwaPath, 'index.html'));
  }
  res.send(`
    <div style="font-family:sans-serif;text-align:center;padding:50px;">
      <h2>📱 PWA Mobile aún no compilada</h2>
      <p>Ejecuta <code>npm run build:pwa</code> o compila con Docker para generar los archivos en <code>public/pwa</code>.</p>
      <p><a href="/">Volver al inicio</a> | <a href="/admin">Panel Admin</a></p>
    </div>
  `);
});

// 2. Control Panel under /admin
app.use('/admin', (req, res, next) => {
  if (hasBuild(adminPath)) {
    return express.static(adminPath)(req, res, next);
  }
  next();
});
app.get('/admin*', (req, res) => {
  if (hasBuild(adminPath)) {
    return res.sendFile(path.join(adminPath, 'index.html'));
  }
  res.send(`
    <div style="font-family:sans-serif;text-align:center;padding:50px;">
      <h2>⚙️ Panel Admin aún no compilado</h2>
      <p>Ejecuta <code>npm run build:admin</code> o compila con Docker para generar los archivos en <code>public/admin</code>.</p>
      <p><a href="/">Volver al inicio</a> | <a href="/app">PWA Mobile</a></p>
    </div>
  `);
});

// 3. E-commerce Portal on Root /
app.use((req, res, next) => {
  if (hasBuild(ecommercePath)) {
    return express.static(ecommercePath)(req, res, next);
  }
  next();
});
app.get('*', (req, res) => {
  if (hasBuild(ecommercePath)) {
    return res.sendFile(path.join(ecommercePath, 'index.html'));
  }
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>NextCollege Rapid Platform</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; max-width: 650px; text-align: center; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        h1 { color: #38bdf8; margin-bottom: 0.5rem; }
        .badge { display: inline-block; background: #0284c7; color: white; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; margin-bottom: 1.5rem; }
        .links { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap; }
        .btn { background: #2563eb; color: white; text-decoration: none; padding: 0.75rem 1.25rem; border-radius: 0.5rem; font-weight: 600; transition: background 0.2s; }
        .btn:hover { background: #1d4ed8; }
        .status { text-align: left; background: #0f172a; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.85rem; margin-top: 1.5rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🍔 Hamburger Rapid - Fast Food Gourmet</h1>
        <div class="badge">Versión Comercial v1.0 • Listo para Producción</div>
        <p>Servidor backend activo. Ejecuta <code>npm run build:all</code> para sincronizar las 3 aplicaciones en <code>server/public</code>.</p>
        <div class="links">
          <a class="btn" href="/">🌐 Landing E-commerce</a>
          <a class="btn" href="/app">📱 PWA Mobile</a>
          <a class="btn" href="/admin">⚙️ Panel Admin</a>
          <a class="btn" style="background:#10b981;" href="/api/health">🩺 Health Check</a>
          <a class="btn" style="background:#d97706;" href="/api/products">🍔 API Hamburguesas</a>
        </div>
        <div class="status">
          <div>• Puerto: ${PORT}</div>
          <div>• Estado DB: ${db.getDbStatus().mode}</div>
          <div>• Entorno: ${process.env.NODE_ENV || 'development'}</div>
        </div>
      </div>
    </body>
    </html>
  `);
});


// Start server and initialize DB
async function start() {
  await db.initDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🍔 Hamburger Rapid Backend ejecutándose en puerto ${PORT}`);
    console.log(`   - E-commerce:  http://localhost:${PORT}/`);
    console.log(`   - PWA Mobile:  http://localhost:${PORT}/app`);
    console.log(`   - Panel Admin: http://localhost:${PORT}/admin`);
    console.log(`   - API Health:  http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

start();
