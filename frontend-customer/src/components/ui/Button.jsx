import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-600',
        secondary: 'bg-white text-primary border border-primary hover:bg-primary-50',
        gold: 'bg-accent-gold text-slate-900 hover:bg-accent-lightGold',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
