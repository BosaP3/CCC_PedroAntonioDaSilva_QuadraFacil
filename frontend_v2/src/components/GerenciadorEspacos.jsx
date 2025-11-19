// src/components/GerenciadorEspacos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getMeusEspacos, deleteEspaco } from '../apiService';
import EspacoForm from './EspacoForm';

export default function GerenciadorEspacos() {
    const [espacos, setEspacos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Controles do formulário
    const [showForm, setShowForm] = useState(false);
    const [espacoEditando, setEspacoEditando] = useState(null); // Guarda o objeto sendo editado

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

    useEffect(() => {
        fetchEspacos();
    }, [fetchEspacos]);

    // Ações
    const handleNovoEspaco = () => {
        setEspacoEditando(null); // Garante que não tem nada selecionado
        setShowForm(true);
    };

    const handleEditar = (espaco) => {
        setEspacoEditando(espaco); // Preenche o formulário com os dados deste espaço
        setShowForm(true);
        // Rola para o topo para ver o form
        window.scrollTo(0, 0);
    };

    const handleExcluir = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este espaço?')) return;

        try {
            await deleteEspaco(id);
            alert('Espaço excluído com sucesso.');
            fetchEspacos(); // Atualiza a lista
        } catch (err) {
            alert(`Erro ao excluir: ${err.message}`);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEspacoEditando(null);
        fetchEspacos();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEspacoEditando(null);
    };

    return (
        <div>
            {loading && <p>Carregando espaços...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            {!showForm && (
                <button onClick={handleNovoEspaco} className="nav-button">
                    + Cadastrar Novo Espaço
                </button>
            )}

            {/* Formulário (Aparece para Criar ou Editar) */}
            {showForm && (
                <EspacoForm 
                    onSuccess={handleFormSuccess} 
                    onCancel={handleFormCancel}
                    espacoParaEditar={espacoEditando} // Passamos o dado para o form
                />
            )}

            {/* Lista de Espaços */}
            <ul className="data-list">
                {espacos.length > 0 ? (
                    espacos.map(espaco => (
                        <li key={espaco.id_espaco} className="data-list-item">
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>{espaco.nome}</strong>
                                <div>Endereço: {espaco.endereco || 'Não informado'}</div>
                                <div>Preço: R$ {espaco.valor_hora.toFixed(2)} / hora</div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="action-buttons">
                                <button 
                                    onClick={() => handleEditar(espaco)}
                                    className="btn-confirm"
                                    style={{ backgroundColor: '#ffc107', color: '#000' }} // Amarelo para editar
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleExcluir(espaco.id_espaco)}
                                    className="btn-cancel"
                                >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    ))
                ) : (
                    !loading && !showForm && <p>Você ainda não cadastrou nenhum espaço.</p>
                )}
            </ul>
        </div>
    );
}