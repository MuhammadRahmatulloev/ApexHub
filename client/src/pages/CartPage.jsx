import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'
import { getMediaUrl } from '../utils/media'

const CartPage = () => {
  const { t } = useTranslation()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const navigate = useNavigate()

  const fetchCart = () => {
    api.get('/orders/cart/my_cart/')
      .then(res => setCart(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCart() }, [])

  const removeItem = async (productId) => {
    setRemovingId(productId)
    await api.delete('/orders/cart/remove_item/', { data: { product_id: productId } })
    fetchCart()
    setRemovingId(null)
  }

  const clearCart = async () => {
    await api.delete('/orders/cart/clear/')
    fetchCart()
  }

  const createOrder = async () => {
    setOrdering(true)
    setOrderError('')
    try {
      await api.post('/orders/create_order/', {
        delivery_address: address || 'Not specified',
        note,
      })
      navigate('/orders')
    } catch (err) {
      setOrderError(err.response?.data?.non_field_errors?.[0] || t('common.error'))
    }
    setOrdering(false)
  }

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
        .cart-item-row {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .cart-item-row:last-child { border-bottom: none; }
        .cart-item-row:hover { background: var(--bg-hover); }
        .remove-btn {
          background: transparent;
          border: 1px solid rgba(248,113,113,0.3);
          color: var(--danger);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .remove-btn:hover { border-color: var(--danger); background: rgba(248,113,113,0.08); }
        .remove-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .clear-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 7px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .clear-btn:hover { border-color: var(--danger); color: var(--danger); }
        .order-btn {
          width: 100%;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.2px;
        }
        .order-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-btn); }
        .order-btn:disabled { background: var(--text-muted); cursor: not-allowed; }
        .summary-input {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 9px 12px;
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .summary-input:focus { border-color: var(--accent); }
        .summary-input::placeholder { color: var(--text-secondary); }
        .product-link {
          color: var(--text-primary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.15s;
          display: block;
          margin-bottom: 4px;
        }
        .product-link:hover { color: var(--accent); }
      `}</style>

      <div style={s.page}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>{t('cart.title')}</h1>
            {!loading && cart?.items?.length > 0 && (
              <p style={s.sub}>
                {cart.total_items} {cart.total_items !== 1 ? t('cart.items') : t('cart.item')}
              </p>
            )}
          </div>
          {!loading && cart?.items?.length > 0 && (
            <button className="clear-btn" onClick={clearCart}>{t('cart.clearCart')}</button>
          )}
        </div>

        {loading ? (
          <div style={s.grid}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '88px', background: 'var(--bg-hover)', animation: 'skeletonPulse 1.4s ease infinite', animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
            <div style={{ height: '320px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'skeletonPulse 1.4s ease infinite' }} />
          </div>
        ) : !cart?.items?.length ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6h4l5 18h14l3-10H11"/>
                <circle cx="17" cy="31" r="2"/>
                <circle cx="27" cy="31" r="2"/>
              </svg>
            </div>
            <p style={s.emptyTitle}>{t('cart.empty')}</p>
            <p style={s.emptyDesc}>{t('cart.emptyDesc')}</p>
            <Link to="/products" style={s.browseBtn}>{t('cart.browse')}</Link>
          </div>
        ) : (
          <div style={s.grid}>
            <div style={s.itemsWrap}>
              <div style={s.itemsCard}>
                {cart.items.map((item, i) => (
                  <div
                    key={item.id}
                    className="cart-item-row"
                    style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}
                  >
                    <div style={s.itemImg}>
                      {item.product.main_image
                        ? <img src={getMediaUrl(item.product.main_image)} alt={item.product.name} style={s.img} />
                        : (
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
                            <rect x="1" y="3" width="20" height="14" rx="2"/>
                            <path d="M7 19h8M11 17v2"/>
                          </svg>
                        )
                      }
                    </div>

                    <div style={s.itemInfo}>
                      <Link to={`/products/${item.product.id}`} className="product-link">
                        {item.product.name}
                      </Link>
                      <div style={s.itemMeta}>
                        <span style={s.itemTypeBadge}>{item.product.product_type}</span>
                        <span style={s.itemUnitPrice}>${item.product.price} × {item.quantity}</span>
                      </div>
                    </div>

                    <div style={s.itemRight}>
                      <span style={s.itemTotal}>${item.total_price}</span>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.product.id)}
                        disabled={removingId === item.product.id}
                      >
                        {removingId === item.product.id ? t('cart.removing') : t('cart.remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.summaryCol}>
              <div style={s.summaryCard}>
                <p style={s.summaryTitle}>{t('cart.orderSummary')}</p>

                <div style={s.summaryRows}>
                  <div style={s.summaryRow}>
                    <span style={s.summaryLabel}>{t('cart.items')}</span>
                    <span style={s.summaryVal}>{cart.total_items}</span>
                  </div>
                  <div style={s.divider} />
                  <div style={s.summaryRow}>
                    <span style={s.summaryLabel}>{t('cart.total')}</span>
                    <span style={s.summaryTotalVal}>${cart.total_price}</span>
                  </div>
                </div>

                <div style={s.formSection}>
                  <div style={s.formField}>
                    <label style={s.formLabel}>{t('cart.deliveryAddress')}</label>
                    <input
                      className="summary-input"
                      placeholder={t('cart.deliveryPlaceholder')}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />
                  </div>
                  <div style={s.formField}>
                    <label style={s.formLabel}>{t('cart.note')}</label>
                    <input
                      className="summary-input"
                      placeholder={t('cart.notePlaceholder')}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                  </div>
                </div>

                {orderError && (
                  <div style={s.errorBox}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="6.5" cy="6.5" r="5.5"/>
                      <path d="M6.5 4v3M6.5 9h.01"/>
                    </svg>
                    {orderError}
                  </div>
                )}

                <button
                  className="order-btn"
                  onClick={createOrder}
                  disabled={ordering}
                >
                  {ordering ? t('cart.placingOrder') : `${t('cart.placeOrder')} · $${cart.total_price}`}
                </button>

                <p style={s.secureNote}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                    <path d="M6 1L1 3v3c0 3 5 5 5 5s5-2 5-5V3z"/>
                  </svg>
                  {t('cart.secureCheckout')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  page: { animation: 'fadeUp 0.35s ease both' },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  sub: { color: 'var(--text-secondary)', fontSize: '13px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '20px',
    alignItems: 'start',
  },
  itemsWrap: {},
  itemsCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  itemImg: {
    width: '72px',
    height: '72px',
    borderRadius: '10px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  itemInfo: { flex: 1, minWidth: 0 },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  itemTypeBadge: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    padding: '2px 7px',
    borderRadius: '4px',
  },
  itemUnitPrice: { color: 'var(--text-secondary)', fontSize: '12px' },
  itemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    flexShrink: 0,
  },
  itemTotal: {
    color: 'var(--accent)',
    fontSize: '17px',
    fontWeight: '800',
    letterSpacing: '-0.2px',
  },
  summaryCol: {},
  summaryCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '20px',
    position: 'sticky',
    top: '72px',
  },
  summaryTitle: {
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '16px',
    letterSpacing: '-0.2px',
  },
  summaryRows: { marginBottom: '16px' },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
  },
  summaryLabel: { color: 'var(--text-secondary)', fontSize: '13px' },
  summaryVal: { color: 'var(--text-primary)', fontSize: '13px', fontWeight: '500' },
  summaryTotalVal: {
    color: 'var(--accent)',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
  },
  divider: { height: '1px', background: 'var(--border)', margin: '8px 0' },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px',
  },
  formField: { display: 'flex', flexDirection: 'column', gap: '5px' },
  formLabel: { color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '500' },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: 'var(--danger)',
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '12px',
    fontSize: '12px',
  },
  secureNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    color: 'var(--text-muted)',
    fontSize: '11px',
    marginTop: '10px',
  },
  emptyState: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '80px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '18px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  emptyTitle: { color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600' },
  emptyDesc: { color: 'var(--text-secondary)', fontSize: '13px' },
  browseBtn: {
    marginTop: '8px',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '8px',
    padding: '10px 22px',
    fontSize: '13px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'background 0.15s',
    display: 'inline-block',
  },
}

export default CartPage