import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import api from '../api/axios';
import {
    Users, Mail, Shield, ShieldAlert,
    ToggleLeft, ToggleRight, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data.data.users);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (id, current) => {
        try {
            await api.patch(`/users/${id}`, { isActive: !current });
            toast.success('User status updated');
            fetchUsers();
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleRoleUpdate = async (id, newRole) => {
        try {
            await api.patch(`/users/${id}`, { role: newRole });
            toast.success(`Role updated to ${newRole}`);
            fetchUsers();
        } catch (err) {
            toast.error('Role update failed');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === '' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <AdminLayout title="User Accounts">
            <div className="mb-6 sm:mb-8 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-admin-primary/20 text-slate-700 dark:text-slate-200 shadow-sm transition-all"
                    />
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-admin-primary/20 transition-all appearance-none"
                        >
                            <option value="">All Roles</option>
                            <option value="customer">Customer</option>
                            <option value="admin1">Analysis Admin (Level 1)</option>
                            <option value="admin2">Operations Admin (Level 2)</option>
                            <option value="super_admin">Finance/Super Admin (Level 3)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl lg:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Profile</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Privileges</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Metadata</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Access Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 animate-pulse">Loading Identity Matrix...</td></tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-lg border border-slate-200 dark:border-slate-700">
                                                    {user.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white leading-none mb-1 capitalize group-hover:text-admin-primary transition-colors">{user.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                                disabled={currentUser?.role === 'admin1'}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border outline-none bg-transparent ${user.role === 'customer'
                                                    ? 'text-sky-700 border-sky-100 dark:text-sky-500 dark:border-sky-900'
                                                    : 'text-indigo-700 border-indigo-100 dark:text-indigo-400 dark:border-indigo-900'
                                                    }`}
                                            >
                                                <option value="customer">Customer</option>
                                                {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin2') && (
                                                    <option value="admin1">Admin 1</option>
                                                )}
                                                {currentUser?.role === 'super_admin' && (
                                                    <>
                                                        <option value="admin2">Admin 2</option>
                                                        <option value="super_admin">Admin 3 (Super)</option>
                                                    </>
                                                )}
                                            </select>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-sm">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
                                                </div>
                                                <p className="text-[10px] text-slate-400 ml-5">Primary Contact</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${user.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500' : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-500'
                                                }`}>
                                                {user.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => toggleStatus(user.id, user.isActive)}
                                                className={`p-2 rounded-xl transition-all ${user.isActive
                                                    ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                    : 'text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    }`}
                                                title={user.isActive ? 'Suspend User' : 'Activate User'}
                                            >
                                                {user.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium italic">Zero results found for current identity query.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 sm:p-6 space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 animate-pulse">Loading Identity Matrix...</div>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-4">
                                {/* User Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-xl border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                        {user.name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 dark:text-white capitalize truncate">{user.name}</h4>
                                        <p className="text-xs text-slate-400">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(user.id, user.isActive)}
                                        className={`flex-shrink-0 p-2 rounded-xl transition-all ${user.isActive
                                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                                : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                                            }`}
                                    >
                                        {user.isActive ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                                    </button>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-admin-primary" />
                                        <span className="text-slate-600 dark:text-slate-400 truncate">{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="w-4 h-4 text-admin-primary" />
                                            <span className="text-slate-600 dark:text-slate-400">{user.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Privileges</label>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                        disabled={currentUser?.role === 'admin1'}
                                        className={`w-full px-4 py-3 rounded-xl text-xs font-black uppercase border outline-none ${user.role === 'customer'
                                                ? 'text-sky-700 border-sky-200 bg-sky-50 dark:text-sky-500 dark:border-sky-900/50 dark:bg-sky-900/10'
                                                : 'text-indigo-700 border-indigo-200 bg-indigo-50 dark:text-indigo-400 dark:border-indigo-900/50 dark:bg-indigo-900/10'
                                            }`}
                                    >
                                        <option value="customer">Customer</option>
                                        {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin2') && (
                                            <option value="admin1">Admin 1</option>
                                        )}
                                        {currentUser?.role === 'super_admin' && (
                                            <>
                                                <option value="admin2">Admin 2</option>
                                                <option value="super_admin">Admin 3 (Super)</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${user.isActive
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 text-slate-400 font-medium italic">
                            Zero results found for current identity query.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default UserManagement;
