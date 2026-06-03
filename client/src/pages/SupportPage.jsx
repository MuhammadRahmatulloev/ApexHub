import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'

const SupportPage = () => {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError(t('support.errorFill'))
      return
    }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .sup-input {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 11px 14px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .sup-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .sup-input::placeholder { color: var(--text-secondary); }
        .sup-textarea {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 11px 14px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          min-height: 130px;
        }
        .sup-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .sup-textarea::placeholder { color: var(--text-secondary); }
        .sup-submit-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 12px 28px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.2px;
        }
        .sup-submit-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-btn);
        }
        .sup-submit-btn:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
        }
      `}</style>

      <div style={s.page}>
        {!sent ? (
          <>
            <div style={s.header}>
              <div style={s.headerIcon}>
                <svg width="28" height="28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <circle cx="12" cy="17" r=".5" fill="var(--accent)"/>
                </svg>
              </div>
              <div>
                <h1 style={s.title}>{t('support.title')}</h1>
                <p style={s.sub}>{t('support.subtitle')}</p>
              </div>
            </div>

            <div style={s.grid}>
              <div style={s.formCard}>
                {error && (
                  <div style={s.errorBox}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="7" r="6"/>
                      <path d="M7 4v3M7 10h.01"/>
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={s.form}>
                  <div style={s.row2}>
                    <div style={s.field}>
                      <label style={s.label}>{t('support.name')} *</label>
                      <input className="sup-input" name="name" placeholder={t('support.namePlaceholder')} value={form.name} onChange={handleChange} />
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>{t('support.email')} *</label>
                      <input className="sup-input" name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} />
                    </div>
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>{t('support.subject')}</label>
                    <input className="sup-input" name="subject" placeholder={t('support.subjectPlaceholder')} value={form.subject} onChange={handleChange} />
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>{t('support.message')} *</label>
                    <textarea className="sup-textarea" name="message" placeholder={t('support.messagePlaceholder')} value={form.message} onChange={handleChange} />
                  </div>

                  <div style={s.formFooter}>
                    <p style={s.formNote}>{t('support.note')}</p>
                    <button type="submit" className="sup-submit-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                          {t('support.sending')}
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13"/>
                            <path d="M22 2L15 22l-4-9-9-4 20-7z"/>
                          </svg>
                          {t('support.send')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div style={s.infoCol}>
                {[
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M3 8l9 6 9-6"/>
                        <rect x="2" y="6" width="20" height="13" rx="2"/>
                      </svg>
                    ),
                    title: t('support.infoEmail'),
                    value: 'support@apexhub.com',
                  },
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    ),
                    title: t('support.infoResponse'),
                    value: t('support.infoResponseVal'),
                  },
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    ),
                    title: 'Telegram',
                    value: '@apexhub_support',
                  },
                ].map((item, i) => (
                  <div key={i} style={s.infoCard}>
                    <div style={s.infoIcon}>{item.icon}</div>
                    <div>
                      <p style={s.infoTitle}>{item.title}</p>
                      <p style={s.infoValue}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={s.successWrap}>
            <div style={s.successCard}>
              <div style={s.successIconWrap}>
                <svg width="36" height="36" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <path d="M22 4L12 14.01l-3-3"/>
                </svg>
              </div>
              <h2 style={s.successTitle}>{t('support.successTitle')}</h2>
              <p style={s.successDesc}>{t('support.successDesc')}</p>
              <div style={s.successEmail}>
                <svg width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 8l9 6 9-6"/>
                  <rect x="2" y="6" width="20" height="13" rx="2"/>
                </svg>
                {form.email}
              </div>
              <button style={s.successBtn} onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                {t('support.sendAnother')}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  page: {
    maxWidth: '900px',
    margin: '0 auto',
    animation: 'fadeUp 0.35s ease both',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  headerIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  sub: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: '20px',
    alignItems: 'start',
  },
  formCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '28px',
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
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '500',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '4px',
  },
  formNote: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    lineHeight: '1.5',
    flex: 1,
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  infoCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  infoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoTitle: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '3px',
  },
  infoValue: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '500',
  },
  successWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  successCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '48px 40px',
    textAlign: 'center',
    maxWidth: '440px',
    width: '100%',
    animation: 'successPop 0.4s ease both',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
  },
  successIconWrap: {
    width: '72px',
    height: '72px',
    borderRadius: '18px',
    background: 'rgba(52,211,153,0.1)',
    border: '1px solid rgba(52,211,153,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  successTitle: {
    color: 'var(--text-primary)',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
  },
  successDesc: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  successEmail: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 16px',
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: '600',
  },
  successBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, color 0.15s',
    marginTop: '4px',
  },
}

export default SupportPage