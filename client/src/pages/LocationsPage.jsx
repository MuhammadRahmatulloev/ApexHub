import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const LocationsPage = () => {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/locations/list_locations/')
      .then(res => setLocations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <h1 style={s.title}>Seller Locations</h1>
      <p style={s.sub}>Find sellers near you</p>
      {loading ? (
        <p style={s.muted}>Loading...</p>
      ) : !locations.length ? (
        <p style={s.muted}>No locations added yet</p>
      ) : (
        <div style={s.grid}>
          {locations.map(loc => (
            <div key={loc.id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.avatar}>{loc.seller_name?.[0]?.toUpperCase() || 'S'}</div>
                <div>
                  <p style={s.sellerName}>{loc.seller_name}</p>
                  <p style={s.sellerEmail}>{loc.seller_email}</p>
                </div>
              </div>
              <div style={s.divider} />
              <div style={s.infoRow}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" style={{ color: 'var(--accent)', flexShrink: 0 }}>
                  <path d="M7 1C4.8 1 3 2.8 3 5c0 3.3 4 8 4 8s4-4.7 4-8c0-2.2-1.8-4-4-4z" />
                  <circle cx="7" cy="5" r="1.5" />
                </svg>
                <span style={s.infoText}>{loc.address}</span>
              </div>
              {loc.work_hours && (
                <div style={s.infoRow}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="6" />
                    <path d="M7 4v3l2 2" />
                  </svg>
                  <span style={s.infoText}>{loc.work_hours}</span>
                </div>
              )}
              {loc.phone && (
                <div style={s.infoRow}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <path d="M4 1h2l1 3-1.5 1.5a9 9 0 0 0 3 3L10 7l3 1v2a1 1 0 0 1-1 1A12 12 0 0 1 1 2a1 1 0 0 1 1-1z" />
                  </svg>
                  <span style={s.infoText}>{loc.phone}</span>
                </div>
              )}
              <a
                href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noreferrer"
                style={s.mapBtn}
              >
                Open in Maps
              </a>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

const s = {
  title: { color: 'var(--text-primary)', fontSize: '26px', fontWeight: '700', marginBottom: '6px' },
  sub: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' },
  muted: { color: 'var(--text-secondary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  avatar: { width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-dim)', border: '1px solid var(--border)', color: 'var(--accent)', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sellerName: { color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' },
  sellerEmail: { color: 'var(--text-secondary)', fontSize: '12px' },
  divider: { height: '1px', background: 'var(--border)', marginBottom: '12px' },
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' },
  infoText: { color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.4' },
  mapBtn: { display: 'block', marginTop: '14px', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'center', transition: 'background 0.15s, border-color 0.15s' },
}

export default LocationsPage