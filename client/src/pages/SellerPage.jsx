import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'
import { getMediaUrl } from '../utils/media'

const PAGE_SIZE = 50

const SellerPage = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    if (user && user.role !== 'SELLER' && user.role !== 'ADMIN') navigate('/')
  }, [user])

  useEffect(() => {
    fetchProducts()
  }, [page])

  const fetchProducts = () => {
    setLoading(true)
    api.get(`/products/?page=${page}&page_size=${PAGE_SIZE}`)
      .then(res => {
        const results = res.data.results || res.data
        setProducts(results)
        if (res.data.count !== undefined) {
          setTotalCount(res.data.count)
          setTotalPages(Math.ceil(res.data.count / PAGE_SIZE))
        }
        if (page === 1) {
          setAllProducts(results)
        }
      })
      .catch(() => setError(t('seller.loadError')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (page === 1 && products.length > 0) {
      setAllProducts(products)
    }
  }, [products])

  const handleDelete = async (id) => {
    if (!window.confirm(t('seller.deleteConfirm'))) return
    setDeleting(id)
    try {
      await api.delete(`/products/${id}/`)
      setProducts(prev => prev.filter(p => p.id !== id))
      setAllProducts(prev => prev.filter(p => p.id !== id))
      setTotalCount(prev => prev - 1)
      setTotalPages(Math.ceil((totalCount - 1) / PAGE_SIZE))
    } catch {
      setError(t('seller.deleteError'))
    }
    setDeleting(null)
  }

  if (!user) return null

  const displayProducts = page === 1 ? allProducts : products
  const totalStock = displayProducts.reduce((sum, p) => sum + p.stock, 0)
  const available = displayProducts.filter(p => p.is_available).length

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
        .seller-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 80px 90px 150px;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          align-items: center;
          transition: background 0.15s;
        }
        .seller-row:hover { background: var(--bg-hover); }
        .seller-row:last-child { border-bottom: none; }
        .edit-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .edit-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-dim);
        }
        .del-btn {
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
        }
        .del-btn:hover {
          border-color: var(--danger);
          background: rgba(248,113,113,0.08);
        }
        .del-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .add-prod-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.2px;
        }
        .add-prod-btn:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-btn);
        }
        .page-btn {
          background: var(--bg-card);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-num {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          transition: all 0.15s;
          font-family: inherit;
        }
        .page-num:hover { border-color: var(--accent); color: var(--accent); }
        .page-num-active {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #fff;
          font-family: inherit;
        }
      `}</style>

      <div style={s.page}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>{t('seller.dashboard')}</h1>
            <p style={s.sub}>{user.email}</p>
          </div>
          <button className="add-prod-btn" onClick={() => navigate('/seller/create')}>
            {t('seller.addProduct')}
          </button>
        </div>

        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statNum}>{totalCount || displayProducts.length}</span>
            <span style={s.statLabel}>{t('seller.totalProducts')}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{available}</span>
            <span style={s.statLabel}>{t('seller.available')}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{totalStock.toLocaleString()}</span>
            <span style={s.statLabel}>{t('seller.totalStock')}</span>
          </div>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {loading ? (
          <div style={s.tableWrap}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ ...s.skeletonRow, animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={s.empty}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
              <rect x="4" y="8" width="40" height="28" rx="4"/>
              <path d="M16 40h16M24 36v4"/>
              <path d="M18 20h12M18 26h8"/>
            </svg>
            <p style={s.emptyTitle}>{t('seller.noProducts')}</p>
            <p style={s.emptyDesc}>{t('seller.noProductsDesc')}</p>
            <button className="add-prod-btn" style={{ marginTop: '8px' }} onClick={() => navigate('/seller/create')}>
              {t('seller.createFirst')}
            </button>
          </div>
        ) : (
          <>
            <div style={s.tableWrap}>
              <div style={s.tableHead}>
                <span>{t('admin.colProduct')}</span>
                <span>{t('admin.colType')}</span>
                <span>{t('admin.colPrice')}</span>
                <span>{t('admin.colStock')}</span>
                <span>{t('admin.colStatus')}</span>
                <span>{t('common.actions')}</span>
              </div>
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="seller-row"
                  style={{ animation: `fadeUp 0.3s ease ${i * 0.03}s both` }}
                >
                  <div style={s.productCell}>
                    <div style={s.thumb}>
                      {product.main_image
                        ? <img src={getMediaUrl(product.main_image)} alt="" style={s.thumbImg} />
                        : (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
                            <rect x="1" y="2" width="16" height="12" rx="2"/>
                            <path d="M6 16h6M9 14v2"/>
                          </svg>
                        )
                      }
                    </div>
                    <span style={s.productName}>{product.name}</span>
                  </div>

                  <span>
                    <span style={s.typeBadge}>{product.product_type}</span>
                  </span>

                  <span style={s.priceText}>${product.price}</span>

                  <span style={s.stockText}>{product.stock}</span>

                  <span>
                    <span style={product.is_available ? s.activeBadge : s.hiddenBadge}>
                      {product.is_available ? t('seller.active') : t('seller.hidden')}
                    </span>
                  </span>

                  <div style={s.actionsCell}>
                    <button className="edit-btn" onClick={() => navigate(`/seller/edit/${product.id}`)}>
                      {t('common.edit')}
                    </button>
                    <button
                      className="del-btn"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                    >
                      {deleting === product.id ? '...' : t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={s.pagination}>
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  {t('admin.prevPage')}
                </button>
                <div style={s.pageNums}>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let num
                    if (totalPages <= 7) num = i + 1
                    else if (page <= 4) num = i + 1
                    else if (page >= totalPages - 3) num = totalPages - 6 + i
                    else num = page - 3 + i
                    return (
                      <button
                        key={num}
                        className={page === num ? 'page-num-active' : 'page-num'}
                        onClick={() => setPage(num)}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
                <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  {t('admin.nextPage')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

const s = {
  page: {
    animation: 'fadeUp 0.35s ease both',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  sub: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statNum: {
    color: 'var(--accent)',
    fontSize: '30px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  errorBox: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: 'var(--danger)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  tableWrap: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 80px 90px 150px',
    gap: '12px',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  skeletonRow: {
    height: '64px',
    background: 'var(--bg-hover)',
    borderBottom: '1px solid var(--border)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  productCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflow: 'hidden',
  },
  thumb: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productName: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  typeBadge: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  priceText: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '600',
  },
  stockText: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  activeBadge: {
    background: 'rgba(52,211,153,0.1)',
    color: 'var(--success)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  hiddenBadge: {
    background: 'var(--bg-hover)',
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  actionsCell: {
    display: 'flex',
    gap: '6px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    gap: '10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    textAlign: 'center',
  },
  emptyTitle: {
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '4px',
  },
  emptyDesc: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
  pageNums: {
    display: 'flex',
    gap: '4px',
  },
}

export default SellerPage