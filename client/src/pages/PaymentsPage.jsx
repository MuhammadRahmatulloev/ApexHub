import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'

const STATUS_COLOR = {
  PENDING: 'var(--warning)',
  SUCCESS: 'var(--success)',
  FAILED: 'var(--danger)',
  REFUNDED: 'var(--text-secondary)',
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    api.get('/payments/my_payments/')
      .then(res => setPayments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <h1 style={s.title}>{t('payments.title')}</h1>
      {loading ? (
        <p style={s.muted}>{t('common.loading')}</p>
      ) : !payments.length ? (
        <p style={s.muted}>{t('payments.noPayments')}</p>
      ) : (
        <div style={s.list}>
          {payments.map(p => (
            <div key={p.id} style={s.card}>
              <div style={s.cardTop}>
                <div>
                  <span style={s.payId}>Payment #{p.id}</span>
                  <span style={s.orderId}>· Order #{p.order}</span>
                </div>
                <span style={{ ...s.status, color: STATUS_COLOR[p.status] }}>{p.status}</span>
              </div>
              <div style={s.cardBottom}>
                <span style={s.method}>{p.method}</span>
                <span style={s.amount}>${p.amount}</span>
              </div>
              <p style={s.date}>{new Date(p.created_at).toLocaleString()}</p>
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
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  payId: { color: 'var(--text-primary)', fontSize: '15px', fontWeight: '700' },
  orderId: { color: 'var(--text-secondary)', fontSize: '13px', marginLeft: '6px' },
  status: { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  method: { background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '6px', padding: '3px 10px', fontSize: '12px' },
  amount: { color: 'var(--accent)', fontSize: '20px', fontWeight: '800' },
  date: { color: 'var(--text-muted)', fontSize: '11px' },
}

export default PaymentsPage