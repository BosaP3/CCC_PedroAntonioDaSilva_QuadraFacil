import React, { useState } from 'react';
import './Auth.css';

// Recebe a função toggleView como uma propriedade (prop)
function Register({ toggleView }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [password, setPassword] = useState('');
    const [tipoPerfil, setTipoPerfil] = useState('atleta'); 
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); 

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setMessageType('');

        const userData = {
            nome: nome,
            email: email,
            telefone: telefone || null,
            password: password,
            tipo_perfil: tipoPerfil
        };

        try {
            const response = await fetch("http://localhost:8000/auth/cadastro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = data.detail || "Erro desconhecido ao registrar.";
                 if (response.status === 409) { // Assumindo que 409 é usado para conflito de email
                    errorMessage = data.detail.includes("IntegrityError") ? "Este email já está cadastrado." : data.detail;
                 }
                throw new Error(errorMessage);
            }

            setMessage("Usuário registrado com sucesso! Você já pode fazer login.");
            setMessageType("success");
            setNome('');
            setEmail('');
            setTelefone('');
            setPassword('');
            setTipoPerfil('atleta');

        } catch (error) {
            setMessage(error.message);
            setMessageType("error");
        }
    };

    return (
        <div className="auth-container">
            <form id="register-form" onSubmit={handleSubmit}>
                <h2>Criar Conta</h2>

                <div className="input-group">
                    <label htmlFor="nome">Nome Completo</label>
                    <input
                        type="text"
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="telefone">Telefone (Opcional)</label>
                    <input
                        type="tel"
                        id="telefone"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Senha</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="tipoPerfil">Tipo de Perfil</label>
                    <select
                        id="tipoPerfil"
                        value={tipoPerfil}
                        onChange={(e) => setTipoPerfil(e.target.value)}
                        required
                    >
                        <option value="atleta">Atleta</option>
                        <option value="organizador">Organizador</option>
                        <option value="dono">Dono de Espaço</option>
                    </select>
                </div>

                <button type="submit">Registrar</button>

                {message && (
                    <p id="message" className={messageType}>
                        {message}
                    </p>
                )}

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button type="button" onClick={toggleView} className="toggle-button">
                        Já tem uma conta? Faça Login
                    </button>
                </div>

            </form>
        </div>
    );
}

export default Register;