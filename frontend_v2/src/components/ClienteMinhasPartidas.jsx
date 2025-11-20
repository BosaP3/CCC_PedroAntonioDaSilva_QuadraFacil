import React, { useState, useEffect, useCallback } from 'react';
import { getMinhasPartidas, leavePartida } from '../apiService';

export default function ClienteMinhasPartidas({ user }) {
    const [partidas, setPartidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandindo, setExpandindo] = useState(null);

    const formatData = (dataHora) => {
        const date = new Date(dataHora);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + 
               ' às ' + 
               date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const fetchMinhasPartidas = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMinhasPartidas();
            setPartidas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMinhasPartidas();
    }, [fetchMinhasPartidas]);

    const handleSair = async (idPartida) => {
        if (!window.confirm("Tem certeza que deseja sair deste time? Se for o organizador, verifique as regras.")) return;

        try {
            await leavePartida(idPartida);
            alert("Você saiu da partida.");
            fetchMinhasPartidas(); // Atualiza a lista
        } catch (err) {
            alert(`Erro ao sair: ${err.message}`);
        }
    };

    const toggleDetalhes = (id) => {
        setExpandindo(prev => prev === id ? null : id);
    };

    return (
        <div>
            <h3>Minhas Partidas (Confirmadas)</h3>
            {loading && <p>Carregando seus jogos...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <ul className="data-list">
                {partidas.map(partida => {
                    const meuPapel = partida.participantes.find(p => p.id_usuario === user.id_usuario)?.papel;
                    const totalJogadores = partida.participantes.length;

                    return (
                        <li key={partida.id_partida} className="data-list-item" style={{ borderLeft: '5px solid #007bff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <strong>{partida.agendamento.espaco.nome}</strong>
                                    <div style={{ color: '#555' }}>📅 {formatData(partida.agendamento.data_hora)}</div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
                                        Você é: <strong style={{ color: meuPapel === 'organizador' ? '#d63384' : '#007bff' }}>
                                            {meuPapel === 'organizador' ? 'Organizador 👑' : 'Jogador ⚽'}
                                        </strong>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ backgroundColor: '#e9ecef', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>
                                        {totalJogadores} jogadores
                                    </span>
                                </div>
                            </div>

                            <div className="action-buttons" style={{ marginTop: '1rem' }}>
                                <button onClick={() => toggleDetalhes(partida.id_partida)} className="nav-button" style={{ fontSize: '0.8rem' }}>
                                    {expandindo === partida.id_partida ? 'Ocultar Time' : 'Ver Time'}
                                </button>
                                <button onClick={() => handleSair(partida.id_partida)} className="btn-cancel" style={{ fontSize: '0.8rem' }}>
                                    Sair do Jogo
                                </button>
                            </div>

                            {/* Detalhes da Escalação */}
                            {expandindo === partida.id_partida && (
                                <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                    <h5>Escalação:</h5>
                                    <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem' }}>
                                        {partida.participantes.map(p => (
                                            <li key={p.id_usuario}>
                                                {p.usuario.nome} 
                                                {p.papel === 'organizador' && ' (Org)'}
                                                {p.id_usuario === user.id_usuario && ' (Você)'}
                                            </li>
                                        ))}
                                    </ul>
                                    {partida.regras && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                                            <strong>Regras:</strong> {partida.regras}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
                {!loading && partidas.length === 0 && <p>Você não está participando de nenhuma partida no momento.</p>}
            </ul>
        </div>
    );
}