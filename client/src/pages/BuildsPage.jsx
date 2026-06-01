import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const STATUS_COLORS = {
  DRAFT: 'var(--text-secondary)',
  COMPLETE: 'var(--success)',
  AI_GENERATED: 'var(--accent)',
}

const COMPONENT_ICONS = {
  CPU: '⚙',
  GPU: '🎮',
  RAM: '💾',
  STORAGE: '💿',
  MOTHERBOARD: '🔧',
  PSU: '⚡',
  CASE: '📦',
  COOLING: '❄',
}

const BuildsPage = () => {
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [budget, setBudget] = useState('')
  const [generating, setGenerating] = useState(false)
  const [tab, setTab] = useState('my')
  const [expandedId, setExpandedId] = useState(null)

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

  const deleteBuild = async (id, e) => {
    e.stopPropagation()
    await api.delete(`/builds/${id}/delete_build/`)
    setBuilds(prev => prev.filter(b => b.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .build-tab {
          padding: 8px 22px;
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
        .build-tab:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-dim);
        }
        .build-tab-active {
          padding: 8px 22px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #fff;
          font-family: inherit;
          transition: all 0.15s;
        }
        .build-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.15s, transform 0.15s;
          cursor: pointer;
        }
        .build-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }
        .delete-build-btn {
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
        .delete-build-btn:hover {
          border-color: var(--danger);
          background: rgba(248,113,113,0.08);
        }
        .generate-btn {
          width: 100%;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.2px;
        }
        .generate-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-btn);
        }
        .generate-btn:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
        }
        .ai-textarea {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .ai-textarea:focus { border-color: var(--accent); }
        .ai-textarea::placeholder { color: var(--text-secondary); }
        .ai-input {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 11px 14px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .ai-input:focus { border-color: var(--accent); }
        .ai-input::placeholder { color: var(--text-secondary); }
        .comp-chip {
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      `}</style>

      <div style={s.page}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>PC Builds</h1>
            <p style={s.sub}>Configure your dream PC or let AI do it for you</p>
          </div>
          <div style={s.tabs}>
            <button className={tab === 'my' ? 'build-tab-active' : 'build-tab'} onClick={() => setTab('my')}>
              My Builds {builds.length > 0 && `(${builds.length})`}
            </button>
            <button className={tab === 'ai' ? 'build-tab-active' : 'build-tab'} onClick={() => setTab('ai')}>
              AI Generator
            </button>
          </div>
        </div>

        {tab === 'ai' && (
          <div style={s.aiSection}>
            <div style={s.aiCard}>
              <div style={s.aiCardHeader}>
                <div style={s.aiIconWrap}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h2 style={s.aiTitle}>AI PC Builder</h2>
                  <p style={s.aiSub}>Describe your needs and AI will build the perfect config</p>
                </div>
              </div>

              <div style={s.aiForm}>
                <div style={s.fieldWrap}>
                  <label style={s.fieldLabel}>What do you need?</label>
                  <textarea
                    className="ai-textarea"
                    placeholder="Example: Gaming PC for modern games at high settings, mainly FPS. Need smooth 144fps gameplay."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.fieldLabel}>Budget (optional, USD)</label>
                  <input
                    className="ai-input"
                    type="number"
                    placeholder="e.g. 1200"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                  />
                </div>
                <button className="generate-btn" onClick={generateBuild} disabled={generating || !prompt.trim()}>
                  {generating ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Generating build...
                    </span>
                  ) : 'Generate Build'}
                </button>
              </div>

              <div style={s.aiHints}>
                <p style={s.aiHintTitle}>Try asking for:</p>
                <div style={s.hintChips}>
                  {[
                    'Budget gaming PC under $800',
                    'Video editing workstation',
                    'Silent home office PC',
                    'High-end streaming setup',
                  ].map(hint => (
                    <button
                      key={hint}
                      style={s.hintChip}
                      onClick={() => setPrompt(hint)}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'my' && (
          <div style={s.mySection}>
            {loading ? (
              <div style={s.buildsGrid}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ ...s.skeletonCard, animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            ) : !builds.length ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
                    <rect x="4" y="4" width="32" height="32" rx="4"/>
                    <path d="M14 20h12M20 14v12"/>
                  </svg>
                </div>
                <p style={s.emptyTitle}>No builds yet</p>
                <p style={s.emptyDesc}>Use the AI Generator to create your first build</p>
                <button
                  style={s.emptyBtn}
                  onClick={() => setTab('ai')}
                >
                  Open AI Generator
                </button>
              </div>
            ) : (
              <div style={s.buildsGrid}>
                {builds.map((build, i) => (
                  <div
                    key={build.id}
                    className="build-card"
                    style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}
                    onClick={() => toggleExpand(build.id)}
                  >
                    <div style={s.cardHead}>
                      <div style={s.cardHeadLeft}>
                        <div style={s.buildStatusDot(build.status)} />
                        <div>
                          <h3 style={s.buildName}>{build.name}</h3>
                          <span style={{ ...s.buildStatus, color: STATUS_COLORS[build.status] || 'var(--text-secondary)' }}>
                            {build.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div style={s.cardHeadRight}>
                        <span style={s.buildPrice}>${build.total_price}</span>
                        <button className="delete-build-btn" onClick={(e) => deleteBuild(build.id, e)}>
                          Delete
                        </button>
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', transform: expandedId === build.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>
                          ▾
                        </span>
                      </div>
                    </div>

                    {build.description && (
                      <p style={s.buildDesc}>{build.description}</p>
                    )}

                    <div style={s.cardStats}>
                      <span style={s.statChip}>
                        {build.components.length} components
                      </span>
                      <span style={{
                        ...s.compatChip,
                        background: build.is_compatible ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                        color: build.is_compatible ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${build.is_compatible ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                      }}>
                        {build.is_compatible ? '✓ Compatible' : '⚠ Issues'}
                      </span>
                    </div>

                    {expandedId === build.id && (
                      <div style={s.expandedSection} onClick={e => e.stopPropagation()}>
                        <div style={s.divider} />

                        {build.components.length > 0 && (
                          <div style={s.componentsWrap}>
                            <p style={s.sectionLabel}>Components</p>
                            <div style={s.compsGrid}>
                              {build.components.map(comp => (
                                <div key={comp.id} className="comp-chip">
                                  <span style={s.compType}>{comp.component_type}</span>
                                  <span style={s.compName}>{comp.product?.name || comp.custom_name || '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {build.compatibility_notes && (
                          <div style={s.notesWrap}>
                            <p style={s.sectionLabel}>Notes</p>
                            <p style={s.notesText}>{build.compatibility_notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  page: {
    animation: 'fadeUp 0.35s ease both',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  sub: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
  },
  aiSection: {
    maxWidth: '640px',
  },
  aiCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '28px',
    animation: 'fadeUp 0.3s ease both',
  },
  aiCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '24px',
  },
  aiIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiTitle: {
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '3px',
  },
  aiSub: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  aiForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '20px',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabel: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '500',
  },
  aiHints: {
    borderTop: '1px solid var(--border)',
    paddingTop: '16px',
  },
  aiHintTitle: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '10px',
  },
  hintChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  hintChip: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: '6px',
    padding: '5px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, color 0.15s',
  },
  mySection: {},
  buildsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  skeletonCard: {
    height: '96px',
    borderRadius: '14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  emptyState: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '80px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '18px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  emptyTitle: {
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: '600',
  },
  emptyDesc: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  emptyBtn: {
    marginTop: '8px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 22px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  cardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    gap: '12px',
  },
  cardHeadLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  buildStatusDot: (status) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    background: STATUS_COLORS[status] || 'var(--text-muted)',
  }),
  buildName: {
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  buildStatus: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardHeadRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  buildPrice: {
    color: 'var(--accent)',
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
  },
  buildDesc: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.5',
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '12px',
  },
  cardStats: {
    display: 'flex',
    gap: '8px',
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '18px',
  },
  statChip: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '600',
  },
  compatChip: {
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '600',
  },
  expandedSection: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '18px',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    marginBottom: '16px',
  },
  componentsWrap: {
    marginBottom: '14px',
  },
  sectionLabel: {
    color: 'var(--text-muted)',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '10px',
  },
  compsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '8px',
  },
  compType: {
    color: 'var(--accent)',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  compName: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  notesWrap: {},
  notesText: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.6',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
}

export default BuildsPage