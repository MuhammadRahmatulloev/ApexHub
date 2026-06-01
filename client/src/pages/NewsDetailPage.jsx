import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const NewsDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/news/${id}/detail_news/`)
      .then(res => setItem(res.data))
      .catch(() => navigate('/news'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></Layout>
  if (!item) return null

  return (
    <Layout>
      <button style={s.back} onClick={() => navigate('/news')}>← Back to News</button>
      {item.image && (
        <div style={s.imgWrap}>
          <img src={item.image} alt={item.title} style={s.img} />
        </div>
      )}
      <div style={s.meta}>
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
        <span style={s.dot}>·</span>
        <span>{item.author?.username}</span>
      </div>
      <h1 style={s.title}>{item.title}</h1>
      <div style={s.content}>{item.content}</div>
    </Layout>
  )
}

const s = {
  back: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', marginBottom: '24px', transition: 'border-color 0.15s, color 0.15s' },
  imgWrap: { width: '100%', maxHeight: '400px', overflow: 'hidden', borderRadius: '12px', marginBottom: '24px' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  meta: { color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px', display: 'flex', gap: '6px' },
  dot: { color: 'var(--text-muted)' },
  title: { color: 'var(--text-primary)', fontSize: '28px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.3' },
  content: { color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap' },
}

export default NewsDetailPage