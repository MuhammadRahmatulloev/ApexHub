import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const ProductCard = ({ product }) => (
  <Link to={`/products/${product.id}`} style={s.card}>
    <div style={s.cardImg}>
      {product.main_image
        ? <img src={product.main_image} alt={product.name} style={s.img} />
        : <div style={s.noImg}>No image</div>
      }
    </div>
    <div style={s.cardBody}>
      <span style={s.badge}>{product.product_type}</span>
      <h3 style={s.cardName}>{product.name}</h3>
      <div style={s.cardBottom}>
        <span style={s.price}>${product.price}</span>
        <span style={s.rating}>{'★'.repeat(Math.round(product.average_rating))}</span>
      </div>
    </div>
  </Link>
)

const HomePage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products/top-rated/')
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div style={s.hero}>
        <p style={s.heroLabel}>Premium PC Store</p>
        <h1 style={s.heroTitle}>Build Your Dream PC</h1>
        <p style={s.heroSub}>Laptops, desktops, and components — all in one place</p>
        <div style={s.heroBtns}>
          <Link to="/products" style={s.btnPrimary}>Browse Products</Link>
          <Link to="/builds" style={s.btnSecondary}>AI PC Builder</Link>
        </div>
      </div>

      <div style={s.features}>
        {[
          { icon: '🚀', title: 'Fast Delivery', desc: '2-3 business days' },
          { icon: '🛡', title: 'Warranty', desc: '1 year on all products' },
          { icon: '🤖', title: 'AI Assistant', desc: 'Get expert advice' },
          { icon: '💳', title: 'Secure Payment', desc: '100% protected' },
        ].map(f => (
          <div key={f.title} style={s.feature}>
            <span style={s.featureIcon}>{f.icon}</span>
            <div>
              <p style={s.featureTitle}>{f.title}</p>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Top Rated Products</h2>
          <Link to="/products" style={s.sectionLink}>View all →</Link>
        </div>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        ) : (
          <div style={s.grid}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  hero: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', marginBottom: '24px' },
  heroLabel: { color: 'var(--accent)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' },
  heroTitle: { color: 'var(--text-primary)', fontSize: '42px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-1px' },
  heroSub: { color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '28px' },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { background: 'var(--accent)', color: '#fff', padding: '12px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '15px' },
  btnSecondary: { background: 'transparent', color: 'var(--text-primary)', padding: '12px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', border: '1px solid var(--border)' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' },
  feature: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' },
  featureIcon: { fontSize: '24px' },
  featureTitle: { color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '2px' },
  featureDesc: { color: 'var(--text-secondary)', fontSize: '12px' },
  section: { marginBottom: '40px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { color: 'var(--text-primary)', fontSize: '20px', fontWeight: '600' },
  sectionLink: { color: 'var(--accent)', fontSize: '14px', fontWeight: '500' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s, transform 0.15s' },
  cardImg: { height: '160px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { color: 'var(--text-muted)', fontSize: '13px' },
  cardBody: { padding: '14px' },
  badge: { background: 'rgba(229,62,62,0.1)', color: 'var(--accent)', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardName: { color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', margin: '8px 0 10px' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: 'var(--accent)', fontSize: '16px', fontWeight: '700' },
  rating: { color: 'var(--warning)', fontSize: '12px' },
}

export default HomePage