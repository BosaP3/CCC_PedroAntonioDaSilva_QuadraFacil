import React, { useState } from 'react';
import './Auth.css';

// Recebe a função toggleView como uma propriedade (prop)
function Login({ toggleView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setMessageType('');

        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const response = await fetch("http://localhost:8000/token/", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Erro ao fazer login");
            }

            console.log("Token:", data.access_token);
            setMessage("Login realizado com sucesso!");
            setMessageType("success");
            // localStorage.setItem("accessToken", data.access_token);

        } catch (error) {
            setMessage(error.message);
            setMessageType("error");
        }
    };

    return (
        <div className="auth-container">
            <form id="login-form" onSubmit={handleSubmit}>
                <h2>Login Quadra Fácil</h2>

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
                    <label htmlFor="password">Senha</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Entrar</button>
                {message && (
                    <p id="message" className={messageType}>
                        {message}
                    </p>
                )}

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button type="button" onClick={toggleView} className="toggle-button">
                        Não tem uma conta? Registre-se
                    </button>
                </div>

            </form>
        </div>
    );
}

export default Login;