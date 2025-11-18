
import React, { useState, useEffect } from 'react';
import { getMeusAgendamentos } from '../apiService'; 

export default function ClienteMeusAgendamentos() {
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

    const formatData = (dataHora) => {
        return new Date(dataHora).toLocaleString('pt-BR');
    };

    return (
        <div>
            <h3>Meus Agendamentos</h3>
            {loading && <p>Carregando agendamentos...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <ul className="data-list">
                {agendamentos.length > 0 ? (
                    agendamentos.map(ag => (
                        <li key={ag.id_agendamento} className="data-list-item">
                            <strong>{ag.espaco.nome}</strong>
                            <div>{formatData(ag.data_hora)}</div>
                            <div>Status: <strong>{ag.status}</strong></div>
                            <div>Dono: {ag.espaco.dono.nome}</div>
                        </li>
                    ))
                ) : (
                    !loading && <p>Você ainda não fez nenhum agendamento.</p>
                )}
            </ul>
        </div>
    );
}