import React from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Sun, Moon } from 'lucide-react';

const AdminLayout = ({ children, title }) => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 lg:p-12">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active System</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        </div>

                        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 mx-2" />

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400"
                        >
                            {darkMode ? <Sun className="w-5 h-5 shadow-inner" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400 relative group">
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-admin-primary rounded-full animate-ping" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-admin-primary rounded-full" />
                            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
