import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'

const NewsPage = () => {
  const { t } = useTranslation()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/news/list_news/')
      .then(res => setNews(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <h1 style={s.title}>{t('news.title')}</h1>
      {loading ? (
        <p style={s.muted}>{t('common.loading')}</p>
      ) : !news.length ? (
        <p style={s.muted}>{t('news.noNews')}</p>
      ) : (
        <div style={s.grid}>
          {news.map(item => (
            <Link to={`/news/${item.id}`} key={item.id} style={s.card}>
              <div style={s.imgWrap}>
                {item.image
                  ? <img src={item.image} alt={item.title} style={s.img} />
                  : <div style={s.noImg} />
                }
              </div>
              <div style={s.body}>
                <p style={s.meta}>{new Date(item.created_at).toLocaleDateString()} · {item.author?.username}</p>
                <h3 style={s.newsTitle}>{item.title}</h3>
                <span style={s.readMore}>{t('news.readMore')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}

const s = {
  title: { color: 'var(--text-primary)', fontSize: '26px', fontWeight: '700', marginBottom: '24px' },
  muted: { color: 'var(--text-secondary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s, transform 0.15s', display: 'block' },
  imgWrap: { height: '180px', background: 'var(--bg-hover)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { color: 'var(--text-muted)', fontSize: '12px' },
  body: { padding: '16px' },
  meta: { color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '8px' },
  newsTitle: { color: 'var(--text-primary)', fontSize: '15px', fontWeight: '600', marginBottom: '10px', lineHeight: '1.4' },
  readMore: { color: 'var(--accent)', fontSize: '12px', fontWeight: '600' },
}

export default NewsPage