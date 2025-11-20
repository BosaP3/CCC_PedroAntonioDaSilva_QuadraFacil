import React from 'react';

export default function Navbar({ user, currentView, setView, menuItems }) {
  const handleLogout = () => {
    localStorage.removeItem('quadraFacilToken');
    window.location.href = '/login';
  };

  const handleLogoClick = () => {
    if (menuItems && menuItems.length > 0) {
      setView(menuItems[0].key);
    }
  };

  return (
    <nav className="navbar">
      <div 
        className="logo" 
        onClick={handleLogoClick}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        title="Voltar ao Início"
      >
        Quadra Fácil ⚽
      </div>
      
      <div className="nav-links">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={`nav-btn ${currentView === item.key ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
        <button onClick={handleLogout} className="nav-btn" style={{color: '#dc3545'}}>
          Sair
        </button>
      </div>
    </nav>
  );
}