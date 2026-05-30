import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'

const SellerPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && user.role !== 'SELLER' && user.role !== 'ADMIN') {
      navigate('/')
    }
  }, [user])

  useEffect(() => {
    api.get('/products/?seller=me')
      .then(res => setProducts(res.data.results || res.data))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    setDeleting(id)
    try {
      await api.delete(`/products/${id}/`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch {
      setError('Failed to delete product')
    }
    setDeleting(null)
  }

  if (!user) return null

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Seller Dashboard</h1>
          <p style={s.subtitle}>{user.email}</p>
        </div>
        <button style={s.addBtn} onClick={() => navigate('/seller/create')}>
          + Add Product
        </button>
      </div>

      <div style={s.stats}>
        <div style={s.statCard}>
          <p style={s.statNum}>{products.length}</p>
          <p style={s.statLabel}>Total Products</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statNum}>{products.filter(p => p.is_available).length}</p>
          <p style={s.statLabel}>Available</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statNum}>
            {products.reduce((sum, p) => sum + p.stock, 0)}
          </p>
          <p style={s.statLabel}>Total Stock</p>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <p style={s.loading}>Loading...</p>
      ) : products.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyText}>No products yet</p>
          <button style={s.addBtn} onClick={() => navigate('/seller/create')}>
            Create your first product
          </button>
        </div>
      ) : (
        <div style={s.table}>
          <div style={s.tableHeader}>
            <span style={s.colName}>Product</span>
            <span style={s.colType}>Type</span>
            <span style={s.colPrice}>Price</span>
            <span style={s.colStock}>Stock</span>
            <span style={s.colStatus}>Status</span>
            <span style={s.colActions}>Actions</span>
          </div>

          {products.map(product => (
            <div key={product.id} style={s.tableRow}>
              <div style={s.colName}>
                <div style={s.productImg}>
                  {product.main_image
                    ? <img src={product.main_image} alt="" style={s.img} />
                    : <div style={s.noImg}>No img</div>
                  }
                </div>
                <span style={s.productName}>{product.name}</span>
              </div>
              <span style={s.colType}>
                <span style={s.typeBadge}>{product.product_type}</span>
              </span>
              <span style={s.colPrice}>${product.price}</span>
              <span style={s.colStock}>{product.stock}</span>
              <span style={s.colStatus}>
                <span style={product.is_available ? s.available : s.unavailable}>
                  {product.is_available ? 'Active' : 'Hidden'}
                </span>
              </span>
              <div style={s.colActions}>
                <button
                  style={s.editBtn}
                  onClick={() => navigate(`/seller/edit/${product.id}`)}
                >
                  Edit
                </button>
                <button
                  style={deleting === product.id ? s.deleteBtnDisabled : s.deleteBtn}
                  onClick={() => handleDelete(product.id)}
                  disabled={deleting === product.id}
                >
                  {deleting === product.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '4px' },
  subtitle: { color: '#888', fontSize: '14px' },
  addBtn: { background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  statNum: { color: '#e53e3e', fontSize: '32px', fontWeight: '700', marginBottom: '4px' },
  statLabel: { color: '#888', fontSize: '13px' },
  error: { background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', color: '#e53e3e', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px' },
  loading: { color: '#888' },
  empty: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '60px', textAlign: 'center' },
  emptyText: { color: '#888', fontSize: '16px', marginBottom: '20px' },
  table: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px 140px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid #2a2a2a', background: '#141414' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px 140px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid #1f1f1f', alignItems: 'center' },
  colName: { color: '#888', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' },
  colType: { color: '#888', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
  colPrice: { color: '#fff', fontSize: '14px', fontWeight: '600' },
  colStock: { color: '#fff', fontSize: '14px' },
  colStatus: { fontSize: '12px' },
  colActions: { display: 'flex', gap: '8px' },
  productImg: { width: '40px', height: '40px', borderRadius: '6px', background: '#2a2a2a', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { color: '#555', fontSize: '9px' },
  productName: { color: '#fff', fontSize: '14px', fontWeight: '500' },
  typeBadge: { background: 'rgba(229,62,62,0.1)', color: '#e53e3e', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px' },
  available: { background: 'rgba(72,187,120,0.1)', color: '#48bb78', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  unavailable: { background: 'rgba(255,255,255,0.05)', color: '#888', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  editBtn: { background: 'transparent', border: '1px solid #3a3a3a', color: '#ccc', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' },
  deleteBtn: { background: 'transparent', border: '1px solid rgba(229,62,62,0.4)', color: '#e53e3e', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' },
  deleteBtnDisabled: { background: 'transparent', border: '1px solid #2a2a2a', color: '#555', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'not-allowed' },
}

export default SellerPage