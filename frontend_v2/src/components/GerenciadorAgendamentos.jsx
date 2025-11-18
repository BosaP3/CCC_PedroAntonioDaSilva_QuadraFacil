import React, { useState, useEffect, useCallback } from 'react';
import { getAgendamentosDono, confirmarAgendamento, cancelarAgendamento } from '../apiService';

export default function GerenciadorAgendamentos() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatData = (dataHora) => new Date(dataHora).toLocaleString('pt-BR');

    const fetchAgendamentos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAgendamentosDono(); //
            setAgendamentos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgendamentos();
    }, [fetchAgendamentos]);

    const updateLocalStatus = (id, novoStatus) => {
        setAgendamentos(agendamentosAtuais => 
            agendamentosAtuais.map(ag => 
                ag.id_agendamento === id ? { ...ag, status: novoStatus } : ag
            )
        );
    };

    const handleConfirmar = async (id) => {
        try {
            const agendamentoAtualizado = await confirmarAgendamento(id); //
            updateLocalStatus(id, agendamentoAtualizado.status);
        } catch (err) {
            alert(`Erro ao confirmar: ${err.message}`);
        }
    };

    const handleCancelar = async (id) => {
        try {
            const agendamentoAtualizado = await cancelarAgendamento(id); //
            updateLocalStatus(id, agendamentoAtualizado.status);
        } catch (err) {
            alert(`Erro ao cancelar: ${err.message}`);
        }
    };

    return (
        <div>
            {loading && <p>Carregando agendamentos...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <ul className="data-list">
                {agendamentos.length > 0 ? (
                    agendamentos.map(ag => (
                        <li key={ag.id_agendamento} className="data-list-item">
                            <div>Cliente: <strong>{ag.usuario.nome}</strong></div>
                            <div>Espaço: <strong>{ag.espaco.nome}</strong></div>
                            <div>Data: {formatData(ag.data_hora)}</div>
                            <div>Status: <strong>{ag.status}</strong></div>

                            {ag.status === 'pendente' && (
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleConfirmar(ag.id_agendamento)}
                                        className="btn-confirm"
                                    >
                                        Confirmar
                                    </button>
                                    <button 
                                        onClick={() => handleCancelar(ag.id_agendamento)}
                                        className="btn-cancel"
                                    >
                                        Cancelar
                                    </button>
                                    
                                </div>
                                
                            )}
                        </li>
                    ))
                ) : (
                    !loading && <p>Nenhum agendamento encontrado para seus espaços.</p>
                )}
            </ul>
        </div>
    );
}