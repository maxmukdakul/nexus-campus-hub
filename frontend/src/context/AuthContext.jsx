import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            // Decode the JWT without external libraries
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ username: payload.username, role: payload.role });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await api.post('token/', { username, password });
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        
        // Decode and set the exact role
        const payload = JSON.parse(atob(response.data.access.split('.')[1]));
        setUser({ username: payload.username, role: payload.role }); 
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);