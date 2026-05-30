import Navbar from './Navbar'

const Layout = ({ children, fullWidth = false }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
    <Navbar />
    <main style={{
      maxWidth: fullWidth ? '100%' : '1280px',
      margin: '0 auto',
      padding: fullWidth ? '0' : '32px 24px',
    }}>
      {children}
    </main>
  </div>
)

export default Layout