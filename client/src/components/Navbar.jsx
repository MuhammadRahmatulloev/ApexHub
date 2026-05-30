import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <Link to="/" style={s.logo}>ApexHub</Link>

        <div style={s.links}>
          {[
          { to: '/', label: 'Home' },
          { to: '/products', label: 'Products' },
          ...(user ? [
            { to: '/builds', label: 'Builds' },
            { to: '/chat', label: 'AI Chat' },
            { to: '/cart', label: 'Cart' },
            { to: '/orders', label: 'Orders' },
          ] : []),
          ...(user?.role === 'SELLER' ? [
            { to: '/seller', label: 'My Products' },
          ] : []),
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={isActive(to) ? s.linkActive : s.link}>
              {label}
            </Link>
          ))}
        </div>

        <div style={s.right}>
          <button onClick={toggleTheme} style={s.themeBtn} title="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {user ? (
            <>
              <Link to="/profile" style={s.userChip}>{user.username}</Link>
              <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={s.link}>Login</Link>
              <Link to="/register" style={s.registerBtn}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const s = {
  nav: {
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow)',
  },
  inner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },
  logo: {
    color: 'var(--accent)',
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    flexShrink: 0,
  },
  links: { display: 'flex', gap: '4px', flex: 1, justifyContent: 'center' },
  link: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '500',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'color 0.15s, background 0.15s',
  },
  linkActive: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '6px',
    background: 'var(--bg-hover)',
  },
  right: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  themeBtn: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: '8px',
    width: '34px',
    height: '34px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userChip: {
    background: 'var(--bg-hover)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '13px',
  },
  registerBtn: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '8px',
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: '600',
  },
}

export default Navbar