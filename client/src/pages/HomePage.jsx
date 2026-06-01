import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l4 4 8-8"/><rect x="1" y="1" width="18" height="18" rx="4"/></svg>,
    title: 'Fast Delivery',
    desc: '2-3 business days',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 18s8-4 8-10V4l-8-3-8 3v4c0 6 8 10 8 10z"/></svg>,
    title: 'Warranty',
    desc: '1 year on all products',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="18" height="14" rx="2"/><path d="M7 19h6M10 16v3"/></svg>,
    title: 'AI Assistant',
    desc: 'Get expert advice',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="18" height="13" rx="2"/><path d="M1 9h18"/></svg>,
    title: 'Secure Payment',
    desc: '100% protected',
  },
]

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
          {p.average_rating > 0 && <span style={s.cardRating}>{'★'.repeat(Math.round(p.average_rating))}</span>}
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
      <div style={{ ...s.featIcon, color: hovered ? 'var(--accent)' : 'var(--text-muted)' }}>{f.icon}</div>
      <p style={s.featTitle}>{f.title}</p>
      <p style={s.featDesc}>{f.desc}</p>
    </div>
  )
}

const HomePage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef(null)
  const animRef = useRef(null)

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

    const nodes = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.8 + 0.5,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
      const nodeColor = isDark ? 'rgba(79,142,247,' : 'rgba(35,96,212,'
      const lineColor = isDark ? 'rgba(79,142,247,' : 'rgba(35,96,212,'

      nodes.forEach(n => {
        n.x += n.dx
        n.y += n.dy
        if (n.x < 0 || n.x > canvas.width) n.dx *= -1
        if (n.y < 0 || n.y > canvas.height) n.dy *= -1

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `${nodeColor}0.5)`
        ctx.fill()
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.18
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `${lineColor}${alpha})`
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
        @keyframes floatMain { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-10px)} }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spinRing { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes spinRingR { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(-360deg)} }
        @keyframes skeletonPulse { 0%,100%{opacity:.35} 50%{opacity:.7} }
        @keyframes glowPulse { 0%,100%{opacity:.4} 50%{opacity:.8} }

        .btn-primary {
          background: var(--accent);
          color: #fff;
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: .2px;
          transition: background .15s, transform .15s, box-shadow .15s;
          display: inline-block;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-btn);
        }
        .btn-primary:active { transform: translateY(0); box-shadow: none; }

        .btn-ghost {
          background: transparent;
          color: var(--accent);
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid var(--border);
          transition: border-color .15s, background .15s, transform .15s, color .15s;
          display: inline-block;
          cursor: pointer;
        }
        .btn-ghost:hover {
          border-color: var(--accent);
          background: var(--accent-dim);
          transform: translateY(-2px);
        }
        .btn-ghost:active { transform: translateY(0); }

        .link-view-all {
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
          transition: opacity .15s;
        }
        .link-view-all:hover { opacity: .7; }
      `}</style>

      <div style={s.hero}>
        <canvas ref={canvasRef} style={s.canvas} />
        <div style={s.heroLeft}>
          <div style={s.eyebrow}>
            <span style={s.eyebrowLine} />
            Premium PC Store
          </div>
          <h1 style={s.heroTitle}>
            Build Your<br />
            <span style={s.heroAccent}>Dream PC</span>
          </h1>
          <p style={s.heroSub}>Laptops, desktops and components — all in one place</p>
          <div style={s.heroBtns}>
            <Link to="/products" className="btn-primary">Browse Products</Link>
            <Link to="/builds" className="btn-ghost">AI PC Builder</Link>
          </div>
        </div>

        <div style={s.heroRight}>
          <div style={s.orbitWrap}>
            <div style={s.glowCircle} />
            <svg style={s.ring1} viewBox="0 0 220 220" fill="none">
              <circle cx="110" cy="110" r="100" stroke="var(--accent)" strokeWidth="0.6" strokeDasharray="5 10" opacity="0.25"/>
            </svg>
            <svg style={s.ring2} viewBox="0 0 150 150" fill="none">
              <circle cx="75" cy="75" r="66" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 7" opacity="0.15"/>
            </svg>

            <div style={s.mainDevice}>
              <svg width="76" height="76" viewBox="0 0 76 76" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="8" width="68" height="46" rx="4" fill="var(--accent-dim)"/>
                <path d="M24 60h28M38 54v6"/>
                <rect x="12" y="16" width="22" height="16" rx="2" fill="var(--accent-dim)"/>
                <rect x="42" y="16" width="22" height="7" rx="1.5" fill="var(--accent-dim)"/>
                <rect x="42" y="27" width="16" height="5" rx="1.5" fill="var(--accent-dim)"/>
                <path d="M12 40h22M12 46h14M42 40h22M42 46h14"/>
              </svg>
            </div>

            <div style={{ ...s.orbitDot, top: '15%', left: '10%', animationDelay: '0s', animationDuration: '3.5s' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.3" opacity="0.65">
                <rect x="2" y="4" width="20" height="15" rx="2"/>
                <path d="M7 19v2M17 19v2M4 21h16"/>
              </svg>
            </div>
            <div style={{ ...s.orbitDot, bottom: '18%', right: '8%', animationDelay: '1s', animationDuration: '4.2s' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="1.3" opacity="0.5">
                <rect x="4" y="1" width="12" height="18" rx="2"/>
                <circle cx="10" cy="16" r="1.2"/>
              </svg>
            </div>
            <div style={{ ...s.orbitDot, top: '18%', right: '14%', animationDelay: '2s', animationDuration: '5s' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--accent)" strokeWidth="1.3" opacity="0.4">
                <path d="M9 2l2 4.5H16l-4 3 1.5 5L9 12l-4.5 2.5 1.5-5-4-3H7z"/>
              </svg>
            </div>
            <div style={{ ...s.orbitDot, bottom: '20%', left: '14%', animationDelay: '0.5s', animationDuration: '4.8s' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.3" opacity="0.4">
                <circle cx="8" cy="8" r="6"/>
                <path d="M8 5v3l2 1.5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div style={s.features}>
        {FEATURES.map(f => <FeatCard key={f.title} f={f} />)}
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Top Rated Products</h2>
          <Link to="/products" className="link-view-all">View all →</Link>
        </div>
        {loading ? (
          <div style={s.grid}>
            {[1, 2, 3, 4, 5].map(i => <div key={i} style={s.skeleton} />)}
          </div>
        ) : !products.length ? (
          <p style={s.empty}>No products yet</p>
        ) : (
          <div style={s.grid}>
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>

      <div style={s.cta}>
        <h2 style={s.ctaTitle}>Ready to build your PC?</h2>
        <p style={s.ctaSub}>Let our AI assistant create the perfect build for your budget and needs</p>
        <Link to="/builds" className="btn-primary">Start with AI Builder</Link>
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
    minHeight: '290px',
    position: 'relative',
    animation: 'fadeInUp 0.4s ease both',
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
    padding: '44px 36px',
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
    marginBottom: '12px',
  },
  eyebrowLine: {
    display: 'inline-block',
    width: '18px',
    height: '1.5px',
    background: 'var(--accent)',
    opacity: 0.7,
    borderRadius: '2px',
  },
  heroTitle: {
    color: 'var(--text-primary)',
    fontSize: '38px',
    fontWeight: '800',
    lineHeight: '1.15',
    letterSpacing: '-0.5px',
    marginBottom: '10px',
  },
  heroAccent: { color: 'var(--accent)' },
  heroSub: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.65',
    marginBottom: '24px',
    maxWidth: '270px',
  },
  heroBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
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
  orbitWrap: {
    position: 'relative',
    width: '220px',
    height: '220px',
  },
  glowCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
    animation: 'glowPulse 3s ease-in-out infinite',
    pointerEvents: 'none',
  },
  ring1: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '220px',
    height: '220px',
    animation: 'spinRing 20s linear infinite',
  },
  ring2: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '150px',
    height: '150px',
    animation: 'spinRingR 14s linear infinite',
  },
  mainDevice: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'floatMain 4s ease-in-out infinite',
  },
  orbitDot: {
    position: 'absolute',
    animation: 'floatA 3.5s ease-in-out infinite',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '28px',
    animation: 'fadeInUp 0.4s ease 0.07s both',
  },
  feat: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'default',
    transition: 'border-color 0.18s, transform 0.18s',
  },
  featIcon: {
    marginBottom: '8px',
    transition: 'color 0.18s',
    display: 'flex',
  },
  featTitle: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '3px',
  },
  featDesc: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
  },
  section: {
    marginBottom: '20px',
    animation: 'fadeInUp 0.4s ease 0.13s both',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  sectionTitle: {
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: '700',
  },
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
  cardName: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '600',
    margin: '8px 0 10px',
    lineHeight: '1.4',
  },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { color: 'var(--accent)', fontSize: '15px', fontWeight: '800' },
  cardRating: { color: 'var(--warning)', fontSize: '11px' },
  cta: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '48px 40px',
    textAlign: 'center',
    animation: 'fadeInUp 0.4s ease 0.18s both',
  },
  ctaTitle: {
    color: 'var(--text-primary)',
    fontSize: '22px',
    fontWeight: '800',
    marginBottom: '8px',
    letterSpacing: '-0.3px',
  },
  ctaSub: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
}

export default HomePage