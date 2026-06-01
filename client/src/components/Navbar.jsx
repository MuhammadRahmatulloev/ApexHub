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

  const clientLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/builds', label: 'Builds' },
    { to: '/chat', label: 'AI Chat' },
    { to: '/favorites', label: 'Favorites' },
    { to: '/cart', label: 'Cart' },
    { to: '/orders', label: 'Orders' },
    { to: '/news', label: 'News' },
    { to: '/locations', label: 'Locations' },
  ]

  const sellerLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/seller', label: 'My Shop' },
    { to: '/news', label: 'News' },
    { to: '/locations', label: 'Locations' },
  ]

  const adminLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/seller', label: 'My Shop' },
    { to: '/news', label: 'News' },
    { to: '/admin/news', label: 'Manage News' },
    { to: '/locations', label: 'Locations' },
  ]

  const guestLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/news', label: 'News' },
    { to: '/locations', label: 'Locations' },
  ]

  const getLinks = () => {
    if (!user) return guestLinks
    if (user.role === 'ADMIN') return adminLinks
    if (user.role === 'SELLER') return sellerLinks
    return clientLinks
  }

  return (
    <>
      <style>{`
        .nav-link {
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 7px;
          transition: color 0.15s, background 0.15s;
          position: relative;
          white-space: nowrap;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .nav-link:hover { color: var(--accent); background: var(--accent-dim); }
        .nav-link-active {
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 7px;
          background: var(--accent-dim);
          position: relative;
          white-space: nowrap;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .nav-bar {
          display: block;
          width: 16px;
          height: 2px;
          border-radius: 2px;
          background: var(--accent);
          margin: 3px auto 0;
        }
        .nav-theme-btn {
          background: var(--bg-hover);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .nav-theme-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .nav-profile-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--bg-hover);
          border: 1.5px solid var(--border);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.15s, background 0.15s;
          text-decoration: none;
        }
        .nav-profile-btn:hover { border-color: var(--accent); background: var(--accent-dim); }
        .nav-logout-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 8px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .nav-logout-btn:hover { border-color: var(--danger); color: var(--danger); }
        .nav-register-btn {
          background: var(--accent);
          color: #fff;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          text-decoration: none;
        }
        .nav-register-btn:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-btn); }
        .nav-login-link {
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 7px;
          transition: color 0.15s, background 0.15s;
          text-decoration: none;
        }
        .nav-login-link:hover { color: var(--accent); background: var(--accent-dim); }
      `}</style>

      <nav style={s.nav}>
        <div style={s.inner}>
          <Link to="/" style={s.logo}>
            <span style={s.logoApex}>Apex</span>
            <span style={s.logoHub}>Hub</span>
          </Link>

          <div style={s.links}>
            {getLinks().map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={isActive(to) ? 'nav-link-active' : 'nav-link'}
              >
                {label}
                {isActive(to) && <span className="nav-bar" />}
              </Link>
            ))}
          </div>

          <div style={s.right}>
            <button onClick={toggleTheme} className="nav-theme-btn" title="Toggle theme">
              {theme === 'dark' ? (
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="7.5" cy="7.5" r="3"/>
                  <path d="M7.5 1v1.5M7.5 13v1.5M1 7.5h1.5M13 7.5h1.5M3.2 3.2l1 1M11.8 11.8l1 1M11.8 3.2l-1 1M3.2 11.8l-1 1"/>
                </svg>
              ) : (
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M13 9.5A6 6 0 0 1 5.5 2a6.5 6.5 0 1 0 7.5 7.5z"/>
                </svg>
              )}
            </button>

            {user ? (
              <>
                <Link to="/profile" className="nav-profile-btn" title={user.username}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="5.5" r="2.8"/>
                    <path d="M1.5 14c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/>
                  </svg>
                </Link>
                <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-login-link">Login</Link>
                <Link to="/register" className="nav-register-btn">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
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
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  logo: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  logoApex: { color: 'var(--accent)' },
  logoHub: { color: 'var(--text-primary)' },
  links: {
    display: 'flex',
    gap: '2px',
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
}

export default Navbar