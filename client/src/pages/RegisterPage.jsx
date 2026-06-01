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
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)

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
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .auth-input {
          width: 100%;
          background: var(--bg);
          border: 1.5px solid var(--border-hover);
          border-radius: 10px;
          padding: 12px 16px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .auth-input::placeholder {
          color: var(--text-secondary);
        }
        .auth-btn {
          width: 100%;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.2px;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .auth-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-btn);
        }
        .auth-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .auth-btn-ghost {
          width: 100%;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 11px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .auth-btn-ghost:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }
        .show-pass-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .show-pass-btn:hover {
          color: var(--text-primary);
        }
        .code-input {
          width: 100%;
          background: var(--bg);
          border: 1.5px solid var(--border-hover);
          border-radius: 12px;
          padding: 16px;
          color: var(--text-primary);
          font-size: 28px;
          font-weight: 700;
          outline: none;
          font-family: inherit;
          text-align: center;
          letter-spacing: 14px;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
        }
        .code-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .code-input::placeholder {
          color: var(--border-hover);
          letter-spacing: 8px;
        }
      `}</style>

      <div style={s.bg}>
        <div style={s.bgGlow1} />
        <div style={s.bgGlow2} />
      </div>

      <div style={s.card}>
        <div style={s.logoRow}>
          <span style={s.logoApex}>Apex</span>
          <span style={s.logoHub}>Hub</span>
        </div>

        {step === 'register' ? (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <div style={s.headGroup}>
              <h1 style={s.title}>Create account</h1>
              <p style={s.subtitle}>Join ApexHub today</p>
            </div>

            {error && (
              <div style={s.errorBox}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="7" cy="7" r="6"/>
                  <path d="M7 4v3M7 10h.01"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onRegister)} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Username</label>
                <input
                  className="auth-input"
                  placeholder="your_username"
                  {...register('username', { required: 'Required' })}
                />
                {errors.username && <span style={s.fieldErr}>{errors.username.message}</span>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', { required: 'Required' })}
                />
                {errors.email && <span style={s.fieldErr}>{errors.email.message}</span>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Age <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                <input
                  className="auth-input"
                  type="number"
                  placeholder="18"
                  {...register('age', { min: { value: 13, message: 'Minimum age is 13' } })}
                />
                {errors.age && <span style={s.fieldErr}>{errors.age.message}</span>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="auth-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    style={{ paddingRight: '44px' }}
                    {...register('password', { required: 'Required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                  />
                  <button type="button" className="show-pass-btn" onClick={() => setShowPass(v => !v)}>
                    {showPass ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/>
                        <circle cx="8" cy="8" r="2"/>
                        <path d="M2 2l12 12"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/>
                        <circle cx="8" cy="8" r="2"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span style={s.fieldErr}>{errors.password.message}</span>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="auth-input"
                    type={showPass2 ? 'text' : 'password'}
                    placeholder="Repeat password"
                    style={{ paddingRight: '44px' }}
                    {...register('password2', {
                      required: 'Required',
                      validate: v => v === watch('password') || 'Passwords do not match'
                    })}
                  />
                  <button type="button" className="show-pass-btn" onClick={() => setShowPass2(v => !v)}>
                    {showPass2 ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/>
                        <circle cx="8" cy="8" r="2"/>
                        <path d="M2 2l12 12"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/>
                        <circle cx="8" cy="8" r="2"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password2 && <span style={s.fieldErr}>{errors.password2.message}</span>}
              </div>

              <button className="auth-btn" disabled={loading} style={{ marginTop: '4px' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p style={s.footerText}>
              Already have an account?{' '}
              <Link to="/login" style={s.footerLink}>Sign in</Link>
            </p>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease both' }}>
            <div style={s.verifyIconWrap}>
              <svg width="28" height="28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l9 6 9-6"/>
                <rect x="2" y="6" width="20" height="13" rx="2"/>
              </svg>
            </div>

            <div style={s.headGroup}>
              <h1 style={s.title}>Verify your email</h1>
              <p style={s.subtitle}>
                We sent a 6-digit code to<br />
                <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{email}</strong>
              </p>
            </div>

            {error && (
              <div style={s.errorBox}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="7" cy="7" r="6"/>
                  <path d="M7 4v3M7 10h.01"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onVerify)} style={s.form}>
              <div style={s.field}>
                <input
                  className="code-input"
                  placeholder="······"
                  maxLength={6}
                  {...register('code', { required: 'Required' })}
                />
                {errors.code && <span style={{ ...s.fieldErr, textAlign: 'center' }}>{errors.code.message}</span>}
              </div>

              <button className="auth-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button type="button" className="auth-btn-ghost" onClick={() => setStep('register')}>
                ← Back to registration
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgGlow1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
    opacity: 0.5,
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
    opacity: 0.35,
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-hover)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow-card)',
  },
  logoRow: {
    display: 'flex',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    marginBottom: '28px',
  },
  logoApex: {
    color: 'var(--accent)',
  },
  logoHub: {
    color: 'var(--text-primary)',
  },
  headGroup: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '6px',
    letterSpacing: '-0.2px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: 'var(--danger)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '20px',
    fontSize: '13px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
  },
  fieldErr: {
    color: 'var(--danger)',
    fontSize: '12px',
    marginTop: '-2px',
  },
  footerText: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '24px',
  },
  footerLink: {
    color: 'var(--accent)',
    fontWeight: '600',
  },
  verifyIconWrap: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
}

export default RegisterPage