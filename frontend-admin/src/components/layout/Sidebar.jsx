import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard, Building2, CalendarRange, Users,
    MessageSquare, Settings, LogOut, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, user } = useAuth();

    const allMenuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Halls', path: '/halls', icon: Building2 },
        { name: 'Bookings', path: '/bookings', icon: CalendarRange },
        { name: 'Users', path: '/users', icon: Users, superAdminOnly: true },
        { name: 'My Profile', path: '/profile', icon: Settings },
    ];

    const menuItems = allMenuItems.filter(item => !item.superAdminOnly || user?.role === 'super_admin');

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) { // lg breakpoint
            onClose?.();
        }
    };

    return (
        <>
            {/* Backdrop overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[98] lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 
                text-slate-500 dark:text-slate-400 flex flex-col fixed left-0 top-0 z-[99] transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>

                {/* Admin Logo */}
                <Link to="/" className="p-8 pb-12 flex items-center gap-3 group" onClick={handleLinkClick}>
                    <div className="w-10 h-10 bg-admin-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-admin-primary/20 group-hover:rotate-12 transition-transform">
                        <span className="font-bold text-xl">N</span>
                    </div>
                    <div>
                        <h1 className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">Netlarx</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-admin-primary">Admin Control</p>
                    </div>
                </Link>

                {/* Nav Links - Enhanced touch targets */}
                <nav className="flex-1 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={({ isActive }) => `
              flex items-center justify-between group px-4 py-4 rounded-xl transition-all duration-300
              ${isActive
                                    ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-admin-primary dark:hover:text-slate-200'}
            `}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-4 mt-auto">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-4 transition-all">
                        <Link to="/profile" className="flex items-center gap-3 mb-3 group" onClick={handleLinkClick}>
                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold uppercase group-hover:border-admin-primary/50 transition-colors">
                                {user?.name?.[0]}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-admin-primary transition-colors">{user?.name}</p>
                                <p className="text-[10px] text-slate-500 truncate uppercase mt-0.5">{user?.role?.replace('_', ' ')}</p>
                            </div>
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
