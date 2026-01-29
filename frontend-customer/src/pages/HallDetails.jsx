import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import {
    MapPin, Users, Star, Check, Info, Calendar as CalendarIcon,
    Clock, CreditCard, ChevronLeft, Image as ImageIcon, Share2, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_HALL_IMAGE, DEFAULT_360_IMAGE, getAssetUrl } from '../utils/assetUrl';

const HallDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [hall, setHall] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [viewMode, setViewMode] = useState('photo'); // 'photo' or '360'
    const [activeImage, setActiveImage] = useState('');

    // Booking state
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [availability, setAvailability] = useState([]);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [guestCount, setGuestCount] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [hallRes, reviewsRes] = await Promise.all([
                    api.get(`/halls/${id}`),
                    api.get(`/halls/${id}/reviews`)
                ]);
                const hallData = hallRes.data.data.hall;
                setHall(hallData);
                setReviews(reviewsRes.data.data.reviews || []);
                if (hallData.images && hallData.images.length > 0) {
                    const primary = hallData.images.find(img => img.isPrimary);
                    setActiveImage(primary ? primary.url : hallData.images[0].url);
                } else {
                    setActiveImage(hallData.primaryImage || '');
                }
            } catch (err) {
                toast.error('Could not load hall details');
                navigate('/halls');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    useEffect(() => {
        if (bookingDate) {
            checkAvailability();
        }
    }, [bookingDate]);

    const viewerRef = useRef(null);

    useEffect(() => {
        if (viewMode === '360' && !loading && hall) {
            const timer = setTimeout(() => {
                if (window.pannellum) {
                    // Destroy existing viewer if it exists
                    if (viewerRef.current) {
                        try { viewerRef.current.destroy(); } catch (e) { }
                    }

                    viewerRef.current = window.pannellum.viewer('panorama', {
                        "type": "equirectangular",
                        "panorama": hall.rotationViewUrl ? getAssetUrl(hall.rotationViewUrl) : DEFAULT_360_IMAGE,
                        "autoLoad": true,
                        "autoRotate": -1.5,
                        "hfov": 110,
                        "crossOrigin": "anonymous",
                        "autoRotateInactivityDelay": 3000,
                        "showZoomCtrl": true
                    });
                }
            }, 100);
            return () => {
                clearTimeout(timer);
                if (viewerRef.current) {
                    try { viewerRef.current.destroy(); } catch (e) { }
                    viewerRef.current = null;
                }
            };
        }
    }, [viewMode, loading, hall]);

    const checkAvailability = async () => {
        setCheckingAvailability(true);
        setSelectedSlot(null);
        try {
            const { data } = await api.get(`/bookings/check-availability?hallId=${id}&date=${bookingDate}`);
            setAvailability(data.data.slots);
        } catch (err) {
            console.error('Error checking availability:', err);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleBooking = async () => {
        if (!user) {
            toast.error('Please login to book');
            return navigate('/login');
        }
        if (!selectedSlot || !guestCount) {
            toast.error('Please select a slot and guest count');
            return;
        }

        setIsBooking(true);
        try {
            const bookingData = {
                halls: [id], // Backend now expects halls array
                eventDate: bookingDate,
                timeSlot: selectedSlot.id,
                eventType: 'Celebration',
                guestCount: parseInt(guestCount),
                contactDetails: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '9999999999'
                }
            };

            await api.post('/bookings', bookingData);
            toast.success('Initial request sent to Admin1 for analysis!');
            navigate('/my-bookings');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally {
            setIsBooking(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
            <Navbar />

            {/* Top Banner / Actions */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <div className="flex gap-4">
                    <button className="p-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"><Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
                    <button className="p-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-600 dark:text-slate-400 hover:text-red-500"><Heart className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Gallery / 360 View */}
                        <div className="space-y-4">
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group border-8 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 aspect-video">
                                {viewMode === 'photo' ? (
                                    <img
                                        src={getAssetUrl(activeImage) || DEFAULT_HALL_IMAGE}
                                        alt={hall.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full relative bg-slate-900 overflow-hidden">
                                        <div id="panorama" style={{ width: '100%', height: '100%' }}></div>
                                        <div className="absolute inset-0 pointer-events-none border-4 border-primary/20 animate-pulse" />
                                    </div>
                                )}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-black/20 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10">
                                    <button
                                        onClick={() => setViewMode('photo')}
                                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'photo' ? 'bg-white text-primary shadow-xl' : 'text-white hover:bg-white/10'}`}
                                    >
                                        <ImageIcon className="w-4 h-4" /> Gallery
                                    </button>
                                    <button
                                        onClick={() => setViewMode('360')}
                                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === '360' ? 'bg-white text-primary shadow-xl' : 'text-white hover:bg-white/10'}`}
                                    >
                                        <Clock className={`w-4 h-4 ${viewMode === '360' ? 'animate-spin-slow' : ''}`} /> 360* Virtual
                                    </button>
                                </div>
                            </div>

                            {/* Multi-Image Strip */}
                            {hall.images && hall.images.length > 0 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                    {hall.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setActiveImage(img.url || img); setViewMode('photo'); }}
                                            className={`w-32 h-24 rounded-3xl overflow-hidden border-4 transition-all flex-shrink-0 relative group shadow-sm ${activeImage === (img.url || img) ? 'border-primary scale-105 shadow-primary/20' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                                        >
                                            <img src={getAssetUrl(img.url || img)} className="w-full h-full object-cover" />
                                            <div className={`absolute inset-0 bg-primary/20 transition-opacity ${activeImage === (img.url || img) ? 'opacity-0' : 'opacity-0 group-hover:opacity-10'}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Title & Info */}
                        <section>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase tracking-widest">{hall.type}</span>
                                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-lg">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">{hall.rating?.average || '0.0'} ({hall.rating?.count} reviews)</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">{hall.name}</h1>
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium text-lg mb-8">
                                <MapPin className="w-5 h-5" />
                                {hall.location?.address}, {hall.location?.city}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary"><Users /></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Capacity</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{hall.capacity?.minimum}-{hall.capacity?.maximum}</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary"><CreditCard /></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Full Day</span>
                                    <span className="font-bold text-slate-900 dark:text-white">₹{hall.pricing?.fullDay?.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary"><ImageIcon /></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">View</span>
                                    <span className="font-bold text-slate-900 dark:text-white">360* Virtual</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary"><Info /></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status</span>
                                    <span className="font-bold text-slate-900 dark:text-white">Verified</span>
                                </div>
                            </div>
                        </section>

                        {/* Description */}
                        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">About this venue</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10 whitespace-pre-line">
                                {hall.description}
                            </p>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Included Amenities</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {hall.amenities?.map((ame) => (
                                    <div key={ame} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                        <div className="w-6 h-6 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        {ame}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Reviews */}
                        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Reviews</h2>
                                <div className="flex items-center gap-1 font-bold text-lg text-slate-900 dark:text-white">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> {hall.rating?.average}
                                </div>
                            </div>

                            <div className="space-y-8">
                                {reviews.length > 0 ? reviews.map(rev => (
                                    <div key={rev.id} className="border-b border-slate-50 dark:border-slate-800 pb-8 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700" />
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white leading-none mb-1 capitalize">{rev.user?.name}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{new Date(rev.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(rev.rating)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">"{rev.review}"</p>
                                    </div>
                                )) : (
                                    <p className="text-slate-400 dark:text-slate-500 text-center italic py-10">No reviews yet for this hall.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Booking Form */}
                    <aside className="lg:sticky lg:top-28 h-fit">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-colors">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                            <div className="flex justify-between items-center mb-8">
                                <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Book Now</div>
                                <div className="text-primary font-black text-2xl">₹{hall.pricing?.fullDay?.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/day</span></div>
                            </div>

                            <div className="space-y-6">
                                {/* Date Picker */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" /> Selection Date
                                    </label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 transition-colors"
                                    />
                                </div>

                                {/* Slot Selector */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Time Slot
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {checkingAvailability ? (
                                            <div className="py-4 text-center text-slate-400 text-sm animate-pulse">Checking...</div>
                                        ) : availability.map((slot) => (
                                            <button
                                                key={slot.id}
                                                disabled={!slot.isAvailable}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`flex justify-between items-center p-4 rounded-2xl border transition-all text-left ${selectedSlot?.id === slot.id
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-primary/30 bg-white dark:bg-slate-800 shadow-sm'
                                                    } ${!slot.isAvailable ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                            >
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white capitalize">{slot.label}</div>
                                                    <div className="text-xs text-slate-400">{slot.startTime} - {slot.endTime}</div>
                                                </div>
                                                {!slot.isAvailable ? (
                                                    <span className="text-[10px] font-bold text-red-500 uppercase">Booked</span>
                                                ) : (
                                                    <div className="text-right">
                                                        <div className="font-bold text-primary">₹{slot.price?.toLocaleString()}</div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Guest Count */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4" /> Guest Count
                                    </label>
                                    <input
                                        type="number"
                                        placeholder={`Min ${hall.capacity?.minimum}`}
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(e.target.value)}
                                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:border-primary font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 transition-colors"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Capacity: {hall.capacity?.minimum} - {hall.capacity?.maximum}</p>
                                </div>

                                {/* Pricing Summary */}
                                {selectedSlot && (
                                    <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl space-y-3 border border-primary/10 dark:border-primary/20">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Venue Base</span>
                                            <span className="font-bold text-slate-900 dark:text-white">₹{selectedSlot.price?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">GST (18%)</span>
                                            <span className="font-bold text-slate-900 dark:text-white">₹{Math.round(selectedSlot.price * 0.18).toLocaleString()}</span>
                                        </div>
                                        <div className="h-[1px] bg-primary/20" />
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-900 dark:text-white">Total</span>
                                            <span className="text-xl font-black text-primary">₹{Math.round(selectedSlot.price * 1.18).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleBooking}
                                    disabled={isBooking || !selectedSlot}
                                    className="w-full h-14 text-lg shadow-xl"
                                >
                                    {isBooking ? 'Processing...' : 'Request Booking'}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                                <Info className="w-4 h-4 text-primary" /> Policy
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {hall.policies?.cancellation}
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default HallDetails;
