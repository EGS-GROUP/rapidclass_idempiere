const mysql = require('mysql2/promise');

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Rey de las Burgers',
    category: 'Especiales de la Casa',
    badge: '👑 Corona de Oro • Edición Legendaria',
    badgeType: 'legendary',
    price: 14.99,
    stock: 45,
    rating: 4.9,
    calories: '980 kcal',
    prepTime: '10-12 min',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    description: 'Doble medallón de carne Angus Black 100% flameada al roble vivo, queso cheddar inglés añejado 12 meses, mermelada artesanal de panceta ahumada al bourbon, cebolla caramelizada y salsa secreta Real en pan brioche dorado a la manteca.'
  },
  {
    id: 2,
    name: 'Burger Real Clásica',
    category: 'Clásicas',
    badge: '⭐ Clásica de Autor',
    badgeType: 'signature',
    price: 9.99,
    stock: 60,
    rating: 4.8,
    calories: '650 kcal',
    prepTime: '8-10 min',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
    description: 'Medallón de res seleccionada a la plancha de hierro fundido, doble loncha de queso cheddar fundido, pepinillos encurtidos en casa con eneldo, lechuga romana crujiente, tomate pera y suave emulsión imperial.'
  },
  {
    id: 3,
    name: 'Burger Real Doble',
    category: 'Especiales de la Casa',
    badge: '🔥 Doble Impacto',
    badgeType: 'double',
    price: 12.50,
    stock: 38,
    rating: 4.9,
    calories: '890 kcal',
    prepTime: '12-14 min',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    description: 'Dos carnes smash con costra caramelizada profunda, cuádruple queso americano extra derretido, panceta crujiente curada al manzano, cebolla frita crocante y salsa barbacoa ahumada artesanal.'
  },
  {
    id: 4,
    name: 'Burger Doble Especial',
    category: 'Especiales de la Casa',
    badge: '✨ Edición Especial',
    badgeType: 'special',
    price: 13.50,
    stock: 30,
    rating: 4.9,
    calories: '920 kcal',
    prepTime: '12-14 min',
    image: 'https://images.unsplash.com/photo-1583032015879-bf67245d55e5?w=800&auto=format&fit=crop&q=80',
    description: 'Doble blend premium de picaña y asado de tira, queso Monterrey Jack fundido con pimientos asados, huevo de campo frito con yema trufada, jamón serrano crocante y mayonesa de ajo negro.'
  },
  {
    id: 5,
    name: 'Burger Trufa & Portobello',
    category: 'Gourmet',
    badge: '💎 Gourmet Select',
    badgeType: 'gourmet',
    price: 15.50,
    stock: 25,
    rating: 5.0,
    calories: '810 kcal',
    prepTime: '14-16 min',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop&q=80',
    description: 'Carne madurada Dry-Aged 30 días, sombrero de hongo Portobello glaseado al vino tinto, queso suizo Emmental gratinado y untuosa mayonesa de trufas negras silvestres del Piamonte.'
  },
  {
    id: 6,
    name: 'Burger Crispy Smokehouse',
    category: 'Pollo & Crispy',
    badge: '🍗 Pollo Crujiente',
    badgeType: 'crispy',
    price: 11.99,
    stock: 40,
    rating: 4.7,
    calories: '740 kcal',
    prepTime: '10-12 min',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&auto=format&fit=crop&q=80',
    description: 'Suprema de pechuga campera marinada 24 horas en buttermilk y pimentón ahumado, rebozada en copos crujientes, ensalada fresca coleslaw de repollo morado y miel picante habanero-maple.'
  },
  {
    id: 7,
    name: 'Burger BBQ Bourbon Flame',
    category: 'Especiales de la Casa',
    badge: '🔥 Ahumada a la Leña',
    badgeType: 'smoke',
    price: 13.99,
    stock: 32,
    rating: 4.8,
    calories: '860 kcal',
    prepTime: '12-15 min',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop&q=80',
    description: 'Medallón de res ahumado pacientemente con virutas de roble, aros de cebolla artesanalmente rebozados a la cerveza rubia, queso provolone fundido y generoso glaseado barbacoa bourbon ahumado.'
  },
  {
    id: 8,
    name: 'Burger Bacon Cheese Deluxe',
    category: 'Clásicas',
    badge: '🥓 Favorita Clásica',
    badgeType: 'bacon',
    price: 10.99,
    stock: 50,
    rating: 4.8,
    calories: '720 kcal',
    prepTime: '8-10 min',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&auto=format&fit=crop&q=80',
    description: '180g de carne jugosa a la parrilla, triple tira de tocino ahumado de corte grueso extra crocante, quesos gouda y cheddar fundidos al vapor, cebolla morada macerada y mostaza antigua en grano.'
  },
  {
    id: 9,
    name: 'Burger Guacamole & Chipotle Crunch',
    category: 'Especiales de la Casa',
    badge: '🥑 Fusión Picante',
    badgeType: 'fusion',
    price: 12.99,
    stock: 35,
    rating: 4.7,
    calories: '780 kcal',
    prepTime: '10-12 min',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&auto=format&fit=crop&q=80',
    description: 'Carne a la parrilla sobre cama de guacamole rústico con toque de lima fresca y cilantro, totopos crocantes de maíz, queso fundido flameado y mayonesa ahumada al chile chipotle morita.'
  },
  {
    id: 10,
    name: 'Burger Green Garden Truffle',
    category: 'Vegetariana',
    badge: '🌱 100% Plant-Based',
    badgeType: 'veggie',
    price: 11.50,
    stock: 28,
    rating: 4.8,
    calories: '590 kcal',
    prepTime: '10-12 min',
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=800&auto=format&fit=crop&q=80',
    description: 'Medallón artesanal a base de lentejas francesas, quinoa andina y setas salteadas, queso vegetal cremoso ahumado, hojas de rúcula silvestre, tomate seco italiano y crema suave de trufa en pan rústico.'
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

let inMemoryProducts = [...INITIAL_PRODUCTS];
let isConnectedToMySQL = false;
let pool = null;
let lastDbError = null;

async function initDB() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'hamburger_rapid';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  try {
    console.log(`🔌 [DB] Intentando conexión directa a MySQL (${host}:${port}, db: ${database})...`);
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 4000
    });

    const connection = await pool.getConnection();
    console.log('✅ [DB] Conexión establecida con MySQL!');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        badge VARCHAR(100) DEFAULT NULL,
        badgeType VARCHAR(50) DEFAULT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        rating DECIMAL(3,1) DEFAULT 4.8,
        calories VARCHAR(50) DEFAULT NULL,
        prepTime VARCHAR(50) DEFAULT NULL,
        image VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log('🌱 [DB] Inicializando catálogo oficial de Hamburger Rapid en MySQL (10 hamburguesas destacadas)...');
      for (const p of INITIAL_PRODUCTS) {
        await connection.query(
          'INSERT INTO products (name, category, badge, badgeType, price, stock, rating, calories, prepTime, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.name, p.category, p.badge, p.badgeType, p.price, p.stock, p.rating, p.calories, p.prepTime, p.image, p.description]
        );
      }
    }

    connection.release();
    isConnectedToMySQL = true;
    lastDbError = null;
  } catch (error) {
    lastDbError = error.message;
    console.warn(`⚠️ [DB] No se pudo conectar a MySQL: ${error.message}. Operando en modo In-Memory con persistencia de sesión.`);
    isConnectedToMySQL = false;
  }
}

async function getProducts() {
  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM products ORDER BY id ASC');
      return rows;
    } catch (err) {
      console.error('Error consultando MySQL, recurriendo a memoria local:', err.message);
      lastDbError = err.message;
    }
  }
  return inMemoryProducts;
}

async function addProduct(prod) {
  const { name, category, badge, badgeType, price, stock, rating, calories, prepTime, image, description } = prod;
  const numPrice = parseFloat(price) || 9.99;
  const numStock = parseInt(stock, 10) || 20;

  if (isConnectedToMySQL && pool) {
    const [result] = await pool.query(
      'INSERT INTO products (name, category, badge, badgeType, price, stock, rating, calories, prepTime, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category || 'Especiales de la Casa', badge || '🔥 Especial', badgeType || 'special', numPrice, numStock, rating || 4.8, calories || '750 kcal', prepTime || '10 min', image || '', description || '']
    );
    return { id: result.insertId, ...prod, price: numPrice, stock: numStock };
  }

  const newProduct = {
    id: Date.now(),
    name,
    category: category || 'Especiales de la Casa',
    badge: badge || '🔥 Especial',
    badgeType: badgeType || 'special',
    price: numPrice,
    stock: numStock,
    rating: parseFloat(rating) || 4.8,
    calories: calories || '750 kcal',
    prepTime: prepTime || '10-12 min',
    image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    description: description || 'Hamburguesa artesanal preparada con ingredientes frescos al instante.'
  };
  inMemoryProducts.unshift(newProduct);
  return newProduct;
}

async function updateProductStock(id, newStock) {
  const numId = parseInt(id, 10);
  const stockVal = parseInt(newStock, 10);
  if (isConnectedToMySQL && pool) {
    await pool.query('UPDATE products SET stock = ? WHERE id = ?', [stockVal, numId]);
    return true;
  }
  const item = inMemoryProducts.find(p => p.id === numId);
  if (item) {
    item.stock = stockVal;
    return true;
  }
  return false;
}

async function deleteProduct(id) {
  const numId = parseInt(id, 10);
  if (isConnectedToMySQL && pool) {
    await pool.query('DELETE FROM products WHERE id = ?', [numId]);
    return true;
  }
  inMemoryProducts = inMemoryProducts.filter(p => p.id !== numId);
  return true;
}

async function resetProducts() {
  if (isConnectedToMySQL && pool) {
    await pool.query('TRUNCATE TABLE products');
    for (const p of INITIAL_PRODUCTS) {
      await pool.query(
        'INSERT INTO products (name, category, badge, badgeType, price, stock, rating, calories, prepTime, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.category, p.badge, p.badgeType, p.price, p.stock, p.rating, p.calories, p.prepTime, p.image, p.description]
      );
    }
    return;
  }
  inMemoryProducts = [...INITIAL_PRODUCTS];
}

function getConsumerMetrics() {
  return CONSUMER_METRICS;
}

function getDbStatus() {
  return {
    mode: isConnectedToMySQL ? 'mysql' : 'in-memory',
    connected: isConnectedToMySQL,
    host: process.env.DB_HOST || (process.env.DATABASE_URL ? 'via-database-url' : 'in-memory-fallback'),
    database: process.env.DB_NAME || 'hamburger_rapid',
    user: process.env.DB_USER || 'root',
    table: 'products',
    records: inMemoryProducts.length,
    lastError: lastDbError
  };
}

module.exports = {
  INITIAL_PRODUCTS,
  initDB,
  getProducts,
  addProduct,
  updateProductStock,
  deleteProduct,
  resetProducts,
  getConsumerMetrics,
  getDbStatus
};
