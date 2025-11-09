import React, { useState } from 'react';
import './Auth.css';

// Recebe a função toggleView como uma propriedade (prop)
function Register({ toggleView }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    // const [telefone, setTelefone] = useState(''); // REMOVIDO: Este campo não existe no schema UserCreate da API
    const [password, setPassword] = useState('');
    const [tipoPerfil, setTipoPerfil] = useState('cliente'); // MUDADO: O padrão agora é 'cliente'
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); 

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setMessageType('');

        const userData = {
            nome: nome,
            email: email,
            // telefone: telefone || null, // REMOVIDO
            password: password,
            tipo_usuario: tipoPerfil // CORREÇÃO: A API espera 'tipo_usuario', não 'tipo_perfil'
        };

        try {
            // CORREÇÃO: A URL da sua API para criar usuários é /users/, não /auth/cadastro
            const response = await fetch("http://localhost:8000/users/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            }); // <-- O fetch() termina aqui

            // CORREÇÃO: A linha 'const data' estava no lugar errado (dentro do objeto de opções do fetch)
            const data = await response.json();

            if (!response.ok) {
                let errorMessage = data.detail || "Erro desconhecido ao registrar.";
                 if (response.status === 409) { 
                     // A lógica de 409 (Conflito) do api/users.py está correta
                     errorMessage = data.detail;
                 }
                 if (response.status === 422) { // Erro de Validação (ex: email inválido, senha curta)
                    // Pydantic v2+ aninha erros em 'detail'
                    if (Array.isArray(data.detail)) {
                        errorMessage = data.detail.map(err => err.msg).join(' ');
                    } else {
                        errorMessage = data.detail[0].msg || "Dados inválidos.";
                    }
                 }
                throw new Error(errorMessage);
            }

            setMessage("Usuário registrado com sucesso! Você já pode fazer login.");
            setMessageType("success");
            setNome('');
            setEmail('');
            // setTelefone(''); // REMOVIDO
            setPassword('');
            setTipoPerfil('cliente'); // MUDADO: O padrão é 'cliente'

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

                {/* O campo Telefone foi removido pois não está no schema 'UserCreate' da API.
                  Se você precisar dele, ele deve ser adicionado primeiro ao 'models/user.py' 
                  e ao 'schemas/user.py' no backend.
                */}

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
                        {/* CORREÇÃO: Os valores devem bater com o Enum 'TipoUsuario' da API */}
                        <option value="cliente">Cliente (Atleta)</option>
                        <option value="dono">Dono de Espaço</option>
                        {/* O 'admin' é criado manualmente ou por outra lógica, não no registro público */}
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