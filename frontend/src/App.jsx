import React from 'react';
// Adicione a extensão .jsx no final do import
import Login from './components/Login.jsx'; 
import './components/Login.css';

function App() {
  return (
    <div className="login-page-wrapper">
      <Login />
    </div>
  );
}

export default App;