import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [becoming, setBecoming] = useState(false)
  const [message, setMessage] = useState('')

  const becomeSeller = async () => {
    setBecoming(true)
    try {
      const res = await api.post('/auth/become-seller/')
      setMessage(res.data.message)
      window.location.reload()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error')
    }
    setBecoming(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.avatar}>
            {user.avatar
              ? <img src={user.avatar} alt="" style={styles.avatarImg} />
              : <div style={styles.avatarPlaceholder}>{user.username[0].toUpperCase()}</div>
            }
          </div>

          <h1 style={styles.name}>{user.username}</h1>
          <p style={styles.email}>{user.email}</p>

          <div style={styles.badge}>{user.role}</div>

          <div style={styles.info}>
            {user.age && <div style={styles.infoRow}><span style={styles.infoLabel}>Age</span><span style={styles.infoVal}>{user.age}</span></div>}
            {user.phone && <div style={styles.infoRow}><span style={styles.infoLabel}>Phone</span><span style={styles.infoVal}>{user.phone}</span></div>}
            <div style={styles.infoRow}><span style={styles.infoLabel}>Verified</span><span style={styles.infoVal}>{user.is_verified ? 'Yes' : 'No'}</span></div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>Member since</span><span style={styles.infoVal}>{new Date(user.created_at).toLocaleDateString()}</span></div>
          </div>

          {message && <div style={styles.message}>{message}</div>}

          {user.role === 'CLIENT' && (
            <button style={becoming ? styles.sellerBtnDisabled : styles.sellerBtn} onClick={becomeSeller} disabled={becoming}>
              {becoming ? 'Processing...' : 'Become a Seller'}
            </button>
          )}

          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </Layout>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center' },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '480px', textAlign: 'center' },
  avatar: { marginBottom: '20px' },
  avatarImg: { width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '96px', height: '96px', borderRadius: '50%', background: '#e53e3e', color: '#fff', fontSize: '36px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  name: { color: '#fff', fontSize: '24px', fontWeight: '700', marginBottom: '6px' },
  email: { color: '#888', fontSize: '14px', marginBottom: '16px' },
  badge: { display: 'inline-block', background: '#2a2a2a', color: '#e53e3e', border: '1px solid #e53e3e', borderRadius: '20px', padding: '4px 16px', fontSize: '12px', fontWeight: '600', marginBottom: '24px' },
  info: { background: '#2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #3a3a3a' },
  infoLabel: { color: '#888', fontSize: '14px' },
  infoVal: { color: '#fff', fontSize: '14px', fontWeight: '500' },
  message: { background: '#1a2d1a', border: '1px solid #4caf50', color: '#4caf50', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '14px' },
  sellerBtn: { background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', width: '100%', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' },
  sellerBtnDisabled: { background: '#555', color: '#888', border: 'none', borderRadius: '8px', padding: '12px 24px', width: '100%', fontSize: '15px', cursor: 'not-allowed', marginBottom: '12px' },
  logoutBtn: { background: 'transparent', border: '1px solid #3a3a3a', color: '#888', borderRadius: '8px', padding: '10px 24px', width: '100%', fontSize: '14px', cursor: 'pointer' },
}

export default ProfilePage