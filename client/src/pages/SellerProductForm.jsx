import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'
import { getMediaUrl } from '../utils/media'

const SellerProductForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    product_type: 'COMPONENT',
    price: '',
    stock: '',
    is_available: true,
    category: '',
    brand: '',
  })

  useEffect(() => {
    if (user && user.role !== 'SELLER' && user.role !== 'ADMIN') navigate('/')
  }, [user])

  useEffect(() => {
    api.get('/products/categories/').then(res => setCategories(res.data.results || res.data)).catch(() => {})
    api.get('/products/brands/').then(res => setBrands(res.data.results || res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${id}/`)
      .then(res => {
        const p = res.data
        setForm({
          name: p.name || '',
          slug: p.slug || '',
          description: p.description || '',
          product_type: p.product_type || 'COMPONENT',
          price: p.price || '',
          stock: p.stock || '',
          is_available: p.is_available ?? true,
          category: p.category?.id || '',
          brand: p.brand?.id || '',
        })
        if (p.images?.length > 0) setExistingImages(p.images)
      })
      .catch(() => setError(t('seller.form.loadError')))
      .finally(() => setFetching(false))
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setForm(prev => ({ ...prev, name, slug }))
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const previews = files.map(f => URL.createObjectURL(f))
    setNewImages(prev => [...prev, ...files])
    setNewImagePreviews(prev => [...prev, ...previews])
    e.target.value = ''
  }

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId) => {
    setRemovedImageIds(prev => [...prev, imageId])
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category: form.category || null,
        brand: form.brand || null,
      }

      let productId = id ? parseInt(id) : null

      if (isEdit) {
        await api.patch(`/products/${id}/`, payload)
      } else {
        const res = await api.post('/products/', payload)
        productId = res.data.id
      }

      for (let i = 0; i < newImages.length; i++) {
        const formData = new FormData()
        formData.append('image', newImages[i])
        formData.append('is_main', i === 0 && existingImages.length === 0 ? 'true' : 'false')
        await api.post(`/products/${productId}/upload_image/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      for (const imgId of removedImageIds) {
        await api.delete(`/products/${productId}/delete_image/?image_id=${imgId}`).catch(() => {})
      }

      setSuccess(isEdit ? t('seller.form.saveChanges') : t('seller.form.create'))
      if (!isEdit) setTimeout(() => navigate('/seller'), 1200)
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object' && data !== null) {
        const first = Object.values(data)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setError(t('common.error'))
      }
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '900px', margin: '0 auto' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'skeletonPulse 1.4s ease infinite' }} />
          ))}
        </div>
        <style>{`@keyframes skeletonPulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
      </Layout>
    )
  }

  const totalImages = existingImages.length + newImages.length

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
        .form-input:focus {
          border-color: var(--accent);
        }
        .form-input::placeholder {
          color: var(--text-secondary);
        }
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
        }
        .form-textarea:focus {
          border-color: var(--accent);
        }
        .form-textarea::placeholder {
          color: var(--text-secondary);
        }
        .form-select {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .form-select:focus {
          border-color: var(--accent);
        }
        .upload-zone {
          width: 100px;
          height: 100px;
          border-radius: 10px;
          border: 2px dashed var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.15s, background 0.15s;
        }
        .upload-zone:hover {
          border-color: var(--accent);
          background: var(--accent-dim);
        }
        .img-remove-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(0,0,0,0.65);
          border: none;
          color: #fff;
          font-size: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .img-remove-btn:hover {
          background: var(--danger);
        }
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
        .cancel-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }
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
          letter-spacing: 0.2px;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-btn);
        }
        .submit-btn:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
        }
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
        .back-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }
      `}</style>

      <div style={s.wrap}>
        <div style={s.topBar}>
          <button className="back-btn" onClick={() => navigate('/seller')}>← {t('common.back')}</button>
          <h1 style={s.title}>{isEdit ? t('seller.form.editProduct') : t('seller.form.newProduct')}</h1>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}
        {success && <div style={s.successBox}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.grid}>
            <div style={s.card}>
              <p style={s.cardTitle}>{t('seller.form.basicInfo')}</p>

              <div style={s.field}>
                <label style={s.label}>{t('seller.form.productName')}</label>
                <input
                  className="form-input"
                  name="name"
                  placeholder={t('seller.form.namePlaceholder')}
                  value={form.name}
                  onChange={handleNameChange}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>{t('seller.form.slug')}</label>
                <input
                  className="form-input"
                  name="slug"
                  placeholder={t('seller.form.slugPlaceholder')}
                  value={form.slug}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>{t('seller.form.description')}</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  placeholder={t('seller.form.descPlaceholder')}
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>{t('seller.form.productType')}</label>
                <select className="form-select" name="product_type" value={form.product_type} onChange={handleChange}>
                  <option value="LAPTOP">{t('products.laptops')}</option>
                  <option value="PC">{t('products.pcs')}</option>
                  <option value="COMPONENT">{t('products.components')}</option>
                  <option value="PERIPHERAL">{t('products.peripherals')}</option>
                </select>
              </div>
            </div>

            <div style={s.card}>
              <p style={s.cardTitle}>{t('seller.form.pricingStock')}</p>

              <div style={s.field}>
                <label style={s.label}>{t('seller.form.price')}</label>
                <input
                  className="form-input"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>{t('seller.form.stock')}</label>
                <input
                  className="form-input"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>{t('seller.form.category')}</label>
                <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                  <option value="">{t('seller.form.noCategory')}</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>{t('seller.form.brand')}</label>
                <select className="form-select" name="brand" value={form.brand} onChange={handleChange}>
                  <option value="">{t('seller.form.noBrand')}</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div style={s.checkRow}>
                <div
                  style={{
                    ...s.toggle,
                    background: form.is_available ? 'var(--accent)' : 'var(--bg-hover)',
                    border: `1px solid ${form.is_available ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                  onClick={() => setForm(prev => ({ ...prev, is_available: !prev.is_available }))}
                >
                  <div style={{
                    ...s.toggleThumb,
                    transform: form.is_available ? 'translateX(18px)' : 'translateX(2px)',
                  }} />
                </div>
                <span style={s.checkLabel}>{t('seller.form.available')}</span>
              </div>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.imgHeader}>
              <p style={s.cardTitle}>{t('seller.form.images')}</p>
              <span style={s.imgCount}>{totalImages}</span>
            </div>

            <div style={s.imgGrid}>
              {existingImages.map(img => (
                <div key={img.id} style={s.imgThumb}>
                  <img src={getMediaUrl(img.image)} alt="" style={s.thumbImg} />
                  {img.is_main && <span style={s.mainBadge}>{t('seller.form.main')}</span>}
                  <button type="button" className="img-remove-btn" onClick={() => removeExistingImage(img.id)}>✕</button>
                </div>
              ))}

              {newImagePreviews.map((preview, i) => (
                <div key={`new-${i}`} style={s.imgThumb}>
                  <img src={preview} alt="" style={s.thumbImg} />
                  {existingImages.length === 0 && i === 0 && <span style={s.mainBadge}>{t('seller.form.main')}</span>}
                  <span style={s.newBadge}>{t('seller.form.new')}</span>
                  <button type="button" className="img-remove-btn" onClick={() => removeNewImage(i)}>✕</button>
                </div>
              ))}

              <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="1" y="3" width="18" height="14" rx="3"/>
                  <circle cx="7" cy="9" r="1.8"/>
                  <path d="M1 14l4.5-4.5 3 3 3-3 4.5 4.5"/>
                </svg>
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600' }}>{t('seller.form.addPhoto')}</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />

            <p style={s.imgHint}>{t('seller.form.imagesHint')}</p>
          </div>

          <div style={s.formActions}>
            <button type="button" className="cancel-btn" onClick={() => navigate('/seller')}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? t('common.saving') : isEdit ? t('seller.form.saveChanges') : t('seller.form.create')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

const s = {
  wrap: {
    maxWidth: '900px',
    margin: '0 auto',
    animation: 'fadeUp 0.35s ease both',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
  },
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '16px',
  },
  cardTitle: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '2px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '500',
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
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
  checkLabel: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  imgHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '-4px',
  },
  imgCount: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
  },
  imgGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  imgThumb: {
    position: 'relative',
    width: '100px',
    height: '100px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid var(--border)',
    flexShrink: 0,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  mainBadge: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  newBadge: {
    position: 'absolute',
    bottom: '5px',
    left: '5px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  imgHint: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    marginTop: '-4px',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '4px',
  },
}

export default SellerProductForm