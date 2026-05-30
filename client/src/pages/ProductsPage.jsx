import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const TYPES = ['', 'LAPTOP', 'PC', 'COMPONENT', 'PERIPHERAL']

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = () => {
    setLoading(true)
    const params = { page, search, product_type: type }
    api.get('/products/', { params })
      .then(res => {
        setProducts(res.data.results || res.data)
        if (res.data.count) setTotalPages(Math.ceil(res.data.count / 10))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [page, type])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  return (
    <Layout>
      <div style={styles.header}>
        <h1 style={styles.title}>Products</h1>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            style={styles.searchInput}
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button style={styles.searchBtn} type="submit">Search</button>
        </form>
      </div>

      <div style={styles.filters}>
        {TYPES.map(t => (
          <button
            key={t}
            style={type === t ? styles.filterActive : styles.filter}
            onClick={() => { setType(t); setPage(1) }}
          >
            {t || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : (
        <>
          <div style={styles.grid}>
            {products.map(product => (
              <Link to={`/products/${product.id}`} key={product.id} style={styles.card}>
                <div style={styles.cardImg}>
                  {product.main_image
                    ? <img src={product.main_image} alt={product.name} style={styles.img} />
                    : <div style={styles.noImg}>No Image</div>
                  }
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardType}>{product.product_type}</p>
                  <h3 style={styles.cardName}>{product.name}</h3>
                  <p style={styles.cardPrice}>${product.price}</p>
                </div>
              </Link>
            ))}
          </div>

          <div style={styles.pagination}>
            <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
            <button style={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </>
      )}
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { color: '#fff', fontSize: '28px', fontWeight: '700' },
  searchForm: { display: 'flex', gap: '8px' },
  searchInput: { background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '10px 16px', color: '#fff', fontSize: '14px', outline: 'none', width: '220px' },
  searchBtn: { background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600' },
  filters: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  filter: { background: '#2a2a2a', color: '#888', border: '1px solid #3a3a3a', borderRadius: '20px', padding: '6px 16px', cursor: 'pointer', fontSize: '13px' },
  filterActive: { background: '#e53e3e', color: '#fff', border: '1px solid #e53e3e', borderRadius: '20px', padding: '6px 16px', cursor: 'pointer', fontSize: '13px' },
  loading: { color: '#888' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', overflow: 'hidden', textDecoration: 'none' },
  cardImg: { height: '180px', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { color: '#555', fontSize: '14px' },
  cardBody: { padding: '16px' },
  cardType: { color: '#e53e3e', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 6px' },
  cardName: { color: '#fff', fontSize: '15px', fontWeight: '600', margin: '0 0 8px' },
  cardPrice: { color: '#e53e3e', fontSize: '18px', fontWeight: '700' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' },
  pageBtn: { background: '#2a2a2a', color: '#fff', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' },
  pageInfo: { color: '#888', fontSize: '14px' },
}

export default ProductsPage