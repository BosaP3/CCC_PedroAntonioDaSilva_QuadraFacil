import React, { useState, useEffect } from 'react';
import { getAllEspacos, createAgendamento } from '../apiService';

export default function ClienteBuscarEspacos() {
    const [espacos, setEspacos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [espacoSelecionado, setEspacoSelecionado] = useState(null);
    const [dataHora, setDataHora] = useState('');

    useEffect(() => {
        const fetchEspacos = async () => {
            try {
                const data = await getAllEspacos();
                setEspacos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEspacos();
    }, []);

    const handleSelecionarEspaco = (espaco) => {
        setEspacoSelecionado(espaco);
        setDataHora(''); 
        window.scrollTo(0, 0); 
    };

    const handleAgendar = async (e) => {
        e.preventDefault();
        setError(null);
        
        const dataLocal = new Date(dataHora);
        const dataEmUTC = dataLocal.toISOString();
        try {
            await createAgendamento({
                id_espaco: espacoSelecionado.id_espaco,
                data_hora: dataEmUTC
            });
            alert('Agendamento solicitado com sucesso! Aguarde a confirmação do dono.');
            setEspacoSelecionado(null); 
        } catch (err) {
            setError(`Erro ao agendar: ${err.message}`);
        }
    };

    if (espacoSelecionado) {
        return (
            <div className="form-container">
                <h3>Reservar "{espacoSelecionado.nome}"</h3>
                <form onSubmit={handleAgendar}>
                    <p>Endereço: {espacoSelecionado.endereco || 'Não informado'}</p>
                    <p>Preço: R$ {espacoSelecionado.valor_hora.toFixed(2)} / hora</p>
                    <div>
                        <label htmlFor="data_hora">Data e Hora</label>
                        <input 
                            type="datetime-local" 
                            id="data_hora"
                            value={dataHora}
                            onChange={(e) => setDataHora(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-confirm">Solicitar Horário</button>
                    <button 
                        type="button" 
                        onClick={() => setEspacoSelecionado(null)} 
                        className="nav-button"
                    >
                        Voltar para a lista
                    </button>
                    {error && <p className="mensagem-erro">{error}</p>}
                </form>
            </div>
        );
    }

    return (
        <div>
            <h3>Encontre um Espaço</h3>
            {loading && <p>Carregando espaços...</p>}
            {error && <p className="mensagem-erro">{error}</p>}

            <ul className="data-list">
                {espacos.length > 0 ? (
                    espacos.map(espaco => (
                        <li key={espaco.id_espaco} className="data-list-item">
                            <strong>{espaco.nome}</strong>
                            <div>Endereço: {espaco.endereco || 'Não informado'}</div>
                            <div>Preço: R$ {espaco.valor_hora.toFixed(2)} / hora</div>
                            <div>Dono: {espaco.dono.nome}</div>
                            <button 
                                onClick={() => handleSelecionarEspaco(espaco)}
                                className="btn-confirm"
                                style={{ marginTop: '0.5rem' }}
                            >
                                Ver Horários
                            </button>
                        </li>
                    ))
                ) : (
                    !loading && <p>Nenhum espaço cadastrado no sistema ainda.</p>
                )}
            </ul>
        </div>
    );
}