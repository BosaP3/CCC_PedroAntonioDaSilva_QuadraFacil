const API_URL = 'http://localhost:8000';
const getToken = () => localStorage.getItem('quadraFacilToken');

const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('quadraFacilToken');
        window.location.href = '/login';
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro na requisição à API');
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    patch: (endpoint, body) => apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};

export const getMe = () => api.get('/users/me');


export const getMeusAgendamentos = () => api.get('/agendamentos/meus-agendamentos');


export const getMeusEspacos = () => api.get('/espacos/meus-espacos');

export const createEspaco = (espacoData) => api.post('/espacos/', espacoData);


export const getAgendamentosDono = () => api.get('/agendamentos/espacos/meus');

export const confirmarAgendamento = (idAgendamento) => 
    api.patch(`/agendamentos/${idAgendamento}/confirmar`);

export const cancelarAgendamento = (idAgendamento) =>
    api.patch(`/agendamentos/${idAgendamento}/cancelar`);
