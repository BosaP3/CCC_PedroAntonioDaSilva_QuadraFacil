import React, { useState, useEffect, useCallback } from 'react';
import { getMeusEspacos } from '../apiService';
import EspacoForm from './EspacoForm'; 

export default function GerenciadorEspacos() {
    const [espacos, setEspacos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);


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

    const handleEspacoCriado = () => {
        setShowForm(false); 
        fetchEspacos();    
    };

    return (
        <div>
            {loading && <p>Carregando espaços...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <button 
                onClick={() => setShowForm(!showForm)}
                className="nav-button" 
            >
                {showForm ? 'Cancelar' : 'Cadastrar Novo Espaço'}
            </button>

            {showForm && (
                <EspacoForm onSuccess={handleEspacoCriado} />
            )}

            <ul className="data-list">
                {espacos.length > 0 ? (
                    espacos.map(espaco => (
                        <li key={espaco.id_espaco} className="data-list-item">
                            <strong>{espaco.nome}</strong>
                            <div>Endereço: {espaco.endereco || 'Não informado'}</div>
                            <div>Preço: R$ {espaco.valor_hora.toFixed(2)} / hora</div>
                        </li>
                    ))
                ) : (
                    !loading && !showForm && <p>Você ainda não cadastrou nenhum espaço.</p>
                )}
            </ul>
        </div>
    );
}