const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'rapidfood.sqlite');
let dbInstance = null;

// Initial 10 Legendary Burgers (Preserving all visual & marketing attributes)
const INITIAL_PRODUCTS = [
  {
    id: 1,
    idempiere_product_id: 1000001,
    sku: 'BUR-001',
    erp_name: 'Burger Rey de las Burgers',
    name: 'Rey de las Burgers',
    category_pwa: 'Especiales de la Casa',
    badge: '👑 Corona de Oro • Edición Legendaria',
    badge_type: 'legendary',
    price: 14.99,
    price_list: 16.50,
    uom: 'Unidad',
    stock: 45,
    rating: 4.9,
    calories: '980 kcal',
    prep_time: '10-12 min',
    pairing: 'Cerveza IPA Artesanal o Shake Deluxe',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    description: 'Doble medallón de carne Angus Black 100% flameada al roble vivo, queso cheddar inglés añejado 12 meses, mermelada artesanal de panceta ahumada al bourbon, cebolla caramelizada y salsa secreta Real en pan brioche dorado a la manteca.',
    is_featured: 1,
    display_order: 1
  },
  {
    id: 2,
    idempiere_product_id: 1000002,
    sku: 'BUR-002',
    erp_name: 'Burger Real Clásica',
    name: 'Burger Real Clásica',
    category_pwa: 'Clásicas',
    badge: '⭐ Clásica de Autor',
    badge_type: 'signature',
    price: 9.99,
    price_list: 11.00,
    uom: 'Unidad',
    stock: 60,
    rating: 4.8,
    calories: '650 kcal',
    prep_time: '8-10 min',
    pairing: 'Papas Rústicas y Gaseosa Helada',
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
    description: 'Medallón de res seleccionada a la plancha de hierro fundido, doble loncha de queso cheddar fundido, pepinillos encurtidos en casa con eneldo, lechuga romana crujiente, tomate pera y suave emulsión imperial.',
    is_featured: 0,
    display_order: 2
  },
  {
    id: 3,
    idempiere_product_id: 1000003,
    sku: 'BUR-003',
    erp_name: 'Burger Real Doble Impacto',
    name: 'Burger Real Doble',
    category_pwa: 'Especiales de la Casa',
    badge: '🔥 Doble Impacto',
    badge_type: 'double',
    price: 12.50,
    price_list: 13.90,
    uom: 'Unidad',
    stock: 38,
    rating: 4.9,
    calories: '890 kcal',
    prep_time: '12-14 min',
    pairing: 'Loaded Truffle Fries',
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    description: 'Dos carnes smash con costra caramelizada profunda, cuádruple queso americano extra derretido, panceta crujiente curada al manzano, cebolla frita crocante y salsa barbacoa ahumada artesanal.',
    is_featured: 1,
    display_order: 3
  },
  {
    id: 4,
    idempiere_product_id: 1000004,
    sku: 'BUR-004',
    erp_name: 'Burger Doble Especial Edición Limitada',
    name: 'Burger Doble Especial',
    category_pwa: 'Especiales de la Casa',
    badge: '✨ Edición Especial',
    badge_type: 'special',
    price: 13.50,
    price_list: 15.00,
    uom: 'Unidad',
    stock: 30,
    rating: 4.9,
    calories: '920 kcal',
    prep_time: '12-14 min',
    pairing: 'Aros de Cebolla a la Cerveza',
    image_url: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&auto=format&fit=crop&q=80',
    description: 'Doble blend premium de picaña y asado de tira, queso Monterrey Jack fundido con pimientos asados, huevo de campo frito con yema trufada, jamón serrano crocante y mayonesa de ajo negro.',
    is_featured: 0,
    display_order: 4
  },
  {
    id: 5,
    idempiere_product_id: 1000005,
    sku: 'BUR-005',
    erp_name: 'Burger Trufa y Hongo Portobello',
    name: 'Burger Trufa & Portobello',
    category_pwa: 'Gourmet',
    badge: '💎 Gourmet Select',
    badge_type: 'gourmet',
    price: 15.50,
    price_list: 17.50,
    uom: 'Unidad',
    stock: 25,
    rating: 5.0,
    calories: '810 kcal',
    prep_time: '14-16 min',
    pairing: 'Vino Tinto Reserva o Agua Mineral con Gas',
    image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop&q=80',
    description: 'Carne madurada Dry-Aged 30 días, sombrero de hongo Portobello glaseado al vino tinto, queso suizo Emmental gratinado y untuosa mayonesa de trufas negras silvestres del Piamonte.',
    is_featured: 1,
    display_order: 5
  },
  {
    id: 6,
    idempiere_product_id: 1000006,
    sku: 'BUR-006',
    erp_name: 'Burger Crispy Smokehouse Buttermilk',
    name: 'Burger Crispy Smokehouse',
    category_pwa: 'Pollo & Crispy',
    badge: '🍗 Pollo Crujiente',
    badge_type: 'crispy',
    price: 11.99,
    price_list: 13.00,
    uom: 'Unidad',
    stock: 40,
    rating: 4.7,
    calories: '740 kcal',
    prep_time: '10-12 min',
    pairing: 'Mojito Menta Citrus Cooler',
    image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&auto=format&fit=crop&q=80',
    description: 'Suprema de pechuga campera marinada 24 horas en buttermilk y pimentón ahumado, rebozada en copos crujientes, ensalada fresca coleslaw de repollo morado y miel picante habanero-maple.',
    is_featured: 0,
    display_order: 6
  },
  {
    id: 7,
    idempiere_product_id: 1000007,
    sku: 'BUR-007',
    erp_name: 'Burger BBQ Bourbon Leña',
    name: 'Burger BBQ Bourbon Flame',
    category_pwa: 'Especiales de la Casa',
    badge: '🔥 Ahumada a la Leña',
    badge_type: 'smoke',
    price: 13.99,
    price_list: 15.50,
    uom: 'Unidad',
    stock: 32,
    rating: 4.8,
    calories: '860 kcal',
    prep_time: '12-15 min',
    pairing: 'Papas Rústicas con Dip BBQ Extra',
    image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop&q=80',
    description: 'Medallón de res ahumado pacientemente con virutas de roble, aros de cebolla artesanalmente rebozados a la cerveza rubia, queso provolone fundido y generoso glaseado barbacoa bourbon ahumado.',
    is_featured: 0,
    display_order: 7
  },
  {
    id: 8,
    idempiere_product_id: 1000008,
    sku: 'BUR-008',
    erp_name: 'Burger Bacon Cheese Deluxe Doble',
    name: 'Burger Bacon Cheese Deluxe',
    category_pwa: 'Clásicas',
    badge: '🥓 Favorita Clásica',
    badge_type: 'bacon',
    price: 10.99,
    price_list: 12.00,
    uom: 'Unidad',
    stock: 50,
    rating: 4.8,
    calories: '720 kcal',
    prep_time: '8-10 min',
    pairing: 'Cerveza Rubia Helada',
    image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&auto=format&fit=crop&q=80',
    description: '180g de carne jugosa a la parrilla, triple tira de tocino ahumado de corte grueso extra crocante, quesos gouda y cheddar fundidos al vapor, cebolla morada macerada y mostaza antigua en grano.',
    is_featured: 0,
    display_order: 8
  },
  {
    id: 9,
    idempiere_product_id: 1000009,
    sku: 'BUR-009',
    erp_name: 'Burger Guacamole Chipotle Morita',
    name: 'Burger Guacamole & Chipotle Crunch',
    category_pwa: 'Especiales de la Casa',
    badge: '🥑 Fusión Picante',
    badge_type: 'fusion',
    price: 12.99,
    price_list: 14.50,
    uom: 'Unidad',
    stock: 35,
    rating: 4.7,
    calories: '780 kcal',
    prep_time: '10-12 min',
    pairing: 'Limonada Frozen con Jengibre',
    image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&auto=format&fit=crop&q=80',
    description: 'Carne a la parrilla sobre cama de guacamole rústico con toque de lima fresca y cilantro, totopos crocantes de maíz, queso fundido flameado y mayonesa ahumada al chile chipotle morita.',
    is_featured: 0,
    display_order: 9
  },
  {
    id: 10,
    idempiere_product_id: 1000010,
    sku: 'BUR-010',
    erp_name: 'Burger Vegetariana Green Garden',
    name: 'Burger Green Garden Truffle',
    category_pwa: 'Vegetariana',
    badge: '🌱 100% Plant-Based',
    badge_type: 'veggie',
    price: 11.50,
    price_list: 13.00,
    uom: 'Unidad',
    stock: 28,
    rating: 4.8,
    calories: '590 kcal',
    prep_time: '10-12 min',
    pairing: 'Jugo Verde Detox Frío',
    image_url: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=800&auto=format&fit=crop&q=80',
    description: 'Medallón artesanal a base de lentejas francesas, quinoa andina y setas salteadas, queso vegetal cremoso ahumado, hojas de rúcula silvestre, tomate seco italiano y crema suave de trufa en pan rústico.',
    is_featured: 0,
    display_order: 10
  }
];

const INITIAL_CATEGORIES = [
  { code: 'burgers', name: 'Hamburguesas', icon_image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80', display_order: 1 },
  { code: 'loaded-fries', name: 'Loaded Fries', icon_image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&auto=format&fit=crop&q=80', display_order: 2 },
  { code: 'wraps', name: 'Wraps & Tacos', icon_image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop&q=80', display_order: 3 },
  { code: 'sides', name: 'Acompañamientos', icon_image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&auto=format&fit=crop&q=80', display_order: 4 },
  { code: 'beverages', name: 'Bebidas & Shakes', icon_image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80', display_order: 5 },
  { code: 'combos', name: 'Combos Dúo & Trío', icon_image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&auto=format&fit=crop&q=80', display_order: 6 },
  { code: 'desserts', name: 'Postres & Helados', icon_image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&auto=format&fit=crop&q=80', display_order: 7 }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-2026-101',
    origin: 'pwa',
    origin_label: 'PWA Preventa',
    agent: 'Juan Carlos Pérez (Vendedor Zona Norte)',
    client_name: 'Restaurante El Roble Gourmet',
    client_tax_id: 'RUC 20459812451',
    date: '2026-10-20 17:45',
    items_json: JSON.stringify([
      { name: 'Rey de las Burgers (Pack x10)', qty: 3, price: 140.00, idempiereProductId: 1000001 },
      { name: 'Burger Real Doble (Pack x10)', qty: 2, price: 120.00, idempiereProductId: 1000003 },
      { name: 'Papas Rústicas Trufadas (Caja 5kg)', qty: 4, price: 35.00, idempiereProductId: 1000004 }
    ]),
    total_amount: 800.00,
    status: 'pending_erp',
    erp_doc_no: null,
    payment_term: 'Crédito 15 Días',
    warehouse_requested: 'HQ Warehouse (103)',
    delivery_address: 'Av. José Larco 812, Miraflores, Lima',
    delivery_coords_json: JSON.stringify({ lat: -12.1218, lng: -77.0298 }),
    vehicle: 'moto'
  },
  {
    id: 'ORD-2026-102',
    origin: 'ecommerce',
    origin_label: 'E-commerce Web',
    agent: 'Cliente Directo (Portal Online)',
    client_name: 'Carlos Mendoza',
    client_tax_id: 'DNI 45892147',
    date: '2026-10-20 18:20',
    items_json: JSON.stringify([
      { name: 'Rey de las Burgers', qty: 2, price: 14.99, idempiereProductId: 1000001 },
      { name: 'French Fries Golden Crisp', qty: 2, price: 4.99, idempiereProductId: 1000002 },
      { name: 'Chocolate Shake Deluxe', qty: 2, price: 5.99, idempiereProductId: 1000003 }
    ]),
    total_amount: 51.94,
    status: 'synced_erp',
    erp_doc_no: 'CO-80042',
    payment_term: 'Pago Online Inmediato',
    warehouse_requested: 'HQ Warehouse (103)',
    delivery_address: 'Calle Las Begonias 441, San Isidro, Lima',
    delivery_coords_json: JSON.stringify({ lat: -12.0925, lng: -77.0287 }),
    vehicle: 'auto'
  },
  {
    id: 'ORD-2026-103',
    origin: 'pwa',
    origin_label: 'PWA Preventa',
    agent: 'Sofía Valenzuela (Preventista Corporativa)',
    client_name: 'Hotel Continental Plaza',
    client_tax_id: 'RUC 20104859623',
    date: '2026-10-20 18:50',
    items_json: JSON.stringify([
      { name: 'Burger Trufa & Portobello (Event Pack)', qty: 5, price: 155.00, idempiereProductId: 1000005 },
      { name: 'Margherita Pizza Stone-Baked (Pack x5)', qty: 6, price: 65.00, idempiereProductId: 1000001 },
      { name: 'Iced Mint Citrus Cooler (Dispensador 10L)', qty: 2, price: 45.00, idempiereProductId: 1000006 }
    ]),
    total_amount: 1255.00,
    status: 'pending_erp',
    erp_doc_no: null,
    payment_term: 'Crédito 30 Días',
    warehouse_requested: 'HQ Warehouse (103)',
    delivery_address: 'Av. Javier Prado Este 2465, San Borja, Lima',
    delivery_coords_json: JSON.stringify({ lat: -12.0864, lng: -77.0016 }),
    vehicle: 'camion'
  },
  {
    id: 'ORD-2026-104',
    origin: 'ecommerce',
    origin_label: 'E-commerce Web',
    agent: 'Cliente Directo (Portal Online)',
    client_name: 'Valentina Soto',
    client_tax_id: 'DNI 71204859',
    date: '2026-10-20 19:15',
    items_json: JSON.stringify([
      { name: 'Burger Real Clásica', qty: 1, price: 9.99, idempiereProductId: 1000002 },
      { name: 'Loaded Bacon Truffle Fries', qty: 1, price: 7.99, idempiereProductId: 1000004 },
      { name: 'Oreo Deluxe Shake', qty: 1, price: 6.50, idempiereProductId: 1000005 }
    ]),
    total_amount: 24.48,
    status: 'pending_erp',
    erp_doc_no: null,
    payment_term: 'Pago Online Inmediato',
    warehouse_requested: 'HQ Warehouse (103)',
    delivery_address: 'Av. Mariscal Sucre 1120, Jesús María, Lima',
    delivery_coords_json: JSON.stringify({ lat: -12.0782, lng: -77.0494 }),
    vehicle: 'moto'
  }
];

const CONSUMER_METRICS = {
  totalCustomers: 1480,
  activeThisMonth: 1120,
  totalRevenueMonth: 48250.00,
  avgOrderValue: 26.40,
  satisfactionRate: 98.6,
  consumptionTiers: [
    {
      tier: 'Oro VIP',
      badge: '🥇 VIP Platino / Oro',
      count: 414,
      percentage: 28,
      revenueShare: 54,
      avgTicket: 38.50,
      monthlyMinSpend: 150,
      frequency: '3.8 pedidos / semana',
      color: '#D97706'
    },
    {
      tier: 'Plata Frecuente',
      badge: '🥈 Consumidor Frecuente',
      count: 680,
      percentage: 46,
      revenueShare: 32,
      avgTicket: 24.20,
      monthlyMinSpend: 50,
      frequency: '1.8 pedidos / semana',
      color: '#64748B'
    },
    {
      tier: 'Bronce Nuevo',
      badge: '🥉 Ocasional / Nuevo',
      count: 386,
      percentage: 26,
      revenueShare: 14,
      avgTicket: 16.80,
      monthlyMinSpend: 0,
      frequency: '1.1 pedidos / mes',
      color: '#B45309'
    }
  ],
  topConsumers: [
    {
      id: 1,
      name: 'Carlos Mendoza',
      avatar: '👨‍💼',
      tier: 'Oro VIP',
      totalSpent: 420.50,
      ordersCount: 28,
      favoriteBurger: 'Rey de las Burgers',
      lastOrder: 'Hace 2 horas',
      badge: '👑 Embajador VIP'
    },
    {
      id: 2,
      name: 'Valentina Soto',
      avatar: '👩‍🔬',
      tier: 'Oro VIP',
      totalSpent: 385.00,
      ordersCount: 24,
      favoriteBurger: 'Burger Real Doble',
      lastOrder: 'Ayer',
      badge: '⭐ Gourmet Fan'
    },
    {
      id: 3,
      name: 'Andrés Castillo',
      avatar: '👨‍🎨',
      tier: 'Oro VIP',
      totalSpent: 340.20,
      ordersCount: 21,
      favoriteBurger: 'Burger Doble Especial',
      lastOrder: 'Hace 2 días',
      badge: '🔥 Meat Lover'
    },
    {
      id: 4,
      name: 'Mariana Rivas',
      avatar: '👩‍💼',
      tier: 'Plata Frecuente',
      totalSpent: 295.80,
      ordersCount: 18,
      favoriteBurger: 'Burger Trufa & Portobello',
      lastOrder: 'Hace 3 días',
      badge: '💎 Truffle Hunter'
    },
    {
      id: 5,
      name: 'Diego Fernández',
      avatar: '👨‍💻',
      tier: 'Plata Frecuente',
      totalSpent: 260.00,
      ordersCount: 16,
      favoriteBurger: 'Burger Real Clásica',
      lastOrder: 'Hace 4 días',
      badge: '🍔 Clásicos Fan'
    }
  ],
  consumptionHours: [
    { hour: '12:00 - 14:00', label: 'Almuerzo Ejecutivo', percentage: 38 },
    { hour: '14:00 - 18:00', label: 'Tarde / Merienda', percentage: 14 },
    { hour: '19:00 - 22:30', label: 'Cena & Delivery Pico', percentage: 42 },
    { hour: '22:30 - 01:00', label: 'Late Night Burgers', percentage: 6 }
  ]
};

// Formatter to guarantee 100% backward compatibility with React PWA, Admin & Astro Ecommerce
function formatProductRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    idempiere_product_id: row.idempiere_product_id,
    idempiereProductId: row.idempiere_product_id,
    sku: row.sku,
    name: row.name,
    erpName: row.erp_name,
    erp_name: row.erp_name,
    category: row.category_pwa,
    category_pwa: row.category_pwa,
    categoryPwa: row.category_pwa,
    badge: row.badge,
    badgeType: row.badge_type,
    badge_type: row.badge_type,
    price: Number(row.price),
    price_list: Number(row.price_list || row.price),
    priceList: Number(row.price_list || row.price),
    uom: row.uom || 'Unidad',
    stock: Number(row.stock),
    rating: Number(row.rating || 4.8),
    calories: row.calories,
    prepTime: row.prep_time,
    prep_time: row.prep_time,
    pairing: row.pairing,
    image: row.image_url,
    image_url: row.image_url,
    imageUrl: row.image_url,
    imageThumb: row.image_thumb || row.image_url,
    image_thumb: row.image_thumb || row.image_url,
    description: row.description,
    erpDescription: row.erp_description,
    erp_description: row.erp_description,
    isActive: row.is_active === 1,
    is_active: row.is_active,
    isFeatured: row.is_featured === 1,
    is_featured: row.is_featured,
    displayOrder: row.display_order,
    display_order: row.display_order,
    syncStatus: row.sync_status,
    sync_status: row.sync_status,
    lastSyncedAt: row.last_synced_at,
    last_synced_at: row.last_synced_at
  };
}

function formatOrderRow(row) {
  if (!row) return null;
  let items = [];
  try {
    items = typeof row.items_json === 'string' ? JSON.parse(row.items_json) : (row.items_json || []);
  } catch {
    items = [];
  }

  let coords = { lat: -12.1218, lng: -77.0298 };
  try {
    coords = typeof row.delivery_coords_json === 'string' ? JSON.parse(row.delivery_coords_json) : (row.delivery_coords_json || coords);
  } catch {
    coords = { lat: -12.1218, lng: -77.0298 };
  }

  return {
    id: row.id,
    origin: row.origin,
    originLabel: row.origin_label,
    agent: row.agent,
    clientName: row.client_name,
    clientTaxId: row.client_tax_id,
    date: row.date,
    items,
    totalAmount: Number(row.total_amount),
    status: row.status,
    erpDocNo: row.erp_doc_no,
    paymentTerm: row.payment_term,
    warehouseRequested: row.warehouse_requested,
    deliveryAddress: row.delivery_address,
    deliveryCoords: coords,
    vehicle: row.vehicle || 'moto'
  };
}

async function initDB() {
  try {
    console.log(`🔌 [SQLite] Conectando a base de datos local en: ${DB_PATH}`);
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');

    // 1. Products Table
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idempiere_product_id INTEGER UNIQUE,
        sku TEXT NOT NULL UNIQUE,
        erp_name TEXT NOT NULL,
        erp_description TEXT,
        price REAL NOT NULL DEFAULT 0.0,
        price_list REAL DEFAULT 0.0,
        uom TEXT DEFAULT 'Unidad',
        stock INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        image_thumb TEXT,
        category_pwa TEXT NOT NULL DEFAULT 'burgers',
        badge TEXT,
        badge_type TEXT DEFAULT 'special',
        calories TEXT,
        prep_time TEXT,
        pairing TEXT,
        rating REAL DEFAULT 4.8,
        is_featured INTEGER DEFAULT 0,
        display_order INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        last_synced_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_products_idempiere ON products(idempiere_product_id);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_pwa);
    `);

    // 2. Categories Mapping Table
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS categories_mapping (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        idempiere_category_id INTEGER,
        icon_image TEXT,
        display_order INTEGER DEFAULT 0
      );
    `);

    // 3. Sync History Table
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS sync_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_type TEXT NOT NULL,
        items_total INTEGER DEFAULT 0,
        items_created INTEGER DEFAULT 0,
        items_updated INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        error_details TEXT,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Orders Table
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        origin TEXT NOT NULL,
        origin_label TEXT,
        agent TEXT,
        client_name TEXT NOT NULL,
        client_tax_id TEXT,
        date TEXT NOT NULL,
        items_json TEXT NOT NULL,
        total_amount REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'pending_erp',
        erp_doc_no TEXT,
        payment_term TEXT,
        warehouse_requested TEXT,
        delivery_address TEXT,
        delivery_coords_json TEXT,
        vehicle TEXT DEFAULT 'moto',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if products need seeding
    const countStmt = dbInstance.prepare('SELECT COUNT(*) as count FROM products');
    const { count } = countStmt.get();

    if (count === 0) {
      console.log('🌱 [SQLite] Inicializando catálogo oficial de Hamburger Rapid (10 hamburguesas + enlaces iDempiere)...');
      const insertProdStmt = dbInstance.prepare(`
        INSERT INTO products (
          id, idempiere_product_id, sku, erp_name, name, category_pwa, badge, badge_type,
          price, price_list, uom, stock, rating, calories, prep_time, pairing,
          image_url, image_thumb, description, is_featured, display_order, sync_status, last_synced_at
        ) VALUES (
          @id, @idempiere_product_id, @sku, @erp_name, @name, @category_pwa, @badge, @badge_type,
          @price, @price_list, @uom, @stock, @rating, @calories, @prep_time, @pairing,
          @image_url, @image_url, @description, @is_featured, @display_order, 'synced', CURRENT_TIMESTAMP
        )
      `);

      const insertMany = dbInstance.transaction((products) => {
        for (const p of products) insertProdStmt.run(p);
      });
      insertMany(INITIAL_PRODUCTS);
    }

    // Check if categories need seeding
    const catCount = dbInstance.prepare('SELECT COUNT(*) as count FROM categories_mapping').get().count;
    if (catCount === 0) {
      const insertCatStmt = dbInstance.prepare(`
        INSERT INTO categories_mapping (code, name, icon_image, display_order)
        VALUES (@code, @name, @icon_image, @display_order)
      `);
      const insertCats = dbInstance.transaction((cats) => {
        for (const c of cats) insertCatStmt.run(c);
      });
      insertCats(INITIAL_CATEGORIES);
    }

    // Check if orders need seeding
    const ordCount = dbInstance.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    if (ordCount === 0) {
      const insertOrdStmt = dbInstance.prepare(`
        INSERT INTO orders (
          id, origin, origin_label, agent, client_name, client_tax_id, date,
          items_json, total_amount, status, erp_doc_no, payment_term,
          warehouse_requested, delivery_address, delivery_coords_json, vehicle
        ) VALUES (
          @id, @origin, @origin_label, @agent, @client_name, @client_tax_id, @date,
          @items_json, @total_amount, @status, @erp_doc_no, @payment_term,
          @warehouse_requested, @delivery_address, @delivery_coords_json, @vehicle
        )
      `);
      const insertOrds = dbInstance.transaction((ords) => {
        for (const o of ords) insertOrdStmt.run(o);
      });
      insertOrds(INITIAL_ORDERS);
    }

    console.log('✅ [SQLite] Base de datos operativa y sincronizada con éxito.');
  } catch (error) {
    console.error('❌ [SQLite] Error inicializando SQLite:', error.message);
    throw error;
  }
}

function getDatabase() {
  if (!dbInstance) {
    initDB();
  }
  return dbInstance;
}

async function getProducts() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM products ORDER BY display_order ASC, id ASC').all();
  return rows.map(formatProductRow);
}

async function addProduct(prod) {
  const db = getDatabase();
  const numPrice = parseFloat(prod.price) || 9.99;
  const numStock = parseInt(prod.stock, 10) || 20;
  const sku = prod.sku || `BUR-GEN-${Date.now().toString().slice(-4)}`;
  const idempiereId = prod.idempiere_product_id || prod.idempiereProductId || (2000000 + Math.floor(Math.random() * 90000));

  const stmt = db.prepare(`
    INSERT INTO products (
      idempiere_product_id, sku, erp_name, name, category_pwa, badge, badge_type,
      price, price_list, uom, stock, rating, calories, prep_time, pairing,
      image_url, image_thumb, description, is_featured, display_order, sync_status, last_synced_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, 'local_only', CURRENT_TIMESTAMP
    )
  `);

  const result = stmt.run(
    idempiereId,
    sku,
    prod.name,
    prod.name,
    prod.category || prod.category_pwa || 'Especiales de la Casa',
    prod.badge || '🔥 Especial',
    prod.badgeType || prod.badge_type || 'special',
    numPrice,
    prod.priceList || numPrice,
    prod.uom || 'Unidad',
    numStock,
    parseFloat(prod.rating) || 4.8,
    prod.calories || '750 kcal',
    prod.prepTime || prod.prep_time || '10-12 min',
    prod.pairing || 'Bebida Helada',
    prod.image || prod.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    prod.image || prod.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    prod.description || 'Hamburguesa artesanal preparada con ingredientes frescos al instante.',
    prod.isFeatured ? 1 : 0,
    99
  );

  const newRow = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  return formatProductRow(newRow);
}

async function updateProductStock(id, newStock) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  const info = stmt.run(parseInt(newStock, 10), parseInt(id, 10));
  return info.changes > 0;
}

async function deleteProduct(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  const info = stmt.run(parseInt(id, 10));
  return info.changes > 0;
}

async function resetProducts() {
  const db = getDatabase();
  db.exec('DELETE FROM products');
  const insertProdStmt = db.prepare(`
    INSERT INTO products (
      id, idempiere_product_id, sku, erp_name, name, category_pwa, badge, badge_type,
      price, price_list, uom, stock, rating, calories, prep_time, pairing,
      image_url, image_thumb, description, is_featured, display_order, sync_status, last_synced_at
    ) VALUES (
      @id, @idempiere_product_id, @sku, @erp_name, @name, @category_pwa, @badge, @badge_type,
      @price, @price_list, @uom, @stock, @rating, @calories, @prep_time, @pairing,
      @image_url, @image_url, @description, @is_featured, @display_order, 'synced', CURRENT_TIMESTAMP
    )
  `);

  const insertMany = db.transaction((products) => {
    for (const p of products) insertProdStmt.run(p);
  });
  insertMany(INITIAL_PRODUCTS);
}

function getConsumerMetrics() {
  return CONSUMER_METRICS;
}

function getDbStatus() {
  let records = 0;
  try {
    const db = getDatabase();
    records = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  } catch {
    records = INITIAL_PRODUCTS.length;
  }

  return {
    mode: 'sqlite',
    engine: 'better-sqlite3',
    connected: true,
    databaseFile: DB_PATH,
    table: 'products',
    records,
    lastError: null
  };
}

async function getOrders() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM orders ORDER BY rowid DESC').all();
  return rows.map(formatOrderRow);
}

async function addOrder(orderData) {
  const db = getDatabase();
  const orderId = orderData.id || `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const itemsJson = typeof orderData.items === 'string' ? orderData.items : JSON.stringify(orderData.items || []);
  const coordsJson = typeof orderData.deliveryCoords === 'string' ? orderData.deliveryCoords : JSON.stringify(orderData.deliveryCoords || { lat: -12.1218, lng: -77.0298 });

  const stmt = db.prepare(`
    INSERT INTO orders (
      id, origin, origin_label, agent, client_name, client_tax_id, date,
      items_json, total_amount, status, erp_doc_no, payment_term,
      warehouse_requested, delivery_address, delivery_coords_json, vehicle
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, 'pending_erp', ?, ?,
      ?, ?, ?, ?
    )
  `);

  stmt.run(
    orderId,
    orderData.origin || 'ecommerce',
    orderData.originLabel || (orderData.origin === 'pwa' ? 'PWA Preventa' : 'E-commerce Web'),
    orderData.agent || 'Cliente Directo',
    orderData.clientName || 'Cliente Gourmet',
    orderData.clientTaxId || 'DNI ' + Math.floor(10000000 + Math.random() * 90000000),
    dateStr,
    itemsJson,
    Number(orderData.totalAmount) || 0,
    orderData.erpDocNo || null,
    orderData.paymentTerm || 'Pago Online Inmediato',
    orderData.warehouseRequested || 'HQ Warehouse (103)',
    orderData.deliveryAddress || 'Av. José Larco 812, Miraflores, Lima',
    coordsJson,
    orderData.vehicle || 'moto'
  );

  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  return formatOrderRow(row);
}

function getOrderTracking(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  const order = formatOrderRow(row);

  return {
    orderId: order.id,
    clientName: order.clientName,
    originWarehouse: {
      name: 'Almacén Central San Isidro',
      address: 'Av. Rivera Navarrete 501, San Isidro, Lima',
      lat: -12.0969,
      lng: -77.0354
    },
    destination: {
      address: order.deliveryAddress,
      coords: order.deliveryCoords
    },
    vehicle: order.vehicle || 'moto',
    status: order.status
  };
}

module.exports = {
  getDatabase,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  initDB,
  getProducts,
  addProduct,
  updateProductStock,
  deleteProduct,
  resetProducts,
  getConsumerMetrics,
  getDbStatus,
  getOrders,
  addOrder,
  getOrderTracking
};
