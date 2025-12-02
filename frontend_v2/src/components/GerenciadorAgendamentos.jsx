import React, { useState, useEffect, useCallback } from 'react';
import { getAgendamentosDono, confirmarAgendamento, cancelarAgendamento } from '../apiService';

export default function GerenciadorAgendamentos() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatData = (dataHora) => {
        const d = new Date(dataHora);
        return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;
    };

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

    useEffect(() => { fetchAgendamentos(); }, [fetchAgendamentos]);

    const updateLocalStatus = (id, novoStatus) => {
        setAgendamentos(prev => prev.map(ag => ag.id_agendamento === id ? { ...ag, status: novoStatus } : ag));
    };

    const handleConfirmar = async (id) => {
        try {
            const res = await confirmarAgendamento(id);
            updateLocalStatus(id, res.status);
        } catch (err) { alert(err.message); }
    };

    const handleCancelar = async (id) => {
        if (!window.confirm("Cancelar este agendamento?")) return;
        try {
            const res = await cancelarAgendamento(id);
            updateLocalStatus(id, res.status);
        } catch (err) { alert(err.message); }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'confirmado': return { borderTop: '5px solid #28a745', badge: '#28a745', label: 'Confirmado' };
            case 'pendente': return { borderTop: '5px solid #ffc107', badge: '#ffc107', label: 'Pendente' };
            case 'cancelado': return { borderTop: '5px solid #dc3545', badge: '#dc3545', label: 'Cancelado' };
            default: return { borderTop: '5px solid #ccc', badge: '#ccc', label: status };
        }
    };

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h2>Gestão de Reservas</h2>
                <p style={{ color: '#666' }}>Confirme ou cancele os pedidos dos clientes</p>
            </header>

            {loading && <p>Carregando...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <div className="cards-grid">
                {agendamentos.map(ag => {
                    const style = getStatusStyle(ag.status);
                    
                    return (
                        <div key={ag.id_agendamento} className="card" style={{ borderTop: style.borderTop }}>
                            <div className="card-body">
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                    <span style={{fontWeight: 'bold', color: '#555'}}>#{ag.id_agendamento}</span>
                                    <span style={{
                                        background: style.badge, 
                                        color: ag.status === 'pendente' ? '#000' : '#fff',
                                        padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>
                                        {style.label}
                                    </span>
                                </div>

                                <h3 className="card-title" style={{fontSize: '1.1rem'}}>{ag.espaco.nome}</h3>
                                
                                <div className="card-info" style={{marginTop: '1rem'}}>
                                    <p>👤 <strong>Cliente:</strong> {ag.usuario.nome}</p>
                                    <p>📅 <strong>Data:</strong> {formatData(ag.data_hora)}</p>
                                </div>
                            </div>

                            <div className="card-footer" style={{ flexDirection: 'column', gap: '5px' }}>
                                {ag.status === 'pendente' && (
                                    <button onClick={() => handleConfirmar(ag.id_agendamento)} className="btn-primary" style={{background: '#28a745'}}>
                                        ✅ Confirmar
                                    </button>
                                )}
                                
                                {(ag.status === 'pendente' || ag.status === 'confirmado') && (
                                    <button onClick={() => handleCancelar(ag.id_agendamento)} className="nav-btn" style={{color: '#dc3545', width: '100%', textAlign: 'center'}}>
                                        Cancelar Reserva
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {!loading && agendamentos.length === 0 && <p style={{textAlign: 'center', marginTop: '3rem'}}>Nenhum agendamento recebido.</p>}
        </div>
    );
}