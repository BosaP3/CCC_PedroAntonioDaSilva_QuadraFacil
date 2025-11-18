import React, { useState } from 'react';
import { createEspaco } from '../apiService';

export default function EspacoForm({ onSuccess }) {
    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [valorHora, setValorHora] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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
            await createEspaco(espacoData); 
            onSuccess(); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h3>Cadastrar Novo Espaço</h3>
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
                        step="0.50"
                        min="0"
                        required
                    />
                </div>
                
                <button type="submit" className="btn-login" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Espaço'}
                </button>
                {error && <p className="mensagem-erro">{error}</p>}
            </form>
        </div>
    );
}