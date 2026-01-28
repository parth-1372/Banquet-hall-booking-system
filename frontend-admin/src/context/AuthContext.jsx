import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            const userData = data.data.user;

            if (['admin', 'super_admin', 'admin1', 'admin2'].includes(userData.role)) {
                setUser(userData);
            } else {
                setUser(null);
                toast.error('Access denied. Admin only.');
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            const userData = data.data.user;

            if (['admin', 'super_admin', 'admin1', 'admin2'].includes(userData.role)) {
                setUser(userData);
                toast.success(`${userData.role.toUpperCase().replace('_', ' ')} Login successful!`);
                return data;
            } else {
                await api.post('/auth/logout');
                toast.error('Access denied. Admin only.');
                throw new Error('Not an admin');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Login failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            toast.success('Logged out');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
