import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const TYPES = [
  { value: '', label: 'All' },
  { value: 'LAPTOP', label: 'Laptops' },
  { value: 'PC', label: 'PCs' },
  { value: 'COMPONENT', label: 'Components' },
  { value: 'PERIPHERAL', label: 'Peripherals' },
]

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price', label: 'Price ↑' },
  { value: '-price', label: 'Price ↓' },
  { value: '-average_rating', label: 'Top Rated' },
  { value: '-created_at', label: 'Newest' },
]

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/products/${product.id}`}
      style={{
        ...s.card,
        borderColor: hovered ? 'var(--accent)' : 'var(--border)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.15)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.cardImg}>
        {product.main_image
          ? <img src={product.main_image} alt={product.name} style={s.img} />
          : (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--border-hover)" strokeWidth="1.2" strokeLinecap="round">
              <rect x="2" y="5" width="36" height="24" rx="3"/>
              <path d="M12 33h16M20 29v4"/>
            </svg>
          )
        }
        {!product.is_available && (
          <div style={s.outOfStockOverlay}>
            <span style={s.outOfStockText}>Out of Stock</span>
          </div>
        )}
        {product.average_rating >= 4.5 && (
          <div style={s.topBadge}>Top</div>
        )}
      </div>

      <div style={s.cardBody}>
        <div style={s.cardMeta}>
          <span style={s.cardBadge}>{product.product_type}</span>
          {product.brand && <span style={s.cardBrand}>{product.brand.name}</span>}
        </div>
        <p style={s.cardName}>{product.name}</p>
        <div style={s.cardBottom}>
          <span style={s.cardPrice}>${product.price}</span>
          <div style={s.cardRatingWrap}>
            {product.average_rating > 0 && (
              <>
                <span style={s.starIcon}>★</span>
                <span style={s.ratingNum}>{Number(product.average_rating).toFixed(1)}</span>
                <span style={s.reviewCount}>({product.total_reviews})</span>
              </>
            )}
          </div>
        </div>
        {product.stock > 0 && product.stock <= 5 && (
          <p style={s.lowStock}>Only {product.stock} left</p>
        )}
      </div>
    </Link>
  )
}

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [type, setType] = useState('')
  const [ordering, setOrdering] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    api.get('/products/categories/')
      .then(res => setCategories(res.data.results || res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [page, type, ordering, search, selectedCategory])

  const fetchProducts = () => {
    setLoading(true)
    const params = {
      page,
      ...(search && { search }),
      ...(type && { product_type: type }),
      ...(ordering && { ordering }),
      ...(selectedCategory && { category: selectedCategory }),
    }
    api.get('/products/', { params })
      .then(res => {
        setProducts(res.data.results || res.data)
        if (res.data.count !== undefined) {
          setTotalCount(res.data.count)
          setTotalPages(Math.ceil(res.data.count / 30))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
    inputRef.current?.focus()
  }

  const handleTypeChange = (val) => {
    setType(val)
    setPage(1)
  }

  const handleCategoryChange = (val) => {
    setSelectedCategory(val)
    setPage(1)
  }

  const handleOrderingChange = (val) => {
    setOrdering(val)
    setPage(1)
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
        .filter-btn {
          background: var(--bg-card);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          font-family: inherit;
        }
        .filter-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .filter-btn-active {
          background: var(--accent);
          color: #fff;
          border: 1px solid var(--accent);
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
        }
        .page-btn {
          background: var(--bg-card);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .page-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }
        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
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
          cursor: default;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #fff;
          font-family: inherit;
        }
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
        .sort-select {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 7px 12px;
          color: var(--text-secondary);
          font-size: 13px;
          outline: none;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .sort-select:hover { border-color: var(--accent); }
        .category-select {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 7px 12px;
          color: var(--text-secondary);
          font-size: 13px;
          outline: none;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .category-select:hover { border-color: var(--accent); }
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
        .clear-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          font-size: 16px;
          transition: color 0.15s;
        }
        .clear-btn:hover { color: var(--text-secondary); }
      `}</style>

      <div style={s.pageHeader}>
        <div>
          <h1 style={s.title}>Products</h1>
          {!loading && (
            <p style={s.subtitle}>{totalCount} items found</p>
          )}
        </div>

        <form onSubmit={handleSearch} style={s.searchWrap}>
          <div style={s.searchBox}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="6.5" cy="6.5" r="5"/>
              <path d="M10.5 10.5l3 3"/>
            </svg>
            <input
              ref={inputRef}
              className="search-input"
              placeholder="Search products..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" className="clear-btn" onClick={handleClearSearch}>×</button>
            )}
            <button type="submit" className="search-btn">Search</button>
          </div>
        </form>
      </div>

      <div style={s.toolbarRow}>
        <div style={s.filtersRow}>
          {TYPES.map(t => (
            <button
              key={t.value}
              className={type === t.value ? 'filter-btn-active' : 'filter-btn'}
              onClick={() => handleTypeChange(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={s.controlsRight}>
          {categories.length > 0 && (
            <select
              className="category-select"
              value={selectedCategory}
              onChange={e => handleCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <select
            className="sort-select"
            value={ordering}
            onChange={e => handleOrderingChange(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={s.grid}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} style={s.skeleton} />
          ))}
        </div>
      ) : !products.length ? (
        <div style={s.emptyState}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
            <rect x="4" y="8" width="40" height="28" rx="4"/>
            <path d="M16 40h16M24 36v4"/>
            <path d="M20 20l4 4 8-8" strokeWidth="1.5"/>
          </svg>
          <p style={s.emptyTitle}>No products found</p>
          <p style={s.emptyDesc}>Try changing your filters or search query</p>
          <button
            style={s.resetBtn}
            onClick={() => {
              setType('')
              setSearch('')
              setSearchInput('')
              setSelectedCategory('')
              setOrdering('')
              setPage(1)
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div style={s.grid}>
          {products.map((product, i) => (
            <div key={product.id} style={{ animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div style={s.pagination}>
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>

          <div style={s.pageNums}>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let num
              if (totalPages <= 7) {
                num = i + 1
              } else if (page <= 4) {
                num = i + 1
              } else if (page >= totalPages - 3) {
                num = totalPages - 6 + i
              } else {
                num = page - 3 + i
              }
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

          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </Layout>
  )
}

const s = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '2px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  searchWrap: {
    flex: '0 1 360px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '7px 10px',
    transition: 'border-color 0.15s',
  },
  toolbarRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filtersRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  controlsRight: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  skeleton: {
    height: '280px',
    borderRadius: '12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'border-color 0.18s, transform 0.18s, box-shadow 0.18s',
    display: 'block',
    textDecoration: 'none',
    height: '100%',
  },
  cardImg: {
    height: '180px',
    background: 'var(--bg-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  outOfStockOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    background: 'rgba(0,0,0,0.5)',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  topBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'var(--warning)',
    color: '#000',
    fontSize: '9px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: '14px',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '7px',
  },
  cardBadge: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    padding: '2px 7px',
    borderRadius: '4px',
  },
  cardBrand: {
    color: 'var(--text-muted)',
    fontSize: '11px',
  },
  cardName: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '10px',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    color: 'var(--accent)',
    fontSize: '16px',
    fontWeight: '800',
  },
  cardRatingWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  starIcon: {
    color: 'var(--warning)',
    fontSize: '12px',
  },
  ratingNum: {
    color: 'var(--text-primary)',
    fontSize: '12px',
    fontWeight: '600',
  },
  reviewCount: {
    color: 'var(--text-muted)',
    fontSize: '11px',
  },
  lowStock: {
    color: 'var(--danger)',
    fontSize: '11px',
    fontWeight: '600',
    marginTop: '6px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    gap: '12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
  },
  emptyTitle: {
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: '600',
  },
  emptyDesc: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  resetBtn: {
    marginTop: '8px',
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  pageNums: {
    display: 'flex',
    gap: '4px',
  },
}

export default ProductsPage