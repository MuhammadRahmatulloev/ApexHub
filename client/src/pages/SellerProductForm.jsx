import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'

const SellerProductForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    if (user && user.role !== 'SELLER' && user.role !== 'ADMIN') {
      navigate('/')
    }
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
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setFetching(false))
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm(prev => ({ ...prev, name, slug: generateSlug(name) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category: form.category || null,
      brand: form.brand || null,
    }

    try {
      if (isEdit) {
        await api.patch(`/products/${id}/`, payload)
        setSuccess('Product updated successfully')
      } else {
        await api.post('/products/', payload)
        setSuccess('Product created successfully')
        setTimeout(() => navigate('/seller'), 1500)
      }
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') {
        const first = Object.values(data)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setError('Something went wrong')
      }
    }
    setLoading(false)
  }

  if (fetching) return <Layout><p style={{ color: '#888' }}>Loading...</p></Layout>

  return (
    <Layout>
      <div style={s.container}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate('/seller')}>
            Back
          </button>
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
                <input
                  style={s.input}
                  name="name"
                  placeholder="e.g. Gaming Laptop RTX 4070"
                  value={form.name}
                  onChange={handleNameChange}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Slug</label>
                <input
                  style={s.input}
                  name="slug"
                  placeholder="auto-generated"
                  value={form.slug}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Description</label>
                <textarea
                  style={s.textarea}
                  name="description"
                  placeholder="Describe your product..."
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
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
                <input
                  style={s.input}
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
                <label style={s.label}>Stock</label>
                <input
                  style={s.input}
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
                <label style={s.label}>Category</label>
                <select style={s.select} name="category" value={form.category} onChange={handleChange}>
                  <option value="">No category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>Brand</label>
                <select style={s.select} name="brand" value={form.brand} onChange={handleChange}>
                  <option value="">No brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div style={s.checkboxRow}>
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleChange}
                  style={s.checkbox}
                />
                <label htmlFor="is_available" style={s.checkboxLabel}>
                  Available for purchase
                </label>
              </div>
            </div>
          </div>

          <div style={s.actions}>
            <button type="button" style={s.cancelBtn} onClick={() => navigate('/seller')}>
              Cancel
            </button>
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
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  cancelBtn: { background: 'transparent', border: '1px solid #3a3a3a', color: '#888', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', cursor: 'pointer' },
  submitBtn: { background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  submitBtnDisabled: { background: '#555', color: '#888', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', cursor: 'not-allowed' },
}

export default SellerProductForm