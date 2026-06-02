import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const sellerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const myIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapClickHandler({ onMapClick, pickMode }) {
  const map = useMap()
  useEffect(() => {
    if (!pickMode) return
    const handler = (e) => onMapClick(e.latlng)
    map.on('click', handler)
    return () => map.off('click', handler)
  }, [map, onMapClick, pickMode])
  return null
}

function FlyToLocation({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1.2 })
  }, [target])
  return null
}

const EMPTY_FORM = { name: '', address: '', lat: '', lng: '', work_hours: '', phone: '' }

const LocationsPage = () => {
  const { user } = useAuth()
  const isSeller = user && (user.role === 'SELLER' || user.role === 'ADMIN')

  const [locations, setLocations] = useState([])
  const [myLocations, setMyLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [flyTarget, setFlyTarget] = useState(null)
  const [tab, setTab] = useState('map')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [pickMode, setPickMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  useEffect(() => {
    api.get('/locations/list_locations/')
      .then(res => setLocations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isSeller) return
    api.get('/locations/my_locations/')
      .then(res => setMyLocations(res.data))
      .catch(() => {})
  }, [isSeller])

  const filtered = locations.filter(loc =>
    loc.name?.toLowerCase().includes(search.toLowerCase()) ||
    loc.address?.toLowerCase().includes(search.toLowerCase()) ||
    loc.seller_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleMapClick = (latlng) => {
    setForm(prev => ({ ...prev, lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) }))
    setPickMode(false)
    setTab('manage')
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setFormSuccess('')
    setShowForm(true)
    setTab('manage')
  }

  const openEdit = (loc) => {
    setEditingId(loc.id)
    setForm({
      name: loc.name || '',
      address: loc.address || '',
      lat: loc.lat || '',
      lng: loc.lng || '',
      work_hours: loc.work_hours || '',
      phone: loc.phone || '',
    })
    setFormError('')
    setFormSuccess('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.lat || !form.lng) {
      setFormError('Pick a location on the map or enter coordinates')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editingId) {
        const res = await api.patch(`/locations/${editingId}/update_location/`, form)
        setMyLocations(prev => prev.map(l => l.id === editingId ? res.data : l))
        setLocations(prev => prev.map(l => l.id === editingId ? res.data : l))
        setFormSuccess('Location updated!')
      } else {
        const res = await api.post('/locations/create_location/', form)
        setMyLocations(prev => [...prev, res.data])
        setLocations(prev => [...prev, res.data])
        setFormSuccess('Location added!')
        setForm(EMPTY_FORM)
        setEditingId(null)
      }
      setTimeout(() => { setFormSuccess(''); setShowForm(false) }, 1200)
    } catch (err) {
      const d = err.response?.data
      setFormError(d ? Object.values(d)[0]?.[0] || 'Error' : 'Error')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return
    setDeleting(id)
    try {
      await api.delete(`/locations/${id}/delete_location/`)
      setMyLocations(prev => prev.filter(l => l.id !== id))
      setLocations(prev => prev.filter(l => l.id !== id))
    } catch {}
    setDeleting(null)
  }

  const handleFlyTo = (loc) => {
    setFlyTarget({ lat: loc.lat, lng: loc.lng, id: loc.id })
    setTab('map')
  }

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .loc-tab {
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-family: inherit;
          transition: all 0.15s;
        }
        .loc-tab:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .loc-tab-active {
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: default;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #fff;
          font-family: inherit;
        }
        .loc-form-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
          font-family: inherit;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .loc-form-input:focus { 
          border-color: var(--accent); 
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .loc-form-input::placeholder { color: var(--text-secondary); }
        .pick-btn {
          background: var(--accent-dim);
          border: 1px solid var(--accent);
          color: var(--accent);
          border-radius: 8px;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .pick-btn:hover { background: var(--accent); color: #fff; }
        .pick-btn-active {
          background: var(--accent);
          border: 1px solid var(--accent);
          color: #fff;
          border-radius: 8px;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          animation: pulse 1.2s ease infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .save-loc-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s;
        }
        .save-loc-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
        .save-loc-btn:disabled { background: var(--text-muted); cursor: not-allowed; }
        .cancel-loc-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .cancel-loc-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
        .add-loc-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .add-loc-btn:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-btn); }
        .edit-loc-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .edit-loc-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .del-loc-btn {
          background: transparent;
          border: 1px solid rgba(248,113,113,0.3);
          color: var(--danger);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, background 0.15s;
        }
        .del-loc-btn:hover { border-color: var(--danger); background: rgba(248,113,113,0.08); }
        .del-loc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .fly-btn {
          background: var(--accent-dim);
          border: 1px solid var(--border);
          color: var(--accent);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .fly-btn:hover { background: var(--accent); color: #fff; }
        .leaflet-container {
          border-radius: 14px;
          border: 1px solid var(--border);
        }
        .loc-list-item {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          transition: border-color 0.15s, transform 0.15s;
          animation: fadeUp 0.3s ease both;
        }
        .loc-list-item:hover { border-color: var(--border-hover); transform: translateY(-2px); }
        .search-input-loc {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
        }
        .search-input-loc::placeholder { color: var(--text-secondary); }
      `}</style>

      <div style={s.page}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Seller Locations</h1>
            <p style={s.sub}>Find sellers and their stores on the map</p>
          </div>
          <div style={s.topRight}>
            <div style={s.tabs}>
              <button className={tab === 'map' ? 'loc-tab-active' : 'loc-tab'} onClick={() => setTab('map')}>
                Map
              </button>
              <button className={tab === 'list' ? 'loc-tab-active' : 'loc-tab'} onClick={() => setTab('list')}>
                List {locations.length > 0 && `(${locations.length})`}
              </button>
              {isSeller && (
                <button className={tab === 'manage' ? 'loc-tab-active' : 'loc-tab'} onClick={() => setTab('manage')}>
                  My Locations {myLocations.length > 0 && `(${myLocations.length})`}
                </button>
              )}
            </div>
            {isSeller && (
              <button className="add-loc-btn" onClick={openCreate}>+ Add Location</button>
            )}
          </div>
        </div>

        <div style={s.searchRow}>
          <div style={s.searchBox}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="6.5" cy="6.5" r="5"/>
              <path d="M10.5 10.5l3 3"/>
            </svg>
            <input
              className="search-input-loc"
              placeholder="Search by name, address, seller..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button style={s.clearSearch} onClick={() => setSearch('')}>×</button>
            )}
          </div>
          {search && (
            <span style={s.searchCount}>{filtered.length} found</span>
          )}
        </div>

        {tab === 'map' && (
          <div style={s.mapWrap}>
            {pickMode && (
              <div style={s.pickBanner}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M7 1C4.8 1 3 2.8 3 5c0 3.3 4 8 4 8s4-4.7 4-8c0-2.2-1.8-4-4-4z"/>
                  <circle cx="7" cy="5" r="1.5"/>
                </svg>
                Click on the map to pick coordinates
                <button style={s.cancelPickBtn} onClick={() => setPickMode(false)}>Cancel</button>
              </div>
            )}
            {!loading && (
              <MapContainer
                center={[38.559772, 68.773994]}
                zoom={12}
                style={{ height: '560px', width: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} pickMode={pickMode} />
                <FlyToLocation target={flyTarget} />
                {(search ? filtered : locations).map(loc => (
                  <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={sellerIcon}>
                    <Popup>
                      <div style={s.popup}>
                        <strong style={s.popupName}>{loc.name}</strong>
                        <span style={s.popupSeller}>{loc.seller_name}</span>
                        <span style={s.popupAddr}>{loc.address}</span>
                        {loc.work_hours && <span style={s.popupInfo}>🕐 {loc.work_hours}</span>}
                        {loc.phone && <span style={s.popupInfo}>📞 {loc.phone}</span>}
                        <a
                          href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={s.popupMapLink}
                        >
                          Open in Google Maps
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
            {loading && <div style={s.mapLoader}>Loading map...</div>}
          </div>
        )}

        {tab === 'list' && (
          <div style={s.listGrid}>
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} style={{ height: '120px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'skeletonPulse 1.4s ease infinite' }} />
              ))
            ) : filtered.length === 0 ? (
              <div style={s.empty}>
                <p style={s.emptyTitle}>No locations found</p>
              </div>
            ) : (
              filtered.map((loc, i) => (
                <div key={loc.id} className="loc-list-item" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div style={s.locTop}>
                    <div style={s.locAvatar}>{loc.seller_name?.[0]?.toUpperCase() || 'S'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={s.locName}>{loc.name}</p>
                      <p style={s.locSeller}>{loc.seller_name} · {loc.seller_email}</p>
                    </div>
                    <button className="fly-btn" onClick={() => handleFlyTo(loc)}>
                      📍 Show on map
                    </button>
                  </div>
                  <div style={s.locDivider} />
                  <div style={s.locInfoRow}>
                    <svg width="13" height="13" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <path d="M6.5 1C4.6 1 3 2.6 3 4.5c0 3 3.5 7 3.5 7S10 7.5 10 4.5C10 2.6 8.4 1 6.5 1z"/>
                      <circle cx="6.5" cy="4.5" r="1.3"/>
                    </svg>
                    <span style={s.locInfoText}>{loc.address}</span>
                  </div>
                  {loc.work_hours && (
                    <div style={s.locInfoRow}>
                      <svg width="13" height="13" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                        <circle cx="6.5" cy="6.5" r="5.5"/>
                        <path d="M6.5 3.5v3l2 2"/>
                      </svg>
                      <span style={s.locInfoText}>{loc.work_hours}</span>
                    </div>
                  )}
                  {loc.phone && (
                    <div style={s.locInfoRow}>
                      <svg width="13" height="13" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                        <path d="M3.5 1h2l.8 2.5-1.3 1.3a8 8 0 0 0 2.7 2.7l1.3-1.3L11.5 7v2a1 1 0 0 1-1 1A10 10 0 0 1 1 2a1 1 0 0 1 1-1z"/>
                      </svg>
                      <span style={s.locInfoText}>{loc.phone}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'manage' && isSeller && (
          <div style={s.manageWrap}>
            {showForm && (
              <div style={s.formCard}>
                <p style={s.formTitle}>{editingId ? 'Edit Location' : 'Add New Location'}</p>

                {formError && <div style={s.formError}>{formError}</div>}
                {formSuccess && <div style={s.formSuccess}>{formSuccess}</div>}

                <form onSubmit={handleSave} style={s.form}>
                  <div style={s.formGrid}>
                    <div style={s.field}>
                      <label style={s.fieldLabel}>Store Name *</label>
                      <input className="loc-form-input" placeholder="e.g. Main Store" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div style={s.field}>
                      <label style={s.fieldLabel}>Address *</label>
                      <input className="loc-form-input" placeholder="e.g. Dushanbe, Rudaki 42" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
                    </div>
                    <div style={s.field}>
                      <label style={s.fieldLabel}>Work Hours</label>
                      <input className="loc-form-input" placeholder="e.g. Mon-Sat 9:00-18:00" value={form.work_hours} onChange={e => setForm(p => ({ ...p, work_hours: e.target.value }))} />
                    </div>
                    <div style={s.field}>
                      <label style={s.fieldLabel}>Phone</label>
                      <input className="loc-form-input" placeholder="+992..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>

                  <div style={s.coordRow}>
                    <div style={s.field}>
                      <label style={s.fieldLabel}>Latitude *</label>
                      <input 
                        type="number" 
                        step="any" 
                        className="loc-form-input" 
                        placeholder="38.559..." 
                        value={form.lat} 
                        onChange={e => setForm(p => ({ ...p, lat: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div style={s.field}>
                      <label style={s.fieldLabel}>Longitude *</label>
                      <input 
                        type="number" 
                        step="any" 
                        className="loc-form-input" 
                        placeholder="68.773..." 
                        value={form.lng} 
                        onChange={e => setForm(p => ({ ...p, lng: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div style={{ alignSelf: 'flex-end' }}>
                      <button
                        type="button"
                        className={pickMode ? 'pick-btn-active' : 'pick-btn'}
                        onClick={() => { setPickMode(!pickMode); setTab('map') }}
                      >
                        {pickMode ? '📍 Picking...' : '📍 Pick on Map'}
                      </button>
                    </div>
                  </div>

                  {(form.lat && form.lng) && (
                    <div style={s.coordPreview}>
                      <svg width="12" height="12" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 6l3 3 5-5"/>
                      </svg>
                      Coordinates set: {form.lat}, {form.lng}
                    </div>
                  )}

                  <div style={s.formActions}>
                    <button type="button" className="cancel-loc-btn" onClick={() => { setShowForm(false); setPickMode(false) }}>Cancel</button>
                    <button type="submit" className="save-loc-btn" disabled={saving}>
                      {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Location'}
                    </button>
                  </div>
                </form>

                <div style={s.formMapWrap}>
                  <p style={s.fieldLabel} style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {pickMode ? 'Click on the map to set coordinates' : 'Map preview'}
                  </p>
                  <MapContainer
                    center={[38.559772, 68.773994]}
                    zoom={12}
                    style={{ height: '280px', width: '100%', borderRadius: '10px', border: '1px solid var(--border)' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} pickMode={pickMode} />
                    {form.lat && form.lng && !isNaN(form.lat) && !isNaN(form.lng) && (
                      <Marker position={[parseFloat(form.lat), parseFloat(form.lng)]} icon={myIcon}>
                        <Popup><strong>{form.name || 'New location'}</strong></Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            )}

            <div style={s.myLocList}>
              <div style={s.myLocHeader}>
                <p style={s.myLocTitle}>My Locations ({myLocations.length})</p>
                {!showForm && (
                  <button className="add-loc-btn" onClick={openCreate}>+ Add Location</button>
                )}
              </div>

              {myLocations.length === 0 ? (
                <div style={s.emptyManage}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M20 4C14.5 4 10 8.5 10 14c0 8 10 22 10 22s10-14 10-22c0-5.5-4.5-10-10-10z"/>
                    <circle cx="20" cy="14" r="3.5"/>
                  </svg>
                  <p style={s.emptyTitle}>No locations yet</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Add your first store location</p>
                </div>
              ) : (
                <div style={s.myLocGrid}>
                  {myLocations.map((loc, i) => (
                    <div key={loc.id} style={{ ...s.myLocCard, animationDelay: `${i * 0.05}s` }}>
                      <div style={s.myLocCardTop}>
                        <div>
                          <p style={s.locName}>{loc.name}</p>
                          <p style={s.locInfoText}>{loc.address}</p>
                        </div>
                        <div style={s.myLocActions}>
                          <button className="fly-btn" onClick={() => handleFlyTo(loc)}>Map</button>
                          <button className="edit-loc-btn" onClick={() => openEdit(loc)}>Edit</button>
                          <button className="del-loc-btn" onClick={() => handleDelete(loc.id)} disabled={deleting === loc.id}>
                            {deleting === loc.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      {(loc.work_hours || loc.phone) && (
                        <div style={s.myLocMeta}>
                          {loc.work_hours && <span style={s.metaChip}>🕐 {loc.work_hours}</span>}
                          {loc.phone && <span style={s.metaChip}>📞 {loc.phone}</span>}
                        </div>
                      )}
                      <div style={s.coordChip}>
                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  page: { animation: 'fadeUp 0.35s ease both' },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: { color: 'var(--text-primary)', fontSize: '26px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.3px' },
  sub: { color: 'var(--text-secondary)', fontSize: '13px' },
  topRight: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: '6px' },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '9px 14px',
    flex: 1,
    maxWidth: '480px',
    transition: 'border-color 0.15s',
  },
  clearSearch: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    padding: '0 2px',
  },
  searchCount: { color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' },
  mapWrap: { position: 'relative' },
  pickBanner: {
    position: 'absolute',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: 'var(--shadow)',
  },
  cancelPickBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.4)',
    color: '#fff',
    borderRadius: '5px',
    padding: '3px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginLeft: '6px',
  },
  mapLoader: {
    height: '560px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  popup: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px' },
  popupName: { fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '2px' },
  popupSeller: { fontSize: '12px', color: '#555', fontWeight: '600' },
  popupAddr: { fontSize: '12px', color: '#666' },
  popupInfo: { fontSize: '12px', color: '#555' },
  popupMapLink: {
    display: 'block',
    marginTop: '6px',
    background: '#2563eb',
    color: '#fff',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'center',
    textDecoration: 'none',
  },
  listGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' },
  locTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  locAvatar: {
    width: '38px', height: '38px',
    borderRadius: '10px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    color: 'var(--accent)',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  locName: { color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '2px' },
  locSeller: { color: 'var(--text-secondary)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  locDivider: { height: '1px', background: 'var(--border)', marginBottom: '10px' },
  locInfoRow: { display: 'flex', alignItems: 'flex-start', gap: '7px', marginBottom: '6px' },
  locInfoText: { color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.4' },
  empty: { gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px' },
  emptyTitle: { color: 'var(--text-primary)', fontSize: '15px', fontWeight: '600' },
  manageWrap: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '24px',
    animation: 'fadeUp 0.25s ease both',
  },
  formTitle: { color: 'var(--text-primary)', fontSize: '15px', fontWeight: '700', marginBottom: '16px' },
  formError: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: 'var(--danger)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    marginBottom: '14px',
  },
  formSuccess: {
    background: 'rgba(52,211,153,0.08)',
    border: '1px solid rgba(52,211,153,0.25)',
    color: 'var(--success)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    marginBottom: '14px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  coordRow: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' },
  coordPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--success)',
    fontSize: '12px',
    fontWeight: '500',
    background: 'rgba(52,211,153,0.08)',
    border: '1px solid rgba(52,211,153,0.2)',
    borderRadius: '6px',
    padding: '6px 10px',
  },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' },
  formMapWrap: { marginTop: '16px' },
  myLocList: {},
  myLocHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  myLocTitle: { color: 'var(--text-primary)', fontSize: '15px', fontWeight: '700' },
  emptyManage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 24px',
    gap: '10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    textAlign: 'center',
  },
  myLocGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  myLocCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    animation: 'fadeUp 0.3s ease both',
    transition: 'border-color 0.15s',
  },
  myLocCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' },
  myLocActions: { display: 'flex', gap: '6px', flexShrink: 0 },
  myLocMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' },
  metaChip: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '11px',
  },
  coordChip: {
    display: 'inline-block',
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    borderRadius: '6px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
}

export default LocationsPage