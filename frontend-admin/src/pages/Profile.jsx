import React, { useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, ShieldCheck, Key, LogOut } from 'lucide-react';
import AdminButton from '../components/ui/AdminButton';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Profile = () => {
    const { user, checkUser, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        currentPassword: '',
        newPassword: '',
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.patch('/auth/update-profile', { name: formData.name });
            await checkUser();
            toast.success('Identity profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Identity update failed');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!formData.currentPassword || !formData.newPassword) {
            toast.error('Please fill both password fields.');
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }
        try {
            await api.patch('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            toast.success('Access credentials updated!');
            setFormData({ ...formData, currentPassword: '', newPassword: '' });
        } catch (err) {
            const message = err.response?.data?.message || 'Credential update failed';
            if (message.toLowerCase().includes('incorrect')) {
                toast.error('Current password is incorrect. Please try again.');
            } else {
                toast.error(message);
            }
        }
    };

    return (
        <AdminLayout title="System Identity">
            <div className="max-w-4xl mx-auto space-y-10 pb-20">
                {/* Identity Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="bg-admin-primary/5 p-12 flex flex-col items-center border-b border-slate-50 dark:border-slate-800 transition-colors">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl flex items-center justify-center transition-all group-hover:rotate-6">
                                <User className="w-16 h-16 text-admin-primary" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-admin-primary rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-slate-800">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <h2 className="mt-8 text-3xl font-black text-slate-800 dark:text-white capitalize tracking-tight">{user?.name}</h2>
                        <div className="mt-2 px-4 py-1.5 bg-admin-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                            {user?.role?.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="p-12">
                        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Identity Label</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-12 py-4 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-admin-primary/20 transition-all disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">System Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        disabled
                                        value={user?.email}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-12 py-4 font-bold text-slate-400 dark:text-slate-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-6 flex justify-between items-center border-t border-slate-50 dark:border-slate-800 transition-colors">
                                {isEditing ? (
                                    <div className="flex gap-4">
                                        <AdminButton type="submit">Deploy Changes</AdminButton>
                                        <AdminButton variant="secondary" onClick={() => setIsEditing(false)}>Cancel</AdminButton>
                                    </div>
                                ) : (
                                    <AdminButton onClick={() => setIsEditing(true)}>Modify Identity</AdminButton>
                                )}
                                <button onClick={logout} className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-3 rounded-2xl transition-all">
                                    <LogOut className="w-4 h-4" /> Terminate Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Security Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-500">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Security & Access</h3>
                            <p className="text-xs text-slate-400 font-medium">Update your administrative access credentials</p>
                        </div>
                    </div>
                    <div className="p-12">
                        <form onSubmit={handleChangePassword} className="space-y-8 max-w-md">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Current Secret</label>
                                <input
                                    type="password"
                                    placeholder="Enter current password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-admin-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">New Sequence</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-admin-primary/20 transition-all"
                                />
                            </div>
                            <AdminButton type="submit" variant="secondary" className="w-full h-14">Rotate Credentials</AdminButton>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Profile;
