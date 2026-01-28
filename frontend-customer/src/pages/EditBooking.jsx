import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import api from '../api/axios';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Users, ShoppingBag, Trash2, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const EditBooking = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [eventDate, setEventDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [guestCount, setGuestCount] = useState(0);
    const [eventType, setEventType] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [contactDetails, setContactDetails] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data } = await api.get(`/bookings/${id}`);
                const b = data.data.booking;

                // Security check
                if (b.user._id !== user.id) {
                    toast.error('Unauthorized Access');
                    return navigate('/my-bookings');
                }

                if (!['action-pending', 'change-requested'].includes(b.status)) {
                    toast.error('Booking cannot be edited anymore');
                    return navigate('/my-bookings');
                }

                setBooking(b);
                setEventDate(new Date(b.eventDate).toISOString().split('T')[0]);
                setTimeSlot(b.timeSlot);
                setGuestCount(b.guestCount || 0);
                setEventType(b.eventType || 'Celebration');
                setEventDescription(b.eventDescription || '');
                setContactDetails({
                    name: b.contactDetails?.name || user.name,
                    email: b.contactDetails?.email || user.email,
                    phone: b.contactDetails?.phone || user.phone || '9999999999'
                });
            } catch (err) {
                toast.error('Failed to load booking details');
                navigate('/my-bookings');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchBooking();
    }, [id, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.patch(`/bookings/my-bookings/${id}`, {
                eventDate,
                timeSlot,
                guestCount: parseInt(guestCount),
                eventType,
                eventDescription,
                contactDetails
            });

            toast.success('Event details re-synced successfully!');
            navigate('/my-bookings');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex shadow-inner items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Accessing Secure Stream...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <button onClick={() => navigate('/my-bookings')} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-12 font-black uppercase tracking-widest text-[10px]">
                    <ArrowLeft className="w-3 h-3" /> Return to Trajectory
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1">
                        <div className="mb-12">
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-4 italic">Edit <span className="text-primary">Connection</span></h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Re-configuring your venue parameters for the upcoming temporal event.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            {booking.halls.map(hall => (
                                <div key={hall._id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                                    <div className="w-24 h-24 bg-slate-100 rounded-3xl overflow-hidden shadow-inner">
                                        <img src={hall.images?.[0]?.url || hall.primaryImage || "http://localhost:5000/uploads/hall_main.png"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{hall.name}</h3>
                                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5 uppercase mt-1">
                                            <MapPin className="w-3 h-3 text-primary" /> {hall.location?.city}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-[450px]">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl sticky top-24">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Parameters</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-primary" /> Chronological Target
                                    </label>
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 px-8 text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold shadow-inner"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-primary" /> Temporal Slot
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['morning', 'afternoon', 'evening', 'full-day'].map((slot) => (
                                            <button
                                                type="button"
                                                key={slot}
                                                onClick={() => setTimeSlot(slot)}
                                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all ${timeSlot === slot
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                                                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                                            >
                                                {slot === 'full-day' ? 'Full Day' : slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Entity Count</label>
                                        <input
                                            type="number"
                                            value={guestCount}
                                            onChange={(e) => setGuestCount(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 px-8 text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Event Flow</label>
                                        <select
                                            value={eventType}
                                            onChange={(e) => setEventType(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 px-8 text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold shadow-inner"
                                        >
                                            <option value="Wedding">Imperial Wedding</option>
                                            <option value="Conference">Corporate Summit</option>
                                            <option value="Party">Social Celebration</option>
                                            <option value="Banquet">Grand Banquet</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Contact Phone</label>
                                    <input
                                        type="tel"
                                        value={contactDetails.phone}
                                        onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 px-8 text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold shadow-inner"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-20 rounded-[2rem] shadow-2xl shadow-primary/30 mt-8 text-lg font-black uppercase tracking-widest group"
                                >
                                    {submitting ? 'Syncing...' : (
                                        <span className="flex items-center justify-center gap-2">
                                            Finalize Re-sync <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditBooking;
