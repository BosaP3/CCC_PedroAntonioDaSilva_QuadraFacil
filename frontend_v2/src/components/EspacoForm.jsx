// src/components/EspacoForm.jsx
import React, { useState, useEffect } from 'react';
import { createEspaco, updateEspaco } from '../apiService';

// Agora aceitamos uma prop opcional 'espacoParaEditar'
export default function EspacoForm({ onSuccess, onCancel, espacoParaEditar }) {
    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [valorHora, setValorHora] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Se recebermos um espaço para editar, preenchemos o formulário
    useEffect(() => {
        if (espacoParaEditar) {
            setNome(espacoParaEditar.nome);
            setEndereco(espacoParaEditar.endereco || '');
            setValorHora(espacoParaEditar.valor_hora);
        } else {
            // Limpa o formulário se for criação
            setNome('');
            setEndereco('');
            setValorHora(0);
        }
    }, [espacoParaEditar]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const espacoData = {
            nome,
            endereco,
            valor_hora: parseFloat(valorHora)
        };

        try {
            if (espacoParaEditar) {
                // MODO EDIÇÃO (PUT)
                await updateEspaco(espacoParaEditar.id_espaco, espacoData);
                alert('Espaço atualizado com sucesso!');
            } else {
                // MODO CRIAÇÃO (POST)
                await createEspaco(espacoData);
                alert('Espaço criado com sucesso!');
            }
            onSuccess(); // Avisa o pai para atualizar a lista
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ border: '1px solid #007bff' }}>
            <h3>{espacoParaEditar ? 'Editar Espaço' : 'Cadastrar Novo Espaço'}</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nome">Nome do Espaço</label>
                    <input
                        type="text" id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="endereco">Endereço</label>
                    <input
                        type="text" id="endereco"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="valor_hora">Valor por Hora (R$)</label>
                    <input
                        type="number" id="valor_hora"
                        value={valorHora}
                        onChange={(e) => setValorHora(e.target.value)}
                        step="0.50" min="0"
                        required
                    />
                </div>
                
                <div className="action-buttons" style={{ marginTop: '1rem' }}>
                    <button type="submit" className="btn-confirm" disabled={loading}>
                        {loading ? 'Salvando...' : (espacoParaEditar ? 'Salvar Alterações' : 'Cadastrar')}
                    </button>
                    <button type="button" onClick={onCancel} className="nav-button">
                        Cancelar
                    </button>
                </div>
                
                {error && <p className="mensagem-erro">{error}</p>}
            </form>
        </div>
    );
}