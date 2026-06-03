import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({ children, fullWidth = false }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <main style={{
      maxWidth: fullWidth ? '100%' : '1280px',
      margin: '0 auto',
      padding: fullWidth ? '0' : '32px 24px',
      flex: 1,
      width: '100%',
    }}>
      {children}
    </main>
    {!fullWidth && <Footer />}
  </div>
)

export default Layout