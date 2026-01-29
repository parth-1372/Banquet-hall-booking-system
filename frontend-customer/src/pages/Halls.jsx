import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import api from '../api/axios';
import { Search, MapPin, Users, Star, SlidersHorizontal, ArrowRight, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { DEFAULT_HALL_IMAGE, getAssetUrl } from '../utils/assetUrl';

const Halls = () => {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [multiSelect, setMultiSelect] = useState(false);
    const [selectedHalls, setSelectedHalls] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        city: '',
        minCapacity: '',
        maxPrice: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    const navigate = useNavigate();

    const fetchHalls = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.type) params.append('type', filters.type);
            if (filters.city) params.append('city', filters.city);
            if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

            const { data } = await api.get(`/halls?${params.toString()}`);
            setHalls(data.data.halls);
        } catch (error) {
            console.error('Error fetching halls:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHalls();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const toggleHallSelection = (id) => {
        if (selectedHalls.includes(id)) {
            setSelectedHalls(selectedHalls.filter(h => h !== id));
        } else {
            setSelectedHalls([...selectedHalls, id]);
        }
    };

    const handleMultiBook = () => {
        if (selectedHalls.length === 0) {
            toast.error('Select at least one hall to proceed');
            return;
        }
        const ids = selectedHalls.join(',');
        navigate(`/book-multi?halls=${ids}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />

            {/* Header & Search */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-6 sm:py-8 md:py-12 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 sm:mb-6 md:mb-8">Find Your Perfect Venue</h1>

                    <div className="max-w-4xl mx-auto relative group">
                        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 border border-slate-100 dark:border-slate-700">
                            <div className="flex-1 flex items-center gap-2 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search by name..."
                                    className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 font-medium"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="flex-1 flex items-center gap-2 px-4 py-2">
                                <MapPin className="w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="Which city?"
                                    className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 font-medium"
                                    value={filters.city}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <Button onClick={fetchHalls} className="w-full md:w-auto h-12 px-8">Search</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8 md:gap-10">

                    {/* Filters Sidebar */}
                    <aside className="lg:w-72 flex-shrink-0 space-y-4 sm:space-y-6 md:space-y-8">
                        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-6">
                                <SlidersHorizontal className="w-5 h-5 text-primary" />
                                <span className="uppercase tracking-[0.1em] text-xs">Refine Results</span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-3">Venue Topology</label>
                                    <select
                                        name="type"
                                        value={filters.type}
                                        onChange={handleFilterChange}
                                        className="w-full p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-slate-200 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">All Architectures</option>
                                        <option value="banquet">Grand Banquet</option>
                                        <option value="conference">Corporate Suite</option>
                                        <option value="wedding">Imperial Wedding</option>
                                        <option value="party">社交 Lounge</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-3">Min Occupancy</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            name="minCapacity"
                                            placeholder="Guest Threshold"
                                            value={filters.minCapacity}
                                            onChange={handleFilterChange}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-3">Budget Ceiling</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            placeholder="Max Price"
                                            value={filters.maxPrice}
                                            onChange={handleFilterChange}
                                            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none text-sm font-bold bg-slate-50 dark:bg-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <Button variant="secondary" onClick={() => {
                                    setFilters({ search: '', type: '', city: '', minCapacity: '', maxPrice: '', sortBy: 'createdAt', sortOrder: 'desc' });
                                }} className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-700">
                                    Flash Inventory
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/10 dark:border-primary/20 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <h4 className="font-black text-slate-900 dark:text-white mb-3 text-lg leading-tight">Expert Consulting</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">Navigate the venue matrix with our specialists.</p>
                            <Link to="/contact" className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:gap-4 transition-all group/link">
                                Initial Contact <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </aside>

                    {/* Hall Grid */}
                    <main className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white italic">
                                    {loading ? 'Venue Stream' : `${halls.length} Entities`}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Found in active index</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => {
                                        setMultiSelect(!multiSelect);
                                        setSelectedHalls([]);
                                    }}
                                    className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${multiSelect
                                        ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/30'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:shadow-lg'
                                        }`}
                                >
                                    {multiSelect ? 'Kill Selection' : 'Multi-Bridge'}
                                </button>

                                <div className="relative flex-1 sm:flex-none">
                                    <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <select
                                        name="sortBy"
                                        value={filters.sortBy}
                                        onChange={handleFilterChange}
                                        className="w-full pl-10 pr-8 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-400 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/10"
                                    >
                                        <option value="createdAt">Chronology</option>
                                        <option value="price">Tariff</option>
                                        <option value="capacity">Occupancy</option>
                                        <option value="rating">Experience</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl h-80 animate-pulse border border-slate-100 dark:border-slate-800" />
                                ))
                            ) : halls.length > 0 ? (
                                halls.map((hall) => (
                                    <div key={hall.id} className="relative group">
                                        {multiSelect && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedHalls.includes(hall._id)}
                                                    onChange={() => toggleHallSelection(hall._id)}
                                                    className="w-6 h-6 rounded-lg border-2 border-white accent-primary cursor-pointer shadow-lg"
                                                />
                                            </div>
                                        )}
                                        <Link
                                            to={multiSelect ? '#' : `/halls/${hall.id}`}
                                            onClick={(e) => {
                                                if (multiSelect) {
                                                    e.preventDefault();
                                                    toggleHallSelection(hall._id);
                                                }
                                            }}
                                            className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 h-full"
                                        >
                                            <div className="relative h-52 sm:h-56 flex-shrink-0">
                                                <img
                                                    src={getAssetUrl(hall.primaryImage) || DEFAULT_HALL_IMAGE}
                                                    alt={hall.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg border border-white/20">
                                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{hall.rating?.average?.toFixed(1) || '0.0'}</span>
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-1">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{hall.name}</h3>
                                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mb-4">
                                                    <MapPin className="w-4 h-4" />
                                                    {hall.location?.city}
                                                </div>
                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-xs">
                                                        <Users className="w-4 h-4" />
                                                        Up to {hall.capacity?.maximum}
                                                    </div>
                                                    <div className="text-primary font-bold">
                                                        ₹{hall.pricing?.fullDay?.toLocaleString()}
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal"> /day</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                                    <p className="text-lg font-medium mb-4">No venues found matching those filters.</p>
                                    <Button variant="ghost" onClick={() => setFilters({ search: '', type: '', city: '', minCapacity: '', maxPrice: '', sortBy: 'createdAt', sortOrder: 'desc' })}>
                                        Clear all filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Selection Sticky Footer */}
            {multiSelect && selectedHalls.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-xl hidden sm:block">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {selectedHalls.length} Hall{selectedHalls.length > 1 ? 's' : ''} Selected
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Multiple booking request will be created</p>
                            </div>
                        </div>
                        <Button onClick={handleMultiBook} className="px-10 h-12 shadow-lg shadow-primary/30">
                            Proceed to Book Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Halls;
