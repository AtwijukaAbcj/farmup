// FarmUp Navigation Bar
export function Navbar({ user, activePage, onNavigate, onLogout }) {
  return (
    <nav style={{
      background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
      padding: '0.75rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Logo */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        onClick={() => onNavigate('home')}
      >
        <span style={{ fontSize: '1.75rem' }}>🌾</span>
        <span style={{ color: 'white', fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.5px' }}>FarmUp</span>
      </div>
      
      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <NavButton active={activePage === 'home'} onClick={() => onNavigate('home')}>
          Home
        </NavButton>
        <NavButton active={activePage === 'marketplace'} onClick={() => onNavigate('marketplace')}>
          Marketplace
        </NavButton>
        
        {user ? (
          <>
            <NavButton active={activePage === 'dashboard'} onClick={() => onNavigate('dashboard')}>
              Dashboard
            </NavButton>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginLeft: '0.5rem',
              paddingLeft: '0.75rem',
              borderLeft: '1px solid rgba(255,255,255,0.3)'
            }}>
              <span style={{ 
                color: 'white', 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize'
                }}>
                  {user.role}
                </span>
                {user.username}
              </span>
              <button 
                onClick={onLogout}
                style={{
                  background: '#d32f2f',
                  border: 'none',
                  color: 'white',
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#b71c1c'}
                onMouseOut={(e) => e.target.style.background = '#d32f2f'}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <NavButton active={activePage === 'login'} onClick={() => onNavigate('login')} highlight>
              Login
            </NavButton>
            <NavButton active={activePage === 'register'} onClick={() => onNavigate('register')} primary>
              Register
            </NavButton>
          </>
        )}
      </div>
    </nav>
  );
}

function NavButton({ children, active, onClick, highlight, primary }) {
  const baseStyle = {
    background: active 
      ? 'rgba(255,255,255,0.25)' 
      : primary 
        ? '#fff' 
        : 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: primary ? '#2e7d32' : 'white',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: primary ? '600' : '500',
    transition: 'all 0.2s ease'
  };
  
  return (
    <button
      onClick={onClick}
      style={baseStyle}
      onMouseOver={(e) => {
        if (primary) {
          e.target.style.background = '#e8f5e9';
        } else {
          e.target.style.background = 'rgba(255,255,255,0.25)';
        }
      }}
      onMouseOut={(e) => {
        if (active) {
          e.target.style.background = 'rgba(255,255,255,0.25)';
        } else if (primary) {
          e.target.style.background = '#fff';
        } else {
          e.target.style.background = 'rgba(255,255,255,0.1)';
        }
      }}
    >
      {children}
    </button>
  );
}
