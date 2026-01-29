import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { LogIn, Mail, Lock, ArrowLeft } from 'lucide-react';

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
            // toast handled in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center text-primary font-semibold hover:underline mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                    <div className="w-20 h-20 bg-primary rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-6 rotate-3 relative overflow-hidden group">
                        <span className="text-white font-black text-3xl relative z-10">V</span>
                        <div className="absolute inset-0 bg-white/20 blur-md group-hover:blur-none transition-all"></div>
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign in to book your favorite halls and manage bookings.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            icon={Mail}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            icon={Lock}
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                                <span className="text-slate-600 font-medium">Remember me</span>
                            </label>
                            <a href="#" className="font-bold text-primary hover:underline">Forgot password?</a>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-600">
                            Don't have an account? {' '}
                            <Link to="/register" className="font-extrabold text-primary hover:underline">Create Account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
