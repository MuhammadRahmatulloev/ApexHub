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
  const [showPassword, setShowPassword] = useState(false)
  const [forgotStep, setForgotStep] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login/', data)
      login(res.data.user, res.data.access, res.data.refresh)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setForgotLoading(true)
    setForgotError('')
    try {
      await api.post('/auth/forgot-password/', { email: forgotEmail })
      setForgotSent(true)
    } catch (err) {
      setForgotError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!resetCode.trim() || !newPassword.trim()) return
    setResetLoading(true)
    setResetError('')
    try {
      await api.post('/auth/reset-password/', {
        email: forgotEmail,
        code: resetCode,
        new_password: newPassword,
      })
      setResetSuccess(true)
    } catch (err) {
      setResetError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setResetLoading(false)
    }
  }

  const resetForgotFlow = () => {
    setForgotStep(false)
    setForgotSent(false)
    setForgotEmail('')
    setForgotError('')
    setResetCode('')
    setNewPassword('')
    setResetError('')
    setResetSuccess(false)
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
        .forgot-link {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          transition: opacity 0.15s;
        }
        .forgot-link:hover {
          opacity: 0.75;
        }
        .back-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s;
          margin-bottom: 20px;
        }
        .back-link:hover {
          color: var(--text-primary);
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

        {!forgotStep ? (
          <>
            <div style={s.headGroup}>
              <h1 style={s.title}>Welcome back</h1>
              <p style={s.subtitle}>Sign in to your account</p>
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

            <form onSubmit={handleSubmit(onSubmit)} style={s.form}>
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
                <div style={s.labelRow}>
                  <label style={s.label}>Password</label>
                  <button type="button" className="forgot-link" onClick={() => { setForgotStep(true); setError('') }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    style={{ paddingRight: '44px' }}
                    {...register('password', { required: 'Required' })}
                  />
                  <button type="button" className="show-pass-btn" onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? (
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

              <button className="auth-btn" disabled={loading} style={{ marginTop: '4px' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p style={s.footerText}>
              No account?{' '}
              <Link to="/register" style={s.footerLink}>Create one</Link>
            </p>
          </>
        ) : (
          <div style={{ animation: 'fadeIn 0.25s ease both' }}>
            <button className="back-link" onClick={resetForgotFlow}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M10 7H4M7 4l-3 3 3 3"/>
              </svg>
              Back to login
            </button>

            {!forgotSent ? (
              <>
                <div style={s.headGroup}>
                  <h1 style={s.title}>Reset password</h1>
                  <p style={s.subtitle}>Enter your email and we'll send a reset code</p>
                </div>

                {forgotError && (
                  <div style={s.errorBox}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="7" r="6"/>
                      <path d="M7 4v3M7 10h.01"/>
                    </svg>
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleForgot} style={s.form}>
                  <div style={s.field}>
                    <label style={s.label}>Email</label>
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button className="auth-btn" disabled={forgotLoading} style={{ marginTop: '4px' }}>
                    {forgotLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
              </>
            ) : !resetSuccess ? (
              <div style={{ animation: 'fadeIn 0.25s ease both' }}>
                <div style={s.sentWrap}>
                  <div style={s.sentIcon}>
                    <svg width="28" height="28" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8l9 6 9-6"/>
                      <rect x="2" y="6" width="20" height="13" rx="2"/>
                    </svg>
                  </div>
                  <h2 style={s.sentTitle}>Check your email</h2>
                  <p style={s.sentDesc}>
                    We sent a reset code to <strong style={{ color: 'var(--text-primary)' }}>{forgotEmail}</strong>
                  </p>
                </div>

                {resetError && (
                  <div style={{ ...s.errorBox, marginTop: '16px' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="7" r="6"/>
                      <path d="M7 4v3M7 10h.01"/>
                    </svg>
                    {resetError}
                  </div>
                )}

                <form onSubmit={handleReset} style={{ ...s.form, marginTop: '20px' }}>
                  <div style={s.field}>
                    <label style={s.label}>Reset Code</label>
                    <input
                      className="auth-input"
                      placeholder="6-digit code"
                      maxLength={6}
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value)}
                      required
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>New Password</label>
                    <input
                      className="auth-input"
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button className="auth-btn" disabled={resetLoading} style={{ marginTop: '4px' }}>
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={s.sentWrap}>
                <div style={{ ...s.sentIcon, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <svg width="28" height="28" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 12l6 6 12-12"/>
                  </svg>
                </div>
                <h2 style={s.sentTitle}>Password reset!</h2>
                <p style={s.sentDesc}>Your password has been changed successfully.</p>
                <button className="auth-btn" style={{ marginTop: '8px' }} onClick={resetForgotFlow}>
                  Back to Sign In
                </button>
              </div>
            )}
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
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
    opacity: 0.6,
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
    opacity: 0.4,
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
    animation: 'fadeUp 0.4s ease both',
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
    marginBottom: '28px',
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
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sentWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center',
    paddingTop: '8px',
  },
  sentIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: 'rgba(52,211,153,0.1)',
    border: '1px solid rgba(52,211,153,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  sentTitle: {
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: '700',
  },
  sentDesc: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '4px',
  },
}

export default LoginPage