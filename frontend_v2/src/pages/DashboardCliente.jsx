import React, { useState } from 'react';
import ClienteMeusAgendamentos from '../components/ClienteMeusAgendamentos';
import ClienteBuscarEspacos from '../components/ClienteBuscarEspacos';
import ClientePartidasAbertas from '../components/ClientePartidasAbertas';

const VIEWS = {
    BUSCAR_ESPACOS: 'BUSCAR_ESPACOS',
    PARTIDAS_ABERTAS: 'PARTIDAS_ABERTAS',
    MEUS_AGENDAMENTOS: 'MEUS_AGENDAMENTOS'
};

export default function DashboardCliente({ user }) {
    const [view, setView] = useState(VIEWS.BUSCAR_ESPACOS); 

    const handleLogout = () => {
        localStorage.removeItem('quadraFacilToken');
        window.location.href = '/login';
    };

    const renderView = () => {
        switch (view) {
            case VIEWS.BUSCAR_ESPACOS:
                return <ClienteBuscarEspacos />;
            case VIEWS.PARTIDAS_ABERTAS:
                return <ClientePartidasAbertas />;
            case VIEWS.MEUS_AGENDAMENTOS:
                return <ClienteMeusAgendamentos />;
            default:
                return <ClienteBuscarEspacos />;
        }
    };

    return (
        <div className="container">
            <div className="dashboard-header">
                <h2>Olá, {user.nome}! (Cliente)</h2>
                <button onClick={handleLogout} className="logout-btn">Sair</button>
            </div>

            <nav className="dashboard-nav">
                <button 
                    onClick={() => setView(VIEWS.BUSCAR_ESPACOS)}
                    className={`nav-button ${view === VIEWS.BUSCAR_ESPACOS ? 'active' : ''}`}
                >
                    Reservar Espaço
                </button>
                <button 
                    onClick={() => setView(VIEWS.PARTIDAS_ABERTAS)}
                    className={`nav-button ${view === VIEWS.PARTIDAS_ABERTAS ? 'active' : ''}`}
                >
                    Partidas Abertas (Fecha Time)
                </button>
                <button 
                    onClick={() => setView(VIEWS.MEUS_AGENDAMENTOS)}
                    className={`nav-button ${view === VIEWS.MEUS_AGENDAMENTOS ? 'active' : ''}`}
                >
                    Meus Agendamentos
                </button>
            </nav>

            <div className="dashboard-content">
                {renderView()}
            </div>
        </div>
    );
}