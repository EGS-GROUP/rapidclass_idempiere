import React, { useState, useEffect } from 'react';
import OrderTrackingModal from './components/OrderTrackingModal';

const FALLBACK_BURGERS = [
  {
    id: 1,
    name: 'Rey de las Burgers',
    category: 'Especiales',
    badge: '👑 Corona de Oro',
    price: 14.99,
    rating: 4.9,
    calories: '980 kcal',
    prepTime: '10-12 min',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    description: 'Doble carne Angus Black 100%, cheddar inglés añejado 12 meses, bacon jam al bourbon y pan brioche dorado.'
  },
  {
    id: 2,
    name: 'Burger Real Clásica',
    category: 'Clásicas',
    badge: '⭐ Clásica de Autor',
    price: 9.99,
    rating: 4.8,
    calories: '650 kcal',
    prepTime: '8-10 min',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    description: 'Carne jugosa a la plancha de hierro, doble queso cheddar fundido, pepinillos encurtidos y salsa imperial.'
  },
  {
    id: 3,
    name: 'Burger Real Doble',
    category: 'Especiales',
    badge: '🔥 Doble Impacto',
    price: 12.50,
    rating: 4.9,
    calories: '890 kcal',
    prepTime: '12-14 min',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    description: 'Doble smash con costra caramelizada, cuádruple queso americano, bacon crocante y BBQ ahumada.'
  },
  {
    id: 4,
    name: 'Burger Doble Especial',
    category: 'Especiales',
    badge: '✨ Edición Especial',
    price: 13.50,
    rating: 4.9,
    calories: '920 kcal',
    prepTime: '12-14 min',
    image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=600&auto=format&fit=crop&q=80',
    description: 'Doble blend picaña, queso Monterrey Jack, huevo de campo frito, jamón serrano y alioli de ajo negro.'
  },
  {
    id: 5,
    name: 'Burger Trufa & Portobello',
    category: 'Gourmet',
    badge: '💎 Gourmet Select',
    price: 15.50,
    rating: 5.0,
    calories: '810 kcal',
    prepTime: '14-16 min',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop&q=80',
    description: 'Carne madurada 30 días, hongo Portobello glaseado al vino tinto, queso Emmental y mayonesa de trufas.'
  },
  {
    id: 6,
    name: 'Burger Crispy Smokehouse',
    category: 'Pollo/Veggie',
    badge: '🍗 Pollo Crujiente',
    price: 11.99,
    rating: 4.7,
    calories: '740 kcal',
    prepTime: '10-12 min',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
    description: 'Pechuga marinada 24h en buttermilk, tempura ultracrujiente, coleslaw fresca y miel habanero-maple.'
  },
  {
    id: 7,
    name: 'Burger BBQ Bourbon Flame',
    category: 'Especiales',
    badge: '🔥 Ahumada a la Leña',
    price: 13.99,
    rating: 4.8,
    calories: '860 kcal',
    prepTime: '12-15 min',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
    description: 'Ahumada al roble vivo, aros de cebolla rebozados a la cerveza rubia, provolone y BBQ Bourbon.'
  },
  {
    id: 8,
    name: 'Burger Bacon Cheese Deluxe',
    category: 'Clásicas',
    badge: '🥓 Favorita Clásica',
    price: 10.99,
    rating: 4.8,
    calories: '720 kcal',
    prepTime: '8-10 min',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80',
    description: 'Res a la parrilla, triple tocino ahumado grueso crocante, mix de quesos gouda y cheddar.'
  },
  {
    id: 9,
    name: 'Burger Guacamole & Chipotle',
    category: 'Especiales',
    badge: '🥑 Fusión Picante',
    price: 12.99,
    rating: 4.7,
    calories: '780 kcal',
    prepTime: '10-12 min',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&auto=format&fit=crop&q=80',
    description: 'Guacamole fresco con toque de lima, totopos crujientes de maíz, queso flameado y alioli chipotle.'
  },
  {
    id: 10,
    name: 'Burger Green Garden Truffle',
    category: 'Pollo/Veggie',
    badge: '🌱 100% Plant-Based',
    price: 11.50,
    rating: 4.8,
    calories: '590 kcal',
    prepTime: '10-12 min',
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80',
    description: 'Medallón de lentejas, quinoa y hongos silvestres, queso vegetal cremoso ahumado y crema de trufa.'
  }
];

const PROMOS = [
  {
    id: 'p1',
    code: 'REY20',
    title: '👑 20% OFF en Rey de las Burgers',
    desc: 'Válido para tu primera orden del rey de la casa.',
    burgerId: 1,
    discountPct: 20
  },
  {
    id: 'p2',
    code: 'DOBLEPACK',
    title: '🔥 Combo Doble Impacto',
    desc: 'Burger Real Doble + Papas Rústicas con $3.00 de descuento.',
    burgerId: 3,
    discountFixed: 3.00
  },
  {
    id: 'p3',
    code: 'CLASICA2X1',
    title: '⭐ 2x1 en Burger Real Clásica',
    desc: 'Lleva la segunda Burger Real Clásica completamente gratis.',
    burgerId: 2,
    isTwoForOne: true
  },
  {
    id: 'p4',
    code: 'RAPIDFREE',
    title: '🛵 Envío Express Gratis',
    desc: 'Envío sin costo en compras superiores a $20.',
    freeShipping: true
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'offers' | 'orders' | 'profile'
  const [burgers, setBurgers] = useState(FALLBACK_BURGERS);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modo Dual: Claro / Oscuro con persistencia en localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('hamburger_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hamburger_theme', theme);
  }, [theme]);

  // Cart & Orders State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(null); // burger object
  const [extras, setExtras] = useState({ extraCheese: false, extraBacon: false, truffleDip: false });
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  
  // Active simulated orders with GPS tracking support
  const [activeOrders, setActiveOrders] = useState([
    {
      id: 'HR-1092',
      items: [
        { name: 'Rey de las Burgers', qty: 1, price: 14.99 },
        { name: 'Papas Rústicas Trufadas', qty: 1, price: 4.50 }
      ],
      total: 19.49,
      status: 'En la Parrilla 🔥',
      step: 2, // 1: Recibido, 2: Parrilla, 3: Empacado, 4: En camino, 5: Entregado
      eta: '8 - 10 min',
      date: 'Hoy, 20:45',
      driver: 'Mateo R. • Moto Honda 125',
      deliveryAddress: 'Av. José Larco 812, Miraflores, Lima',
      deliveryCoords: { lat: -12.1218, lng: -77.0298 },
      vehicle: 'moto'
    }
  ]);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);

  // Network & PWA prompt
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Try fetching products from backend SQLite API
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map(p => ({
            ...p,
            prepTime: p.prep_time || p.prepTime || '8-10 min',
            calories: p.calories ? (String(p.calories).includes('kcal') ? p.calories : `${p.calories} kcal`) : '750 kcal',
            image: p.image_url || p.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
          }));
          setBurgers(mapped);
        }
      })
      .catch(() => {
        // keep fallback burgers
      });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('PWA lista: Puedes agregar Burger Factory a tu pantalla de inicio desde las opciones de tu navegador.');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // Cart operations
  const addToCart = (burger, customExtras = null) => {
    const itemKey = `${burger.id}-${customExtras ? JSON.stringify(customExtras) : 'normal'}`;
    const extraCost = customExtras ? (
      (customExtras.extraCheese ? 1.50 : 0) +
      (customExtras.extraBacon ? 2.00 : 0) +
      (customExtras.truffleDip ? 1.25 : 0)
    ) : 0;
    const finalPrice = burger.price + extraCost;

    setCart(prev => {
      const existing = prev.find(item => item.key === itemKey);
      if (existing) {
        return prev.map(item => item.key === itemKey ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, {
        key: itemKey,
        id: burger.id,
        name: burger.name,
        price: finalPrice,
        basePrice: burger.price,
        image: burger.image,
        badge: burger.badge,
        extras: customExtras,
        qty: 1
      }];
    });
    setIsCustomizing(null);
    setExtras({ extraCheese: false, extraBacon: false, truffleDip: false });
  };

  const updateCartQty = (key, delta) => {
    setCart(prev => prev.map(item => {
      if (item.key === key) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = appliedPromo?.freeShipping || subtotal > 25 || subtotal === 0 ? 0 : 2.50;
  const discountAmount = appliedPromo?.discountPct 
    ? (subtotal * (appliedPromo.discountPct / 100))
    : (appliedPromo?.discountFixed || 0);
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

  // Apply Coupon
  const handleApplyCoupon = (promo) => {
    setAppliedPromo(promo);
    alert(`🎉 ¡Oferta aplicada con éxito!\nCódigo: ${promo.code}\n${promo.title}`);
  };

  // Simulate Checkout Execution
  const handleSimulateCheckout = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      const newOrder = {
        id: `HR-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [...cart],
        total: finalTotal,
        status: 'Recibido en Cocina 👨‍🍳',
        step: 1,
        eta: '12 - 15 min',
        date: 'Recién confirmado',
        driver: 'Mateo R. • Moto Honda 125',
        deliveryAddress: 'Av. José Pardo 450, Miraflores, Lima',
        deliveryCoords: { lat: -12.1218, lng: -77.0298 },
        vehicle: 'moto'
      };
      setActiveOrders(prev => [newOrder, ...prev]);
      setCart([]);
      setIsSimulatingPayment(false);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setActiveTab('orders');
    }, 1400);
  };

  // Step advancement in active order for demo
  const advanceOrderStep = (orderId) => {
    setActiveOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const nextStep = order.step < 4 ? order.step + 1 : 4;
        const statusMap = {
          1: 'Recibido en Cocina 👨‍🍳',
          2: 'En la Parrilla al Carbón 🥩🔥',
          3: 'Empacado & Control Calidad 📦',
          4: '🛵 Repartidor en Camino (Llegando en 4 min)'
        };
        return {
          ...order,
          step: nextStep,
          status: statusMap[nextStep],
          driver: nextStep >= 3 ? 'Mateo R. • Moto Honda 125' : order.driver
        };
      }
      return order;
    }));
  };

  // Filtered Burgers
  const filteredBurgers = burgers.filter(b => {
    const matchesCat = selectedCategory === 'Todas' || 
      (selectedCategory === 'Especiales' && (b.category?.includes('Especial') || b.name.includes('Rey') || b.name.includes('Doble'))) ||
      (selectedCategory === 'Clásicas' && b.category?.includes('Clásica')) ||
      (selectedCategory === 'Gourmet' && b.category?.includes('Gourmet')) ||
      (selectedCategory === 'Pollo/Veggie' && (b.category?.includes('Pollo') || b.category?.includes('Vegetariana')));
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--bg-app)',
      color: 'var(--text-main)',
      position: 'relative'
    }}>
      
      {/* Top Mobile Status & Navigation Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--surface-warm)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5px',
            boxShadow: 'var(--shadow-gold)'
          }}>
            <div style={{ width: '22px', height: '7px', background: 'var(--primary)', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}></div>
            <div style={{ width: '20px', height: '3px', background: '#FFFFFF', borderRadius: '2px' }}></div>
            <div style={{ width: '22px', height: '4px', background: 'var(--primary)', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}></div>
          </div>
          <div>
            <div className="display-title" style={{ fontSize: '1.25rem', color: 'var(--text-main)', lineHeight: 1 }}>
              BURGER FACTORY
            </div>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 800 }}>
              • EST. 2016 • Nextcollege 2027
            </div>
          </div>
        </div>

        {/* Right Actions: Theme Toggle, Install, Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Dual Theme Toggle: Modo Claro / Modo Oscuro */}
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title="Alternar Modo Claro / Oscuro"
            aria-label="Alternar Modo Claro / Oscuro"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface-warm)',
              color: 'var(--text-main)',
              padding: '5px 10px',
              borderRadius: '999px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
          </button>

          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              style={{
                background: 'var(--amber-soft)',
                border: '1px solid var(--primary)',
                color: 'var(--primary-dark)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              📲
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'var(--primary)',
              color: '#0D0D0D',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: '800',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-gold)'
            }}
          >
            <span>🛒</span>
            <span>{cartCount}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 85px' }}>
        
        {/* TAB 1: MENÚ */}
        {activeTab === 'menu' && (
          <div className="fade-in">
            {/* Promo banner */}
            <div style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #1E293B 0%, #311E0C 100%)'
                : 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: theme === 'dark' ? '1px solid #78350F' : '1px solid #FDE68A',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  color: theme === 'dark' ? '#FBBF24' : '#B45309',
                  background: 'var(--amber-soft)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  RECOMENDADO DE HOY
                </span>
                <div className="display-title" style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  👑 Rey de las Burgers + Papas
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Usa el cupón <b>REY20</b> para un 20% de descuento.
                </div>
              </div>
              <button
                onClick={() => {
                  const b = burgers.find(x => x.id === 1) || burgers[0];
                  addToCart(b);
                }}
                style={{
                  background: 'var(--primary)',
                  color: '#0D0D0D',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-gold)'
                }}
              >
                + Pedir
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Buscar hamburguesa, ingredientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}>🔍</span>
            </div>

            {/* Category Filter Pills */}
            <div className="horizontal-scroll" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
              {['Todas', 'Especiales', 'Clásicas', 'Gourmet', 'Pollo/Veggie'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                    background: selectedCategory === cat ? 'var(--primary)' : 'var(--surface)',
                    color: selectedCategory === cat ? '#0D0D0D' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    boxShadow: selectedCategory === cat ? 'var(--shadow-gold)' : 'none'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Burgers Listing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredBurgers.map(b => (
                <div
                  key={b.id}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    padding: '12px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: '800',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'var(--amber-soft)',
                        color: 'var(--primary-dark)'
                      }}>
                        {b.badge || '⭐ Especial'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '700' }}>
                        ★ {b.rating || '4.9'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name}
                    </h4>

                    {/* Detalle de Referencia: Tiempo y Número de Calorías */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '3px 0 5px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <span>⏱️ {b.prepTime || '8-10 min'}</span>
                      <span>•</span>
                      <span>🔥 {b.calories || '750 kcal'}</span>
                    </div>

                    <p style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      margin: '2px 0 6px'
                    }}>
                      {b.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        ${b.price.toFixed(2)}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* Requirement 2.1: Mantén el botón Personalizar */}
                        <button
                          onClick={() => setIsCustomizing(b)}
                          style={{
                            background: 'var(--surface-warm)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-main)',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Personalizar
                        </button>
                        <button
                          onClick={() => addToCart(b)}
                          style={{
                            background: 'var(--primary)',
                            border: 'none',
                            color: '#0D0D0D',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-gold)'
                          }}
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: OFERTAS */}
        {activeTab === 'offers' && (
          <div className="fade-in">
            <div style={{ marginBottom: '14px' }}>
              <h3 className="display-title" style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>🏷️ Ofertas & Cupones</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Canjea códigos promocionales directos para tu orden simulada.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PROMOS.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px dashed var(--primary)',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {p.title}
                    </div>
                    <span style={{
                      background: 'var(--amber-soft)',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary-dark)',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {p.code}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {p.desc}
                  </p>
                  <button
                    onClick={() => handleApplyCoupon(p)}
                    style={{
                      width: '100%',
                      background: appliedPromo?.code === p.code ? '#10B981' : 'var(--primary)',
                      color: appliedPromo?.code === p.code ? '#FFFFFF' : '#0D0D0D',
                      border: 'none',
                      padding: '9px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-gold)'
                    }}
                  >
                    {appliedPromo?.code === p.code ? '✓ Oferta Aplicada' : 'Aplicar al Carrito'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ÓRDENES */}
        {activeTab === 'orders' && (
          <div className="fade-in">
            <div style={{ marginBottom: '14px' }}>
              <h3 className="display-title" style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>📦 Tus Órdenes</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seguimiento en vivo y pedidos completados.</p>
            </div>

            {activeOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍔</div>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>No tienes órdenes activas</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Simula la compra de una hamburguesa desde la pestaña Menú.
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  style={{
                    background: 'var(--primary)',
                    color: '#0D0D0D',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeOrders.map(order => (
                  <div
                    key={order.id}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: '18px',
                      border: '1px solid var(--border)',
                      padding: '16px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          Orden #{order.id}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{order.date}</div>
                      </div>
                      <span style={{
                        background: 'var(--success-soft)',
                        color: 'var(--success)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        fontWeight: '700',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '20px'
                      }}>
                        {order.status}
                      </span>
                    </div>

                    {/* Progress Bar (4 steps) */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '700' }}>
                        <span style={{ color: order.step >= 1 ? 'var(--primary)' : 'var(--text-muted)' }}>1. Recibido</span>
                        <span style={{ color: order.step >= 2 ? 'var(--primary)' : 'var(--text-muted)' }}>2. Parrilla</span>
                        <span style={{ color: order.step >= 3 ? 'var(--primary)' : 'var(--text-muted)' }}>3. Empaque</span>
                        <span style={{ color: order.step >= 4 ? 'var(--primary)' : 'var(--text-muted)' }}>4. Repartidor</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--surface-warm)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(order.step / 4) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>

                    {/* Order Details */}
                    <div style={{ background: 'var(--surface-warm)', borderRadius: '12px', padding: '10px', marginBottom: '12px', fontSize: '0.78rem' }}>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '700' }}>Detalle de productos:</div>
                      {order.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', padding: '2px 0' }}>
                          <span>{it.qty}x {it.name}</span>
                          <span style={{ fontWeight: '600' }}>${(it.price * it.qty).toFixed(2)}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: 'var(--text-main)' }}>
                        <span>Total Pagado:</span>
                        <span style={{ color: 'var(--primary)' }}>${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Delivery Driver Info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      <span>🛵 {order.driver}</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>ETA: {order.eta}</span>
                    </div>

                    {/* GPS Tracking Button */}
                    <button
                      onClick={() => setSelectedTrackingOrder(order)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        border: 'none',
                        color: '#FFFFFF',
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                        marginBottom: '8px'
                      }}
                    >
                      <span>🗺️</span>
                      <span>Ver Seguimiento GPS Satelital en Vivo</span>
                    </button>

                    {/* Simulation Control */}
                    <button
                      onClick={() => advanceOrderStep(order.id)}
                      style={{
                        width: '100%',
                        background: 'var(--surface-warm)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        padding: '6px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ Simular avance de estado en cocina
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PERFIL */}
        {activeTab === 'profile' && (
          <div className="fade-in">
            {/* User Profile Card */}
            <div style={{
              background: 'var(--surface)',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              padding: '18px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '14px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--amber-soft)',
                border: '2px solid var(--primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 10px'
              }}>
                👨‍💼
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>Carlos Mendoza</h3>
              <span style={{
                display: 'inline-block',
                background: 'var(--amber-soft)',
                color: 'var(--primary-dark)',
                fontSize: '0.72rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '12px',
                marginTop: '4px'
              }}>
                👑 Socio VIP Club Oro
              </span>

              {/* Loyalty Points */}
              <div style={{
                marginTop: '16px',
                background: 'var(--surface-warm)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Puntos Rapid acumulados:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>1,450 pts</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  ¡Te faltan solo 50 pts para canjear 1 "Burger Real Clásica" gratis!
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div style={{
              background: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>📍 Dirección de Entrega</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Av. Las Flores 450, Dpto 4B, Miraflores</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>💳 Método de Pago Predeterminado</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Visa Débito •••• 8821 (Aprobado)</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Notificaciones de Delivery</span>
                <span style={{ color: 'var(--success)', fontWeight: '700' }}>Activas 🔔</span>
              </div>
            </div>

            {/* Quick Switch Links */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <a
                href="/"
                style={{
                  flex: 1,
                  background: 'var(--surface-warm)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  textDecoration: 'none',
                  padding: '10px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.78rem'
                }}
              >
                🌐 Ir a Landing
              </a>
              <a
                href="/admin"
                style={{
                  flex: 1,
                  background: 'var(--primary)',
                  color: '#0D0D0D',
                  textAlign: 'center',
                  textDecoration: 'none',
                  padding: '10px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '0.78rem',
                  boxShadow: 'var(--shadow-gold)'
                }}
              >
                ⚙️ Panel Admin
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Button (when items exist) */}
      {cartCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <div style={{
          position: 'absolute',
          bottom: '72px',
          left: '14px',
          right: '14px',
          zIndex: 40
        }}>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              color: '#0D0D0D',
              border: 'none',
              padding: '12px 18px',
              borderRadius: '16px',
              fontWeight: '800',
              fontSize: '0.92rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-gold)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'rgba(0,0,0,0.18)', padding: '2px 8px', borderRadius: '12px' }}>{cartCount}</span>
              <span>Ver Carrito de Compras</span>
            </div>
            <span>${finalTotal.toFixed(2)} ➔</span>
          </button>
        </div>
      )}

      {/* Bottom 4-Tab Navigation Bar */}
      <nav style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '66px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 8px',
        zIndex: 50,
        boxShadow: 'var(--shadow-md)'
      }}>
        {[
          { key: 'menu', label: 'Menú', icon: '🍔' },
          { key: 'offers', label: 'Ofertas', icon: '🏷️' },
          { key: 'orders', label: 'Órdenes', icon: '📦', badge: activeOrders.length > 0 ? activeOrders.length : null },
          { key: 'profile', label: 'Perfil', icon: '👤' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              cursor: 'pointer',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              position: 'relative',
              padding: '6px 12px',
              borderRadius: '12px'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: activeTab === tab.key ? '800' : '600' }}>
              {tab.label}
            </span>
            {tab.badge && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '12px',
                background: 'var(--primary)',
                color: '#0D0D0D',
                fontSize: '0.62rem',
                fontWeight: '800',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Cart Drawer / Modal */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}>
          <div className="slide-up" style={{
            background: 'var(--surface)',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '85vh',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            borderTop: '1px solid var(--border)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className="display-title" style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>🛒 Tu Carrito de Hamburguesas</h3>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  background: 'var(--surface-warm)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: '800'
                }}
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ overflowY: 'auto', flex: 1, maxHeight: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map(item => (
                <div key={item.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  background: 'var(--surface-warm)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, marginLeft: '10px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>${item.price.toFixed(2)} c/u</div>
                    {item.extras && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {item.extras.extraCheese && '+ Queso '}
                        {item.extras.extraBacon && '+ Bacon '}
                        {item.extras.truffleDip && '+ Salsa Trufa'}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateCartQty(item.key, -1)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-main)',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-main)' }}>{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.key, 1)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-main)',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '14px', paddingTop: '12px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>Envío Express</span>
                <span>{deliveryFee === 0 ? <b style={{ color: 'var(--success)' }}>GRATIS</b> : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: '700', marginBottom: '4px' }}>
                  <span>Descuento cupón</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)', marginTop: '6px' }}>
                <span>Total Estimado</span>
                <span style={{ color: 'var(--primary)' }}>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: '#0D0D0D',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.95rem',
                marginTop: '14px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-gold)'
              }}
            >
              Simular Compra Ahora ➔
            </button>
          </div>
        </div>
      )}

      {/* Simulated Checkout Modal */}
      {isCheckoutOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div className="slide-up" style={{
            background: 'var(--surface)',
            width: '100%',
            maxWidth: '420px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            padding: '20px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 className="display-title" style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '8px' }}>💳 Finalizar Pedido</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Confirma tu pedido comercial de Burger Factory.
            </p>

            <div style={{ background: 'var(--surface-warm)', borderRadius: '12px', padding: '12px', marginBottom: '14px', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>Destino de Envío:</div>
              <div style={{ color: 'var(--text-secondary)' }}>📍 Av. Las Flores 450, Miraflores, Lima</div>
              <div style={{ marginTop: '8px', fontWeight: '700', color: 'var(--text-main)' }}>Método de Pago:</div>
              <div style={{ color: 'var(--text-secondary)' }}>💳 Visa •••• 8821 (Pago Seguro Simulado)</div>
              <div style={{ marginTop: '8px', fontWeight: '800', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Monto Total: <span style={{ color: 'var(--primary)' }}>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                disabled={isSimulatingPayment}
                style={{
                  flex: 1,
                  background: 'var(--surface-warm)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Volver
              </button>
              <button
                onClick={handleSimulateCheckout}
                disabled={isSimulatingPayment}
                style={{
                  flex: 1.6,
                  background: isSimulatingPayment ? '#64748B' : 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: isSimulatingPayment ? 'not-allowed' : 'pointer'
                }}
              >
                {isSimulatingPayment ? '⏳ Procesando...' : '✓ Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Burger Customizer Modal */}
      {isCustomizing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}>
          <div className="slide-up" style={{
            background: 'var(--surface)',
            width: '100%',
            maxWidth: '480px',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            borderTop: '1px solid var(--border)',
            padding: '20px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)' }}>{isCustomizing.badge}</span>
                <h3 className="display-title" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{isCustomizing.name}</h3>
              </div>
              <button
                onClick={() => setIsCustomizing(null)}
                style={{
                  background: 'var(--surface-warm)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: '800'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>{isCustomizing.description}</p>

            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              Personaliza con extras gourmet:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { key: 'extraCheese', label: 'Extra Queso Cheddar Añejado', price: 1.50 },
                { key: 'extraBacon', label: 'Doble Tira de Bacon Crujiente', price: 2.00 },
                { key: 'truffleDip', label: 'Dip Artesanal de Trufa Negra', price: 1.25 }
              ].map(opt => (
                <label key={opt.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: extras[opt.key] ? 'var(--amber-soft)' : 'var(--surface-warm)',
                  border: '1px solid',
                  borderColor: extras[opt.key] ? 'var(--primary)' : 'var(--border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={extras[opt.key]}
                      onChange={(e) => setExtras({ ...extras, [opt.key]: e.target.checked })}
                    />
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{opt.label}</span>
                  </div>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>+${opt.price.toFixed(2)}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => addToCart(isCustomizing, extras)}
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: '#0D0D0D',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-gold)'
              }}
            >
              Agregar al Carrito • ${(isCustomizing.price + (extras.extraCheese?1.5:0) + (extras.extraBacon?2:0) + (extras.truffleDip?1.25:0)).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {/* Modal Seguimiento GPS Satelital PWA */}
      {selectedTrackingOrder && (
        <OrderTrackingModal
          order={selectedTrackingOrder}
          onClose={() => setSelectedTrackingOrder(null)}
        />
      )}
    </div>
  );
}
