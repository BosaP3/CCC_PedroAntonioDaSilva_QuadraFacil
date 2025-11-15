import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    try {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Falha no login');
      }

      // Sucesso!
      console.log('Token:', data.access_token);
      localStorage.setItem('quadraFacilToken', data.access_token);
      
      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Login - Quadra Fácil</h2>
      
      {successMessage && <p className="mensagem-sucesso">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      {error && <div className="mensagem-erro">{error}</div>}
      
      <div className="link-alternativo">
        <p>Não tem conta? <Link to="/register">Registre-se</Link></p>
      </div>
    </div>
  );
}