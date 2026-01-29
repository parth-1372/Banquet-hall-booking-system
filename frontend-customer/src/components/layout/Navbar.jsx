import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Calendar, Home, Search, Menu, X, Moon, Sun } from 'lucide-react';
import Button from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = React.useState(false);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Halls', path: '/halls', icon: Search },
        { name: 'My Bookings', path: '/my-bookings', icon: Calendar, protected: true },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-bold text-xl">N</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent hidden sm:block">
                            Netlarx
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            (!link.protected || user) && (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary'
                                        }`
                                    }
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.name}
                                </NavLink>
                            )
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-2 md:gap-4">
                                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all group">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <User className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <span className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-200">{user.name}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link to="/register">
                                    <Button>Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 animate-in slide-in-from-top duration-300 shadow-2xl z-[60] transition-colors">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            (!link.protected || user) && (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-4 text-lg font-bold text-slate-700 dark:text-slate-200 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                                >
                                    <div className="w-11 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                        <link.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    {link.name}
                                </Link>
                            )
                        ))}
                        <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2" />
                        {user ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold dark:text-white capitalize">{user.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{user.email}</span>
                                    </div>
                                </div>
                                <Button onClick={() => { logout(); setIsOpen(false); }} variant="secondary" className="w-full h-14 rounded-2xl border-red-100 dark:border-red-900/30 text-red-500">
                                    <LogOut className="w-5 h-5 mr-3" /> Logout Access
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 pt-2">
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full h-14 rounded-2xl">Sign In</Button>
                                </Link>
                                <Link to="/register" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
