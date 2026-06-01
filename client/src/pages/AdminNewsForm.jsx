import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'

const AdminNewsForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ title: '', content: '', is_published: true })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/')
  }, [user])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/news/${id}/detail_news/`)
      .then(res => {
        const n = res.data
        setForm({ title: n.title || '', content: n.content || '', is_published: n.is_published ?? true })
        if (n.image) setExistingImage(n.image)
      })
      .catch(() => setError('Failed to load article'))
      .finally(() => setFetching(false))
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('content', form.content)
      formData.append('is_published', form.is_published)
      if (imageFile) formData.append('image', imageFile)

      if (isEdit) {
        await api.patch(`/news/${id}/update_news/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSuccess('Article updated!')
      } else {
        await api.post('/news/create_news/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSuccess('Article created!')
        setTimeout(() => navigate('/admin/news'), 1000)
      }
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object' && data !== null) {
        const first = Object.values(data)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setError('Something went wrong')
      }
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <Layout>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'skeletonPulse 1.4s ease infinite' }} />
          ))}
        </div>
        <style>{`@keyframes skeletonPulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
      </Layout>
    )
  }

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-input {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .form-input:focus { border-color: var(--accent); }
        .form-input::placeholder { color: var(--text-secondary); }
        .form-textarea {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.15s;
          box-sizing: border-box;
          min-height: 240px;
        }
        .form-textarea:focus { border-color: var(--accent); }
        .form-textarea::placeholder { color: var(--text-secondary); }
        .upload-zone {
          width: 100%;
          height: 160px;
          border-radius: 10px;
          border: 2px dashed var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .upload-zone:hover { border-color: var(--accent); background: var(--accent-dim); }
        .cancel-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .cancel-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
        .submit-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 26px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .submit-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-btn); }
        .submit-btn:disabled { background: var(--text-muted); cursor: not-allowed; }
        .back-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 7px;
          padding: 6px 14px;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .back-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
      `}</style>

      <div style={s.wrap}>
        <div style={s.topBar}>
          <button className="back-btn" onClick={() => navigate('/admin/news')}>← Back</button>
          <h1 style={s.title}>{isEdit ? 'Edit Article' : 'New Article'}</h1>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}
        {success && <div style={s.successBox}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.card}>
            <p style={s.cardTitle}>Article Info</p>

            <div style={s.field}>
              <label style={s.label}>Title</label>
              <input
                className="form-input"
                name="title"
                placeholder="Article title..."
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Content</label>
              <textarea
                className="form-textarea"
                name="content"
                placeholder="Write your article content here..."
                value={form.content}
                onChange={handleChange}
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Cover Image</label>
              {imagePreview || existingImage ? (
                <div style={s.imgPreviewWrap}>
                  <img
                    src={imagePreview || existingImage}
                    alt="preview"
                    style={s.imgPreview}
                  />
                  <button
                    type="button"
                    style={s.removeImgBtn}
                    onClick={() => { setImageFile(null); setImagePreview(null); setExistingImage(null) }}
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="1" y="4" width="26" height="20" rx="4"/>
                    <circle cx="9" cy="12" r="2.5"/>
                    <path d="M1 20l7-7 4 4 4-4 7 7"/>
                  </svg>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Click to upload image</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>JPG, PNG, WebP</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
            </div>

            <div style={s.checkRow}>
              <div
                style={{
                  ...s.toggle,
                  background: form.is_published ? 'var(--accent)' : 'var(--bg-hover)',
                  border: `1px solid ${form.is_published ? 'var(--accent)' : 'var(--border)'}`,
                }}
                onClick={() => setForm(prev => ({ ...prev, is_published: !prev.is_published }))}
              >
                <div style={{
                  ...s.toggleThumb,
                  transform: form.is_published ? 'translateX(18px)' : 'translateX(2px)',
                }} />
              </div>
              <span style={s.checkLabel}>
                {form.is_published ? 'Published — visible to everyone' : 'Draft — only you can see it'}
              </span>
            </div>
          </div>

          <div style={s.formActions}>
            <button type="button" className="cancel-btn" onClick={() => navigate('/admin/news')}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

const s = {
  wrap: { maxWidth: '760px', margin: '0 auto', animation: 'fadeUp 0.35s ease both' },
  topBar: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  title: { color: 'var(--text-primary)', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.2px' },
  errorBox: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: 'var(--danger)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '20px',
    fontSize: '13px',
  },
  successBox: {
    background: 'rgba(52,211,153,0.08)',
    border: '1px solid rgba(52,211,153,0.25)',
    color: 'var(--success)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '20px',
    fontSize: '13px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    marginBottom: '16px',
  },
  cardTitle: { color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500' },
  imgPreviewWrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  imgPreview: {
    width: '100%',
    maxHeight: '280px',
    objectFit: 'cover',
    borderRadius: '10px',
    border: '1px solid var(--border)',
  },
  removeImgBtn: {
    background: 'transparent',
    border: '1px solid rgba(248,113,113,0.3)',
    color: 'var(--danger)',
    borderRadius: '7px',
    padding: '6px 14px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    alignSelf: 'flex-start',
    transition: 'border-color 0.15s, background 0.15s',
  },
  checkRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  toggle: {
    width: '38px',
    height: '22px',
    borderRadius: '11px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s, border 0.2s',
    flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute',
    top: '3px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#fff',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  },
  checkLabel: { color: 'var(--text-secondary)', fontSize: '13px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' },
}

export default AdminNewsForm