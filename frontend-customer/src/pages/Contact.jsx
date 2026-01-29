import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'Venue Booking Inquiry', message: '' });
    const [sending, setSending] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill all required fields');
            return;
        }
        setSending(true);
        // Simulated API call
        await new Promise(res => setTimeout(res, 1500));
        toast.success('Message sent successfully! We will get back to you shortly.', { duration: 5000, icon: '✉️' });
        setFormData({ name: '', email: '', subject: 'Venue Booking Inquiry', message: '' });
        setSending(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-24">
                <div className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Connect with Our Experts</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                        Whether you're planning a grand wedding or a corporate gala,
                        our team is here to ensure every detail of your venue is perfect.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Contact Info */}
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Speak to Us</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">+91 98765 43210</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Available 9am - 8pm IST</p>
                            </div>
                            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Email Inquiries</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">support@netlarx.com</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Quick response within 24h</p>
                            </div>
                        </div>

                        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Visit our Experience Center</h3>
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                    Suite 405, Tech Plaza, Silicon Valley Blvd,<br />
                                    Mumbai, Maharashtra - 400051
                                </p>
                            </div>
                        </div>

                        <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-[32px] border border-primary/10">
                            <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" /> Instant Support
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Need faster answers? Use our 24/7 AI-powered chatbot located at the bottom right corner of your screen.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Send a Custom Inquiry</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                                    <input
                                        name="name" value={formData.name} onChange={handleChange}
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address *</label>
                                    <input
                                        name="email" value={formData.email} onChange={handleChange}
                                        type="email"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                <select name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                                    <option>Venue Booking Inquiry</option>
                                    <option>Bulk/Corporate Deal</option>
                                    <option>Partnership Request</option>
                                    <option>Feedback & Suggestions</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message *</label>
                                <textarea
                                    name="message" value={formData.message} onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[150px] resize-none"
                                    placeholder="Tell us about your event..."
                                />
                            </div>
                            <Button type="submit" disabled={sending} className="w-full py-5 text-lg shadow-xl shadow-primary/25 group">
                                {sending ? (
                                    <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Sending...</span>
                                ) : (
                                    <><Send className="w-5 h-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Transmit Message</>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
