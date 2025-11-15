import React, { useState, useEffect } from 'react';
import { getMeusEspacos } from '../apiService';

export default function DashboardDono({ user }) {
    const [espacos, setEspacos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEspacos = async () => {
            try {
                const data = await getMeusEspacos();
                setEspacos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEspacos();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('quadraFacilToken');
        window.location.href = '/login';
    };

    return (
        <div className="container">
            <div className="dashboard-header">
                <h2>Olá, {user.nome}! (Dono)</h2>
                <button onClick={handleLogout} className="logout-btn">Sair</button>
            </div>
            <p>Seus espaços cadastrados (Módulo de Gestão):</p>
            
            {loading && <p>Carregando espaços...</p>}
            {error && <p className="mensagem-erro">{error}</p>}
            
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
                    !loading && <p>Você ainda não cadastrou nenhum espaço.</p>
                )}
            </ul>
        </div>
    );
}