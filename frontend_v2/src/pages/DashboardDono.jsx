import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import GerenciadorEspacos from '../components/GerenciadorEspacos';
import GerenciadorAgendamentos from '../components/GerenciadorAgendamentos';

const VIEWS = {
    ESPACOS: 'ESPACOS',
    AGENDAMENTOS: 'AGENDAMENTOS'
};

export default function DashboardDono({ user }) {
    const [view, setView] = useState(VIEWS.ESPACOS); 

    const menuItems = [
        { key: VIEWS.ESPACOS, label: 'Meus Espaços' },
        { key: VIEWS.AGENDAMENTOS, label: 'Gerenciar Agendamentos' },
    ];

    const renderView = () => {
        switch (view) {
            case VIEWS.ESPACOS: return <GerenciadorEspacos />;
            case VIEWS.AGENDAMENTOS: return <GerenciadorAgendamentos />;
            default: return <GerenciadorEspacos />;
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