import React from 'react';

const AdminButton = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, size = 'md' }) => {
    const variants = {
        primary: 'bg-admin-primary text-white hover:bg-sky-600',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        success: 'bg-admin-accent text-white hover:bg-emerald-600',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

export default AdminButton;
