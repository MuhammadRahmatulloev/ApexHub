import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/favorites/my_favorites/')
      .then(res => setFavorites(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const remove = async (productId) => {
    await api.delete('/favorites/remove/', { data: { product_id: productId } })
    setFavorites(prev => prev.filter(f => f.product.id !== productId))
  }

  return (
    <Layout>
      <h1 style={s.title}>Favorites</h1>
      {loading ? (
        <p style={s.muted}>Loading...</p>
      ) : !favorites.length ? (
        <div style={s.empty}>
          <p style={s.emptyText}>No favorites yet</p>
          <Link to="/products" style={s.emptyLink}>Browse Products</Link>
        </div>
      ) : (
        <div style={s.grid}>
          {favorites.map(fav => (
            <div key={fav.id} style={s.card}>
              <Link to={`/products/${fav.product.id}`} style={s.imgWrap}>
                {fav.product.main_image
                  ? <img src={fav.product.main_image} alt={fav.product.name} style={s.img} />
                  : <div style={s.noImg}>No image</div>
                }
              </Link>
              <div style={s.body}>
                <span style={s.type}>{fav.product.product_type}</span>
                <Link to={`/products/${fav.product.id}`} style={s.name}>{fav.product.name}</Link>
                <div style={s.bottom}>
                  <span style={s.price}>${fav.product.price}</span>
                  <button style={s.removeBtn} onClick={() => remove(fav.product.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

const s = {
  title: { color: 'var(--text-primary)', fontSize: '26px', fontWeight: '700', marginBottom: '24px' },
  muted: { color: 'var(--text-secondary)' },
  empty: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '60px', textAlign: 'center' },
  emptyText: { color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px' },
  emptyLink: { background: 'var(--accent)', color: '#fff', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s, transform 0.15s' },
  imgWrap: { display: 'block', height: '160px', background: 'var(--bg-hover)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { color: 'var(--text-muted)', fontSize: '12px' },
  body: { padding: '14px' },
  type: { color: 'var(--accent)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  name: { display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', margin: '6px 0 10px' },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: 'var(--accent)', fontSize: '16px', fontWeight: '800' },
  removeBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' },
}

export default FavoritesPage