import React, { useState, useEffect, useCallback } from 'react';
import { getPartidasAbertas, joinPartida, leavePartida } from '../apiService';

export default function ClientePartidasAbertas({ user }) {
    const [partidas, setPartidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandindo, setExpandindo] = useState(null);

    const formatData = (dataHora) => {
        const d = new Date(dataHora);
        return `${d.toLocaleDateString('pt-BR')} - ${d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    };

    const fetchPartidas = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPartidasAbertas(); 
            setPartidas(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPartidas(); }, [fetchPartidas]);

    const handleEntrar = async (id) => {
        try { await joinPartida(id); alert("Entrou!"); fetchPartidas(); } 
        catch (err) { alert(err.message); }
    };

    const handleSair = async (id) => {
        if(!window.confirm("Sair do time?")) return;
        try { await leavePartida(id); alert("Saiu!"); fetchPartidas(); } 
        catch (err) { alert(err.message); }
    };

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h2>Partidas Abertas</h2>
                <p style={{ color: '#666' }}>Encontre um jogo e complete o time</p>
            </header>

            {loading && <p>Carregando...</p>}

            <div className="cards-grid">
                {partidas.map(partida => {
                    const ocupadas = partida.participantes.length;
                    const total = partida.limite_jogadores;
                    const pct = (ocupadas / total) * 100;
                    const disponiveis = total - ocupadas;
                    const estouDentro = partida.participantes.some(p => p.id_usuario === user.id_usuario);
                    const isFull = disponiveis === 0;

                    return (
                        <div 
                            key={partida.id_partida} 
                            className="card"
                            style={{ borderLeft: estouDentro ? '5px solid #2ea34aff' : 'none' }}
                        >
                            <div className="card-header" style={{ height: '100px', background: 'linear-gradient(45deg, #11998e, #38ef7d)', fontSize: '2.5rem' }}>
                                ⏳
                            </div>

                            <div className="card-body">
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <h3 className="card-title" style={{fontSize: '1.1rem'}}>{partida.agendamento.espaco.nome}</h3>
                                    {estouDentro && <span style={{color: '#28a745', fontWeight: 'bold', fontSize: '0.8rem'}}>VOCÊ JOGA</span>}
                                </div>
                                
                                <div className="card-info" style={{ margin: '10px 0' }}>
                                    <div>📅 {formatData(partida.agendamento.data_hora)}</div>
                                    <div style={{fontStyle: 'italic', marginTop: '5px'}}>"{partida.descricao}"</div>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <span>{ocupadas} confirmados</span>
                                        <span style={{ color: isFull ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                                            {isFull ? 'LOTADO' : `${disponiveis} vagas`}
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${pct}%`, 
                                            height: '100%', 
                                            background: isFull ? '#dc3545' : '#007bff',
                                            transition: 'width 0.3s ease'
                                        }}></div>
                                    </div>
                                </div>

                                {expandindo === partida.id_partida && (
                                    <div style={{ marginTop: '1rem', background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                        <strong>Escalação:</strong>
                                        <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                                            {partida.participantes.map(p => (
                                                <li key={p.id_usuario}>{p.usuario.nome}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                {!estouDentro && !isFull && (
                                    <button onClick={() => handleEntrar(partida.id_partida)} className="btn-primary">
                                        Entrar
                                    </button>
                                )}
                                {estouDentro && (
                                    <button onClick={() => handleSair(partida.id_partida)} className="btn-danger">
                                        Sair
                                    </button>
                                )}
                                <button 
                                    onClick={() => setExpandindo(prev => prev === partida.id_partida ? null : partida.id_partida)} 
                                    className="nav-btn" 
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    {expandindo === partida.id_partida ? '▲' : '▼ Ver Time'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {!loading && partidas.length === 0 && <p style={{textAlign: 'center', marginTop: '3rem'}}>Nenhuma partida aberta no momento.</p>}
        </div>
    );
}