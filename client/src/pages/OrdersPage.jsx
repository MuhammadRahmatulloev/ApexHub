import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const STATUS_COLORS = {
  CREATED: '#f6c90e',
  PAID: '#4caf50',
  SHIPPING: '#2196f3',
  DELIVERED: '#4caf50',
  CANCELLED: '#e53e3e',
}

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my_orders/')
      .then(res => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cancelOrder = async (id) => {
    await api.post(`/orders/${id}/cancel/`)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o))
  }

  if (loading) return <Layout><p style={{ color: '#888' }}>Loading...</p></Layout>

  return (
    <Layout>
      <h1 style={styles.title}>My Orders</h1>

      {!orders.length ? (
        <p style={styles.empty}>No orders yet</p>
      ) : (
        <div style={styles.list}>
          {orders.map(order => (
            <div key={order.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.orderId}>Order #{order.id}</span>
                  <span style={{ ...styles.status, color: STATUS_COLORS[order.status] }}>{order.status}</span>
                </div>
                <span style={styles.date}>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>

              <div style={styles.items}>
                {order.items.map(item => (
                  <div key={item.id} style={styles.item}>
                    <span style={styles.itemName}>{item.product.name}</span>
                    <span style={styles.itemQty}>x{item.quantity}</span>
                    <span style={styles.itemPrice}>${item.total_price}</span>
                  </div>
                ))}
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.total}>Total: ${order.total_price}</span>
                {order.status === 'CREATED' && (
                  <button style={styles.cancelBtn} onClick={() => cancelOrder(order.id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

const styles = {
  title: { color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '24px' },
  empty: { color: '#888', fontSize: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  orderId: { color: '#fff', fontSize: '16px', fontWeight: '700', marginRight: '12px' },
  status: { fontSize: '13px', fontWeight: '600' },
  date: { color: '#666', fontSize: '13px' },
  items: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  item: { display: 'flex', gap: '12px', alignItems: 'center' },
  itemName: { color: '#ccc', fontSize: '14px', flex: 1 },
  itemQty: { color: '#666', fontSize: '13px' },
  itemPrice: { color: '#fff', fontSize: '14px', fontWeight: '600' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2a2a2a', paddingTop: '16px' },
  total: { color: '#e53e3e', fontSize: '18px', fontWeight: '700' },
  cancelBtn: { background: 'transparent', border: '1px solid #e53e3e', color: '#e53e3e', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer', fontSize: '13px' },
}

export default OrdersPage