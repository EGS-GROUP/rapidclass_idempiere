import React, { useState } from 'react';
import OrderTrackingModal from './OrderTrackingModal';

const INITIAL_ORDERS = [
  {
    id: 'ORD-2026-101',
    origin: 'pwa',
    originLabel: 'PWA Preventa',
    agent: 'Juan Carlos Pérez (Vendedor Zona Norte)',
    clientName: 'Restaurante El Roble Gourmet',
    clientTaxId: 'RUC 20459812451',
    date: '2026-10-20 17:45',
    items: [
      { name: 'Rey de las Burgers (Pack x10)', qty: 3, price: 140.00 },
      { name: 'Burger Real Doble (Pack x10)', qty: 2, price: 120.00 },
      { name: 'Papas Rústicas Trufadas (Caja 5kg)', qty: 4, price: 35.00 }
    ],
    totalAmount: 800.00,
    status: 'pending_erp', // 'pending_erp' | 'synced_erp' | 'in_kitchen'
    erpDocNo: null,
    paymentTerm: 'Crédito 15 días (iDempiere 15D)',
    warehouseRequested: 'HQ Warehouse (103)',
    deliveryAddress: 'Av. José Larco 812, Miraflores, Lima',
    deliveryCoords: { lat: -12.1218, lng: -77.0298 },
    defaultVehicle: 'moto'
  },
  {
    id: 'ORD-2026-102',
    origin: 'ecommerce',
    originLabel: 'E-commerce Web',
    agent: 'Cliente Directo (Portal Online)',
    clientName: 'Carlos Mendoza',
    clientTaxId: 'DNI 45892147',
    date: '2026-10-20 18:20',
    items: [
      { name: 'Rey de las Burgers', qty: 2, price: 14.99 },
      { name: 'French Fries Golden Crisp', qty: 2, price: 4.99 },
      { name: 'Chocolate Shake Deluxe', qty: 2, price: 5.99 }
    ],
    totalAmount: 51.94,
    status: 'synced_erp',
    erpDocNo: 'CO-80042',
    paymentTerm: 'Pago Online Inmediato (Tarjeta)',
    warehouseRequested: 'HQ Warehouse (103)',
    deliveryAddress: 'Calle Las Begonias 441, San Isidro, Lima',
    deliveryCoords: { lat: -12.0925, lng: -77.0287 },
    defaultVehicle: 'auto'
  },
  {
    id: 'ORD-2026-103',
    origin: 'pwa',
    originLabel: 'PWA Preventa',
    agent: 'Sofía Valenzuela (Preventista Corporativa)',
    clientName: 'Hotel Continental Plaza',
    clientTaxId: 'RUC 20104859623',
    date: '2026-10-20 18:50',
    items: [
      { name: 'Burger Trufa & Portobello (Event Pack)', qty: 5, price: 155.00 },
      { name: 'Margherita Pizza Stone-Baked (Pack x5)', qty: 6, price: 65.00 },
      { name: 'Iced Mint Citrus Cooler (Dispensador 10L)', qty: 2, price: 45.00 }
    ],
    totalAmount: 1255.00,
    status: 'pending_erp',
    erpDocNo: null,
    paymentTerm: 'Factura 30 días (iDempiere 30D)',
    warehouseRequested: 'HQ Warehouse (103)',
    deliveryAddress: 'Av. Javier Prado Este 2465, San Borja, Lima',
    deliveryCoords: { lat: -12.0864, lng: -77.0016 },
    defaultVehicle: 'camion'
  },
  {
    id: 'ORD-2026-104',
    origin: 'ecommerce',
    originLabel: 'E-commerce Web',
    agent: 'Cliente Directo (Portal Online)',
    clientName: 'Valentina Soto',
    clientTaxId: 'DNI 71204859',
    date: '2026-10-20 19:15',
    items: [
      { name: 'Burger Real Clásica', qty: 1, price: 9.99 },
      { name: 'Loaded Bacon Truffle Fries', qty: 1, price: 7.99 },
      { name: 'Oreo Deluxe Shake', qty: 1, price: 6.50 }
    ],
    totalAmount: 24.48,
    status: 'pending_erp',
    erpDocNo: null,
    paymentTerm: 'Pago Contra Entrega (Efectivo)',
    warehouseRequested: 'HQ Warehouse (103)',
    deliveryAddress: 'Av. Mariscal Sucre 1120, Jesús María, Lima',
    deliveryCoords: { lat: -12.0782, lng: -77.0494 },
    defaultVehicle: 'moto'
  }
];

export default function OrdersManagement({ session }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [originFilter, setOriginFilter] = useState('all'); // 'all' | 'pwa' | 'ecommerce'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending_erp' | 'synced_erp'
  const [selectedOrderForPayload, setSelectedOrderForPayload] = useState(null);
  const [selectedOrderForGps, setSelectedOrderForGps] = useState(null);
  const [isSyncing, setIsSyncing] = useState(null); // orderId being synced

  // Filtrado de pedidos
  const filteredOrders = orders.filter(order => {
    const matchesOrigin = originFilter === 'all' || order.origin === originFilter;
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesOrigin && matchesStatus;
  });

  // Estadísticas operativas
  const totalOrders = orders.length;
  const pwaCount = orders.filter(o => o.origin === 'pwa').length;
  const ecomCount = orders.filter(o => o.origin === 'ecommerce').length;
  const pendingCount = orders.filter(o => o.status === 'pending_erp').length;
  const syncedCount = orders.filter(o => o.status === 'synced_erp').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Sincronizar pedido hacia iDempiere ERP
  const handleSyncToErp = async (order) => {
    setIsSyncing(order.id);
    try {
      // Simulación de latencia de red y confirmación de C_Order en iDempiere
      await new Promise(r => setTimeout(r, 1200));

      const generatedDocNo = `CO-${Math.floor(10000 + Math.random() * 90000)}`;

      setOrders(prev => prev.map(o => {
        if (o.id === order.id) {
          return {
            ...o,
            status: 'synced_erp',
            erpDocNo: generatedDocNo
          };
        }
        return o;
      }));

      alert(`✅ Pedido ${order.id} sincronizado con éxito en iDempiere ERP.\n\nDocumento Generado: ${generatedDocNo}\nTenant ID: ${session.clientId}\nOrg ID: ${session.orgId}\nAlmacén ID: ${session.warehouseId}`);
    } catch (err) {
      alert('Error sincronizando con iDempiere: ' + err.message);
    } finally {
      setIsSyncing(null);
    }
  };

  // Generador de Payload REST iDempiere (C_Order)
  const generateErpPayload = (order) => {
    return {
      documentAction: 'CO', // Complete
      standardDocType: 'SO', // Sales Order
      AD_Client_ID: Number(session?.clientId || 11),
      AD_Org_ID: Number(session?.orgId || session?.organizationId || 11),
      M_Warehouse_ID: Number(session?.warehouseId || 103),
      C_BPartner_ID: order.origin === 'pwa' ? 1000001 : 1000002,
      C_PaymentTerm_ID: order.origin === 'pwa' ? 105 : 100, // 30D vs Inmediato
      Description: `[${order.originLabel.toUpperCase()}] Pedido ID: ${order.id} - ${order.agent}`,
      POReference: order.id,
      DateOrdered: new Date().toISOString().split('T')[0],
      Lines: order.items.map((item, idx) => ({
        Line: (idx + 1) * 10,
        M_Product_ID: 1000 + idx,
        Description: item.name,
        QtyOrdered: item.qty,
        PriceEntered: item.price,
        PriceActual: item.price
      }))
    };
  };

  return (
    <div>
      {/* Active Session Context Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1A17 0%, #2A241F 100%)',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px 22px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#F5A623',
            color: '#141210',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '1.1rem'
          }}>
            ⚙️
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
              Sesión de Trabajo ERP Activa: <span style={{ color: '#F5A623' }}>{session?.userName || 'admin'}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#D6D0C5' }}>
              Servidor: <code>{session?.baseUrl}</code> &bull; Modo: <b style={{ color: '#10B981' }}>iDempiere REST v1</b>
            </div>
          </div>
        </div>

        {/* ERP Context Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
            🏢 Client: <b>{session?.clientId}</b>
          </span>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
            👑 Role: <b>{session?.roleId}</b>
          </span>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
            🏬 Org: <b>{session?.orgId || session?.organizationId}</b>
          </span>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
            📦 Warehouse: <b>{session?.warehouseId}</b>
          </span>
        </div>
      </div>

      {/* KPI Cards for Orders */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>TOTAL PEDIDOS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>{totalOrders}</div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '2px' }}>Capas PWA + E-commerce</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>📱 PWA PREVENTA</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#3B82F6' }}>{pwaCount} pedidos</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Fuerza de ventas en campo</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>🌐 E-COMMERCE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#D97706' }}>{ecomCount} pedidos</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Clientes web directos</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>PENDIENTES ERP</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: pendingCount > 0 ? '#EF4444' : '#10B981' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{syncedCount} ya sincronizados</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>VOLUMEN TOTAL</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '2px' }}>Valor total en cartera</div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '14px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Origin Filter */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748B', marginRight: '4px' }}>
            Filtrar Origen:
          </span>
          <button
            onClick={() => setOriginFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: originFilter === 'all' ? '#0F172A' : '#F1F5F9',
              color: originFilter === 'all' ? '#FFFFFF' : '#475569'
            }}
          >
            Todos ({totalOrders})
          </button>
          <button
            onClick={() => setOriginFilter('pwa')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: originFilter === 'pwa' ? '#3B82F6' : '#EFF6FF',
              color: originFilter === 'pwa' ? '#FFFFFF' : '#1D4ED8'
            }}
          >
            📱 PWA Preventa ({pwaCount})
          </button>
          <button
            onClick={() => setOriginFilter('ecommerce')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: originFilter === 'ecommerce' ? '#D97706' : '#FFFBEB',
              color: originFilter === 'ecommerce' ? '#FFFFFF' : '#B45309'
            }}
          >
            🌐 E-commerce ({ecomCount})
          </button>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748B' }}>
            Estado ERP:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              fontWeight: '600'
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="pending_erp">⏳ Pendiente ERP</option>
            <option value="synced_erp">✓ Sincronizado ERP</option>
          </select>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredOrders.map(order => (
          <div
            key={order.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 2px 6px rgba(15,23,42,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* Order Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '800',
                    color: '#0F172A'
                  }}>
                    {order.id}
                  </span>
                  
                  {/* Origin Badge */}
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    background: order.origin === 'pwa' ? '#EFF6FF' : '#FFFBEB',
                    color: order.origin === 'pwa' ? '#1D4ED8' : '#B45309',
                    border: order.origin === 'pwa' ? '1px solid #BFDBFE' : '1px solid #FDE68A'
                  }}>
                    {order.origin === 'pwa' ? '📱 PWA Preventa' : '🌐 E-commerce'}
                  </span>

                  {/* ERP Status Badge */}
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    background: order.status === 'synced_erp' ? '#ECFDF5' : '#FEF2F2',
                    color: order.status === 'synced_erp' ? '#065F46' : '#991B1B',
                    border: order.status === 'synced_erp' ? '1px solid #A7F3D0' : '1px solid #FCA5A5'
                  }}>
                    {order.status === 'synced_erp' ? `✓ ERP: ${order.erpDocNo}` : '⏳ Pendiente ERP'}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                  {order.agent} &bull; Fecha: <b>{order.date}</b>
                </div>
              </div>

              {/* Order Total & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>TOTAL ORDEN</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedOrderForGps(order)}
                    style={{
                      background: '#0284c7',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                    }}
                    title="Ver Seguimiento Satelital GPS y Ruteo"
                  >
                    🗺️ Ver GPS / Ruta
                  </button>

                  <button
                    onClick={() => setSelectedOrderForPayload(order)}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: '#334155',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                    title="Ver Payload REST C_Order"
                  >
                    📄 Payload ERP
                  </button>

                  {order.status !== 'synced_erp' ? (
                    <button
                      onClick={() => handleSyncToErp(order)}
                      disabled={isSyncing === order.id}
                      style={{
                        background: 'linear-gradient(135deg, #F5A623 0%, #D97706 100%)',
                        border: 'none',
                        color: '#FFFFFF',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: isSyncing === order.id ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
                        opacity: isSyncing === order.id ? 0.7 : 1
                      }}
                    >
                      {isSyncing === order.id ? 'Sincronizando...' : '🔄 Sincronizar ERP'}
                    </button>
                  ) : (
                    <span style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#ECFDF5',
                      color: '#065F46',
                      fontWeight: '700',
                      fontSize: '0.8rem'
                    }}>
                      Sincronizado ✅
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Client & Shipping info */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: '#475569',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                Cliente: <b style={{ color: '#0F172A' }}>{order.clientName}</b> ({order.clientTaxId})
              </div>
              <div>
                📍 Entrega GPS: <b style={{ color: '#0F172A' }}>{order.deliveryAddress || 'Lima'}</b>
              </div>
              <div>
                Término de Pago: <b>{order.paymentTerm}</b>
              </div>
              <div>
                Almacén Origen: <b>{order.warehouseRequested}</b>
              </div>
            </div>

            {/* Items summary */}
            <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                LÍNEAS DEL PEDIDO ({order.items.length}):
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {order.items.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      color: '#334155'
                    }}
                  >
                    <b>{item.qty}x</b> {item.name} (${item.price.toFixed(2)})
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            color: '#64748B'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
            <div style={{ fontWeight: '700' }}>No hay pedidos que coincidan con los filtros seleccionados.</div>
          </div>
        )}
      </div>

      {/* Modal Payload REST iDempiere */}
      {selectedOrderForPayload && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '680px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '85vh'
          }}>
            {/* Header */}
            <div style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '16px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '800' }}>
                  Payload REST iDempiere v1 &bull; {selectedOrderForPayload.id}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                  POST /api/v1/models/c_order (Contextualizado con Token Bearer)
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForPayload(null)}
                style={{
                  background: 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '1.4rem',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
            </div>

            {/* Payload Body */}
            <div style={{ padding: '20px', overflowY: 'auto' }}>
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                marginBottom: '14px',
                color: '#334155'
              }}>
                <b>Headers HTTP generados con el token de sesión actual:</b>
                <pre style={{ margin: '6px 0 0 0', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>
{`Authorization: Bearer ${session?.token?.substring(0, 32)}...
Content-Type: application/json
Accept: application/json`}
                </pre>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Cuerpo JSON (C_Order Model):
              </div>
              <pre style={{
                background: '#1E293B',
                color: '#38BDF8',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                lineHeight: 1.4
              }}>
                {JSON.stringify(generateErpPayload(selectedOrderForPayload), null, 2)}
              </pre>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedOrderForPayload(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
              {selectedOrderForPayload.status !== 'synced_erp' && (
                <button
                  onClick={() => {
                    const ord = selectedOrderForPayload;
                    setSelectedOrderForPayload(null);
                    handleSyncToErp(ord);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#D97706',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Sincronizar ahora ➔
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Seguimiento GPS Satelital en Tiempo Real */}
      {selectedOrderForGps && (
        <OrderTrackingModal
          order={selectedOrderForGps}
          onClose={() => setSelectedOrderForGps(null)}
        />
      )}

    </div>
  );
}
