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

  const navLinks = [
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
  ]

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <Link to="/" style={s.logo}>
          <span style={s.logoApex}>Apex</span>
          <span style={s.logoHub}>Hub</span>
        </Link>

        <div style={s.links}>
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={isActive(to) ? s.linkActive : s.link}>
              {label}
              {isActive(to) && <span style={s.linkDot} />}
            </Link>
          ))}
        </div>

        <div style={s.right}>
          <button onClick={toggleTheme} style={s.themeBtn} title="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {user ? (
            <>
              <Link to="/profile" style={s.userChip}>
                <span style={s.userAvatar}>{user.username?.[0]?.toUpperCase()}</span>
                {user.username}
              </Link>
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
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  logoApex: { color: 'var(--accent)' },
  logoHub: { color: 'var(--text-primary)' },
  links: { display: 'flex', gap: '2px', flex: 1, justifyContent: 'center' },
  link: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '500',
    padding: '6px 12px',
    borderRadius: '8px',
    transition: 'color 0.15s, background 0.15s',
    position: 'relative',
  },
  linkActive: {
    color: 'var(--accent)',
    fontSize: '14px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'var(--accent-dim)',
    position: 'relative',
  },
  linkDot: {
    display: 'block',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: 'var(--accent)',
    margin: '3px auto 0',
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
    transition: 'background 0.15s, border-color 0.15s',
  },
  userChip: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '5px 12px 5px 6px',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  userAvatar: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '13px',
    transition: 'border-color 0.15s, color 0.15s',
  },
  registerBtn: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '8px',
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background 0.15s',
  },
}

export default Navbar