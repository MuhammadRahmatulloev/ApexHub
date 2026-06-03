import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'ru', label: 'RU', full: 'Русский' },
  { code: 'tj', label: 'TJ', full: 'Тоҷикӣ' },
]

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2) || 'en'
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const change = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('i18nextLng', code)
    setOpen(false)
  }

  const currentLang = LANGUAGES.find(l => l.code === current) || LANGUAGES[0]

  return (
    <div ref={ref} style={s.wrap}>
      <button onClick={() => setOpen(p => !p)} style={s.trigger}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        {currentLang.label}
        <svg
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          viewBox="0 0 24 24"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div style={s.dropdown}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => change(lang.code)}
              style={{
                ...s.option,
                ...(current === lang.code ? s.optionActive : {}),
              }}
            >
              <span style={s.optionCode}>{lang.label}</span>
              <span style={s.optionFull}>{lang.full}</span>
              {current === lang.code && (
                <svg width="13" height="13" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: {
    position: 'relative',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
    letterSpacing: '0.3px',
    height: '32px',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
    minWidth: '140px',
    zIndex: 999,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '9px 14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
    color: 'var(--text-primary)',
  },
  optionActive: {
    background: 'var(--accent-dim)',
  },
  optionCode: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--accent)',
    minWidth: '24px',
  },
  optionFull: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
}

export default LanguageSwitcher