// src/components/GerenciadorAgendamentos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAgendamentosDono, confirmarAgendamento, cancelarAgendamento } from '../apiService';

export default function GerenciadorAgendamentos() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatData = (dataHora) => new Date(dataHora).toLocaleString('pt-BR');

    // Função para buscar os agendamentos
    const fetchAgendamentos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAgendamentosDono();
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
            const agendamentoAtualizado = await confirmarAgendamento(id);
            updateLocalStatus(id, agendamentoAtualizado.status);
        } catch (err) {
            alert(`Erro ao confirmar: ${err.message}`);
        }
    };

    const handleCancelar = async (id) => {
        // Adicionamos uma confirmação simples para evitar cliques acidentais
        if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
            return;
        }

        try {
            const agendamentoAtualizado = await cancelarAgendamento(id);
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

                            {/* --- AQUI ESTÁ A MUDANÇA --- */}
                            <div className="action-buttons">
                                {/* Botão Confirmar: Apenas para PENDENTE */}
                                {ag.status === 'pendente' && (
                                    <button 
                                        onClick={() => handleConfirmar(ag.id_agendamento)}
                                        className="btn-confirm"
                                    >
                                        Confirmar
                                    </button>
                                )}

                                {/* Botão Cancelar: Para PENDENTE ou CONFIRMADO */}
                                {(ag.status === 'pendente' || ag.status === 'confirmado') && (
                                    <button 
                                        onClick={() => handleCancelar(ag.id_agendamento)}
                                        className="btn-cancel"
                                    >
                                        Cancelar Agendamento
                                    </button>
                                )}
                            </div>
                             {/* --- FIM DA MUDANÇA --- */}
                        </li>
                    ))
                ) : (
                    !loading && <p>Nenhum agendamento encontrado para seus espaços.</p>
                )}
            </ul>
        </div>
    );
}