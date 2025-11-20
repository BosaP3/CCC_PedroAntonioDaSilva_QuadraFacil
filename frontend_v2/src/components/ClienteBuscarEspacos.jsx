import React, { useState, useEffect } from 'react';
import { getAllEspacos, createAgendamento } from '../apiService';

const HORARIOS_DISPONIVEIS = [
    "08:00", "09:00", "10:00", "11:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

export default function ClienteBuscarEspacos() {
    const [espacos, setEspacos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [espacoSelecionado, setEspacoSelecionado] = useState(null);
    
    const [dataEscolhida, setDataEscolhida] = useState('');
    const [horaEscolhida, setHoraEscolhida] = useState('');

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
        setDataEscolhida('');
        setHoraEscolhida('');
        window.scrollTo(0, 0);
    };

    const handleAgendar = async (e) => {
        e.preventDefault();
        setError(null);

        if (!dataEscolhida || !horaEscolhida) {
            alert("Por favor, escolha um dia e um horário.");
            return;
        }
        
        const dataHoraLocalString = `${dataEscolhida}T${horaEscolhida}`;
        const dataObj = new Date(dataHoraLocalString);
        
        const dataEmUTC = dataObj.toISOString(); 

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
                <p>Endereço: {espacoSelecionado.endereco || 'Não informado'}</p>
                <p>Preço: R$ {espacoSelecionado.valor_hora.toFixed(2)} / hora</p>
                
                <form onSubmit={handleAgendar}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="dia">Escolha o Dia:</label>
                        <input 
                            type="date" 
                            id="dia"
                            value={dataEscolhida}
                            onChange={(e) => setDataEscolhida(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="hora">Horário Disponível:</label>
                        <select
                            id="hora"
                            value={horaEscolhida}
                            onChange={(e) => setHoraEscolhida(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', backgroundColor: 'white' }}
                        >
                            <option value="" disabled>Selecione um horário...</option>
                            {HORARIOS_DISPONIVEIS.map(horario => (
                                <option key={horario} value={horario}>
                                    {horario} até {parseInt(horario.split(':')[0]) + 1}:{horario.split(':')[1]}
                                </option>
                            ))}
                        </select>
                        <small style={{ color: '#666' }}>*Horários de 1 hora de duração</small>
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