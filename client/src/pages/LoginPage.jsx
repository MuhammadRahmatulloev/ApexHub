import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login/', data)
      login(res.data.user, res.data.access, res.data.refresh)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logoText}>ApexHub</div>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.subtitle}>Sign in to your account</p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              {...register('email', { required: 'Required' })}
            />
            {errors.email && <span style={s.fieldErr}>{errors.email.message}</span>}
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Required' })}
            />
            {errors.password && <span style={s.fieldErr}>{errors.password.message}</span>}
          </div>
          <button style={loading ? s.btnDisabled : s.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={s.footer}>
          No account? <Link to="/register" style={s.footerLink}>Register</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow)' },
  header: { textAlign: 'center', marginBottom: '28px' },
  logoText: { color: 'var(--accent)', fontSize: '22px', fontWeight: '700', marginBottom: '16px' },
  title: { color: 'var(--text-primary)', fontSize: '22px', fontWeight: '600', marginBottom: '6px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' },
  input: { background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '11px 14px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', transition: 'border-color 0.15s' },
  btn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: '600', marginTop: '4px' },
  btnDisabled: { background: 'var(--text-muted)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', cursor: 'not-allowed', marginTop: '4px' },
  error: { background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', color: '#e53e3e', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' },
  fieldErr: { color: 'var(--accent)', fontSize: '12px' },
  footer: { color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '20px' },
  footerLink: { color: 'var(--accent)', fontWeight: '600' },
}

export default LoginPage