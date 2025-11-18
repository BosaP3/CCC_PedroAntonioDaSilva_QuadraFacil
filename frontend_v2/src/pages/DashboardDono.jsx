// src/pages/DashboardDono.jsx
import React, { useState } from 'react';
import GerenciadorEspacos from '../components/GerenciadorEspacos';
import GerenciadorAgendamentos from '../components/GerenciadorAgendamentos';

// Definimos as visualizações possíveis
const VIEWS = {
    ESPACOS: 'ESPACOS',
    AGENDAMENTOS: 'AGENDAMENTOS'
};

export default function DashboardDono({ user }) {
    // O estado agora controla qual tela está ativa
    const [view, setView] = useState(VIEWS.ESPACOS); 

    const handleLogout = () => {
        localStorage.removeItem('quadraFacilToken');
        window.location.href = '/login';
    };

    const renderView = () => {
        switch (view) {
            case VIEWS.ESPACOS:
                return <GerenciadorEspacos />;
            case VIEWS.AGENDAMENTOS:
                return <GerenciadorAgendamentos />;
            default:
                return <GerenciadorEspacos />;
        }
    };

    return (
        <div className="container">
            <div className="dashboard-header">
                <h2>Olá, {user.nome}! (Dono)</h2>
                <button onClick={handleLogout} className="logout-btn">Sair</button>
            </div>
            
            <nav className="dashboard-nav">
                <button 
                    onClick={() => setView(VIEWS.ESPACOS)}
                    className={`nav-button ${view === VIEWS.ESPACOS ? 'active' : ''}`}
                >
                    Meus Espaços
                </button>
                
                <button 
                    onClick={() => setView(VIEWS.AGENDAMENTOS)}
                    className={`nav-button ${view === VIEWS.AGENDAMENTOS ? 'active' : ''}`}
                >
                    Agendamentos
                </button>
            </nav>

            {/* Renderiza o componente da tela ativa */}
            <div className="dashboard-content">
                {renderView()}
            </div>
        </div>
    );
}