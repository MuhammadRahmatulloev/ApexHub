import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'

const AdminNewsPage = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/')
  }, [user])

  useEffect(() => {
    api.get('/news/all_news/')
      .then(res => setNews(res.data))
      .catch(() => setError(t('news.loadError')))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm(t('news.deleteConfirm'))) return
    setDeleting(id)
    try {
      await api.delete(`/news/${id}/delete_news/`)
      setNews(prev => prev.filter(n => n.id !== id))
    } catch {
      setError(t('news.deleteError'))
    }
    setDeleting(null)
  }

  const handleToggle = async (id) => {
    setToggling(id)
    try {
      const res = await api.patch(`/news/${id}/toggle_publish/`)
      setNews(prev => prev.map(n => n.id === id ? { ...n, is_published: res.data.is_published } : n))
    } catch {
      setError(t('news.toggleError'))
    }
    setToggling(null)
  }

  if (!user) return null

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .news-row {
          display: grid;
          grid-template-columns: 80px 1fr 100px 110px 160px;
          gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          align-items: center;
          transition: background 0.15s;
        }
        .news-row:hover { background: var(--bg-hover); }
        .news-row:last-child { border-bottom: none; }
        .edit-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .edit-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .del-btn {
          background: transparent;
          border: 1px solid rgba(248,113,113,0.3);
          color: var(--danger);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, background 0.15s;
        }
        .del-btn:hover { border-color: var(--danger); background: rgba(248,113,113,0.08); }
        .del-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .toggle-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .toggle-btn:hover { border-color: var(--accent); color: var(--accent); }
        .toggle-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .add-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .add-btn:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-btn); }
      `}</style>

      <div style={s.page}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>{t('news.management')}</h1>
            <p style={s.sub}>{t('news.managementSub')}</p>
          </div>
          <button className="add-btn" onClick={() => navigate('/admin/news/create')}>
            {t('news.addNews')}
          </button>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {loading ? (
          <div style={s.tableWrap}>
            {[1,2,3].map(i => (
              <div key={i} style={s.skeletonRow} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div style={s.empty}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
              <rect x="8" y="4" width="32" height="40" rx="4"/>
              <path d="M16 14h16M16 22h16M16 30h10"/>
            </svg>
            <p style={s.emptyTitle}>{t('news.noNews')}</p>
            <p style={s.emptyDesc}>{t('news.noNewsDesc')}</p>
            <button className="add-btn" style={{ marginTop: '8px' }} onClick={() => navigate('/admin/news/create')}>
              {t('news.createFirst')}
            </button>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <div style={s.tableHead}>
              <span>{t('news.image')}</span>
              <span>{t('news.titleLabel')}</span>
              <span>{t('news.status')}</span>
              <span>{t('news.date')}</span>
              <span>{t('common.actions')}</span>
            </div>
            {news.map((item, i) => (
              <div
                key={item.id}
                className="news-row"
                style={{ animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}
              >
                <div style={s.thumb}>
                  {item.image
                    ? <img src={item.image} alt="" style={s.thumbImg} />
                    : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
                        <rect x="1" y="3" width="18" height="14" rx="3"/>
                        <circle cx="7" cy="9" r="1.8"/>
                        <path d="M1 14l4.5-4.5 3 3 3-3 4.5 4.5"/>
                      </svg>
                    )
                  }
                </div>

                <span style={s.newsTitle}>{item.title}</span>

                <span>
                  <span style={item.is_published ? s.publishedBadge : s.draftBadge}>
                    {item.is_published ? t('news.published') : t('news.draft')}
                  </span>
                </span>

                <span style={s.dateText}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>

                <div style={s.actionsCell}>
                  <button className="edit-btn" onClick={() => navigate(`/admin/news/edit/${item.id}`)}>
                    {t('common.edit')}
                  </button>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle(item.id)}
                    disabled={toggling === item.id}
                  >
                    {toggling === item.id ? '...' : item.is_published ? t('news.hide') : t('news.publish')}
                  </button>
                  <button
                    className="del-btn"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                  >
                    {deleting === item.id ? '...' : t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  page: { animation: 'fadeUp 0.35s ease both' },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  sub: { color: 'var(--text-secondary)', fontSize: '13px' },
  errorBox: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: 'var(--danger)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  tableWrap: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 100px 110px 160px',
    gap: '16px',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  skeletonRow: {
    height: '72px',
    background: 'var(--bg-hover)',
    borderBottom: '1px solid var(--border)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  thumb: {
    width: '64px',
    height: '48px',
    borderRadius: '8px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  newsTitle: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  publishedBadge: {
    background: 'rgba(52,211,153,0.1)',
    color: 'var(--success)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  draftBadge: {
    background: 'var(--bg-hover)',
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  dateText: { color: 'var(--text-secondary)', fontSize: '12px' },
  actionsCell: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    gap: '10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    textAlign: 'center',
  },
  emptyTitle: { color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600', marginTop: '4px' },
  emptyDesc: { color: 'var(--text-secondary)', fontSize: '13px' },
}

export default AdminNewsPage