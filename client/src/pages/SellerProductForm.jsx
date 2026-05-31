import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'

const SellerProductForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
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
      .catch(() => setError('Failed to load product'))
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
    // reset input so same file can be selected again
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
      // Step 1: Create / update product as JSON
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
        productId = res.data.id  // number from JSON response
      }

      // Step 2: Upload images using action endpoint /products/{id}/upload_image/
      // This avoids the "product" field problem — the product ID is in the URL
      for (let i = 0; i < newImages.length; i++) {
        const formData = new FormData()
        formData.append('image', newImages[i])
        formData.append('is_main', i === 0 && existingImages.length === 0 ? 'true' : 'false')
        await api.post(`/products/${productId}/upload_image/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      // Step 3: Delete removed images
      for (const imgId of removedImageIds) {
        await api.delete(`/products/${productId}/delete_image/?image_id=${imgId}`).catch(() => {})
      }

      setSuccess(isEdit ? 'Product updated!' : 'Product created!')
      if (!isEdit) setTimeout(() => navigate('/seller'), 1200)
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

  if (fetching) return <Layout><p style={{ color: '#888' }}>Loading...</p></Layout>

  const totalImages = existingImages.length + newImages.length

  return (
    <Layout>
      <div style={s.container}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate('/seller')}>← Back</button>
          <h1 style={s.title}>{isEdit ? 'Edit Product' : 'Create Product'}</h1>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.grid}>
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Basic Info</h2>
              <div style={s.field}>
                <label style={s.label}>Product Name</label>
                <input style={s.input} name="name" placeholder="e.g. Gaming Laptop RTX 4070"
                  value={form.name} onChange={handleNameChange} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Slug</label>
                <input style={s.input} name="slug" placeholder="auto-generated"
                  value={form.slug} onChange={handleChange} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Description</label>
                <textarea style={s.textarea} name="description" placeholder="Describe your product..."
                  value={form.description} onChange={handleChange} rows={4} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Product Type</label>
                <select style={s.select} name="product_type" value={form.product_type} onChange={handleChange}>
                  <option value="LAPTOP">Laptop</option>
                  <option value="PC">PC</option>
                  <option value="COMPONENT">Component</option>
                  <option value="PERIPHERAL">Peripheral</option>
                </select>
              </div>
            </div>

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Pricing & Stock</h2>
              <div style={s.field}>
                <label style={s.label}>Price ($)</label>
                <input style={s.input} name="price" type="number" step="0.01" min="0"
                  placeholder="0.00" value={form.price} onChange={handleChange} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Stock</label>
                <input style={s.input} name="stock" type="number" min="0"
                  placeholder="0" value={form.stock} onChange={handleChange} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Category</label>
                <select style={s.select} name="category" value={form.category} onChange={handleChange}>
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Brand</label>
                <select style={s.select} name="brand" value={form.brand} onChange={handleChange}>
                  <option value="">No brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={s.checkboxRow}>
                <input type="checkbox" id="is_available" name="is_available"
                  checked={form.is_available} onChange={handleChange} style={s.checkbox} />
                <label htmlFor="is_available" style={s.checkboxLabel}>Available for purchase</label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div style={s.imagesSection}>
            <div style={s.imagesSectionHeader}>
              <h2 style={s.sectionTitle}>Product Images</h2>
              <span style={s.imageCount}>{totalImages} image{totalImages !== 1 ? 's' : ''}</span>
            </div>

            <div style={s.imagesGrid}>
              {existingImages.map((img) => (
                <div key={img.id} style={s.imageThumb}>
                  <img src={img.image} alt="" style={s.thumbImg} />
                  {img.is_main && <span style={s.mainBadge}>Main</span>}
                  <button type="button" style={s.removeImgBtn}
                    onClick={() => removeExistingImage(img.id)}>✕</button>
                </div>
              ))}

              {newImagePreviews.map((preview, i) => (
                <div key={`new-${i}`} style={s.imageThumb}>
                  <img src={preview} alt="" style={s.thumbImg} />
                  {existingImages.length === 0 && i === 0 && <span style={s.mainBadge}>Main</span>}
                  <span style={s.newBadge}>New</span>
                  <button type="button" style={s.removeImgBtn}
                    onClick={() => removeNewImage(i)}>✕</button>
                </div>
              ))}

              <div style={s.uploadBox} onClick={() => fileInputRef.current?.click()}>
                <span style={s.uploadIcon}>📷</span>
                <span style={s.uploadText}>Add Images</span>
                <span style={s.uploadSub}>Click to browse</span>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" multiple
              style={{ display: 'none' }} onChange={handleImageSelect} />

            <p style={s.imageHint}>💡 First image will be the main image. JPG, PNG, WebP supported.</p>
          </div>

          <div style={s.actions}>
            <button type="button" style={s.cancelBtn} onClick={() => navigate('/seller')}>Cancel</button>
            <button type="submit" style={loading ? s.submitBtnDisabled : s.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

const s = {
  container: { maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  backBtn: { background: 'transparent', border: '1px solid #3a3a3a', color: '#888', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', cursor: 'pointer' },
  title: { color: '#fff', fontSize: '24px', fontWeight: '700' },
  error: { background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', color: '#e53e3e', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '14px' },
  success: { background: 'rgba(72,187,120,0.1)', border: '1px solid rgba(72,187,120,0.3)', color: '#48bb78', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '14px' },
  form: {},
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  section: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitle: { color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#888', fontSize: '13px', fontWeight: '500' },
  input: { background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none' },
  textarea: { background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical' },
  select: { background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  checkboxLabel: { color: '#ccc', fontSize: '14px', cursor: 'pointer' },
  imagesSection: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px', marginBottom: '20px' },
  imagesSectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  imageCount: { color: '#888', fontSize: '13px' },
  imagesGrid: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' },
  imageThumb: { position: 'relative', width: '110px', height: '110px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #3a3a3a', flexShrink: 0 },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  mainBadge: { position: 'absolute', top: '6px', left: '6px', background: '#e53e3e', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px' },
  newBadge: { position: 'absolute', bottom: '6px', left: '6px', background: '#2a6496', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px' },
  removeImgBtn: { position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadBox: { width: '110px', height: '110px', borderRadius: '10px', border: '2px dashed #3a3a3a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', flexShrink: 0 },
  uploadIcon: { fontSize: '22px' },
  uploadText: { color: '#ccc', fontSize: '12px', fontWeight: '600' },
  uploadSub: { color: '#555', fontSize: '10px' },
  imageHint: { color: '#555', fontSize: '12px' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  cancelBtn: { background: 'transparent', border: '1px solid #3a3a3a', color: '#888', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', cursor: 'pointer' },
  submitBtn: { background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  submitBtnDisabled: { background: '#555', color: '#888', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', cursor: 'not-allowed' },
}

export default SellerProductForm