import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ClienteMeusAgendamentos from '../components/ClienteMeusAgendamentos';
import ClienteBuscarEspacos from '../components/ClienteBuscarEspacos';
import ClientePartidasAbertas from '../components/ClientePartidasAbertas';
import ClienteMinhasPartidas from '../components/ClienteMinhasPartidas';

const VIEWS = {
    BUSCAR_ESPACOS: 'BUSCAR_ESPACOS',
    PARTIDAS_ABERTAS: 'PARTIDAS_ABERTAS',
    MEUS_AGENDAMENTOS: 'MEUS_AGENDAMENTOS',
    MINHAS_PARTIDAS: 'MINHAS_PARTIDAS'
};

export default function DashboardCliente({ user }) {
    const [view, setView] = useState(VIEWS.BUSCAR_ESPACOS); 

    const menuItems = [
        { key: VIEWS.BUSCAR_ESPACOS, label: 'Reservar Quadra' },
        { key: VIEWS.PARTIDAS_ABERTAS, label: 'Fecha Time' },
        { key: VIEWS.MEUS_AGENDAMENTOS, label: 'Meus Agendamentos' },
        { key: VIEWS.MINHAS_PARTIDAS, label: 'Meus Jogos' },
    ];

    const renderView = () => {
        switch (view) {
            case VIEWS.BUSCAR_ESPACOS: return <ClienteBuscarEspacos />;
            case VIEWS.PARTIDAS_ABERTAS: return <ClientePartidasAbertas user={user} />;
            case VIEWS.MEUS_AGENDAMENTOS: return <ClienteMeusAgendamentos />;
            case VIEWS.MINHAS_PARTIDAS: return <ClienteMinhasPartidas user={user} />;
            default: return <ClienteBuscarEspacos />;
        }
    };

    return (
        <div className="dashboard-layout">
            <Navbar 
                user={user} 
                currentView={view} 
                setView={setView} 
                menuItems={menuItems} 
            />

            <main className="main-content">
                {renderView()}
            </main>
        </div>
    );
}