import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const BuildsPage = () => {
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [budget, setBudget] = useState('')
  const [generating, setGenerating] = useState(false)
  const [tab, setTab] = useState('my') // 'my' | 'ai'

  useEffect(() => {
    api.get('/builds/my_builds/')
      .then(res => setBuilds(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const generateBuild = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    try {
      const res = await api.post('/builds/ai_generate/', { prompt, budget: budget || undefined })
      setBuilds(prev => [res.data.build, ...prev])
      setTab('my')
      setPrompt('')
      setBudget('')
    } catch {}
    setGenerating(false)
  }

  const deleteBuild = async (id) => {
    await api.delete(`/builds/${id}/delete_build/`)
    setBuilds(prev => prev.filter(b => b.id !== id))
  }

  return (
    <Layout>
      <h1 style={styles.title}>PC Builds</h1>

      <div style={styles.tabs}>
        <button style={tab === 'my' ? styles.tabActive : styles.tab} onClick={() => setTab('my')}>My Builds</button>
        <button style={tab === 'ai' ? styles.tabActive : styles.tab} onClick={() => setTab('ai')}>AI Generator</button>
      </div>

      {tab === 'ai' && (
        <div style={styles.aiBox}>
          <h2 style={styles.aiTitle}>AI PC Builder</h2>
          <p style={styles.aiSubtitle}>Describe what you need and AI will recommend the best build</p>
          <textarea
            style={styles.textarea}
            placeholder="Example: Gaming PC for playing modern games at high settings, mainly FPS games"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Budget (optional, USD)"
            value={budget}
            onChange={e => setBudget(e.target.value)}
          />
          <button style={generating ? styles.btnDisabled : styles.btn} onClick={generateBuild} disabled={generating}>
            {generating ? 'Generating build...' : 'Generate Build'}
          </button>
        </div>
      )}

      {tab === 'my' && (
        loading ? <p style={styles.loading}>Loading...</p> :
        !builds.length ? <p style={styles.empty}>No builds yet. Try the AI Generator!</p> :
        <div style={styles.list}>
          {builds.map(build => (
            <div key={build.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.buildName}>{build.name}</h3>
                  <span style={styles.buildStatus}>{build.status}</span>
                </div>
                <div style={styles.cardRight}>
                  <span style={styles.buildPrice}>${build.total_price}</span>
                  <button style={styles.deleteBtn} onClick={() => deleteBuild(build.id)}>Delete</button>
                </div>
              </div>

              {build.description && <p style={styles.buildDesc}>{build.description}</p>}

              <div style={styles.components}>
                {build.components.map(comp => (
                  <div key={comp.id} style={styles.comp}>
                    <span style={styles.compType}>{comp.component_type}</span>
                    <span style={styles.compName}>{comp.product?.name || comp.custom_name}</span>
                  </div>
                ))}
              </div>

              <div style={styles.compat}>
                <span style={{ color: build.is_compatible ? '#4caf50' : '#e53e3e' }}>
                  {build.is_compatible ? 'Compatible' : 'Compatibility issue'}
                </span>
                {build.compatibility_notes && <p style={styles.compatNotes}>{build.compatibility_notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

const styles = {
  title: { color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '24px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: { background: '#2a2a2a', color: '#888', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '8px 24px', cursor: 'pointer', fontSize: '14px' },
  tabActive: { background: '#e53e3e', color: '#fff', border: '1px solid #e53e3e', borderRadius: '8px', padding: '8px 24px', cursor: 'pointer', fontSize: '14px' },
  aiBox: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '32px', maxWidth: '600px' },
  aiTitle: { color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '8px' },
  aiSubtitle: { color: '#888', fontSize: '14px', marginBottom: '20px' },
  textarea: { width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', marginBottom: '12px', boxSizing: 'border-box' },
  input: { width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' },
  btn: { background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%' },
  btnDisabled: { background: '#555', color: '#888', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '15px', cursor: 'not-allowed', width: '100%' },
  loading: { color: '#888' },
  empty: { color: '#888', fontSize: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  buildName: { color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '4px' },
  buildStatus: { color: '#888', fontSize: '12px' },
  cardRight: { textAlign: 'right' },
  buildPrice: { color: '#e53e3e', fontSize: '20px', fontWeight: '700', display: 'block', marginBottom: '8px' },
  deleteBtn: { background: 'transparent', border: '1px solid #3a3a3a', color: '#888', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' },
  buildDesc: { color: '#888', fontSize: '14px', marginBottom: '16px' },
  components: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' },
  comp: { background: '#2a2a2a', borderRadius: '8px', padding: '10px' },
  compType: { color: '#e53e3e', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' },
  compName: { color: '#fff', fontSize: '13px' },
  compat: { borderTop: '1px solid #2a2a2a', paddingTop: '12px' },
  compatNotes: { color: '#888', fontSize: '13px', marginTop: '4px' },
}

export default BuildsPage