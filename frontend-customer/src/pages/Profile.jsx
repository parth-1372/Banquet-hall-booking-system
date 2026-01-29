import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { User, Lock, Mail, ShieldCheck, Camera } from 'lucide-react';

const Profile = () => {
    const { user, checkUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/users/update-me', { name: formData.name });
            await checkUser(); // Refresh global user state
            toast.success('Identity profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Identity update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await api.patch('/users/update-password', {
                passwordCurrent: formData.currentPassword,
                password: formData.newPassword,
                passwordConfirm: formData.confirmPassword
            });
            toast.success('Password updated successfully!');
            setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Your Account</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your personal information and security settings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl font-black">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 capitalize">{user?.name}</h3>
                            <p className="text-sm text-slate-400 mb-6">{user?.email}</p>
                            <span className="px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-100 dark:border-green-900/50">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified User
                            </span>
                        </div>
                    </div>

                    {/* Forms */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Section */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" /> Profile Details
                                </h4>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm font-bold text-primary hover:underline underline-offset-4"
                                    >
                                        Edit Details
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    disabled={!isEditing}
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Email Address (Cannot be changed)"
                                    disabled={true}
                                    value={user?.email}
                                />
                                {isEditing && (
                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" loading={loading} className="px-8 shadow-lg shadow-primary/20">Save Changes</Button>
                                        <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Security Section */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-8">
                                <Lock className="w-5 h-5 text-red-500" /> Security & Password
                            </h4>

                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <Input
                                    label="Current Password"
                                    name="currentPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        label="New Password"
                                        name="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" loading={loading} className="w-full sm:w-auto px-10 shadow-lg shadow-primary/20 bg-slate-900 hover:bg-black dark:bg-primary dark:hover:bg-primary-600">
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
