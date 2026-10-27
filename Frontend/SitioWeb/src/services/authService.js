import api from './api';

const authService = {
    login: (credentials) => api.post('/login', credentials),
    // validate: () => api.get('/login/validate'),
};

export default authService;