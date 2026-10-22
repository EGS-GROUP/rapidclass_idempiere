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
    image: 'https://images.unsplash.com/photo-1583032015879-bf67245d55e5?w=600&auto=format&fit=crop&q=80',
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
  
  // Cart & Orders State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(null); // burger object
  const [extras, setExtras] = useState({ extraCheese: false, extraBacon: false, truffleDip: false });
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  
  // Active simulated orders
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
    // Try fetching products from backend
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setBurgers(data.data);
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
      alert('PWA lista: Puedes agregar Hamburger Rapid a tu pantalla de inicio desde las opciones de tu navegador.');
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8FAFC', position: 'relative' }}>
      
      {/* Top Mobile Status & Navigation Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            color: 'white'
          }}>
            🍔
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0F172A', lineHeight: 1.1 }}>
              HAMBURGER <span style={{ color: '#D97706' }}>RAPID</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span>📍 Miraflores, Lima</span> &bull; 
              <span style={{ color: isOnline ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              style={{
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#B45309',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              📲 Instalar
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: '#0F172A',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15,23,42,0.15)'
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
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: '1px solid #FDE68A',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#B45309', background: '#FDE68A', padding: '2px 6px', borderRadius: '4px' }}>
                  RECOMENDADO DE HOY
                </span>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#78350F', marginTop: '4px' }}>
                  👑 Rey de las Burgers + Papas
                </div>
                <div style={{ fontSize: '0.75rem', color: '#92400E' }}>
                  Usa el cupón <b>REY20</b> para un 20% de descuento.
                </div>
              </div>
              <button
                onClick={() => {
                  const b = burgers.find(x => x.id === 1) || burgers[0];
                  addToCart(b);
                }}
                style={{
                  background: '#D97706',
                  color: 'white',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
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
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: '0.88rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.03)'
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }}>🔍</span>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
              {['Todas', 'Especiales', 'Clásicas', 'Gourmet', 'Pollo/Veggie'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? '#D97706' : '#E2E8F0',
                    background: selectedCategory === cat ? '#D97706' : '#FFFFFF',
                    color: selectedCategory === cat ? '#FFFFFF' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
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
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '12px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.03)'
                  }}
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#FEF3C7',
                        color: '#92400E'
                      }}>
                        {b.badge || '⭐ Especial'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: '700' }}>
                        ★ {b.rating || '4.9'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name}
                    </h4>

                    <p style={{
                      fontSize: '0.74rem',
                      color: '#64748B',
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
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>
                        ${b.price.toFixed(2)}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setIsCustomizing(b)}
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            padding: '4px 8px',
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
                            background: '#0F172A',
                            border: 'none',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            cursor: 'pointer'
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>🏷️ Ofertas & Cupones</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Canjea códigos promocionales directos para tu orden simulada.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PROMOS.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px dashed #D97706',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0F172A' }}>
                      {p.title}
                    </div>
                    <span style={{
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      color: '#B45309',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {p.code}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '10px' }}>
                    {p.desc}
                  </p>
                  <button
                    onClick={() => handleApplyCoupon(p)}
                    style={{
                      width: '100%',
                      background: appliedPromo?.code === p.code ? '#10B981' : '#D97706',
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>📦 Tus Órdenes</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Seguimiento en vivo y pedidos completados.</p>
            </div>

            {activeOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍔</div>
                <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>No tienes órdenes activas</div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '14px' }}>
                  Simula la compra de una hamburguesa desde la pestaña Menú.
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  style={{
                    background: '#D97706',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
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
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #E2E8F0',
                      padding: '16px',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.04)'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0F172A' }}>
                          Orden #{order.id}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{order.date}</div>
                      </div>
                      <span style={{
                        background: '#ECFDF5',
                        color: '#065F46',
                        border: '1px solid #A7F3D0',
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginBottom: '6px', fontWeight: '700' }}>
                        <span style={{ color: order.step >= 1 ? '#D97706' : '#94A3B8' }}>1. Recibido</span>
                        <span style={{ color: order.step >= 2 ? '#D97706' : '#94A3B8' }}>2. Parrilla</span>
                        <span style={{ color: order.step >= 3 ? '#D97706' : '#94A3B8' }}>3. Empaque</span>
                        <span style={{ color: order.step >= 4 ? '#D97706' : '#94A3B8' }}>4. Repartidor</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(order.step / 4) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #F59E0B, #EA580C)',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>

                    {/* Order Details */}
                    <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '10px', marginBottom: '12px', fontSize: '0.78rem' }}>
                      <div style={{ color: '#475569', marginBottom: '4px', fontWeight: '700' }}>Detalle de productos:</div>
                      {order.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A', padding: '2px 0' }}>
                          <span>{it.qty}x {it.name}</span>
                          <span style={{ fontWeight: '600' }}>${(it.price * it.qty).toFixed(2)}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0F172A' }}>
                        <span>Total Pagado:</span>
                        <span style={{ color: '#D97706' }}>${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Delivery Driver Info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginBottom: '10px' }}>
                      <span>🛵 {order.driver}</span>
                      <span style={{ fontWeight: '700', color: '#0F172A' }}>ETA: {order.eta}</span>
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
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A',
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
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '18px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(15,23,42,0.03)',
              marginBottom: '14px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#FEF3C7',
                border: '2px solid #FDE68A',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 10px'
              }}>
                👨‍💼
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>Carlos Mendoza</h3>
              <span style={{
                display: 'inline-block',
                background: '#FEF3C7',
                color: '#92400E',
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
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#78350F' }}>Puntos Rapid acumulados:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#B45309' }}>1,450 pts</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#92400E', marginTop: '2px' }}>
                  ¡Te faltan solo 50 pts para canjear 1 "Burger Real Clásica" gratis!
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>📍 Dirección de Entrega</div>
                <div style={{ color: '#64748B', fontSize: '0.78rem' }}>Av. Las Flores 450, Dpto 4B, Miraflores</div>
              </div>
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>💳 Método de Pago Predeterminado</div>
                <div style={{ color: '#64748B', fontSize: '0.78rem' }}>Visa Débito •••• 8821 (Aprobado)</div>
              </div>
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569', fontWeight: '600' }}>Notificaciones de Delivery</span>
                <span style={{ color: '#10B981', fontWeight: '700' }}>Activas 🔔</span>
              </div>
            </div>

            {/* Quick Switch Links */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <a
                href="/"
                style={{
                  flex: 1,
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
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
                  background: '#0F172A',
                  color: 'white',
                  textAlign: 'center',
                  textDecoration: 'none',
                  padding: '10px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.78rem'
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
          bottom: '70px',
          left: '14px',
          right: '14px',
          zIndex: 40
        }}>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: 'white',
              border: 'none',
              padding: '12px 18px',
              borderRadius: '16px',
              fontWeight: '800',
              fontSize: '0.92rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 8px 20px rgba(217, 119, 6, 0.35)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '12px' }}>{cartCount}</span>
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
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 8px',
        zIndex: 50,
        boxShadow: '0 -2px 10px rgba(15,23,42,0.03)'
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
              color: activeTab === tab.key ? '#D97706' : '#64748B',
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
                background: '#EA580C',
                color: 'white',
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
          background: 'rgba(15,23,42,0.5)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}>
          <div className="slide-up" style={{
            background: 'white',
            width: '100%',
            maxWidth: '440px',
            maxHeight: '85vh',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>🛒 Tu Carrito de Hamburguesas</h3>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ overflowY: 'auto', flex: 1, maxHeight: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#F8FAFC', borderRadius: '12px' }}>
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, marginLeft: '10px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: '700' }}>${item.price.toFixed(2)} c/u</div>
                    {item.extras && (
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                        {item.extras.extraCheese && '+ Queso '}
                        {item.extras.extraBacon && '+ Bacon '}
                        {item.extras.truffleDip && '+ Salsa Trufa'}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateCartQty(item.key, -1)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>-</button>
                    <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.key, 1)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '14px', paddingTop: '12px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: '4px' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: '4px' }}>
                <span>Envío Express</span>
                <span>{deliveryFee === 0 ? <b style={{ color: '#10B981' }}>GRATIS</b> : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: '700', marginBottom: '4px' }}>
                  <span>Descuento cupón</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.05rem', color: '#0F172A', marginTop: '6px' }}>
                <span>Total Estimado</span>
                <span style={{ color: '#D97706' }}>${finalTotal.toFixed(2)}</span>
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
                background: '#0F172A',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.95rem',
                marginTop: '14px',
                cursor: 'pointer'
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
          background: 'rgba(15,23,42,0.6)',
          zIndex: 110,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px'
        }}>
          <div className="fade-in" style={{
            background: 'white',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              💳 Simulación de Pago
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '16px' }}>
              Confirma tu pedido comercial de Hamburger Rapid.
            </p>

            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px', marginBottom: '14px', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Destino de Envío:</div>
              <div style={{ color: '#475569' }}>📍 Av. Las Flores 450, Miraflores, Lima</div>
              <div style={{ marginTop: '8px', fontWeight: '700', color: '#0F172A' }}>Método de Pago:</div>
              <div style={{ color: '#475569' }}>💳 Visa •••• 8821 (Pago Seguro Simulado)</div>
              <div style={{ marginTop: '8px', fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>
                Monto Total: <span style={{ color: '#D97706' }}>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                disabled={isSimulatingPayment}
                style={{
                  flex: 1,
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
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
          background: 'rgba(15,23,42,0.5)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}>
          <div className="slide-up" style={{
            background: 'white',
            width: '100%',
            maxWidth: '440px',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '20px',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#D97706' }}>{isCustomizing.badge}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>{isCustomizing.name}</h3>
              </div>
              <button onClick={() => setIsCustomizing(null)} style={{ background: '#F1F5F9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '14px' }}>{isCustomizing.description}</p>

            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0F172A', marginBottom: '8px' }}>
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
                  background: extras[opt.key] ? '#FFFBEB' : '#F8FAFC',
                  border: '1px solid',
                  borderColor: extras[opt.key] ? '#FDE68A' : '#E2E8F0',
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
                    <span style={{ fontWeight: '600', color: '#0F172A' }}>{opt.label}</span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#D97706' }}>+${opt.price.toFixed(2)}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => addToCart(isCustomizing, extras)}
              style={{
                width: '100%',
                background: '#D97706',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer'
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
