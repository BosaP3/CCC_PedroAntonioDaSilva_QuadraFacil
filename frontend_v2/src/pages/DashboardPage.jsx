import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../apiService';
import DashboardDono from './DashboardDono';
import DashboardCliente from './DashboardCliente';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getMe(); 
                setUser(userData);
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div className="container"><h2>Carregando...</h2></div>;
    }

    if (error) {
        return <div className="container"><p className="mensagem-erro">{error}</p></div>;
    }

    if (user && user.tipo_usuario === 'dono') {
        return <DashboardDono user={user} />;
    }

    if (user && user.tipo_usuario === 'cliente') {
        return <DashboardCliente user={user} />;
    }

    return <div className="container"><p>Tipo de usuário desconhecido: {user?.tipo_usuario}</p></div>;
}