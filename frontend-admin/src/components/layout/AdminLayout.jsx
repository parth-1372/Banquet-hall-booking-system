import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Sun, Moon, Menu } from 'lucide-react';

const AdminLayout = ({ children, title }) => {
    const { darkMode, toggleDarkMode } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 xl:p-12 w-full">
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-10">
                    <div className="flex items-center gap-3">
                        {/* Hamburger menu for mobile */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </button>

                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active System</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        </div>

                        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? <Sun className="w-5 h-5 shadow-inner" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <button
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400 relative group"
                            aria-label="Notifications"
                        >
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
