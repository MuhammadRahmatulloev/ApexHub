import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const CartPage = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const navigate = useNavigate()

  const fetchCart = () => {
    api.get('/orders/cart/my_cart/')
      .then(res => setCart(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCart() }, [])

  const removeItem = async (productId) => {
    await api.delete('/orders/cart/remove_item/', { data: { product_id: productId } })
    fetchCart()
  }

  const createOrder = async () => {
    setOrdering(true)
    try {
      await api.post('/orders/create_order/', { delivery_address: 'My address' })
      navigate('/orders')
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.[0] || 'Error creating order')
    }
    setOrdering(false)
  }

  if (loading) return <Layout><p style={{ color: '#888' }}>Loading...</p></Layout>

  return (
    <Layout>
      <h1 style={styles.title}>My Cart</h1>

      {!cart?.items?.length ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>Your cart is empty</p>
        </div>
      ) : (
        <div style={styles.container}>
          <div style={styles.items}>
            {cart.items.map(item => (
              <div key={item.id} style={styles.item}>
                <div style={styles.itemImg}>
                  {item.product.main_image
                    ? <img src={item.product.main_image} alt={item.product.name} style={styles.img} />
                    : <div style={styles.noImg}>No Image</div>
                  }
                </div>
                <div style={styles.itemInfo}>
                  <h3 style={styles.itemName}>{item.product.name}</h3>
                  <p style={styles.itemPrice}>${item.product.price} x {item.quantity}</p>
                </div>
                <div style={styles.itemRight}>
                  <p style={styles.itemTotal}>${item.total_price}</p>
                  <button style={styles.removeBtn} onClick={() => removeItem(item.product.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Items</span>
              <span style={styles.summaryVal}>{cart.total_items}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Total</span>
              <span style={styles.summaryTotal}>${cart.total_price}</span>
            </div>
            <button style={ordering ? styles.orderBtnDisabled : styles.orderBtn} onClick={createOrder} disabled={ordering}>
              {ordering ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}

const styles = {
  title: { color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '24px' },
  empty: { textAlign: 'center', padding: '80px' },
  emptyText: { color: '#888', fontSize: '18px' },
  container: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' },
  items: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' },
  itemImg: { width: '80px', height: '80px', background: '#2a2a2a', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { color: '#555', fontSize: '11px' },
  itemInfo: { flex: 1 },
  itemName: { color: '#fff', fontSize: '15px', fontWeight: '600', marginBottom: '6px' },
  itemPrice: { color: '#888', fontSize: '14px' },
  itemRight: { textAlign: 'right' },
  itemTotal: { color: '#e53e3e', fontSize: '18px', fontWeight: '700', marginBottom: '8px' },
  removeBtn: { background: 'transparent', border: '1px solid #3a3a3a', color: '#888', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' },
  summary: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px', height: 'fit-content' },
  summaryTitle: { color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '20px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  summaryLabel: { color: '#888', fontSize: '14px' },
  summaryVal: { color: '#fff', fontSize: '14px' },
  summaryTotal: { color: '#e53e3e', fontSize: '20px', fontWeight: '700' },
  orderBtn: { background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', width: '100%', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
  orderBtnDisabled: { background: '#555', color: '#888', border: 'none', borderRadius: '8px', padding: '14px', width: '100%', fontSize: '16px', cursor: 'not-allowed', marginTop: '16px' },
}

export default CartPage