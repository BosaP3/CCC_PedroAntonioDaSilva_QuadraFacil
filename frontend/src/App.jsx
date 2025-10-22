import React, { useState } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import './components/Auth.css';

function App() {
  const [currentView, setCurrentView] = useState('login');

  const toggleView = () => {
    setCurrentView(currentView === 'login' ? 'register' : 'login');
  };

  return (
    <div className="auth-page-wrapper">

        {currentView === 'login' ? (
            <Login toggleView={toggleView} />
        ) : (
            <Register toggleView={toggleView} />
        )}

    </div>
  );
}

export default App;