import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import api from '../api/axios';
import { Calendar, Clock, MapPin, Users, ShoppingBag, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MultiBooking = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hallIds = searchParams.get('halls')?.split(',') || [];

    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingDate, setBookingDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [guestCount, setGuestCount] = useState(100);
    const [eventType, setEventType] = useState('Wedding');
    const [contactDetails, setContactDetails] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '9999999999'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchHalls = async () => {
            try {
                const hallData = await Promise.all(
                    hallIds.map(id => api.get(`/halls/${id}`).then(res => res.data.data.hall))
                );
                setHalls(hallData);
            } catch (err) {
                toast.error('Failed to load hall information');
            } finally {
                setLoading(false);
            }
        };

        if (hallIds.length > 0) {
            fetchHalls();
        } else {
            navigate('/halls');
        }
    }, [hallIds, navigate]);

    const handleBooking = async () => {
        if (!bookingDate || !selectedSlot) {
            toast.error('Please select a date and time slot');
            return;
        }

        setSubmitting(true);
        try {
            // In a real app, this might be a single "multi-booking" endpoint.
            // For now, let's assume we create multiple bookings.
            // (Or if the backend supports it, a single booking with multiple halls)

            await api.post('/bookings', {
                halls: halls.map(h => h._id),
                eventDate: bookingDate,
                timeSlot: selectedSlot,
                eventType,
                guestCount: parseInt(guestCount),
                contactDetails
            });

            toast.success('Combo Booking Successful! Redirecting...');
            setTimeout(() => navigate('/my-bookings'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed. Some halls might be booked.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Syncing Selected Venues...</div>;

    const getPrice = (hall, slot) => {
        if (!hall || !slot) return 0;
        const slotKey = slot === 'full-day' ? 'fullDay' : slot;
        return hall.pricing?.[slotKey] || hall.pricing?.fullDay || 0;
    };

    const totalPrice = halls.reduce((sum, h) => sum + getPrice(h, selectedSlot), 0);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Selected Halls Summary */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Multi-Hall Bridge</h1>
                            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">{halls.length} Entities Selected</span>
                        </div>

                        {halls.map((hall) => (
                            <div key={hall._id} className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex gap-6 group hover:shadow-md transition-shadow">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                                    <img src={hall.images?.[0]?.url || hall.primaryImage || "http://localhost:5000/uploads/hall_main.png"} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 py-2">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{hall.name}</h3>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wide mt-1 mb-4">
                                        <MapPin className="w-3.5 h-3.5" /> {hall.location?.city}
                                    </div>
                                    <div className="flex justify-between items-center pr-4">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                                <Users className="w-4 h-4" /> {hall.capacity?.maximum} Max
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Hall Specific Rate</p>
                                            <p className="text-primary font-black">₹{getPrice(hall, selectedSlot).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Booking Configurator */}
                    <div className="lg:w-96">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl sticky top-24">
                            <div className="flex items-center gap-3 mb-8">
                                <ShoppingBag className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Event Config</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Select Event Date
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Global Time Slot
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['morning', 'afternoon', 'evening', 'full-day'].map((slot) => (
                                            <button
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSlot === slot
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                                            >
                                                {slot === 'full-day' ? 'Full Day' : slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Type</label>
                                        <select
                                            value={eventType}
                                            onChange={(e) => setEventType(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="Wedding">Imperial Wedding</option>
                                            <option value="Conference">Corporate Summit</option>
                                            <option value="Party">Social Celebration</option>
                                            <option value="Banquet">Grand Banquet</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</label>
                                        <input
                                            type="text"
                                            value={contactDetails.name}
                                            onChange={(e) => setContactDetails({ ...contactDetails, name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                                            <input
                                                type="tel"
                                                value={contactDetails.phone}
                                                onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                            <input
                                                type="email"
                                                value={contactDetails.email}
                                                readOnly
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-400 dark:text-slate-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold text-sm">Base Total</span>
                                        <span className="text-slate-900 dark:text-white font-black">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-green-500 font-bold text-sm">
                                        <span>Combo Discount (5%)</span>
                                        <span>- ₹{Math.round(totalPrice * 0.05).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Total Net</span>
                                        <span className="text-2xl font-black text-primary">₹{Math.round(totalPrice * 0.95).toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleBooking}
                                    className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Bridging Data...' : (
                                        <>
                                            Execute Combo Booking <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-[9px] text-center text-slate-400 font-medium px-4">
                                    By proceeding, you agree to the composite booking policies for all selected venues.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiBooking;
