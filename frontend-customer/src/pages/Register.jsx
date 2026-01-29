import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { UserPlus, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return alert("Passwords don't match");
        }
        setLoading(true);
        try {
            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });
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
                    <div className="w-20 h-20 bg-primary rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-6 -rotate-3 relative overflow-hidden group">
                        <span className="text-white font-black text-3xl relative z-10">V</span>
                        <div className="absolute inset-0 bg-white/20 blur-md group-hover:blur-none transition-all"></div>
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Join VenueVista to start booking premium banquet halls.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Full Name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            icon={User}
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            icon={Mail}
                        />

                        <Input
                            label="Phone Number"
                            name="phone"
                            placeholder="Your 10-digit phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            icon={Phone}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                icon={Lock}
                            />
                            <Input
                                label="Confirm"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                icon={Lock}
                            />
                        </div>

                        <div className="flex items-center gap-2 px-2">
                            <input type="checkbox" required className="rounded border-slate-300 text-primary focus:ring-primary" />
                            <span className="text-xs text-slate-600 font-medium leading-tight">
                                I agree to the <a href="#" className="text-primary font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-primary font-bold hover:underline">Privacy Policy</a>.
                            </span>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-600">
                            Already have an account? {' '}
                            <Link to="/login" className="font-extrabold text-primary hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
