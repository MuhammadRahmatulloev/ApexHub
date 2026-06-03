import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'

const ProductCard = ({ p }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={`/products/${p.id}`}
      style={{
        ...s.card,
        borderColor: hovered ? 'var(--accent)' : 'var(--border)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-card)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.cardImg}>
        {p.main_image
          ? <img src={p.main_image} alt={p.name} style={s.img} />
          : (
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="var(--border-hover)" strokeWidth="1.2" strokeLinecap="round">
              <rect x="2" y="4" width="32" height="22" rx="3"/>
              <path d="M11 30h14M18 26v4"/>
            </svg>
          )
        }
      </div>
      <div style={s.cardBody}>
        <span style={s.cardBadge}>{p.product_type}</span>
        <p style={s.cardName}>{p.name}</p>
        <div style={s.cardBottom}>
          <span style={s.cardPrice}>${p.price}</span>
          {p.average_rating > 0 && (
            <span style={s.cardRating}>{'★'.repeat(Math.round(p.average_rating))}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

const FeatCard = ({ f }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        ...s.feat,
        borderColor: hovered ? 'var(--accent)' : 'var(--border)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...s.featIcon, color: hovered ? 'var(--accent)' : 'var(--text-muted)' }}>
        {f.icon}
      </div>
      <p style={s.featTitle}>{f.title}</p>
      <p style={s.featDesc}>{f.desc}</p>
    </div>
  )
}

const CHIPS = [
  {
    key: 'cpu',
    label: 'CPU',
    style: { top: '14%', left: '8%', animationDelay: '0s', animationDuration: '3.5s' },
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round">
        <rect x="4" y="4" width="14" height="14" rx="2"/>
        <rect x="7" y="7" width="8" height="8" rx="1"/>
        <path d="M8 1v3M14 1v3M8 18v3M14 18v3M1 8h3M1 14h3M18 8h3M18 14h3"/>
      </svg>
    ),
  },
  {
    key: 'gpu',
    label: 'GPU',
    style: { bottom: '14%', right: '8%', animationDelay: '0.9s', animationDuration: '4.2s' },
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round">
        <rect x="2" y="6" width="18" height="10" rx="2"/>
        <circle cx="8" cy="11" r="2.2"/>
        <circle cx="15" cy="11" r="2.2"/>
        <path d="M6 3v3M10 3v3M14 3v3M18 3v3"/>
      </svg>
    ),
  },
  {
    key: 'ram',
    label: 'RAM',
    style: { top: '14%', right: '12%', animationDelay: '1.6s', animationDuration: '3.9s' },
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round">
        <rect x="2" y="5" width="16" height="10" rx="1.5"/>
        <path d="M5 8v4M8 8v4M11 8v4M14 8v4"/>
        <path d="M5 2v3M8 2v3M11 2v3M14 2v3"/>
      </svg>
    ),
  },
  {
    key: 'ssd',
    label: 'SSD',
    style: { bottom: '18%', left: '12%', animationDelay: '0.4s', animationDuration: '4.6s' },
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round">
        <rect x="2" y="4" width="16" height="12" rx="2"/>
        <circle cx="14" cy="10" r="2.2"/>
        <path d="M5 7h5M5 10h4M5 13h5"/>
      </svg>
    ),
  },
]

const HomePage = () => {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  const FEATURES = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10l4 4 8-8"/>
          <rect x="1" y="1" width="18" height="18" rx="4"/>
        </svg>
      ),
      title: t('home.features.delivery'),
      desc: t('home.features.deliveryDesc'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 18s8-4 8-10V4l-8-3-8 3v4c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: t('home.features.warranty'),
      desc: t('home.features.warrantyDesc'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="2" width="18" height="14" rx="2"/>
          <path d="M7 19h6M10 16v3"/>
        </svg>
      ),
      title: t('home.features.ai'),
      desc: t('home.features.aiDesc'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="18" height="13" rx="2"/>
          <path d="M1 9h18"/>
        </svg>
      ),
      title: t('home.features.payment'),
      desc: t('home.features.paymentDesc'),
    },
  ]

  useEffect(() => {
    api.get('/products/top_rated/')
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 22 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 0.45,
      dy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.6 + 0.5,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
      const accent = isDark ? '79,142,247' : '35,96,212'

      nodes.forEach(n => {
        n.x += n.dx
        n.y += n.dy
        if (n.x < 0 || n.x > canvas.width) n.dx *= -1
        if (n.y < 0 || n.y > canvas.height) n.dy *= -1
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${accent},0.45)`
        ctx.fill()
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 130) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(${accent},${(1 - d / 130) * 0.18})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatMain {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        @keyframes floatChip {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes spinRing {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spinRingR {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.18); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        .hero-eyebrow { opacity: 0; animation: fadeUp 0.5s 0.05s ease forwards; }
        .hero-title { opacity: 0; animation: fadeUp 0.5s 0.15s ease forwards; }
        .hero-sub { opacity: 0; animation: fadeUp 0.5s 0.25s ease forwards; }
        .hero-btns { opacity: 0; animation: fadeUp 0.5s 0.35s ease forwards; }
        .hero-stats { opacity: 0; animation: fadeUp 0.5s 0.45s ease forwards; }
        .orbit-chip {
          position: absolute;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          animation: floatChip ease-in-out infinite;
        }
        .orbit-chip-inner { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .orbit-chip-label { font-size: 9px; font-weight: 700; color: var(--accent); letter-spacing: 0.5px; }
        .btn-primary-hero {
          background: var(--accent); color: #fff; border: none;
          border-radius: 8px; padding: 11px 22px; font-size: 13px;
          font-weight: 700; cursor: pointer; letter-spacing: 0.2px;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          display: inline-block; text-decoration: none;
        }
        .btn-primary-hero:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: var(--shadow-btn); }
        .btn-ghost-hero {
          background: transparent; color: var(--accent);
          border: 1.5px solid var(--border); border-radius: 8px;
          padding: 11px 22px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: border-color 0.15s, background 0.15s, transform 0.15s;
          display: inline-block; text-decoration: none;
        }
        .btn-ghost-hero:hover { border-color: var(--accent); background: var(--accent-dim); transform: translateY(-2px); }
        .link-view-all { color: var(--accent); font-size: 13px; font-weight: 600; transition: opacity 0.15s; }
        .link-view-all:hover { opacity: 0.7; }
      `}</style>

      <div style={s.hero}>
        <canvas ref={canvasRef} style={s.canvas} />

        <div style={s.heroLeft}>
          <div className="hero-eyebrow" style={s.eyebrow}>
            <span style={s.eyebrowLine} />
            {t('home.eyebrow')}
          </div>
          <h1 className="hero-title" style={s.heroTitle}>
            {t('home.title1')}<br />
            <span style={s.heroAccent}>{t('home.title2')}</span>
          </h1>
          <p className="hero-sub" style={s.heroSub}>
            {t('home.subtitle')}
          </p>
          <div className="hero-btns" style={s.heroBtns}>
            <Link to="/products" className="btn-primary-hero">{t('home.browseProducts')}</Link>
            <Link to="/builds" className="btn-ghost-hero">{t('home.aiBuilder')}</Link>
          </div>
          <div className="hero-stats" style={s.heroStats}>
            <div style={s.stat}>
              <span style={s.statNum}>2.4K+</span>
              <span style={s.statLabel}>{t('home.products')}</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.stat}>
              <span style={s.statNum}>18K</span>
              <span style={s.statLabel}>{t('home.orders')}</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.stat}>
              <span style={s.statNum}>4.9★</span>
              <span style={s.statLabel}>{t('home.rating')}</span>
            </div>
          </div>
        </div>

        <div style={s.heroRight}>
          <div style={s.scene}>
            <div style={s.ring1} />
            <div style={s.ring2} />
            <div style={s.glowCenter} />

            <div style={s.monitor}>
              <svg width="92" height="76" viewBox="0 0 92 76" fill="none">
                <rect x="2" y="2" width="88" height="56" rx="5" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="1.5"/>
                <rect x="10" y="10" width="28" height="20" rx="2" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="1"/>
                <rect x="44" y="10" width="36" height="9" rx="1.5" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="1"/>
                <rect x="44" y="23" width="28" height="7" rx="1.5" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="0.8" strokeOpacity="0.5"/>
                <path d="M10 38h28M10 46h18M44 38h36M44 46h24" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round"/>
                <path d="M34 66h24M46 58v8" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round"/>
              </svg>
            </div>

            {CHIPS.map(chip => (
              <div
                key={chip.key}
                className="orbit-chip"
                style={{
                  ...chip.style,
                  width: chip.key === 'cpu' || chip.key === 'gpu' ? '54px' : '46px',
                  height: chip.key === 'cpu' || chip.key === 'gpu' ? '54px' : '46px',
                }}
              >
                <div className="orbit-chip-inner">
                  {chip.icon}
                  <span className="orbit-chip-label">{chip.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.features}>
        {FEATURES.map(f => <FeatCard key={f.title} f={f} />)}
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>{t('home.topRated')}</h2>
          <Link to="/products" className="link-view-all">{t('home.viewAll')}</Link>
        </div>
        {loading ? (
          <div style={s.grid}>
            {[1, 2, 3, 4, 5].map(i => <div key={i} style={s.skeleton} />)}
          </div>
        ) : !products.length ? (
          <p style={s.empty}>{t('home.noProducts')}</p>
        ) : (
          <div style={s.grid}>
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>

      <div style={s.cta}>
        <h2 style={s.ctaTitle}>{t('home.ctaTitle')}</h2>
        <p style={s.ctaSub}>{t('home.ctaDesc')}</p>
        <Link to="/builds" className="btn-primary-hero">{t('home.ctaBtn')}</Link>
      </div>
    </Layout>
  )
}

const s = {
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '14px',
    minHeight: '300px',
    position: 'relative',
    animation: 'fadeUp 0.4s ease both',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  heroLeft: {
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--accent)',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '14px',
  },
  eyebrowLine: {
    display: 'inline-block',
    width: '20px',
    height: '1.5px',
    background: 'var(--accent)',
    opacity: 0.7,
    borderRadius: '2px',
  },
  heroTitle: {
    color: 'var(--text-primary)',
    fontSize: '42px',
    fontWeight: '800',
    lineHeight: '1.12',
    letterSpacing: '-0.5px',
    marginBottom: '12px',
  },
  heroAccent: { color: 'var(--accent)' },
  heroSub: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.7',
    marginBottom: '28px',
    maxWidth: '280px',
  },
  heroBtns: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  stat: { display: 'flex', flexDirection: 'column' },
  statNum: {
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: '800',
    lineHeight: '1',
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  statDivider: { width: '1px', height: '28px', background: 'var(--border)' },
  heroRight: {
    background: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  scene: { position: 'relative', width: '260px', height: '260px' },
  ring1: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '240px',
    height: '240px',
    marginLeft: '-120px',
    marginTop: '-120px',
    borderRadius: '50%',
    border: '1px dashed var(--accent)',
    opacity: 0.15,
    animation: 'spinRing 22s linear infinite',
  },
  ring2: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '165px',
    height: '165px',
    marginLeft: '-82.5px',
    marginTop: '-82.5px',
    borderRadius: '50%',
    border: '1px dashed var(--accent)',
    opacity: 0.1,
    animation: 'spinRingR 15s linear infinite',
  },
  glowCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
    animation: 'pulseGlow 3s ease-in-out infinite',
  },
  monitor: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    animation: 'floatMain 3.8s ease-in-out infinite',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '28px',
    animation: 'fadeUp 0.4s ease 0.07s both',
  },
  feat: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'default',
    transition: 'border-color 0.18s, transform 0.18s',
  },
  featIcon: { marginBottom: '8px', transition: 'color 0.18s', display: 'flex' },
  featTitle: { color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', marginBottom: '3px' },
  featDesc: { color: 'var(--text-secondary)', fontSize: '11px' },
  section: { marginBottom: '20px', animation: 'fadeUp 0.4s ease 0.13s both' },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  sectionTitle: { color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '14px',
  },
  skeleton: {
    height: '240px',
    borderRadius: '12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  empty: { color: 'var(--text-secondary)', fontSize: '14px' },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'border-color 0.18s, transform 0.18s, box-shadow 0.18s',
    display: 'block',
  },
  cardImg: {
    height: '160px',
    background: 'var(--bg-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody: { padding: '14px' },
  cardBadge: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  cardName: { color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', margin: '8px 0 10px', lineHeight: '1.4' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { color: 'var(--accent)', fontSize: '15px', fontWeight: '800' },
  cardRating: { color: 'var(--warning)', fontSize: '11px' },
  cta: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '48px 40px',
    textAlign: 'center',
    animation: 'fadeUp 0.4s ease 0.18s both',
  },
  ctaTitle: { color: 'var(--text-primary)', fontSize: '22px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.3px' },
  ctaSub: { color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: '1.6' },
}

export default HomePage