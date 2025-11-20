import React, { useState, useEffect } from 'react';
import { getMeusAgendamentos, createPartida, cancelarAgendamento } from '../apiService';

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
        setFormDescricao(`Futebol no ${agendamento.espaco.nome}`);
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

    const handleCancelar = async (id) => {
        if(!window.confirm("Tem certeza que deseja cancelar este horário?")) return;
        try {
            await cancelarAgendamento(id); 
            fetchAgendamentos();
        } catch (err) {
            alert(err.message);
        }
    };

    const formatData = (dataHora) => {
        const d = new Date(dataHora);
        return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'confirmado': return { bg: '#28a745', label: 'Confirmado' };
            case 'pendente': return { bg: '#ffc107', label: 'Pendente', color: '#000' };
            case 'cancelado': return { bg: '#dc3545', label: 'Cancelado' };
            default: return { bg: '#6c757d', label: status };
        }
    };

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h2>Meus Agendamentos</h2>
                <p style={{ color: '#666' }}>Gerencie suas reservas e crie partidas</p>
            </header>

            {loading && <p>Carregando...</p>}

            <div className="cards-grid">
                {agendamentos.map(ag => {
                    const badge = getStatusBadge(ag.status);
                    const isCreating = criandoPartidaId === ag.id_agendamento;

                    return (
                        <div key={ag.id_agendamento} className="card" style={{ borderTop: `4px solid ${badge.bg}` }}>
                            
                            {isCreating ? (
                                <div className="card-body" style={{ background: '#f0f8ff' }}>
                                    <h4 style={{marginTop: 0, color: '#007bff'}}>Configurar Partida</h4>
                                    <form onSubmit={confirmarCriacao}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{fontSize: '0.85rem'}}>Descrição</label>
                                            <input 
                                                type="text" 
                                                value={formDescricao} 
                                                onChange={e => setFormDescricao(e.target.value)} 
                                                required 
                                                autoFocus
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{fontSize: '0.85rem'}}>Vagas Totais</label>
                                            <input 
                                                type="number" 
                                                value={formLimite} 
                                                onChange={e => setFormLimite(e.target.value)} 
                                                min="2" max="50" 
                                                required 
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button type="submit" className="btn-primary">Publicar</button>
                                            <button type="button" onClick={() => setCriandoPartidaId(null)} className="nav-btn" style={{border: '1px solid #ccc'}}>Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    <div className="card-body">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <h3 className="card-title">{ag.espaco.nome}</h3>
                                            <span style={{ 
                                                backgroundColor: badge.bg, 
                                                color: badge.color || '#fff', 
                                                padding: '2px 8px', 
                                                borderRadius: '12px', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 'bold'
                                            }}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        
                                        <div className="card-info" style={{ marginTop: '1rem' }}>
                                            <p style={{ margin: '5px 0' }}>📅 {formatData(ag.data_hora)}</p>
                                            <p style={{ margin: '5px 0' }}>📍 {ag.espaco.endereco || 'Endereço padrão'}</p>
                                        </div>
                                    </div>

                                    <div className="card-footer" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                                        {ag.status === 'confirmado' && !ag.partida && (
                                            <button 
                                                onClick={() => iniciarCriacao(ag)}
                                                className="btn-primary"
                                                style={{ background: '#6f42c1' }}  Roxo para destacar a funcionalidade social
                                            >
                                                📢 Abrir Partida (Fecha Time)
                                            </button>
                                        )}
                                        
                                        {(ag.status === 'pendente' || ag.status === 'confirmado') && (
                                            <button 
                                                onClick={() => handleCancelar(ag.id_agendamento)}
                                                className="nav-btn"
                                                style={{ color: '#dc3545', width: '100%', textAlign: 'center' }}
                                            >
                                                Cancelar Reserva
                                            </button>
                                        )}
                                        
                                        {ag.status === 'cancelado' && <small style={{textAlign: 'center', color: '#999'}}>Reserva cancelada</small>}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
            {!loading && agendamentos.length === 0 && <p style={{textAlign: 'center', marginTop: '3rem'}}>Nenhum agendamento encontrado.</p>}
        </div>
    );
}