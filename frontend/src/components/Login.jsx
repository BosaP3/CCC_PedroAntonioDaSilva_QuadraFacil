import React, { useState } from 'react';
import './Login.css'; // Importa nosso CSS

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault(); // Impede que a página recarregue

        setMessage('');
        setMessageType('');

        const formData = new FormData();
        formData.append('username', email); // backend -> 'username'
        formData.append('password', password);

        try {
            // (fetch) para a API
            const response = await fetch("http://localhost:8000/auth/login", {
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
            
            // TODO: salvar o token
            // localStorage.setItem("accessToken", data.access_token);

        } catch (error) {
            setMessage(error.message);
            setMessageType("error");
        }
    };

    // HTML (JSX) componente
    return (
        <div className="login-container">
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
                
                {/* mensagem de erro ou sucesso */}
                {message && (
                    <p id="message" className={messageType}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}

export default Login;