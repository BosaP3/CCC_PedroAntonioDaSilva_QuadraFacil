import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('cliente'); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      nome: nome,
      email: email,
      password: password,
      tipo_usuario: tipoUsuario,
    };

    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Falha ao registrar');
      }

      navigate('/login', { 
        state: { message: 'Registro bem-sucedido! Faça o login.' } 
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Criar Conta - Quadra Fácil</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
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
        <div>
          <label htmlFor="tipo_usuario">Eu sou:</label>
          {/* Baseado no DVP (Dono de espaço / Atleta) [cite: 41] */}
          <select
            id="tipo_usuario"
            value={tipoUsuario}
            onChange={(e) => setTipoUsuario(e.target.value)}
            required
          >
            <option value="cliente">Cliente / Jogador</option>
            <option value="dono">Dono de Espaço</option>
          </select>
        </div>
        <button type="submit" className="btn-register" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      
      {error && <div className="mensagem-erro">{error}</div>}
      
      <div className="link-alternativo">
        <p>Já tem conta? <Link to="/login">Faça login</Link></p>
      </div>
    </div>
  );
}