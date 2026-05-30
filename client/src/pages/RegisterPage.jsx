import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('register')
  const [email, setEmail] = useState('')

  const onRegister = async (data) => {
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register/', data)
      setEmail(data.email)
      setStep('verify')
    } catch (err) {
      const e = err.response?.data
      setError(e?.email?.[0] || e?.password?.[0] || e?.username?.[0] || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const onVerify = async (data) => {
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/verify-email/', { email, code: data.code })
      navigate('/login')
    } catch {
      setError('Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logoText}>ApexHub</div>
          <h1 style={s.title}>{step === 'register' ? 'Create account' : 'Verify your email'}</h1>
          <p style={s.subtitle}>
            {step === 'register' ? 'Join ApexHub today' : `Code sent to ${email}`}
          </p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {step === 'register' ? (
          <form onSubmit={handleSubmit(onRegister)} style={s.form}>
            {[
              { name: 'username', label: 'Username', placeholder: 'your_username', rules: { required: 'Required' } },
              { name: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email', rules: { required: 'Required' } },
              { name: 'age', label: 'Age', placeholder: '18', type: 'number', rules: { min: { value: 13, message: 'Min 13' } } },
              { name: 'password', label: 'Password', placeholder: '••••••••', type: 'password', rules: { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } } },
              { name: 'password2', label: 'Confirm password', placeholder: '••••••••', type: 'password', rules: { required: 'Required', validate: v => v === watch('password') || 'Passwords do not match' } },
            ].map(({ name, label, placeholder, type = 'text', rules }) => (
              <div key={name} style={s.field}>
                <label style={s.label}>{label}</label>
                <input style={s.input} type={type} placeholder={placeholder} {...register(name, rules)} />
                {errors[name] && <span style={s.fieldErr}>{errors[name].message}</span>}
              </div>
            ))}
            <button style={loading ? s.btnDisabled : s.btn} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onVerify)} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Verification code</label>
              <input
                style={{ ...s.input, textAlign: 'center', fontSize: '22px', letterSpacing: '10px' }}
                placeholder="000000"
                maxLength={6}
                {...register('code', { required: 'Required' })}
              />
            </div>
            <button style={loading ? s.btnDisabled : s.btn} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button type="button" style={s.backBtn} onClick={() => setStep('register')}>
              Back to registration
            </button>
          </form>
        )}

        {step === 'register' && (
          <p style={s.footer}>
            Already have an account? <Link to="/login" style={s.footerLink}>Sign in</Link>
          </p>
        )}
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
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' },
  input: { background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '11px 14px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' },
  btn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: '600', marginTop: '4px' },
  btnDisabled: { background: 'var(--text-muted)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', cursor: 'not-allowed', marginTop: '4px' },
  backBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '10px', fontSize: '13px' },
  error: { background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)', color: '#e53e3e', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' },
  fieldErr: { color: 'var(--accent)', fontSize: '12px' },
  footer: { color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '20px' },
  footerLink: { color: 'var(--accent)', fontWeight: '600' },
}

export default RegisterPage