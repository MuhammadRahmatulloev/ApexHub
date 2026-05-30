import { useEffect, useState, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const ChatPage = () => {
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const endRef = useRef(null)

  useEffect(() => {
    api.get('/chat/conversations/')
      .then(res => setConversations(res.data))
      .finally(() => setLoadingConvs(false))
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openConv = async (conv) => {
    setActiveConv(conv)
    const res = await api.get(`/chat/${conv.id}/messages/`)
    setMessages(res.data.messages || [])
  }

  const newConv = async () => {
    const res = await api.post('/chat/new_conversation/')
    setConversations(prev => [res.data, ...prev])
    setActiveConv(res.data)
    setMessages([])
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)

    const tempId = Date.now()
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: text }])

    try {
      const res = await api.post('/chat/send/', {
        message: text,
        conversation_id: activeConv?.id,
      })

      if (!activeConv) {
        const newC = { id: res.data.conversation_id, title: text.slice(0, 50) }
        setActiveConv(newC)
        setConversations(prev => [newC, ...prev])
      }

      setMessages(prev => [...prev, {
        id: tempId + 1,
        role: 'assistant',
        content: res.data.ai_response,
      }])

      setConversations(prev => prev.map(c =>
        c.id === res.data.conversation_id
          ? { ...c, title: c.title === 'New Chat' ? text.slice(0, 50) : c.title }
          : c
      ))
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
    setSending(false)
  }

  const deleteConv = async (id, e) => {
    e.stopPropagation()
    await api.delete(`/chat/${id}/delete_conversation/`)
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeConv?.id === id) {
      setActiveConv(null)
      setMessages([])
    }
  }

  return (
    <Layout fullWidth>
      <div style={s.layout}>
        <aside style={s.sidebar}>
          <div style={s.sidebarTop}>
            <h2 style={s.sidebarTitle}>AI Chat</h2>
            <button style={s.newBtn} onClick={newConv}>+ New</button>
          </div>
          <div style={s.convList}>
            {loadingConvs ? (
              <p style={s.sidebarMuted}>Loading...</p>
            ) : conversations.length === 0 ? (
              <p style={s.sidebarMuted}>No chats yet</p>
            ) : conversations.map(c => (
              <div
                key={c.id}
                style={activeConv?.id === c.id ? s.convActive : s.conv}
                onClick={() => openConv(c)}
              >
                <span style={s.convTitle}>{c.title || 'New Chat'}</span>
                <button style={s.delBtn} onClick={(e) => deleteConv(c.id, e)}>✕</button>
              </div>
            ))}
          </div>
        </aside>

        <div style={s.chatArea}>
          {!activeConv ? (
            <div style={s.welcome}>
              <div style={s.welcomeIcon}>🤖</div>
              <h2 style={s.welcomeTitle}>ApexHub AI Assistant</h2>
              <p style={s.welcomeSub}>Ask me anything about PCs, laptops and components</p>
              <div style={s.suggestions}>
                {[
                  'Best gaming PC under $1000?',
                  'Compare RTX 4070 vs RX 7800 XT',
                  'What RAM do I need for video editing?',
                ].map(q => (
                  <button key={q} style={s.suggBtn} onClick={() => { setInput(q) }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={s.messages}>
              {messages.map(msg => (
                <div key={msg.id} style={msg.role === 'user' ? s.userRow : s.aiRow}>
                  {msg.role === 'assistant' && <div style={s.aiAvatar}>AI</div>}
                  <div style={msg.role === 'user' ? s.userBubble : s.aiBubble}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div style={s.aiRow}>
                  <div style={s.aiAvatar}>AI</div>
                  <div style={s.aiBubble}>
                    <span style={s.typing}>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}

          <div style={s.inputBar}>
            <input
              style={s.input}
              placeholder="Ask about PCs, laptops, components..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <button
              style={sending || !input.trim() ? s.sendBtnOff : s.sendBtn}
              onClick={sendMessage}
              disabled={sending || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const s = {
  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', height: 'calc(100vh - 60px)', background: 'var(--bg)' },
  sidebar: { background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  sidebarTop: { padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sidebarTitle: { color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600' },
  newBtn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: '600' },
  convList: { flex: 1, overflowY: 'auto', padding: '8px' },
  sidebarMuted: { color: 'var(--text-muted)', fontSize: '13px', padding: '12px 8px' },
  conv: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px' },
  convActive: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px', background: 'var(--bg-hover)', border: '1px solid var(--border)' },
  convTitle: { color: 'var(--text-primary)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  delBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', padding: '2px 6px', flexShrink: 0 },
  chatArea: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  welcome: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px' },
  welcomeIcon: { fontSize: '48px' },
  welcomeTitle: { color: 'var(--text-primary)', fontSize: '22px', fontWeight: '600' },
  welcomeSub: { color: 'var(--text-secondary)', fontSize: '15px' },
  suggestions: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', width: '100%', maxWidth: '440px' },
  suggBtn: { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', textAlign: 'left' },
  messages: { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  userRow: { display: 'flex', justifyContent: 'flex-end' },
  aiRow: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  aiAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' },
  userBubble: { background: 'var(--accent)', color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 16px', maxWidth: '65%', fontSize: '14px', lineHeight: '1.5' },
  aiBubble: { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px 16px 16px 16px', padding: '10px 16px', maxWidth: '65%', fontSize: '14px', lineHeight: '1.5' },
  typing: { color: 'var(--text-muted)', fontStyle: 'italic' },
  inputBar: { padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', background: 'var(--bg-secondary)' },
  input: { flex: 1, background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '11px 14px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' },
  sendBtn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 20px', fontWeight: '600', fontSize: '14px' },
  sendBtnOff: { background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '11px 20px', fontSize: '14px', cursor: 'not-allowed' },
}

export default ChatPage