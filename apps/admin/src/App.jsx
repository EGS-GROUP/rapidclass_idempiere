import React, { useState, useEffect } from 'react';
import AuthGuard from './components/AuthGuard';
import OrdersManagement from './components/OrdersManagement';
import ProfileSection from './components/ProfileSection';

const FALLBACK_BURGERS = [
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
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
    description: 'Doble carne Angus Black 100%, cheddar inglés añejado 12 meses, mermelada de bacon al bourbon y pan brioche artesanal.'
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
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80',
    description: 'Carne a la plancha de hierro fundido, doble queso cheddar fundido, pepinillos encurtidos y salsa imperial.'
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
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80',
    description: 'Dos carnes smash con costra caramelizada, cuádruple queso americano, panceta crujiente y BBQ ahumada.'
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
    image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&auto=format&fit=crop&q=80',
    description: 'Doble blend picaña, queso Monterrey Jack, huevo de campo frito, jamón serrano y alioli de ajo negro.'
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
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&auto=format&fit=crop&q=80',
    description: 'Carne madurada 30 días, Portobello glaseado al vino tinto, queso Emmental gratinado y mayonesa de trufas.'
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
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&auto=format&fit=crop&q=80',
    description: 'Suprema campesina marinada 24h en buttermilk, tempura ultracrujiente, coleslaw de col morada y miel habanero-maple.'
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
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&auto=format&fit=crop&q=80',
    description: 'Ahumada con virutas de roble, aros de cebolla rebozados a la cerveza, queso provolone y reducción BBQ Bourbon.'
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
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&auto=format&fit=crop&q=80',
    description: 'Res jugosa a la parrilla, triple tocino ahumado grueso extra crocante, quesos gouda y cheddar.'
  },
  {
    id: 9,
    name: 'Burger Guacamole & Chipotle',
    category: 'Especiales de la Casa',
    badge: '🥑 Fusión Picante',
    badgeType: 'fusion',
    price: 12.99,
    stock: 35,
    rating: 4.7,
    calories: '780 kcal',
    prepTime: '10-12 min',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&auto=format&fit=crop&q=80',
    description: 'Guacamole rústico con lima y cilantro fresco, totopos crujientes de maíz, queso flameado y alioli de chipotle.'
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
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=400&auto=format&fit=crop&q=80',
    description: 'Medallón de lentejas, quinoa y hongos, queso cremoso vegetal ahumado, rúcula y crema de trufa.'
  }
];

const FALLBACK_METRICS = {
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

function AdminDashboard({ session, logout }) {
  const [activeSection, setActiveSection] = useState('orders'); // 'orders' | 'burgers' | 'consumers' | 'database'
  const [burgers, setBurgers] = useState(FALLBACK_BURGERS);
  const [metrics, setMetrics] = useState(FALLBACK_METRICS);
  const [dbStatus, setDbStatus] = useState({
    mode: 'in-memory',
    connected: false,
    host: 'localhost',
    database: 'hamburger_rapid',
    table: 'products',
    records: 10
  });
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Burger form state
  const [newBurger, setNewBurger] = useState({
    name: '',
    category: 'Especiales de la Casa',
    badge: '👑 Edición Especial',
    price: '',
    stock: 30,
    description: '',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80'
  });

  // Fetch initial telemetry and products
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Health
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        if (healthData.database) setDbStatus(healthData.database);
      }

      // 2. Fetch Products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.success && prodData.data && prodData.data.length > 0) {
          setBurgers(prodData.data);
        }
      }

      // 3. Fetch Metrics
      const metRes = await fetch('/api/metrics');
      if (metRes.ok) {
        const metData = await metRes.json();
        if (metData.success && metData.metrics) {
          setMetrics(metData.metrics);
        }
      }
    } catch {
      // Keep fallbacks
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick stock adjust
  const handleStockChange = (id, delta) => {
    setBurgers(prev => prev.map(b => {
      if (b.id === id) {
        const newStock = Math.max(0, b.stock + delta);
        fetch(`/api/products/${id}/stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: newStock })
        }).catch(() => {});
        return { ...b, stock: newStock };
      }
      return b;
    }));
  };

  // Toggle availability
  const handleToggleAvailable = (id) => {
    setBurgers(prev => prev.map(b => {
      if (b.id === id) {
        const newStock = b.stock === 0 ? 25 : 0;
        fetch(`/api/products/${id}/stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: newStock })
        }).catch(() => {});
        return { ...b, stock: newStock };
      }
      return b;
    }));
  };

  // Create Burger
  const handleCreateBurger = async (e) => {
    e.preventDefault();
    if (!newBurger.name || !newBurger.price) {
      alert('Por favor completa nombre y precio');
      return;
    }
    const created = {
      id: Date.now(),
      ...newBurger,
      price: parseFloat(newBurger.price),
      stock: parseInt(newBurger.stock, 10),
      rating: 4.9,
      calories: '750 kcal',
      prepTime: '10 min'
    };

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch {
      // client update
    }

    setBurgers(prev => [created, ...prev]);
    setIsCreateModalOpen(false);
    setNewBurger({
      name: '',
      category: 'Especiales de la Casa',
      badge: '👑 Edición Especial',
      price: '',
      stock: 30,
      description: '',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80'
    });
  };

  // Reset database demo
  const handleResetCatalog = async () => {
    if (!confirm('¿Restablecer el catálogo oficial de Hamburger Rapid con las 10 hamburguesas iniciales?')) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        alert('✅ Catálogo oficial restablecido exitosamente.');
        fetchDashboardData();
      }
    } catch (err) {
      alert('Error restableciendo datos: ' + err.message);
    }
  };

  // Filtered Burgers
  const filteredBurgers = burgers.filter(b => {
    const matchesCat = filterCategory === 'Todas' || b.category === filterCategory;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.badge?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Operations Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            color: 'white',
            boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)'
          }}>
            🍔
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0F172A' }}>
                HAMBURGER <span style={{ color: '#D97706' }}>RAPID</span>
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '800',
                background: '#FEF3C7',
                color: '#92400E',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                ADMIN SUITE v1.0
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Panel de Control, Métricas de Consumo & Telemetría
            </div>
          </div>
        </div>

        {/* Database & Quick Links & ERP Session Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Active Context Badge -> Links to Profile */}
          <button
            onClick={() => setActiveSection('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeSection === 'profile' ? '#FEF3C7' : '#FFFBEB',
              border: '1px solid',
              borderColor: activeSection === 'profile' ? '#F59E0B' : '#FDE68A',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#92400E',
              cursor: 'pointer'
            }}
            title="Ver Perfil y Configuración de Conexión"
          >
            <span>👤 Sesión: <b>{session?.userName || 'Admin'}</b> (Org #{session?.organizationId || session?.orgId || '11'})</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: dbStatus?.connected ? '#ECFDF5' : '#FFFBEB',
            border: '1px solid',
            borderColor: dbStatus?.connected ? '#A7F3D0' : '#FDE68A',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: '700',
            color: dbStatus?.connected ? '#065F46' : '#92400E'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dbStatus?.connected ? '#10B981' : '#F59E0B'
            }} />
            <span>DB: {dbStatus?.mode === 'sqlite' ? 'SQLite Datamart' : (dbStatus?.mode === 'mysql' ? 'MySQL Conectado' : 'Modo In-Memory')}</span>
          </div>

          <a
            href="/"
            style={{
              background: '#F1F5F9',
              color: '#0F172A',
              textDecoration: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700',
              border: '1px solid #CBD5E1'
            }}
          >
            🌐 Landing E-commerce
          </a>

          <a
            href="/app"
            style={{
              background: '#D97706',
              color: 'white',
              textDecoration: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}
          >
            📱 App Móvil PWA
          </a>

          {/* Cerrar Sesión */}
          <button
            onClick={logout}
            style={{
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Cerrar sesión autorizada"
          >
            <span>🚪 Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        
        {/* KPI Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Card 1: Revenue */}
          <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
              <span>VENTAS ESTIMADAS DEL MES</span>
              <span style={{ color: '#10B981', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>+14.8%</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A' }}>
              ${metrics.totalRevenueMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
              Ticket promedio: <b>${metrics.avgOrderValue.toFixed(2)}</b>
            </div>
          </div>

          {/* Card 2: Burgers Available */}
          <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
              <span>HAMBURGUESAS ACTIVAS</span>
              <span style={{ color: '#D97706', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>10 Destacadas</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A' }}>
              {burgers.length} Variantes
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
              Stock total en sucursal: <b>{burgers.reduce((acc, b) => acc + b.stock, 0)} unidades</b>
            </div>
          </div>

          {/* Card 3: Customers */}
          <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
              <span>CONSUMIDORES REGISTRADOS</span>
              <span style={{ color: '#6366F1', background: '#EEF2FF', padding: '2px 6px', borderRadius: '4px' }}>VIP Oro & Plata</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A' }}>
              {metrics.totalCustomers.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
              Activos este mes: <b>{metrics.activeThisMonth.toLocaleString()} clientes</b>
            </div>
          </div>

          {/* Card 4: Database Telemetry */}
          <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
              <span>ESTADO DE BASE DE DATOS</span>
              <span style={{ color: dbStatus.connected ? '#10B981' : '#F59E0B' }}>● En Línea</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: dbStatus.connected ? '#065F46' : '#D97706', lineHeight: 1.3 }}>
              {dbStatus.mode === 'sqlite' ? 'SQLite Datamart Activo' : (dbStatus.mode === 'mysql' ? 'MySQL Activo' : 'In-Memory DB')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
              Archivo: {dbStatus.databaseFile || 'rapidfood.sqlite'} &bull; Tablas: {dbStatus.table || 'products'} ({dbStatus.records || 0} registros)
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px', overflowX: 'auto' }}>
          {[
            { key: 'orders', label: '📦 Bandeja de Pedidos & Sincronización ERP (3 Capas)', count: 4 },
            { key: 'burgers', label: '🍔 Catálogo de Hamburguesas', count: burgers.length },
            { key: 'consumers', label: '👥 Métricas de Consumidores / Clientes', count: metrics.totalCustomers },
            { key: 'database', label: '🗄️ Estado de la Base de Datos & Telemetría' },
            { key: 'profile', label: '👤 Perfil & Conexión' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 18px',
                borderBottom: '3px solid',
                borderColor: activeSection === tab.key ? '#D97706' : 'transparent',
                color: activeSection === tab.key ? '#D97706' : '#64748B',
                fontWeight: activeSection === tab.key ? '800' : '600',
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  background: activeSection === tab.key ? '#FEF3C7' : '#F1F5F9',
                  color: activeSection === tab.key ? '#92400E' : '#64748B',
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '700'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* SECTION 0: ORDERS MANAGEMENT & ERP */}
        {activeSection === 'orders' && (
          <OrdersManagement session={session} />
        )}

        {/* SECTION 1: BURGERS CATALOG */}
        {activeSection === 'burgers' && (
          <div>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  placeholder="Buscar por nombre, especialidad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    width: '100%',
                    maxWidth: '320px',
                    outline: 'none'
                  }}
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    background: 'white',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                >
                  <option value="Todas">Todas las Categorías</option>
                  <option value="Especiales de la Casa">Especiales de la Casa</option>
                  <option value="Clásicas">Clásicas</option>
                  <option value="Gourmet">Gourmet</option>
                  <option value="Pollo & Crispy">Pollo & Crispy</option>
                  <option value="Vegetariana">Vegetariana</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleResetCatalog}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Resetear a 10 Iniciales
                </button>
                <button
                  onClick={() => setActiveSection('profile')}
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                  }}
                  title="Aprovisionar y sincronizar con iDempiere ERP"
                >
                  <span>🌱 Sembrar / Sincronizar ERP</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{
                    background: '#D97706',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
                  }}
                >
                  + Nueva Hamburguesa
                </button>
              </div>
            </div>

            {/* Burgers Table */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '14px 18px' }}>Hamburguesa</th>
                      <th style={{ padding: '14px 18px' }}>Categoría</th>
                      <th style={{ padding: '14px 18px' }}>Nivel / Badge</th>
                      <th style={{ padding: '14px 18px' }}>Precio</th>
                      <th style={{ padding: '14px 18px' }}>Stock</th>
                      <th style={{ padding: '14px 18px' }}>Estado</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Gestión de Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBurgers.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                        {/* Burger Info */}
                        <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={b.image}
                            alt={b.name}
                            style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: '800', color: '#0F172A' }}>{b.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              ★ {b.rating || 4.8} &bull; {b.calories || '750 kcal'}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '14px 18px', color: '#475569' }}>
                          <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600' }}>
                            {b.category}
                          </span>
                        </td>

                        {/* Specialty Badge */}
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            background: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            color: '#B45309',
                            fontWeight: '700',
                            fontSize: '0.76rem',
                            padding: '3px 10px',
                            borderRadius: '8px'
                          }}>
                            {b.badge || '🔥 Especial'}
                          </span>
                        </td>

                        {/* Price */}
                        <td style={{ padding: '14px 18px', fontWeight: '800', color: '#0F172A', fontSize: '1rem' }}>
                          ${b.price.toFixed(2)}
                        </td>

                        {/* Stock */}
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            color: b.stock > 10 ? '#065F46' : (b.stock > 0 ? '#B45309' : '#991B1B')
                          }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: b.stock > 10 ? '#10B981' : (b.stock > 0 ? '#F59E0B' : '#EF4444')
                            }} />
                            {b.stock} unids
                          </span>
                        </td>

                        {/* Availability Toggle */}
                        <td style={{ padding: '14px 18px' }}>
                          <button
                            onClick={() => handleToggleAvailable(b.id)}
                            style={{
                              background: b.stock > 0 ? '#ECFDF5' : '#FEF2F2',
                              color: b.stock > 0 ? '#065F46' : '#991B1B',
                              border: '1px solid',
                              borderColor: b.stock > 0 ? '#A7F3D0' : '#FECACA',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {b.stock > 0 ? '✓ Disponible' : '✕ Pausada'}
                          </button>
                        </td>

                        {/* Stock Quick Actions */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleStockChange(b.id, -5)}
                              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleStockChange(b.id, +5)}
                              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleStockChange(b.id, +20)}
                              style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#B45309', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              +20
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: CONSUMER & CLIENT CONSUMPTION METRICS */}
        {activeSection === 'consumers' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A' }}>
                Métricas de Consumidores según Nivel de Consumo
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Segmentación estratégica de clientes, hábitos de recompra y contribución de ingresos.
              </p>
            </div>

            {/* Consumption Tiers Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '18px',
              marginBottom: '28px'
            }}>
              {metrics.consumptionTiers.map(tier => (
                <div
                  key={tier.tier}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: tier.color
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: tier.color }}>{tier.badge}</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                        {tier.tier}
                      </h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F172A' }}>{tier.count}</span>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{tier.percentage}% de clientes</div>
                    </div>
                  </div>

                  {/* Revenue Contribution Progress Bar */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', marginBottom: '4px' }}>
                      <span>Participación en Ingresos:</span>
                      <span style={{ fontWeight: '800', color: tier.color }}>{tier.revenueShare}% del total</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${tier.revenueShare}%`, height: '100%', background: tier.color, borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#F8FAFC', padding: '10px', borderRadius: '10px', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Ticket Promedio:</span>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>${tier.avgTicket.toFixed(2)}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Frecuencia:</span>
                      <div style={{ fontWeight: '700', color: '#0F172A' }}>{tier.frequency}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top VIP Consumers Table & Consumption Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '20px' }}>
              
              {/* Top VIP Clients */}
              <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
                      Top 5 Clientes con Mayor Consumo Acumulado
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Consumidores más leales de Hamburger Rapid.</p>
                  </div>
                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.72rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                    VIP Tier
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 12px' }}>Cliente</th>
                        <th style={{ padding: '8px 12px' }}>Nivel</th>
                        <th style={{ padding: '8px 12px' }}>Gasto Total</th>
                        <th style={{ padding: '8px 12px' }}>Órdenes</th>
                        <th style={{ padding: '8px 12px' }}>Favorita</th>
                        <th style={{ padding: '8px 12px' }}>Último Pedido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topConsumers.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#0F172A' }}>
                            <span style={{ fontSize: '1.2rem' }}>{c.avatar}</span>
                            <span>{c.name}</span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: c.tier.includes('Oro') ? '#FEF3C7' : '#F1F5F9', color: c.tier.includes('Oro') ? '#92400E' : '#475569', fontSize: '0.72rem', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                              {c.tier}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: '800', color: '#D97706' }}>
                            ${c.totalSpent.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0F172A' }}>
                            {c.ordersCount}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>
                            {c.favoriteBurger}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '0.78rem' }}>
                            {c.lastOrder}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Peak Consumption Time Slots */}
              <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                  Franjas Horarias de Consumo
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '16px' }}>
                  Distribución de pedidos según momento del día.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {metrics.consumptionHours.map((slot, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#0F172A', fontWeight: '700', marginBottom: '4px' }}>
                        <span>{slot.label} ({slot.hour})</span>
                        <span style={{ color: '#D97706' }}>{slot.percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${slot.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #EA580C)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px', background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px', borderRadius: '12px', fontSize: '0.78rem', color: '#92400E' }}>
                  💡 <b>Insight Comercial:</b> El 80% de las ventas ocurren durante los turnos de Almuerzo (12-14h) y Cena Pico (19-22:30h). Se recomienda maximizar el stock de "Rey de las Burgers" antes de las 18:30h.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 3: DATABASE STATUS & TELEMETRY */}
        {activeSection === 'database' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: dbStatus?.connected ? '#ECFDF5' : '#FFFBEB',
                  border: '1px solid',
                  borderColor: dbStatus?.connected ? '#A7F3D0' : '#FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {dbStatus?.connected ? '🐬' : '⚡'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>
                    Estado del Motor de Base de Datos
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    Hamburger Rapid Data Layer Telemetry
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{
                background: dbStatus?.connected ? '#F0FDF4' : '#FFFBEB',
                border: '1px solid',
                borderColor: dbStatus?.connected ? '#BBF7D0' : '#FDE68A',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: dbStatus?.connected ? '#166534' : '#92400E', marginBottom: '4px' }}>
                  {dbStatus?.connected ? 'Conectado a MySQL Production Pool' : 'Operando con Motor de Persistencia In-Memory'}
                </div>
                <div style={{ fontSize: '0.82rem', color: dbStatus?.connected ? '#15803D' : '#B45309' }}>
                  {dbStatus?.connected 
                    ? 'Transacciones ACID activas, pool de 10 conexiones disponibles y persistencia física en volumen.' 
                    : 'Modo de desarrollo activo. Todos los datos de las 10 hamburguesas y clientes se encuentran cargados en memoria y sincronizados.'}
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '24px', fontSize: '0.85rem' }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700' }}>MODO DE EJECUCIÓN</div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0F172A', marginTop: '2px' }}>
                    {dbStatus?.mode?.toUpperCase() || 'IN-MEMORY'}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700' }}>NOMBRE DE BASE DE DATOS</div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0F172A', marginTop: '2px' }}>
                    {dbStatus?.database || 'hamburger_rapid'}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700' }}>TABLA DE PRODUCTOS</div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0F172A', marginTop: '2px' }}>
                    {burgers.length} Hamburguesas Registradas
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700' }}>SET DE CONSUMIDORES</div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0F172A', marginTop: '2px' }}>
                    {metrics.totalCustomers} Clientes Activos
                  </div>
                </div>
              </div>

              {/* Maintenance Actions */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={fetchDashboardData}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {isLoading ? '⏳ Verificando...' : '🔄 Comprobar Conexión (Ping)'}
                </button>
                <button
                  onClick={handleResetCatalog}
                  style={{
                    flex: 1,
                    background: '#D97706',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  🌱 Re-sembrar Catálogo Oficial
                </button>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 5: PROFILE & BLINDED CONNECTION CONFIGURATION */}
        {activeSection === 'profile' && (
          <ProfileSection session={session} />
        )}

      </main>

      {/* Modal Nueva Hamburguesa */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,23,42,0.6)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                + Agregar Hamburguesa al Catálogo
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBurger} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Nombre de la Hamburguesa:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Burger Imperial BBQ"
                  value={newBurger.name}
                  onChange={(e) => setNewBurger({ ...newBurger, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Categoría:
                  </label>
                  <select
                    value={newBurger.category}
                    onChange={(e) => setNewBurger({ ...newBurger, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  >
                    <option value="Especiales de la Casa">Especiales de la Casa</option>
                    <option value="Clásicas">Clásicas</option>
                    <option value="Gourmet">Gourmet</option>
                    <option value="Pollo & Crispy">Pollo & Crispy</option>
                    <option value="Vegetariana">Vegetariana</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Badge / Nivel:
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 👑 Edición Especial"
                    value={newBurger.badge}
                    onChange={(e) => setNewBurger({ ...newBurger, badge: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Precio ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="12.99"
                    value={newBurger.price}
                    onChange={(e) => setNewBurger({ ...newBurger, price: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Stock Inicial:
                  </label>
                  <input
                    type="number"
                    required
                    value={newBurger.stock}
                    onChange={(e) => setNewBurger({ ...newBurger, stock: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Descripción de Ingredientes:
                </label>
                <textarea
                  rows="2"
                  placeholder="Detalla los ingredientes gourmet..."
                  value={newBurger.description}
                  onChange={(e) => setNewBurger({ ...newBurger, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontWeight: '700' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1.5, padding: '10px', borderRadius: '8px', border: 'none', background: '#D97706', color: 'white', fontWeight: '800' }}
                >
                  Guardar Hamburguesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthGuard>
      {({ session, logout }) => <AdminDashboard session={session} logout={logout} />}
    </AuthGuard>
  );
}
