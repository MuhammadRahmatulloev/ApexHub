import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'
import { getMediaUrl } from '../utils/media'

const AdminProductPage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/')
  }, [user])

  useEffect(() => {
    fetchProducts()
  }, [page, search])

  const fetchProducts = () => {
    setLoading(true)
    const params = { page, ...(search && { search }) }
    api.get('/products/', { params })
      .then(res => {
        setProducts(res.data.results || res.data)
        if (res.data.count !== undefined) {
          setTotalCount(res.data.count)
          setTotalPages(Math.ceil(res.data.count / 30))
        }
      })
      .catch(() => setError(t('admin.loadError')))
      .finally(() => setLoading(false))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm(t('admin.deleteConfirm'))) return
    setDeleting(id)
    try {
      await api.delete(`/products/${id}/`)
      setProducts(prev => prev.filter(p => p.id !== id))
      setTotalCount(prev => prev - 1)
    } catch {
      setError(t('admin.deleteError'))
    }
    setDeleting(null)
  }

  if (!user) return null

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
        .ap-row {
          display: grid;
          grid-template-columns: 56px 1fr 110px 100px 80px 90px 100px;
          gap: 12px;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          align-items: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ap-row:hover { background: var(--bg-hover); }
        .ap-row:last-child { border-bottom: none; }
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
        .del-btn:hover { border-color: var(--danger); background: rgba(248,113,113,0.08); }
        .del-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
        }
        .search-input::placeholder { color: var(--text-secondary); }
        .search-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .search-btn:hover { background: var(--accent-hover); }
        .page-btn {
          background: var(--bg-card);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-num {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          transition: all 0.15s;
          font-family: inherit;
        }
        .page-num:hover { border-color: var(--accent); color: var(--accent); }
        .page-num-active {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
          font-size: 13px; font-weight: 700;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #fff;
          font-family: inherit;
        }
      `}</style>

      <div style={s.page}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>{t('admin.allProducts')}</h1>
            {!loading && <p style={s.sub}>{totalCount} {t('admin.productsTotal')}</p>}
          </div>
          <form onSubmit={handleSearch} style={s.searchWrap}>
            <div style={s.searchBox}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="6.5" cy="6.5" r="5"/>
                <path d="M10.5 10.5l3 3"/>
              </svg>
              <input
                className="search-input"
                placeholder={t('admin.searchPlaceholder')}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button type="button" style={s.clearBtn} onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}>×</button>
              )}
              <button type="submit" className="search-btn">{t('common.search')}</button>
            </div>
          </form>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {loading ? (
          <div style={s.tableWrap}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: '64px', background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)', animation: `skeletonPulse 1.4s ease ${i * 0.07}s infinite` }} />
            ))}
          </div>
        ) : !products.length ? (
          <div style={s.empty}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
              <rect x="4" y="8" width="40" height="28" rx="4"/>
              <path d="M16 40h16M24 36v4"/>
            </svg>
            <p style={s.emptyTitle}>{t('admin.noProducts')}</p>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <div style={s.tableHead}>
              <span></span>
              <span>{t('admin.colProduct')}</span>
              <span>{t('admin.colType')}</span>
              <span>{t('admin.colPrice')}</span>
              <span>{t('admin.colStock')}</span>
              <span>{t('admin.colStatus')}</span>
              <span>{t('common.actions')}</span>
            </div>
            {products.map((p, i) => (
              <div
                key={p.id}
                className="ap-row"
                style={{ animation: `fadeUp 0.3s ease ${i * 0.03}s both` }}
                onClick={() => navigate(`/products/${p.id}`)}
              >
                <div style={s.thumb}>
                  {p.main_image
                    ? <img src={getMediaUrl(p.main_image)} alt="" style={s.thumbImg} />
                    : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
                        <rect x="1" y="2" width="16" height="12" rx="2"/>
                        <path d="M6 16h6M9 14v2"/>
                      </svg>
                    )
                  }
                </div>
                <span style={s.productName}>{p.name}</span>
                <span><span style={s.typeBadge}>{p.product_type}</span></span>
                <span style={s.priceText}>${p.price}</span>
                <span style={s.stockText}>{p.stock}</span>
                <span>
                  <span style={p.is_available ? s.activeBadge : s.hiddenBadge}>
                    {p.is_available ? t('seller.active') : t('seller.hidden')}
                  </span>
                </span>
                <div onClick={e => e.stopPropagation()}>
                  <button
                    className="del-btn"
                    onClick={(e) => handleDelete(p.id, e)}
                    disabled={deleting === p.id}
                  >
                    {deleting === p.id ? '...' : t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && !loading && (
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
                  <button key={num} className={page === num ? 'page-num-active' : 'page-num'} onClick={() => setPage(num)}>
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
    gap: '16px',
  },
  title: { color: 'var(--text-primary)', fontSize: '26px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.3px' },
  sub: { color: 'var(--text-secondary)', fontSize: '13px' },
  searchWrap: { flex: '0 1 360px' },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '7px 10px',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '2px 4px',
    lineHeight: 1,
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
    gridTemplateColumns: '56px 1fr 110px 100px 80px 90px 100px',
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
  thumb: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
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
  priceText: { color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' },
  stockText: { color: 'var(--text-secondary)', fontSize: '13px' },
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
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '80px 24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    textAlign: 'center',
  },
  emptyTitle: { color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600' },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
  pageNums: { display: 'flex', gap: '4px' },
}

export default AdminProductPage