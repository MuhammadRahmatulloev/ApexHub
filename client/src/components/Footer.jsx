import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const socials = [
    {
      label: 'Telegram',
      href: 'https://t.me/+ygk-7MbCFpozNzky',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/rhmtllvm_',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: 'https://facebook.com/',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      label: 'GitHub',
      href: 'https://github.com/MuhammadRahmatulloev',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      ),
    },
    {
      label: 'Gmail',
      href: 'mailto:support@apexhub.com',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
        </svg>
      ),
    },
  ]

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/products', label: t('nav.products') },
    { to: '/builds', label: t('nav.builds') },
    { to: '/chat', label: t('nav.chat') },
    { to: '/news', label: t('nav.news') },
    { to: '/locations', label: t('nav.locations') },
  ]

  return (
    <>
      <style>{`
        .footer-social-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          transition: color 0.18s, border-color 0.18s, background 0.18s, transform 0.18s;
          cursor: pointer;
          text-decoration: none;
        }
        .footer-social-btn:hover {
          color: var(--accent);
          border-color: var(--accent);
          background: var(--accent-dim);
          transform: translateY(-2px);
        }
        .footer-nav-link {
          color: var(--text-secondary);
          font-size: 13px;
          text-decoration: none;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .footer-nav-link:hover {
          color: var(--accent);
        }
        .footer-support-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.2px;
        }
        .footer-support-btn:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-btn);
        }
      `}</style>

      <footer style={s.footer}>
        <div style={s.topGlow} />

        <div style={s.inner}>
          <div style={s.mainRow}>
            <div style={s.brand}>
              <div style={s.logoRow}>
                <div style={s.logoIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M8 21h8M12 17v4"/>
                    <path d="M7 8h2M11 8h6M7 11h4M15 11h2"/>
                  </svg>
                </div>
                <span style={s.logoText}>
                  <span style={s.logoApex}>Apex</span>
                  <span style={s.logoHub}>Hub</span>
                </span>
              </div>
              <p style={s.brandDesc}>{t('footer.desc')}</p>
              <div style={s.socialsRow}>
                {socials.map(s2 => (
                  <a key={s2.label} href={s2.href} target="_blank" rel="noreferrer" className="footer-social-btn" title={s2.label}>
                    {s2.icon}
                  </a>
                ))}
              </div>
            </div>

            <div style={s.linksCol}>
              <p style={s.colTitle}>{t('footer.navigation')}</p>
              <div style={s.linksList}>
                {navLinks.map(l => (
                  <Link key={l.to} to={l.to} className="footer-nav-link">{l.label}</Link>
                ))}
              </div>
            </div>

            <div style={s.linksCol}>
              <p style={s.colTitle}>{t('footer.company')}</p>
              <div style={s.linksList}>
                <Link to="/news" className="footer-nav-link">{t('nav.news')}</Link>
                <Link to="/locations" className="footer-nav-link">{t('nav.locations')}</Link>
                <a href="mailto:support@apexhub.com" className="footer-nav-link">support@apexhub.com</a>
              </div>
            </div>

            <div style={s.supportCol}>
              <p style={s.colTitle}>{t('footer.help')}</p>
              <p style={s.supportDesc}>{t('footer.supportDesc')}</p>
              <Link to="/support" className="footer-support-btn">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="7" r="6"/>
                  <path d="M5.5 5.5a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.5-1.5 2.5"/>
                  <circle cx="7" cy="11" r=".5" fill="currentColor"/>
                </svg>
                {t('footer.support')}
              </Link>
            </div>
          </div>

          <div style={s.divider} />

          <div style={s.bottomRow}>
            <p style={s.copyright}>
              © {year} ApexHub. {t('footer.rights')}
            </p>
            <div style={s.bottomBadge}>
              <span style={s.badgeDot} />
              <span style={s.badgeText}>{t('footer.status')}</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

const s = {
  footer: {
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border)',
    marginTop: '60px',
    position: 'relative',
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
    opacity: 0.6,
  },
  inner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '48px 24px 28px',
  },
  mainRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.4fr',
    gap: '40px',
    marginBottom: '40px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
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
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  logoApex: {
    color: 'var(--accent)',
  },
  logoHub: {
    color: 'var(--text-primary)',
  },
  brandDesc: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.6',
    maxWidth: '240px',
  },
  socialsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  linksCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  colTitle: {
    color: 'var(--text-primary)',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  linksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  supportCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  supportDesc: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.6',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    marginBottom: '20px',
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  copyright: {
    color: 'var(--text-muted)',
    fontSize: '12px',
  },
  bottomBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '4px 12px',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--success)',
    display: 'inline-block',
    boxShadow: '0 0 6px var(--success)',
  },
  badgeText: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '500',
  },
}

export default Footer