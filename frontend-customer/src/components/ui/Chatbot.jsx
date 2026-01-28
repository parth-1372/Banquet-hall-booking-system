import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus, Maximize2, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FAQS = [
    { q: "How do I book a hall?", a: "You can browse halls from the 'Halls' page, select a date and slot, and click 'Request Booking'. Admin will then analyze your request." },
    { q: "What are the payment terms?", a: "Once Admin1 analyzes and Admin2 checks availability, you will receive a payment request. You need to pay the advance to confirm." },
    { q: "Can I book multiple halls?", a: "Yes! In the Halls list, enable 'Book Multiple Halls' mode to select and request multiple venues at once." },
    { q: "How to cancel a booking?", a: "Go to 'My Bookings', select the booking, and if the status allows, you can request a cancellation." },
    { q: "Whom to contact for technical help?", a: "You can go to the 'Contact' page to talk to our expert team for immediate assistance." }
];

const Chatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: `Hi ${user ? user.name : 'there'}! I'm Netty, your hall booking assistant. How can I help you today?` }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);
    const chatbotRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (text = input) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setInput('');

        // Simple Bot Logic
        setTimeout(() => {
            const query = text.toLowerCase();
            let response = "I'm not sure about that. Would you like to check our FAQs or contact an expert?";

            const faq = FAQS.find(f => query.includes(f.q.toLowerCase().split(' ').slice(0, 3).join(' ')));
            if (faq) {
                response = faq.a;
            } else if (query.includes('hi') || query.includes('hello')) {
                response = "Hello! How can I assist you with your booking today?";
            } else if (query.includes('price') || query.includes('cost')) {
                response = "Prices vary by hall and slot. You can see specific pricing on each hall's details page.";
            }

            setMessages(prev => [...prev, { role: 'bot', text: response }]);
        }, 600);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
            >
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-bounce hidden group-hover:block" />
                <MessageCircle className="w-8 h-8" />
            </button>
        );
    }

    return (
        <div ref={chatbotRef} className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 z-[100] transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm leading-none">Netty Assistant</h4>
                        <span className="text-[10px] text-white/70">Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg"><Minus className="w-4 h-4" /></button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 h-[380px] overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick FAQs */}
                    <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        {FAQS.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(f.q)}
                                className="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all"
                            >
                                {f.q}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none outline-none px-4 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        />
                        <button
                            onClick={() => handleSend()}
                            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:shadow-lg shadow-primary/20 transition-all active:scale-90"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Chatbot;
