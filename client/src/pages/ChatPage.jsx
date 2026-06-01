import { useEffect, useState, useRef, useCallback } from 'react'
import { marked } from 'marked'
import Layout from '../components/Layout'
import api from '../api/axios'

marked.setOptions({ breaks: true, gfm: true })

const MarkdownContent = ({ content }) => (
  <div
    className="markdown-body"
    dangerouslySetInnerHTML={{ __html: marked.parse(content || '') }}
  />
)

const SUGGESTIONS = [
  'Best gaming PC under $1000?',
  'Compare RTX 4070 vs RX 7800 XT',
  'What RAM do I need for video editing?',
  'Best SSD for 2026?',
]

export default function ChatPage() {
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    api.get('/chat/conversations/')
      .then(res => setConversations(res.data))
      .catch(() => {})
      .finally(() => setLoadingConvs(false))
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const openConv = useCallback(async (conv) => {
    if (loadingMsgs) return
    setActiveConvId(conv.id)
    setMessages([])
    setLoadingMsgs(true)
    try {
      const res = await api.get(`/chat/${conv.id}/messages/`)
      setMessages(res.data.messages || [])
    } catch {}
    setLoadingMsgs(false)
    inputRef.current?.focus()
  }, [loadingMsgs])

  const newConv = async () => {
    try {
      const res = await api.post('/chat/new_conversation/')
      setConversations(prev => [res.data, ...prev])
      setActiveConvId(res.data.id)
      setMessages([])
      inputRef.current?.focus()
    } catch {}
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || sending) return

    setInput('')
    setSending(true)

    const tempUserMsg = { id: `temp_${Date.now()}`, role: 'user', content: text }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const res = await api.post('/chat/send/', {
        message: text,
        conversation_id: activeConvId || null,
      })

      const convId = res.data.conversation_id

      if (!activeConvId) {
        const newC = { id: convId, title: text.length > 50 ? text.slice(0, 50) + '...' : text }
        setConversations(prev => [newC, ...prev])
        setActiveConvId(convId)
      } else {
        setConversations(prev => prev.map(c =>
          c.id === convId && c.title === 'New Chat'
            ? { ...c, title: text.length > 50 ? text.slice(0, 50) + '...' : text }
            : c
        ))
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: res.data.ai_response,
        }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          isError: true,
        }
      ])
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const deleteConv = async (id, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/chat/${id}/delete_conversation/`)
      setConversations(prev => prev.filter(c => c.id !== id))
      if (activeConvId === id) {
        setActiveConvId(null)
        setMessages([])
      }
    } catch {}
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const hasActiveChat = activeConvId !== null || messages.length > 0

  return (
    <Layout fullWidth>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .conv-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 2px;
          transition: background 0.15s;
          gap: 6px;
        }
        .conv-item:hover { background: var(--bg-hover); }
        .conv-item:hover .conv-del { opacity: 1; }
        .conv-item-active {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 2px;
          background: var(--bg-active);
          border: 1px solid var(--border);
          gap: 6px;
        }
        .conv-item-active .conv-del { opacity: 1; }
        .conv-del {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 13px;
          padding: 2px 5px;
          cursor: pointer;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.15s, color 0.15s, background 0.15s;
          flex-shrink: 0;
          line-height: 1;
        }
        .conv-del:hover { color: var(--danger); background: rgba(248,113,113,0.1); }
        .send-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0 18px;
          height: 40px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }
        .send-btn:disabled {
          background: var(--bg-hover);
          color: var(--text-muted);
          cursor: not-allowed;
        }
        .sugg-btn {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 10px;
          padding: 11px 18px;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          width: 100%;
        }
        .sugg-btn:hover {
          border-color: var(--accent);
          color: var(--text-primary);
          background: var(--accent-dim);
        }
        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
          resize: none;
          height: 40px;
          line-height: 40px;
          padding: 0;
        }
        .chat-input::placeholder { color: var(--text-secondary); }
        .new-conv-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 7px;
          padding: 6px 13px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .new-conv-btn:hover { background: var(--accent-hover); }
      `}</style>

      <div style={s.layout}>
        <aside style={s.sidebar}>
          <div style={s.sidebarTop}>
            <span style={s.sidebarTitle}>Chats</span>
            <button className="new-conv-btn" onClick={newConv}>+ New</button>
          </div>

          <div style={s.convList}>
            {loadingConvs ? (
              <div style={s.sidebarLoading}>
                {[1,2,3].map(i => <div key={i} style={{ ...s.convSkeleton, animationDelay: `${i * 0.1}s` }} />)}
              </div>
            ) : conversations.length === 0 ? (
              <p style={s.sidebarEmpty}>No chats yet</p>
            ) : conversations.map(c => (
              <div
                key={c.id}
                className={activeConvId === c.id ? 'conv-item-active' : 'conv-item'}
                onClick={() => openConv(c)}
              >
                <div style={s.convIcon}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M10 1H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1l1 2 1-2h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
                  </svg>
                </div>
                <span style={s.convTitle}>{c.title || 'New Chat'}</span>
                <button className="conv-del" onClick={(e) => deleteConv(c.id, e)}>✕</button>
              </div>
            ))}
          </div>
        </aside>

        <div style={s.chatArea}>
          {!hasActiveChat ? (
            <div style={s.welcome}>
              <div style={s.welcomeIconWrap}>
                <svg width="32" height="32" fill="none" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="28" height="20" rx="4"/>
                  <circle cx="11" cy="14" r="3"/>
                  <circle cx="21" cy="14" r="3"/>
                  <path d="M8 24v2M24 24v2M14 24h4"/>
                </svg>
              </div>
              <h2 style={s.welcomeTitle}>ApexHub AI Assistant</h2>
              <p style={s.welcomeSub}>Ask me anything about PCs, laptops and components</p>
              <div style={s.suggestions}>
                {SUGGESTIONS.map(q => (
                  <button key={q} className="sugg-btn" onClick={() => { setInput(q); inputRef.current?.focus() }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={s.messages}>
              {loadingMsgs ? (
                <div style={s.msgsLoading}>
                  {[1,2,3].map(i => <div key={i} style={{ ...s.msgSkeleton, alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start', width: i % 2 === 0 ? '40%' : '60%' }} />)}
                </div>
              ) : messages.length === 0 ? (
                <div style={s.emptyConv}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Start the conversation</p>
                </div>
              ) : messages.map((msg, i) => (
                <div
                  key={msg.id}
                  style={{
                    ...msg.role === 'user' ? s.userRow : s.aiRow,
                    animation: `msgIn 0.25s ease ${Math.min(i * 0.03, 0.3)}s both`,
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={msg.isError ? s.aiAvatarErr : s.aiAvatar}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="2" width="12" height="9" rx="2"/>
                        <circle cx="4.5" cy="6.5" r="1.2"/>
                        <circle cx="9.5" cy="6.5" r="1.2"/>
                        <path d="M3 11v1.5M11 11v1.5M5.5 11h3"/>
                      </svg>
                    </div>
                  )}
                  <div style={msg.role === 'user' ? s.userBubble : msg.isError ? s.errBubble : s.aiBubble}>
                    {msg.role === 'assistant'
                      ? <MarkdownContent content={msg.content} />
                      : msg.content
                    }
                  </div>
                </div>
              ))}

              {sending && (
                <div style={s.aiRow}>
                  <div style={s.aiAvatar}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="2" width="12" height="9" rx="2"/>
                      <circle cx="4.5" cy="6.5" r="1.2"/>
                      <circle cx="9.5" cy="6.5" r="1.2"/>
                      <path d="M3 11v1.5M11 11v1.5M5.5 11h3"/>
                    </svg>
                  </div>
                  <div style={s.aiBubble}>
                    <div style={s.typingDots}>
                      <span style={{ ...s.dot, animationDelay: '0s' }} />
                      <span style={{ ...s.dot, animationDelay: '0.16s' }} />
                      <span style={{ ...s.dot, animationDelay: '0.32s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}

          <div style={s.inputBar}>
            <div style={s.inputWrap}>
              <input
                ref={inputRef}
                className="chat-input"
                placeholder="Ask about PCs, laptops, components..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={sending || !input.trim()}
              >
                {sending ? (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="7" cy="7" r="6" strokeOpacity="0.3"/>
                    <path d="M7 1a6 6 0 0 1 6 6" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur="0.8s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                ) : 'Send'}
              </button>
            </div>
            <p style={s.inputHint}>Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const s = {
  layout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    height: 'calc(100vh - 56px)',
    background: 'var(--bg)',
  },
  sidebar: {
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarTop: {
    padding: '14px 12px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sidebarTitle: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '600',
  },
  convList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  sidebarLoading: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '4px',
  },
  convSkeleton: {
    height: '36px',
    borderRadius: '8px',
    background: 'var(--bg-hover)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  sidebarEmpty: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    padding: '12px 8px',
    textAlign: 'center',
  },
  convIcon: {
    color: 'var(--text-muted)',
    flexShrink: 0,
    display: 'flex',
  },
  convTitle: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  chatArea: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  welcome: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    padding: '40px',
    animation: 'fadeUp 0.4s ease both',
  },
  welcomeIconWrap: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  welcomeTitle: {
    color: 'var(--text-primary)',
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
  },
  welcomeSub: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  suggestions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    maxWidth: '420px',
    marginTop: '4px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  msgsLoading: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  msgSkeleton: {
    height: '48px',
    borderRadius: '12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  emptyConv: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  aiRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  aiAvatarErr: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.2)',
    color: 'var(--danger)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  userBubble: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '16px 16px 4px 16px',
    padding: '10px 16px',
    maxWidth: '65%',
    fontSize: '14px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  aiBubble: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '4px 16px 16px 16px',
    padding: '12px 16px',
    maxWidth: '72%',
    fontSize: '14px',
    lineHeight: '1.6',
    wordBreak: 'break-word',
  },
  errBubble: {
    background: 'rgba(248,113,113,0.06)',
    border: '1px solid rgba(248,113,113,0.2)',
    color: 'var(--danger)',
    borderRadius: '4px 16px 16px 16px',
    padding: '12px 16px',
    maxWidth: '72%',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  typingDots: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    padding: '2px 0',
  },
  dot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--text-muted)',
    animation: 'dotPulse 1.2s ease infinite',
  },
  inputBar: {
    padding: '12px 16px 14px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
  },
  inputWrap: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '0 6px 0 14px',
    transition: 'border-color 0.15s',
  },
  inputHint: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    marginTop: '6px',
    textAlign: 'center',
  },
}