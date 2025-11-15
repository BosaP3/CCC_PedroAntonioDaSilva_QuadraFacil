// src/pages/DashboardCliente.jsx
import React, { useState, useEffect } from 'react';
import { getMeusAgendamentos } from '../apiService';

export default function DashboardCliente({ user }) {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAgendamentos = async () => {
            try {
                const data = await getMeusAgendamentos();
                setAgendamentos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAgendamentos();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('quadraFacilToken');
        window.location.href = '/login';
    };

    const formatData = (dataHora) => {
        return new Date(dataHora).toLocaleString('pt-BR');
    };

    return (
        <div className="container">
            <div className="dashboard-header">
                <h2>Olá, {user.nome}! (Cliente)</h2>
                <button onClick={handleLogout} className="logout-btn">Sair</button>
            </div>
            <p>Meus agendamentos (Módulo de Agendamento):</p>
            
            {loading && <p>Carregando agendamentos...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <ul className="data-list">
                {agendamentos.length > 0 ? (
                    agendamentos.map(ag => (
                        <li key={ag.id_agendamento} className="data-list-item">
                            <strong>{ag.espaco.nome}</strong>
                            <div>{formatData(ag.data_hora)}</div>
                            <div>Status: <strong>{ag.status}</strong></div>
                        </li>
                    ))
                ) : (
                    !loading && <p>Você ainda não fez nenhum agendamento.</p>
                )}
            </ul>
        </div>
    );
}