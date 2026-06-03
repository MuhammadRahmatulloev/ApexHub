import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [tab, setTab] = useState('info')
  const [becoming, setBecoming] = useState(false)
  const [becomeMsg, setBecomeMsg] = useState('')
  const [becomeErr, setBecomeErr] = useState('')

  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ username: user?.username || '', phone: user?.phone || '', age: user?.age || '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editMsg, setEditMsg] = useState('')
  const [editErr, setEditErr] = useState('')

  const [avatarLoading, setAvatarLoading] = useState(false)
  const avatarRef = useRef(null)

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const becomeSeller = async () => {
    setBecoming(true)
    setBecomeMsg('')
    setBecomeErr('')
    try {
      const res = await api.post('/auth/become-seller/')
      setBecomeMsg(res.data.message)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setBecomeErr(err.response?.data?.error || t('common.error'))
    }
    setBecoming(false)
  }

  const handleEditSave = async () => {
    setEditLoading(true)
    setEditMsg('')
    setEditErr('')
    try {
      await api.patch('/auth/profile/', {
        username: editForm.username,
        phone: editForm.phone || null,
        age: editForm.age ? parseInt(editForm.age) : null,
      })
      setEditMsg(t('profile.success'))
      setEditMode(false)
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      const d = err.response?.data
      setEditErr(d ? Object.values(d)[0]?.[0] || t('common.error') : t('common.error'))
    }
    setEditLoading(false)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      await api.patch('/auth/profile/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      window.location.reload()
    } catch {}
    setAvatarLoading(false)
  }

  const handlePwChange = async () => {
    setPwMsg('')
    setPwErr('')
    if (!pwForm.old_password || !pwForm.new_password || !pwForm.confirm) {
      setPwErr(t('profile.errors.fillAll'))
      return
    }
    if (pwForm.new_password !== pwForm.confirm) {
      setPwErr(t('profile.errors.passwordMismatch'))
      return
    }
    if (pwForm.new_password.length < 8) {
      setPwErr(t('profile.errors.minLength'))
      return
    }
    setPwLoading(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      })
      setPwMsg(t('profile.passwordChanged'))
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      const d = err.response?.data
      setPwErr(d?.error || d?.old_password?.[0] || t('profile.errors.wrongPassword'))
    }
    setPwLoading(false)
  }

  if (!user) return null

  const initials = user.username?.[0]?.toUpperCase() || '?'

  const roleBadgeColor = {
    CLIENT: { bg: 'rgba(79,142,247,0.12)', color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.3)' },
    SELLER: { bg: 'rgba(52,211,153,0.12)', color: 'var(--success)', border: '1px solid rgba(52,211,153,0.3)' },
    ADMIN: { bg: 'rgba(251,191,36,0.12)', color: 'var(--warning)', border: '1px solid rgba(251,191,36,0.3)' },
  }[user.role] || {}

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .profile-tab {
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: none;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          font-family: inherit;
          white-space: nowrap;
        }
        .profile-tab:hover { color: var(--text-primary); }
        .profile-tab-active {
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: default;
          border: none;
          background: none;
          color: var(--accent);
          border-bottom: 2px solid var(--accent);
          font-family: inherit;
          white-space: nowrap;
        }
        .profile-input {
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
        .profile-input:focus { border-color: var(--accent); }
        .profile-input::placeholder { color: var(--text-secondary); }
        .profile-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pw-input-wrap {
          position: relative;
        }
        .pw-toggle {
          position: absolute;
          right: 12px;
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
        .pw-toggle:hover { color: var(--text-primary); }
        .save-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .save-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-btn);
        }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cancel-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .cancel-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
        .danger-btn {
          background: transparent;
          border: 1px solid rgba(248,113,113,0.3);
          color: var(--danger);
          border-radius: 8px;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, background 0.15s;
          width: 100%;
        }
        .danger-btn:hover { border-color: var(--danger); background: rgba(248,113,113,0.06); }
        .seller-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          width: 100%;
        }
        .seller-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-btn);
        }
        .seller-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .avatar-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          cursor: pointer;
        }
        .avatar-wrap:hover .avatar-overlay { opacity: 1; }
      `}</style>

      <div style={s.page}>
        <div style={s.leftCol}>
          <div style={s.card}>
            <div style={s.avatarSection}>
              <div className="avatar-wrap" style={s.avatarWrap} onClick={() => !avatarLoading && avatarRef.current?.click()}>
                {user.avatar
                  ? <img src={user.avatar} alt="" style={s.avatarImg} />
                  : <div style={s.avatarPlaceholder}>{initials}</div>
                }
                <div className="avatar-overlay">
                  {avatarLoading
                    ? <div style={s.spinner} />
                    : (
                      <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M3 17h14M8 13l3-9 3 9M5 8h10"/>
                        <circle cx="15" cy="5" r="2"/>
                      </svg>
                    )
                  }
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <p style={s.avatarHint}>{t('profile.avatarHint')}</p>
            </div>

            <h2 style={s.userName}>{user.username}</h2>
            <p style={s.userEmail}>{user.email}</p>

            <div style={{ ...s.roleBadge, ...roleBadgeColor }}>{user.role}</div>

            <div style={s.statsRow}>
              <div style={s.statItem}>
                <span style={s.statNum}>{user.is_verified ? '✓' : '✗'}</span>
                <span style={s.statLabel}>{t('profile.verified')}</span>
              </div>
              <div style={s.statDivider} />
              <div style={s.statItem}>
                <span style={s.statNum}>{user.age || '—'}</span>
                <span style={s.statLabel}>{t('profile.age')}</span>
              </div>
              <div style={s.statDivider} />
              <div style={s.statItem}>
                <span style={s.statNum}>{new Date(user.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                <span style={s.statLabel}>{t('profile.memberSince')}</span>
              </div>
            </div>

            <div style={s.sideActions}>
              {user.role === 'CLIENT' && (
                <div>
                  {becomeMsg && <div style={s.successBox}>{becomeMsg}</div>}
                  {becomeErr && <div style={s.errorBox}>{becomeErr}</div>}
                  <button className="seller-btn" onClick={becomeSeller} disabled={becoming}>
                    {becoming ? t('profile.processing') : t('profile.becomeSeller')}
                  </button>
                </div>
              )}
              <button className="danger-btn" onClick={handleLogout}>{t('nav.logout')}</button>
            </div>
          </div>
        </div>

        <div style={s.rightCol}>
          <div style={s.tabsCard}>
            <div style={s.tabsBar}>
              <button className={tab === 'info' ? 'profile-tab-active' : 'profile-tab'} onClick={() => setTab('info')}>
                {t('profile.personalInfo')}
              </button>
              <button className={tab === 'security' ? 'profile-tab-active' : 'profile-tab'} onClick={() => setTab('security')}>
                {t('profile.security')}
              </button>
            </div>

            <div style={s.tabContent}>
              {tab === 'info' && (
                <div style={{ animation: 'fadeUp 0.3s ease both' }}>
                  <div style={s.sectionHeader}>
                    <div>
                      <p style={s.sectionTitle}>{t('profile.personalInfo')}</p>
                      <p style={s.sectionSub}>{t('profile.personalInfoSub')}</p>
                    </div>
                    {!editMode && (
                      <button
                        style={s.editBtn}
                        onClick={() => { setEditMode(true); setEditForm({ username: user.username || '', phone: user.phone || '', age: user.age || '' }) }}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M9 2l2 2-7 7H2v-2z"/>
                        </svg>
                        {t('profile.edit')}
                      </button>
                    )}
                  </div>

                  {editMsg && <div style={{ ...s.successBox, marginBottom: '16px' }}>{editMsg}</div>}
                  {editErr && <div style={{ ...s.errorBox, marginBottom: '16px' }}>{editErr}</div>}

                  <div style={s.fieldsGrid}>
                    <div style={s.fieldGroup}>
                      <label style={s.fieldLabel}>{t('profile.username')}</label>
                      {editMode
                        ? <input className="profile-input" value={editForm.username} onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))} />
                        : <div style={s.fieldValue}>{user.username || '—'}</div>
                      }
                    </div>

                    <div style={s.fieldGroup}>
                      <label style={s.fieldLabel}>{t('profile.email')}</label>
                      <div style={{ ...s.fieldValue, color: 'var(--text-secondary)' }}>{user.email}</div>
                    </div>

                    <div style={s.fieldGroup}>
                      <label style={s.fieldLabel}>{t('profile.phone')}</label>
                      {editMode
                        ? <input className="profile-input" placeholder="+992..." value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                        : <div style={s.fieldValue}>{user.phone || '—'}</div>
                      }
                    </div>

                    <div style={s.fieldGroup}>
                      <label style={s.fieldLabel}>{t('profile.age')}</label>
                      {editMode
                        ? <input className="profile-input" type="number" min="13" placeholder="18" value={editForm.age} onChange={e => setEditForm(p => ({ ...p, age: e.target.value }))} />
                        : <div style={s.fieldValue}>{user.age || '—'}</div>
                      }
                    </div>

                    <div style={s.fieldGroup}>
                      <label style={s.fieldLabel}>{t('profile.role')}</label>
                      <div style={s.fieldValue}>{user.role}</div>
                    </div>

                    <div style={s.fieldGroup}>
                      <label style={s.fieldLabel}>{t('profile.memberSince')}</label>
                      <div style={s.fieldValue}>{new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {editMode && (
                    <div style={s.editActions}>
                      <button className="cancel-btn" onClick={() => { setEditMode(false); setEditErr('') }}>{t('profile.cancel')}</button>
                      <button className="save-btn" onClick={handleEditSave} disabled={editLoading}>
                        {editLoading ? t('profile.saving') : t('profile.save')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {tab === 'security' && (
                <div style={{ animation: 'fadeUp 0.3s ease both' }}>
                  <div style={s.sectionHeader}>
                    <div>
                      <p style={s.sectionTitle}>{t('profile.changePassword')}</p>
                      <p style={s.sectionSub}>{t('profile.changePasswordSub')}</p>
                    </div>
                  </div>

                  {pwMsg && <div style={{ ...s.successBox, marginBottom: '20px' }}>{pwMsg}</div>}
                  {pwErr && <div style={{ ...s.errorBox, marginBottom: '20px' }}>{pwErr}</div>}

                  <div style={s.pwFields}>
                    <div style={s.fieldGroup}>
                      <label style={s.fieldLabel}>{t('profile.currentPassword')}</label>
                      <div className="pw-input-wrap">
                        <input
                          className="profile-input"
                          type={showOld ? 'text' : 'password'}
                          placeholder={t('profile.currentPasswordPlaceholder')}
                          style={{ paddingRight: '42px' }}
                          value={pwForm.old_password}
                          onChange={e => setPwForm(p => ({ ...p, old_password: e.target.value }))}
                        />
                        <button className="pw-toggle" onClick={() => setShowOld(v => !v)}>
                          <EyeIcon open={showOld} />
                        </button>
                      </div>
                    </div>

                    <div style={s.fieldGroup}>
                      <label style={s.fieldLabel}>{t('profile.newPassword')}</label>
                      <div className="pw-input-wrap">
                        <input
                          className="profile-input"
                          type={showNew ? 'text' : 'password'}
                          placeholder={t('profile.newPasswordPlaceholder')}
                          style={{ paddingRight: '42px' }}
                          value={pwForm.new_password}
                          onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                        />
                        <button className="pw-toggle" onClick={() => setShowNew(v => !v)}>
                          <EyeIcon open={showNew} />
                        </button>
                      </div>
                    </div>

                    <div style={s.fieldGroup}>
                      <label style={s.fieldLabel}>{t('profile.confirmPassword')}</label>
                      <div className="pw-input-wrap">
                        <input
                          className="profile-input"
                          type={showConfirm ? 'text' : 'password'}
                          placeholder={t('profile.confirmPasswordPlaceholder')}
                          style={{ paddingRight: '42px' }}
                          value={pwForm.confirm}
                          onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                        />
                        <button className="pw-toggle" onClick={() => setShowConfirm(v => !v)}>
                          <EyeIcon open={showConfirm} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <button className="save-btn" onClick={handlePwChange} disabled={pwLoading}>
                      {pwLoading ? t('profile.changing') : t('profile.changePasswordBtn')}
                    </button>
                  </div>

                  <div style={s.securityDivider} />

                  <div style={s.dangerZone}>
                    <p style={s.dangerTitle}>{t('profile.dangerZone')}</p>
                    <p style={s.dangerDesc}>{t('profile.dangerDesc')}</p>
                    <button className="danger-btn" style={{ marginTop: '12px' }} onClick={handleLogout}>
                      {t('profile.signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const EyeIcon = ({ open }) => open ? (
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
)

const s = {
  page: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '24px',
    alignItems: 'start',
    animation: 'fadeUp 0.35s ease both',
  },
  leftCol: {},
  rightCol: {},
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  avatarWrap: {
    position: 'relative',
    width: '88px',
    height: '88px',
    cursor: 'pointer',
  },
  avatarImg: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--border)',
  },
  avatarPlaceholder: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '32px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--border)',
  },
  avatarHint: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    textAlign: 'center',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  userName: {
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: '-0.2px',
  },
  userEmail: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '-8px',
  },
  roleBadge: {
    alignSelf: 'center',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '14px 0',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
  },
  statNum: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '700',
  },
  statLabel: {
    color: 'var(--text-muted)',
    fontSize: '10px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  statDivider: {
    width: '1px',
    height: '28px',
    background: 'var(--border)',
  },
  sideActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tabsCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  tabsBar: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    padding: '0 4px',
    background: 'var(--bg-secondary)',
  },
  tabContent: {
    padding: '28px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  sectionTitle: {
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '3px',
  },
  sectionSub: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: '7px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, color 0.15s',
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  fieldLabel: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  fieldValue: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '500',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
  editActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '24px',
  },
  pwFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  securityDivider: {
    height: '1px',
    background: 'var(--border)',
    margin: '28px 0',
  },
  dangerZone: {
    background: 'rgba(248,113,113,0.04)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: '10px',
    padding: '18px',
  },
  dangerTitle: {
    color: 'var(--danger)',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '6px',
    letterSpacing: '0.2px',
  },
  dangerDesc: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    lineHeight: '1.5',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(52,211,153,0.08)',
    border: '1px solid rgba(52,211,153,0.25)',
    color: 'var(--success)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
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
    fontSize: '13px',
  },
}

export default ProfilePage