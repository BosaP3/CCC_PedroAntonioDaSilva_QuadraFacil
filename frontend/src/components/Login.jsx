import React, { useState } from 'react';
import './Login.css'; // Importa nosso CSS

function Login() {
    // 1. Cria "estados" para guardar o e-mail, senha e mensagens
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // 2. Função que será chamada quando o formulário for enviado
    const handleSubmit = async (event) => {
        event.preventDefault(); // Impede que a página recarregue

        // Limpa mensagens anteriores
        setMessage('');
        setMessageType('');

        // 3. Prepara os dados do formulário
        // A API espera 'form-data' por causa do OAuth2PasswordRequestForm
        const formData = new FormData();
        formData.append('username', email); // O backend espera 'username'
        formData.append('password', password);

        try {
            // 4. Faz a chamada (fetch) para a API
            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            // 5. Verifica se a API retornou um erro
            if (!response.ok) {
                throw new Error(data.detail || "Erro ao fazer login");
            }

            // 6. Sucesso!
            console.log("Token:", data.access_token);
            setMessage("Login realizado com sucesso!");
            setMessageType("success");
            
            // Em um app real, salvaríamos o token
            // localStorage.setItem("accessToken", data.access_token);

        } catch (error) {
            // 7. Falha
            setMessage(error.message);
            setMessageType("error");
        }
    };

    // 8. Este é o HTML (JSX) que o componente vai renderizar
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
                
                {/* Exibe a mensagem de erro ou sucesso */}
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