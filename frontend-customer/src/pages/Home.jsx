import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import api from '../api/axios';
import { MapPin, Users, Star, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { DEFAULT_HALL_IMAGE, DEFAULT_360_IMAGE } from '../utils/assetUrl';

const Home = () => {
    const [featuredHalls, setFeaturedHalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await api.get('/halls/featured'); // Matches our backend route
                setFeaturedHalls(data.data.halls);
            } catch (error) {
                console.error('Error fetching featured halls:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();

        const initPannellum = () => {
            if (window.pannellum && document.getElementById('hero-panorama')) {
                window.pannellum.viewer('hero-panorama', {
                    "type": "equirectangular",
                    "panorama": DEFAULT_360_IMAGE,
                    "autoLoad": true,
                    "autoRotate": -1.5,
                    "showControls": false,
                    "hfov": 100
                });
            } else {
                setTimeout(initPannellum, 500);
            }
        };
        initPannellum();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <header className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_top_right,rgba(77,119,255,0.1),transparent_50%)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                                <Star className="w-4 h-4 fill-primary" />
                                Top Rated Banquet Hall Booking
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-6">
                                Make Your <span className="text-primary">Special Moments</span> Unforgettable
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0">
                                Discover and book the perfect venue for weddings, conferences, and celebrations.
                                Premium halls, seamless booking, and exceptional service.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link to="/halls">
                                    <Button className="w-full sm:w-auto h-14 px-10 text-lg">
                                        Browse Halls <ChevronRight className="ml-2 w-5 h-5 inline" />
                                    </Button>
                                </Link>
                                <div className="flex -space-x-3 overflow-hidden ml-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <img
                                            key={i}
                                            className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                                            alt="User avatar"
                                        />
                                    ))}
                                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 ring-2 ring-white text-xs font-bold text-slate-500">
                                        +2k
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-slate-500">
                                    Trusted by 2000+ happy customers
                                </div>
                            </div>

                            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                {['Google', 'Airbnb', 'Microsoft', 'Uber'].map((brand) => (
                                    <span key={brand} className="text-2xl font-bold tracking-tighter text-slate-400">{brand}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-slate-900 aspect-[4/3]">
                                <div id="hero-panorama" className="w-full h-full"></div>
                                <div className="absolute inset-0 pointer-events-none border-4 border-primary/20 animate-pulse rounded-3xl" />
                            </div>
                            <div className="absolute -bottom-6 -left-6 z-20 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs animate-bounce-subtle">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 leading-tight">360* Virtual Tour</div>
                                    <div className="text-xs text-slate-500">Explore every detail online</div>
                                </div>
                            </div>
                            <div className="absolute top-1/2 -right-12 -z-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Section */}
            <section className="bg-white dark:bg-slate-900/50 py-16 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Total Halls', value: '150+' },
                            { label: 'Happy Events', value: '2500+' },
                            { label: 'Total Cities', value: '25+' },
                            { label: 'Verified Reviews', value: '1800+' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Halls Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Featured Venues</h2>
                            <p className="text-slate-600 dark:text-slate-400">Handpicked banquet halls with top-notch amenities and service.</p>
                        </div>
                        <Link to="/halls" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:underline group">
                            View All Venues <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl h-96 animate-pulse border border-slate-100 dark:border-slate-800" />
                            ))
                        ) : featuredHalls.length > 0 ? (
                            featuredHalls.map((hall) => (
                                <Link to={`/halls/${hall.id}`} key={hall.id} className="group cursor-pointer">
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 h-full">
                                        {/* Image */}
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={hall.primaryImage || DEFAULT_HALL_IMAGE}
                                                alt={hall.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-full text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                                                {hall.type}
                                            </div>
                                            <div className="absolute bottom-4 right-4 px-3 py-1 bg-primary text-white rounded-lg text-sm font-bold">
                                                ₹{hall.pricing?.fullDay?.toLocaleString()}/Day
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{hall.name}</h3>
                                                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{hall.rating?.average || '0.0'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium">
                                                <MapPin className="w-4 h-4" />
                                                {hall.location?.city}, {hall.location?.state}
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <Users className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Up to {hall.capacity?.maximum} Guests</span>
                                                </div>
                                                <span className="text-primary font-bold text-sm">View Details</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                                <span className="text-lg">No featured halls available right now.</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 bg-white dark:bg-slate-900 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 px-4">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Book with Netlarx?</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We redefine the hall booking experience with technology and premium service.</p>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: 'Easy & Fast Booking', desc: 'Book your dream venue in under 2 minutes with instant confirmation.', icon: '⚡' },
                            { title: 'Best Price Guaranteed', desc: 'Transparent pricing with no hidden charges. Get the best deals directly.', icon: '💰' },
                            { title: 'Verified Venues', desc: 'All halls are physically verified for quality and amenities.', icon: '✅' },
                        ].map((item) => (
                            <div key={item.title} className="flex flex-col items-center p-8 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="w-16 h-16 bg-primary/5 dark:bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">N</span>
                            </div>
                            <span className="text-xl font-bold text-white">Netlarx</span>
                        </div>
                        <div className="flex gap-8 text-sm font-medium">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <Link to="/halls" className="hover:text-white transition-colors">Search</Link>
                            <Link to="/policy" className="hover:text-white transition-colors">Policies</Link>
                            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                        </div>
                    </div>
                    <div className="text-center text-sm border-t border-slate-800 pt-8">
                        © 2026 Netlarx Banquet Hall Booking System. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
