import React, { useState, useEffect, useCallback } from 'react';
import { getMinhasPartidas, leavePartida } from '../apiService';

export default function ClienteMinhasPartidas({ user }) {
    const [partidas, setPartidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [partidaExpandida, setPartidaExpandida] = useState(null);

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
        if (!window.confirm("Tem certeza que deseja sair deste time?")) return;
        try {
            await leavePartida(idPartida);
            alert("Você saiu da partida.");
            fetchMinhasPartidas();
        } catch (err) {
            alert(`Erro ao sair: ${err.message}`);
        }
    };

    const toggleDetalhes = (id) => {
        setPartidaExpandida(prev => prev === id ? null : id);
    };

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h2>Minhas Partidas</h2>
                <p style={{ color: '#666' }}>Jogos confirmados onde você está escalado</p>
            </header>

            {loading && <p>Carregando seus jogos...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <div className="cards-grid">
                {partidas.map(partida => {
                    const meuPapel = partida.participantes.find(p => p.id_usuario === user.id_usuario)?.papel;
                    const totalJogadores = partida.participantes.length;
                    const isExpandido = partidaExpandida === partida.id_partida;

                    return (
                        <div key={partida.id_partida} className="card">
                            <div className="card-header" style={{ height: '80px', fontSize: '2rem' }}>
                                ⚽
                            </div>  

                            <div className="card-body">
                                <h3 className="card-title">{partida.agendamento.espaco.nome}</h3>
                                <div className="card-info">
                                    📅 {formatData(partida.agendamento.data_hora)}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                    <span style={{ 
                                        background: meuPapel === 'organizador' ? '#ffc107' : '#007bff',
                                        color: meuPapel === 'organizador' ? '#000' : '#fff',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>
                                        {meuPapel === 'organizador' ? '👑 Organizador' : '👟 Jogador'}
                                    </span>
                                    
                                    <span style={{ background: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        👥 {totalJogadores} Atletas
                                    </span>
                                </div>

                                {isExpandido && (
                                    <div style={{ 
                                        marginTop: '1rem', 
                                        paddingTop: '1rem', 
                                        borderTop: '1px dashed #ccc',
                                        animation: 'fadeIn 0.3s'
                                    }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0' }}>Escalação:</h5>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {partida.participantes.map(p => (
                                                <li key={p.id_usuario} style={{ padding: '4px 0', fontSize: '0.9rem', borderBottom: '1px solid #eee' }}>
                                                    {p.papel === 'organizador' && '👑 '} 
                                                    {p.usuario.nome} 
                                                    {p.id_usuario === user.id_usuario && <strong> (Você)</strong>}
                                                </li>
                                            ))}
                                        </ul>
                                        {partida.regras && (
                                            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                                                ⚠️ {partida.regras}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <button 
                                    onClick={() => toggleDetalhes(partida.id_partida)} 
                                    className="btn-primary"
                                    style={{ background: isExpandido ? '#6c757d' : 'var(--primary)' }}
                                >
                                    {isExpandido ? 'Ocultar' : 'Ver Time'}
                                </button>
                                <button 
                                    onClick={() => handleSair(partida.id_partida)} 
                                    className="btn-danger"
                                >
                                    Sair
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {!loading && partidas.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <p>Você não está participando de nenhuma partida no momento.</p>
                </div>
            )}
        </div>
    );
}