import React, { useState, useEffect } from 'react';
import { getMeusAgendamentos, createPartida } from '../apiService';

export default function ClienteMeusAgendamentos() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [criandoPartidaId, setCriandoPartidaId] = useState(null);
    const [formDescricao, setFormDescricao] = useState('');
    const [formLimite, setFormLimite] = useState(10);

    const fetchAgendamentos = async () => {
        try {
            const data = await getMeusAgendamentos(); 
            setAgendamentos(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgendamentos();
    }, []);

    const iniciarCriacao = (agendamento) => {
        setCriandoPartidaId(agendamento.id_agendamento);
        setFormDescricao(`Futebol na ${agendamento.espaco.nome}`);
        setFormLimite(10);
    };

    const confirmarCriacao = async (e) => {
        e.preventDefault();
        try {
            await createPartida(criandoPartidaId, {
                descricao: formDescricao,
                limite_jogadores: parseInt(formLimite),
                regras: "Regras gerais do app"
            });
            alert("Partida criada! Ela agora aparece na lista pública.");
            setCriandoPartidaId(null);
            fetchAgendamentos();
        } catch (err) {
            alert(`Erro: ${err.message}`);
        }
    };

    return (
        <div>
            <h3>Meus Agendamentos</h3>
            {loading && <p>Carregando...</p>}
            
            <ul className="data-list">
                {agendamentos.map(ag => (
                    <li key={ag.id_agendamento} className="data-list-item">
                        <div>
                            <strong>{ag.espaco.nome}</strong>
                            <br />
                            <small>{new Date(ag.data_hora).toLocaleString('pt-BR')}</small>
                        </div>
                        <div style={{ margin: '0.5rem 0' }}>
                            Status: <strong>{ag.status}</strong>
                        </div>

                        {criandoPartidaId === ag.id_agendamento ? (
                            <form onSubmit={confirmarCriacao} style={{ background: '#e3f2fd', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                                <h5 style={{ margin: '0 0 10px 0' }}>Configurar Partida Aberta</h5>
                                <div style={{ marginBottom: '8px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem' }}>Descrição/Nível:</label>
                                    <input 
                                        type="text" 
                                        value={formDescricao} 
                                        onChange={e => setFormDescricao(e.target.value)} 
                                        required 
                                        style={{ width: '100%', padding: '5px' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem' }}>Total de Vagas:</label>
                                    <input 
                                        type="number" 
                                        value={formLimite} 
                                        onChange={e => setFormLimite(e.target.value)} 
                                        min="2" 
                                        max="50" 
                                        required 
                                        style={{ width: '100%', padding: '5px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button type="submit" className="btn-confirm" style={{ flex: 1 }}>Publicar</button>
                                    <button type="button" onClick={() => setCriandoPartidaId(null)} className="btn-cancel" style={{ flex: 1 }}>Cancelar</button>
                                </div>
                            </form>
                        ) : (
                            ag.status === 'confirmado' && (
                                <button 
                                    onClick={() => iniciarCriacao(ag)}
                                    className="nav-button"
                                    style={{ width: '100%', marginTop: '0.5rem', border: '1px solid #007bff', color: '#007bff' }}
                                >
                                    Transformar em Partida Aberta
                                </button>
                            )
                        )}
                    </li>
                ))}
                {!loading && agendamentos.length === 0 && <p>Você não tem agendamentos.</p>}
            </ul>
        </div>
    );
}