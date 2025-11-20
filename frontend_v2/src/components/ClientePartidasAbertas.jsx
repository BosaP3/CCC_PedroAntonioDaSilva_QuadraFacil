import React, { useState, useEffect, useCallback } from 'react';
import { getPartidasAbertas, joinPartida, leavePartida } from '../apiService';

export default function ClientePartidasAbertas({ user }) {
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
            alert("Você entrou no time!");
            fetchPartidas();
        } catch (err) {
            alert(`Erro ao entrar: ${err.message}`);
        }
    };

    const handleSair = async (idPartida) => {
        if (!window.confirm("Vai abandonar o time?")) return;
        try {
            await leavePartida(idPartida);
            alert("Você saiu da partida.");
            fetchPartidas();
        } catch (err) {
            alert(`Erro ao sair: ${err.message}`);
        }
    };

    const toggleDetalhes = (id) => {
        setExpandindo(prev => prev === id ? null : id);
    };

    return (
        <div>
            <h3>Partidas Abertas (Fecha Time)</h3>
            {loading && <p>Buscando jogos...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <ul className="data-list">
                {partidas.map(partida => {
                    const ocupadas = partida.participantes.length;
                    const total = partida.limite_jogadores;
                    const disponiveis = total - ocupadas;
                    const porcentagem = (ocupadas / total) * 100;

                    const estouDentro = partida.participantes.some(p => p.id_usuario === user.id_usuario);
                    const souOrganizador = partida.participantes.some(p => p.id_usuario === user.id_usuario && p.papel === 'organizador');

                    return (
                        <li key={partida.id_partida} className="data-list-item" style={{ borderLeft: estouDentro ? '5px solid #28a745' : '5px solid #ccc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <strong style={{ fontSize: '1.1rem' }}>{partida.agendamento.espaco.nome}</strong>
                                    <div style={{ color: '#555' }}>📅 {formatData(partida.agendamento.data_hora)}</div>
                                    <div style={{ fontStyle: 'italic', margin: '0.5rem 0' }}>"{partida.descricao}"</div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    {estouDentro && <span style={{ backgroundColor: '#28a745', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', display: 'block', marginBottom: '4px' }}>VOCÊ JOGA</span>}
                                    {disponiveis === 0 && !estouDentro && <span style={{ backgroundColor: '#dc3545', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>LOTADO</span>}
                                </div>
                            </div>

                            <div style={{ margin: '0.5rem 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                                    <span>Jogadores confirmados</span>
                                    <span>{ocupadas}/{total}</span>
                                </div>
                                <div style={{ width: '100%', backgroundColor: '#e9ecef', borderRadius: '4px', height: '8px' }}>
                                    <div style={{ width: `${porcentagem}%`, backgroundColor: disponiveis === 0 ? '#dc3545' : '#007bff', height: '100%', borderRadius: '4px', transition: 'width 0.3s' }}></div>
                                </div>
                            </div>

                            <div className="action-buttons" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                {!estouDentro && disponiveis > 0 && (
                                    <button onClick={() => handleEntrar(partida.id_partida)} className="btn-confirm" style={{ flex: 1 }}>
                                        Bora Jogar! (Entrar)
                                    </button>
                                )}

                                {estouDentro && (
                                    <button onClick={() => handleSair(partida.id_partida)} className="btn-cancel" style={{ flex: 1 }}>
                                        Sair do Time
                                    </button>
                                )}

                                <button onClick={() => toggleDetalhes(partida.id_partida)} className="nav-button" style={{ fontSize: '0.8rem' }}>
                                    {expandindo === partida.id_partida ? '▲' : '▼ Ver Time'}
                                </button>
                            </div>

                            {expandindo === partida.id_partida && (
                                <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                    <h5 style={{ margin: '0 0 0.5rem 0' }}>Escalação:</h5>
                                    <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem' }}>
                                        {partida.participantes.map(p => (
                                            <li key={p.id_usuario} style={{ fontWeight: p.id_usuario === user.id_usuario ? 'bold' : 'normal' }}>
                                                {p.usuario.nome} 
                                                {p.papel === 'organizador' && ' (Dono da Bola 👑)'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    );
                })}
                {!loading && partidas.length === 0 && <p style={{textAlign: 'center', color: '#777'}}>Nenhuma partida aberta. Crie uma nos seus agendamentos!</p>}
            </ul>
        </div>
    );
}