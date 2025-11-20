import React, { useState, useEffect } from 'react';
import { getAllEspacos, createAgendamento, getAgendamentosConfirmados } from '../apiService';

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
    
    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [buscandoDisponibilidade, setBuscandoDisponibilidade] = useState(false);

    useEffect(() => {
        const fetchEspacos = async () => {
            try {
                const data = await getAllEspacos(); //
                setEspacos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEspacos();
    }, []);

    useEffect(() => {
        const verificarDisponibilidade = async () => {
            if (!espacoSelecionado || !dataEscolhida) {
                setHorariosOcupados([]);
                return;
            }

            setBuscandoDisponibilidade(true);
            try {
                const inicioDia = new Date(`${dataEscolhida}T00:00:00`);
                const fimDia = new Date(`${dataEscolhida}T23:59:59`);

                const agendamentos = await getAgendamentosConfirmados(
                    espacoSelecionado.id_espaco,
                    inicioDia.toISOString(),
                    fimDia.toISOString()
                );

                const horasBloqueadas = agendamentos.map(ag => {
                    const dataObj = new Date(ag.data_hora);
                    const hora = dataObj.getHours().toString().padStart(2, '0');
                    const minuto = dataObj.getMinutes().toString().padStart(2, '0');
                    return `${hora}:${minuto}`;
                });

                setHorariosOcupados(horasBloqueadas);
            } catch (err) {
                console.error("Erro ao verificar disponibilidade:", err);
            } finally {
                setBuscandoDisponibilidade(false);
            }
        };

        verificarDisponibilidade();
    }, [dataEscolhida, espacoSelecionado]);

    const handleSelecionarEspaco = (espaco) => {
        setEspacoSelecionado(espaco);
        setDataEscolhida('');
        setHoraEscolhida('');
        setHorariosOcupados([]);
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
            alert('Agendamento solicitado com sucesso!');
            setEspacoSelecionado(null); 
        } catch (err) {
            setError(`Erro ao agendar: ${err.message}`);
        }
    };

    // --- RENDERIZAÇÃO ---
    if (espacoSelecionado) {
        return (
            <div className="form-container">
                <h3>Reservar "{espacoSelecionado.nome}"</h3>
                <p>Preço: R$ {espacoSelecionado.valor_hora.toFixed(2)} / hora</p>
                
                <form onSubmit={handleAgendar}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="dia">Escolha o Dia:</label>
                        <input 
                            type="date" 
                            id="dia"
                            value={dataEscolhida}
                            onChange={(e) => {
                                setDataEscolhida(e.target.value);
                                setHoraEscolhida(''); // Reseta a hora ao mudar o dia
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="hora">
                            Horário {buscandoDisponibilidade && <small>(Verificando disponibilidade...)</small>}
                        </label>
                        
                        <select
                            id="hora"
                            value={horaEscolhida}
                            onChange={(e) => setHoraEscolhida(e.target.value)}
                            required
                            disabled={!dataEscolhida || buscandoDisponibilidade} // Trava se não tiver data
                            style={{ width: '100%', padding: '8px', backgroundColor: 'white' }}
                        >
                            <option value="" disabled>
                                {!dataEscolhida ? 'Selecione uma data primeiro' : 'Selecione um horário...'}
                            </option>
                            
                            {HORARIOS_DISPONIVEIS.map(horario => {
                                // Verifica se este horário está na lista de ocupados
                                const estaOcupado = horariosOcupados.includes(horario);

                                return (
                                    <option 
                                        key={horario} 
                                        value={horario}
                                        disabled={estaOcupado} // Impede a seleção
                                        style={{ 
                                            color: estaOcupado ? 'red' : 'black', // Texto vermelho
                                            fontWeight: estaOcupado ? 'bold' : 'normal'
                                        }}
                                    >
                                        {horario} 
                                        {estaOcupado ? ' (OCUPADO - CONFIRMADO)' : ` até ${parseInt(horario.split(':')[0]) + 1}:00`}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="action-buttons">
                        <button type="submit" className="btn-confirm">Solicitar Horário</button>
                        <button type="button" onClick={() => setEspacoSelecionado(null)} className="nav-button">
                            Voltar
                        </button>
                    </div>
                    {error && <p className="mensagem-erro">{error}</p>}
                </form>
            </div>
        );
    }

    return (
        <div>
            <h3>Encontre um Espaço</h3>
            {loading && <p>Carregando espaços...</p>}
            
            <ul className="data-list">
                {espacos.map(espaco => (
                    <li key={espaco.id_espaco} className="data-list-item">
                        <strong>{espaco.nome}</strong>
                        <div>Endereço: {espaco.endereco || 'Não informado'}</div>
                        <div>Preço: R$ {espaco.valor_hora.toFixed(2)} / hora</div>
                        <button 
                            onClick={() => handleSelecionarEspaco(espaco)}
                            className="btn-confirm"
                            style={{ marginTop: '0.5rem' }}
                        >
                            Ver Disponibilidade
                        </button>
                    </li>
                ))}
                {!loading && espacos.length === 0 && <p>Nenhum espaço cadastrado.</p>}
            </ul>
        </div>
    );
}