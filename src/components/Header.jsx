import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🔬</span>
          <h1>BioScan</h1>
        </div>
        <p className="tagline">AI-Powered Protocol Validation</p>
      </div>
    </header>
  )
}

export default Header
