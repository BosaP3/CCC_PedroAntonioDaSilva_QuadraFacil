import React, { useState, useEffect, useCallback } from 'react';
import { getMeusEspacos, deleteEspaco } from '../apiService';
import EspacoForm from './EspacoForm';

export default function GerenciadorEspacos() {
    const [espacos, setEspacos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showForm, setShowForm] = useState(false);
    const [espacoEditando, setEspacoEditando] = useState(null);

    const fetchEspacos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMeusEspacos();
            setEspacos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEspacos(); }, [fetchEspacos]);

    const handleNovoEspaco = () => {
        setEspacoEditando(null);
        setShowForm(true);
    };

    const handleEditar = (espaco) => {
        setEspacoEditando(espaco);
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const handleExcluir = async (id) => {
        if (!window.confirm('Tem a certeza que deseja excluir este espaço?')) return;
        try {
            await deleteEspaco(id);
            alert('Espaço excluído.');
            fetchEspacos();
        } catch (err) {
            alert(`Erro: ${err.message}`);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEspacoEditando(null);
        fetchEspacos();
    };

    return (
        <div>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Meus Espaços</h2>
                    <p style={{ color: '#666' }}>Faça a gestão das suas quadras e campos</p>
                </div>
                {!showForm && (
                    <button onClick={handleNovoEspaco} className="btn-primary" style={{ width: 'auto', padding: '0.8rem 1.5rem' }}>
                        + Novo Espaço
                    </button>
                )}
            </header>

            {loading && <p>Carregando...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            {showForm && (
                <div style={{ marginBottom: '2rem' }}>
                    <EspacoForm 
                        onSuccess={handleFormSuccess} 
                        onCancel={() => setShowForm(false)}
                        espacoParaEditar={espacoEditando}
                    />
                </div>
            )}

            {!showForm && (
                <div className="cards-grid">
                    {espacos.map(espaco => (
                        <div key={espaco.id_espaco} className="card">
                            <div className="card-header" style={{ height: '100px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontSize: '2.5rem' }}>
                                🏟️
                            </div>

                            <div className="card-body">
                                <h3 className="card-title">{espaco.nome}</h3>
                                <div className="card-info" style={{ margin: '10px 0' }}>
                                    <p>📍 {espaco.endereco || 'Sem endereço'}</p>
                                    <p style={{ fontWeight: 'bold', color: '#28a745', fontSize: '1.1rem' }}>
                                        R$ {espaco.valor_hora.toFixed(2)}/h
                                    </p>
                                </div>
                            </div>

                            <div className="card-footer">
                                <button 
                                    onClick={() => handleEditar(espaco)}
                                    className="btn-primary"
                                    style={{ background: '#ffc107', color: '#000' }}
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleExcluir(espaco.id_espaco)}
                                    className="btn-danger"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {!loading && !showForm && espacos.length === 0 && (
                <p style={{textAlign: 'center', marginTop: '3rem'}}>Ainda não tem espaços cadastrados.</p>
            )}
        </div>
    );
}