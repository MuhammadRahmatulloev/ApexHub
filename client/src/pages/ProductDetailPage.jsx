import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    api.get(`/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  const addToCart = async () => {
    setAdding(true)
    try {
      await api.post('/orders/cart/add_item/', { product_id: product.id, quantity: 1 })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
    setAdding(false)
  }

  if (loading) return <Layout><p style={{ color: '#888' }}>Loading...</p></Layout>
  if (!product) return null

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.imageSection}>
          <div style={styles.mainImg}>
            {product.images?.[activeImg]
              ? <img src={product.images[activeImg].image} alt={product.name} style={styles.img} />
              : <div style={styles.noImg}>No Image</div>
            }
          </div>
          <div style={styles.thumbs}>
            {product.images?.map((img, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={i === activeImg ? styles.thumbActive : styles.thumb}>
                <img src={img.image} alt="" style={styles.thumbImg} />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.info}>
          <p style={styles.type}>{product.product_type}</p>
          <h1 style={styles.name}>{product.name}</h1>
          <p style={styles.brand}>{product.brand?.name} · {product.category?.name}</p>

          <div style={styles.rating}>
            {'★'.repeat(Math.round(product.average_rating))}{'☆'.repeat(5 - Math.round(product.average_rating))}
            <span style={styles.ratingCount}> ({product.total_reviews} reviews)</span>
          </div>

          <p style={styles.price}>${product.price}</p>
          <p style={styles.stock}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

          <p style={styles.description}>{product.description}</p>

          <button
            style={product.stock === 0 ? styles.btnDisabled : added ? styles.btnAdded : styles.btn}
            onClick={addToCart}
            disabled={adding || product.stock === 0}
          >
            {added ? 'Added to Cart!' : adding ? 'Adding...' : 'Add to Cart'}
          </button>

          {product.specifications?.length > 0 && (
            <div style={styles.specs}>
              <h3 style={styles.specsTitle}>Specifications</h3>
              {product.specifications.map((spec, i) => (
                <div key={i} style={styles.specRow}>
                  <span style={styles.specKey}>{spec.key}</span>
                  <span style={styles.specVal}>{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

const styles = {
  container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' },
  imageSection: {},
  mainImg: { height: '360px', background: '#2a2a2a', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { color: '#555' },
  thumbs: { display: 'flex', gap: '8px' },
  thumb: { width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #3a3a3a', cursor: 'pointer' },
  thumbActive: { width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e53e3e', cursor: 'pointer' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  info: {},
  type: { color: '#e53e3e', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' },
  name: { color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '8px' },
  brand: { color: '#666', fontSize: '14px', marginBottom: '12px' },
  rating: { color: '#f6c90e', fontSize: '16px', marginBottom: '16px' },
  ratingCount: { color: '#666', fontSize: '13px' },
  price: { color: '#e53e3e', fontSize: '32px', fontWeight: '800', marginBottom: '8px' },
  stock: { color: '#4caf50', fontSize: '14px', marginBottom: '16px' },
  description: { color: '#aaa', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' },
  btn: { background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 32px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: '100%', marginBottom: '24px' },
  btnAdded: { background: '#4caf50', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 32px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: '100%', marginBottom: '24px' },
  btnDisabled: { background: '#555', color: '#888', border: 'none', borderRadius: '8px', padding: '14px 32px', fontSize: '16px', fontWeight: '600', cursor: 'not-allowed', width: '100%', marginBottom: '24px' },
  specs: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' },
  specsTitle: { color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '16px' },
  specRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #2a2a2a' },
  specKey: { color: '#888', fontSize: '14px' },
  specVal: { color: '#fff', fontSize: '14px', fontWeight: '500' },
}

export default ProductDetailPage