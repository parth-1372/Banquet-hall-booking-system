import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminButton from '../components/ui/AdminButton';
import { ShieldCheck, Mail, Lock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            // toast handled in context or here if not an admin
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Decoration */}
                <div className="flex justify-center mb-10">
                    <div className="w-24 h-24 bg-admin-primary/10 rounded-3xl flex items-center justify-center border border-admin-primary/20 shadow-2xl shadow-admin-primary/20 rotate-12 transition-transform hover:rotate-0 duration-500">
                        <ShieldCheck className="w-12 h-12 text-admin-primary" />
                    </div>
                </div>

                <div className="bg-slate-800 p-10 rounded-[40px] border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-admin-primary/5 rounded-full blur-3xl" />

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Portal</h2>
                        <p className="text-slate-400 font-medium">Please sign in to access management</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@netlarx.com"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-admin-primary focus:ring-4 focus:ring-admin-primary/10 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-admin-primary focus:ring-4 focus:ring-admin-primary/10 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <AdminButton type="submit" disabled={loading} className="w-full h-14 text-lg mt-4 shadow-xl shadow-admin-primary/20">
                            {loading ? 'Authenticating Access...' : 'Enter Dashboard'}
                        </AdminButton>
                    </form>

                    <div className="mt-10 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                        <p className="text-[10px] text-amber-500 font-bold leading-relaxed uppercase tracking-wider">
                            Access Restricted to authorized personnel only. All login attempts are logged for security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
