// src/components/ClientePartidasAbertas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getPartidasAbertas, joinPartida } from '../apiService';

export default function ClientePartidasAbertas() {
    const [partidas, setPartidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatData = (dataHora) => new Date(dataHora).toLocaleString('pt-BR');

    const fetchPartidas = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPartidasAbertas(); //
            setPartidas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPartidas();
    }, [fetchPartidas]);

    const handleEntrar = async (idPartida) => {
        try {
            await joinPartida(idPartida);
            alert('Você entrou na partida!');
            fetchPartidas(); 
        } catch (err) {
            alert(`Erro ao entrar: ${err.message}`);
        }
    };

    return (
        <div>
            <h3>Partidas Abertas (Fecha Time)</h3>
            {loading && <p>Carregando partidas...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <ul className="data-list">
                {partidas.length > 0 ? (
                    partidas.map(partida => {
                        const vagasPreenchidas = partida.participantes.length;
                        const vagasTotais = partida.limite_jogadores;
                        const vagasAbertas = vagasTotais - vagasPreenchidas;

                        return (
                            <li key={partida.id_partida} className="data-list-item">
                                <strong>{partida.agendamento.espaco.nome}</strong>
                                <div><strong>Quando:</strong> {formatData(partida.agendamento.data_hora)}</div>
                                <div><strong>Descrição:</strong> {partida.descricao || 'Sem descrição'}</div>
                                <div><strong>Local:</strong> {partida.agendamento.espaco.endereco}</div>
                                <div>
                                    <strong>Vagas:</strong> 
                                    {vagasPreenchidas} / {vagasTotais} 
                                    ({vagasAbertas} restantes)
                                </div>
                                <button 
                                    onClick={() => handleEntrar(partida.id_partida)}
                                    className="btn-confirm"
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    Entrar na Partida
                                </button>
                            </li>
                        );
                    })
                ) : (
                    !loading && <p>Nenhuma partida aberta no momento.</p>
                )}
            </ul>
        </div>
    );
}