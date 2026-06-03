import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'

const OrdersPage = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const STATUS_CONFIG = {
    CREATED: { label: t('orders.statuses.CREATED'), color: 'var(--warning)', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
    PAID: { label: t('orders.statuses.PAID'), color: 'var(--success)', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    SHIPPING: { label: t('orders.statuses.SHIPPING'), color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' },
    DELIVERED: { label: t('orders.statuses.DELIVERED'), color: 'var(--success)', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    CANCELLED: { label: t('orders.statuses.CANCELLED'), color: 'var(--danger)', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  }

  const STATUS_STEPS = ['CREATED', 'PAID', 'SHIPPING', 'DELIVERED']

  useEffect(() => {
    api.get('/orders/my_orders/')
      .then(res => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cancelOrder = async (id, e) => {
    e.stopPropagation()
    setCancellingId(id)
    try {
      await api.post(`/orders/${id}/cancel/`)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o))
    } catch {}
    setCancellingId(null)
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const FILTERS = ['ALL', 'CREATED', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED']

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status)

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .order-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.15s, transform 0.15s;
        }
        .order-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-1px);
        }
        .filter-btn {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-family: inherit;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .filter-btn-active {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #fff;
          font-family: inherit;
          white-space: nowrap;
        }
        .cancel-btn {
          background: transparent;
          border: 1px solid rgba(248,113,113,0.3);
          color: var(--danger);
          border-radius: 6px;
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, background 0.15s;
        }
        .cancel-btn:hover {
          border-color: var(--danger);
          background: rgba(248,113,113,0.08);
        }
        .cancel-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }
        .item-row:last-child {
          border-bottom: none;
        }
      `}</style>

      <div style={s.page}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>{t('orders.title')}</h1>
            {!loading && (
              <p style={s.sub}>{orders.length} {t('orders.total')}</p>
            )}
          </div>
        </div>

        {!loading && orders.length > 0 && (
          <div style={s.filtersRow}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={filter === f ? 'filter-btn-active' : 'filter-btn'}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? t('orders.all') : STATUS_CONFIG[f]?.label}
                {f !== 'ALL' && orders.filter(o => o.status === f).length > 0 && (
                  <span style={{ marginLeft: '5px', opacity: 0.75 }}>
                    {orders.filter(o => o.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={s.list}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '100px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', animation: `skeletonPulse 1.4s ease ${i * 0.08}s infinite` }} />
            ))}
          </div>
        ) : !filtered.length ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 8h4l4 16h12l3-10H12"/>
                <circle cx="18" cy="31" r="2"/>
                <circle cx="28" cy="31" r="2"/>
              </svg>
            </div>
            <p style={s.emptyTitle}>
              {filter === 'ALL' ? t('orders.noOrders') : t('orders.noFilterOrders', { status: STATUS_CONFIG[filter]?.label })}
            </p>
            <p style={s.emptyDesc}>
              {filter === 'ALL' ? t('orders.noOrdersDesc') : t('orders.tryFilter')}
            </p>
            {filter === 'ALL' && (
              <Link to="/products" style={s.browseBtn}>{t('orders.browse')}</Link>
            )}
          </div>
        ) : (
          <div style={s.list}>
            {filtered.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.CREATED
              const stepIndex = getStepIndex(order.status)
              const isCancelled = order.status === 'CANCELLED'
              const isExpanded = expandedId === order.id

              return (
                <div
                  key={order.id}
                  className="order-card"
                  style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}
                  onClick={() => toggleExpand(order.id)}
                >
                  <div style={s.cardHead}>
                    <div style={s.cardHeadLeft}>
                      <div style={s.orderNum}>{t('orders.order')} #{order.id}</div>
                      <span style={{ ...s.statusBadge, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={s.cardHeadRight}>
                      <span style={s.orderDate}>{new Date(order.created_at).toLocaleDateString()}</span>
                      <span style={s.orderTotal}>${order.total_price}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>
                        ▾
                      </span>
                    </div>
                  </div>

                  {!isCancelled && (
                    <div style={s.progressWrap}>
                      <div style={s.progressBar}>
                        {STATUS_STEPS.map((step, idx) => {
                          const done = idx <= stepIndex
                          const isCurrent = idx === stepIndex
                          return (
                            <div key={step} style={s.progressStep}>
                              <div style={{
                                ...s.progressDot,
                                background: done ? 'var(--accent)' : 'var(--bg-hover)',
                                border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                                boxShadow: isCurrent ? '0 0 0 3px var(--accent-dim)' : 'none',
                              }} />
                              {idx < STATUS_STEPS.length - 1 && (
                                <div style={{ ...s.progressLine, background: idx < stepIndex ? 'var(--accent)' : 'var(--border)' }} />
                              )}
                              <span style={{ ...s.progressLabel, color: done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isCurrent ? '600' : '400' }}>
                                {STATUS_CONFIG[step]?.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div style={s.expandedSection} onClick={e => e.stopPropagation()}>
                      <div style={s.divider} />

                      <div style={s.itemsList}>
                        {order.items.map(item => (
                          <div key={item.id} className="item-row">
                            <div style={s.itemImgWrap}>
                              {item.product?.main_image
                                ? <img src={item.product.main_image} alt={item.product.name} style={s.itemImg} />
                                : (
                                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
                                    <rect x="1" y="2" width="16" height="12" rx="2"/>
                                    <path d="M6 16h6M9 14v2"/>
                                  </svg>
                                )
                              }
                            </div>
                            <span style={s.itemName}>{item.product?.name || t('common.noImage')}</span>
                            <span style={s.itemQty}>×{item.quantity}</span>
                            <span style={s.itemPrice}>${item.total_price}</span>
                          </div>
                        ))}
                      </div>

                      <div style={s.expandedFooter}>
                        <div style={s.orderMeta}>
                          {order.delivery_address && (
                            <span style={s.metaItem}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                                <path d="M6 1C4.3 1 3 2.3 3 4c0 2.5 3 6 3 6s3-3.5 3-6c0-1.7-1.3-3-3-3z"/>
                                <circle cx="6" cy="4" r="1"/>
                              </svg>
                              {order.delivery_address}
                            </span>
                          )}
                          {order.note && (
                            <span style={s.metaItem}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                                <rect x="1" y="1" width="10" height="10" rx="2"/>
                                <path d="M3 4h6M3 6h4"/>
                              </svg>
                              {order.note}
                            </span>
                          )}
                        </div>

                        <div style={s.expandedActions}>
                          <div style={s.totalRow}>
                            <span style={s.totalLabel}>{t('cart.total')}</span>
                            <span style={s.totalVal}>${order.total_price}</span>
                          </div>
                          {order.status === 'CREATED' && (
                            <button
                              className="cancel-btn"
                              onClick={(e) => cancelOrder(order.id, e)}
                              disabled={cancellingId === order.id}
                            >
                              {cancellingId === order.id ? t('orders.cancelling') : t('orders.cancel')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  page: { animation: 'fadeUp 0.35s ease both' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  title: { color: 'var(--text-primary)', fontSize: '26px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.3px' },
  sub: { color: 'var(--text-secondary)', fontSize: '13px' },
  filtersRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', gap: '12px', flexWrap: 'wrap' },
  cardHeadLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  orderNum: { color: 'var(--text-primary)', fontSize: '15px', fontWeight: '700' },
  statusBadge: { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.3px' },
  cardHeadRight: { display: 'flex', alignItems: 'center', gap: '14px' },
  orderDate: { color: 'var(--text-muted)', fontSize: '12px' },
  orderTotal: { color: 'var(--accent)', fontSize: '17px', fontWeight: '800', letterSpacing: '-0.2px' },
  progressWrap: { paddingLeft: '20px', paddingRight: '20px', paddingBottom: '16px' },
  progressBar: { display: 'flex', alignItems: 'flex-start', gap: '0' },
  progressStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' },
  progressDot: { width: '10px', height: '10px', borderRadius: '50%', zIndex: 1, transition: 'all 0.2s', marginBottom: '6px' },
  progressLine: { position: 'absolute', top: '4px', left: '50%', width: '100%', height: '2px', transition: 'background 0.2s', zIndex: 0 },
  progressLabel: { fontSize: '10px', textAlign: 'center', transition: 'color 0.2s' },
  expandedSection: { paddingLeft: '20px', paddingRight: '20px', paddingBottom: '16px' },
  divider: { height: '1px', background: 'var(--border)', marginBottom: '14px' },
  itemsList: { marginBottom: '14px' },
  itemImgWrap: { width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-hover)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemImg: { width: '100%', height: '100%', objectFit: 'cover' },
  itemName: { color: 'var(--text-primary)', fontSize: '13px', fontWeight: '500', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemQty: { color: 'var(--text-secondary)', fontSize: '12px', flexShrink: 0 },
  itemPrice: { color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', flexShrink: 0 },
  expandedFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  orderMeta: { display: 'flex', flexDirection: 'column', gap: '5px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px' },
  expandedActions: { display: 'flex', alignItems: 'center', gap: '14px' },
  totalRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  totalLabel: { color: 'var(--text-secondary)', fontSize: '13px' },
  totalVal: { color: 'var(--accent)', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px' },
  emptyState: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' },
  emptyIcon: { width: '72px', height: '72px', borderRadius: '18px', background: 'var(--bg-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' },
  emptyTitle: { color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600' },
  emptyDesc: { color: 'var(--text-secondary)', fontSize: '13px' },
  browseBtn: { marginTop: '8px', background: 'var(--accent)', color: '#fff', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' },
}

export default OrdersPage