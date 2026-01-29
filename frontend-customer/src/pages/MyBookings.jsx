import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import api from '../api/axios';
import { Calendar, MapPin, Clock, CreditCard, ChevronRight, CheckCircle, Clock3, XCircle, Search, Users, Edit3, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { RAZORPAY_KEY_ID } from '../utils/assetUrl';

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState('all');
    const [processingPayment, setProcessingPayment] = useState(null);

    const handlePayment = async (booking) => {
        setProcessingPayment(booking.id || booking._id);
        try {
            // 1. Create Order
            const { data: orderData } = await api.post('/payments/create-order', {
                bookingId: booking.id || booking._id
            });

            const { order } = orderData.data;

            // 2. Open Razorpay Modal
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "VenueVista",
                description: `Payment for ${booking.halls?.[0]?.name || 'Booking'}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await api.post('/payments/verify', {
                            ...response,
                            bookingId: booking.id || booking._id
                        });
                        toast.success('Payment Successful!');
                        fetchBookings();
                    } catch (err) {
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: booking.user?.name || "",
                    email: booking.user?.email || "",
                    contact: booking.user?.phone || ""
                },
                theme: {
                    color: "#6366f1"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment failed: ' + response.error.description);
            });
            rzp.open();

        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not initiate payment');
        } finally {
            setProcessingPayment(null);
        }
    };

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my-bookings');
            setBookings(data.data.bookings);
        } catch (err) {
            toast.error('Could not load your bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await api.patch(`/bookings/${id}/cancel`, { reason: 'Cancelled by user' });
            toast.success('Booking cancelled');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cancellation failed');
        }
    };

    const statusMap = {
        'action-pending': { label: 'Action Pending', icon: Clock3, bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
        'change-requested': { label: 'Changes Requested', icon: Search, bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900' },
        'approved-admin1': { label: 'Admin1 Approved', icon: CheckCircle, bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900' },
        'payment-requested': { label: 'Payment Requested', icon: CreditCard, bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-900' },
        'approved-admin2': { label: 'Admin2 Approved', icon: CheckCircle, bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-900' },
        'confirmed': { label: 'Confirmed', icon: CheckCircle, bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-900' },
        'cancelled': { label: 'Cancelled', icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-900' },
        'rejected': { label: 'Rejected', icon: XCircle, bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-700 dark:text-red-500', border: 'border-red-100 dark:border-red-900' }
    };

    const filterOptions = [
        { id: 'all', label: 'All Event Flows' },
        { id: 'active', label: 'Active Process' },
        { id: 'confirmed', label: 'Successful' },
        { id: 'cancelled', label: 'Inactive' }
    ];

    const filteredBookings = bookings.filter(b => {
        if (activeStatus === 'all') return true;
        if (activeStatus === 'active') return ['action-pending', 'change-requested', 'approved-admin1', 'payment-requested', 'approved-admin2'].includes(b.status);
        if (activeStatus === 'confirmed') return b.status === 'confirmed';
        if (activeStatus === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-2">Event <span className="text-primary italic">Trajectory</span></h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Tracking your premium venue connections and lifecycle.</p>
                    </div>
                    <Link to="/halls" className="w-full md:w-auto">
                        <Button className="w-full md:w-auto h-12 sm:h-14 px-6 sm:px-8 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">Initialize New Booking</Button>
                    </Link>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2 mb-10 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl w-fit">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setActiveStatus(opt.id)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeStatus === opt.id
                                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="h-56 bg-white dark:bg-slate-900 rounded-[40px] animate-pulse border border-slate-100 dark:border-slate-800" />
                        ))}
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="space-y-8">
                        {filteredBookings.map((booking) => {
                            const status = statusMap[booking.status] || statusMap.requested;
                            const mainHall = booking.halls?.[0] || booking.hall;
                            return (
                                <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Visual Component */}
                                        <div className="lg:w-80 h-48 lg:h-auto overflow-hidden relative">
                                            <img
                                                src={mainHall?.images?.[0] || mainHall?.primaryImage || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"}
                                                alt={mainHall?.name}
                                                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                            <div className={`absolute top-6 left-6 px-4 py-2 rounded-2xl border flex items-center gap-2 backdrop-blur-md ${status.bg} ${status.text} ${status.border} text-[10px] font-black uppercase shadow-2xl`}>
                                                <status.icon className="w-4 h-4" />
                                                {status.label}
                                            </div>
                                        </div>

                                        {/* Data Component */}
                                        <div className="flex-1 p-8 md:p-10">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-primary transition-colors">{mainHall?.name} {booking.halls?.length > 1 && <span className="text-primary font-medium text-lg">& {booking.halls.length - 1} More</span>}</h3>
                                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                                        {mainHall?.location?.city}, {mainHall?.location?.state}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5">Stream ID</div>
                                                    <div className="text-xs font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-inner inline-block">{booking.bookingId}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> Target Chronology</p>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(booking.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black">{booking.timeSlot} Segment</p>
                                                </div>
                                                <div className="space-y-1 border-slate-100 dark:border-slate-800 sm:border-x sm:px-8">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3 h-3 text-primary" /> Guest Density</p>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{booking.guestCount} Units</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black">Capacity Approved</p>
                                                </div>
                                                <div className="space-y-1 sm:pl-4">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-primary" /> Financial Commitment</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">₹{booking.pricing?.totalAmount?.toLocaleString()}</p>
                                                    <p className="text-[10px] text-emerald-500 uppercase font-black">Taxes Accounted</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800 gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Process Init: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                <div className="flex gap-4">
                                                    <Link to={`/halls/${mainHall?.id || mainHall?._id}`}>
                                                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest px-6 h-10 border-slate-200 dark:border-slate-700">Audit Venue</Button>
                                                    </Link>
                                                    {['action-pending', 'change-requested', 'approved-admin1'].includes(booking.status) && (
                                                        <button
                                                            onClick={() => handleCancel(booking.id)}
                                                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white px-6 h-10 rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-500 transition-all shadow-sm"
                                                        >
                                                            Abort Stream
                                                        </button>
                                                    )}
                                                    {['action-pending', 'change-requested'].includes(booking.status) && (
                                                        <Link to={`/edit-booking/${booking.id || booking._id}`}>
                                                            <Button className="h-10 px-6 text-[10px] font-black bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 text-white">
                                                                <Edit3 className="w-3 h-3 mr-2" /> Re-config
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <Button
                                                            onClick={() => navigate(`/invoice/${booking.id || booking._id}`)}
                                                            className="h-10 px-6 text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 text-white"
                                                        >
                                                            <FileText className="w-3 h-3 mr-2" /> Invoice
                                                        </Button>
                                                    )}
                                                    {booking.status === 'payment-requested' && (
                                                        <Button
                                                            onClick={() => handlePayment(booking)}
                                                            disabled={processingPayment === (booking.id || booking._id)}
                                                            className="h-10 px-6 text-[10px] font-black shadow-lg shadow-primary/20 bg-primary group"
                                                        >
                                                            {processingPayment === (booking.id || booking._id) ? 'Connecting...' : 'Settle Revenue'}
                                                            <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[60px] p-20 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center transition-colors">
                        <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-6xl mb-8 shadow-inner animate-bounce">🎈</div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 italic">Empty Stream</h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-sm mx-auto font-medium leading-relaxed">Your event trajectory is looking a bit quiet. Shall we initialize a connection with our premium venues?</p>
                        <Link to="/halls">
                            <Button className="h-16 px-12 text-lg shadow-2xl shadow-primary/30 group">
                                Explore Venue Matrix <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="mt-20 p-8 bg-primary rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-4xl">🎁</div>
                            <div>
                                <h3 className="text-2xl font-black mb-1">Refer a Friend</h3>
                                <p className="text-white/70">Get 10% off on your next booking when you share!</p>
                            </div>
                        </div>
                        <Button variant="gold" className="h-14 px-12 text-black font-black whitespace-nowrap">Invite Now</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
