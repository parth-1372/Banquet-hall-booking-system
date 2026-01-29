import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import AdminButton from '../components/ui/AdminButton';
import api from '../api/axios';
import {
    Building2, Plus, Edit2, Trash2, Eye, X,
    MapPin, Users, Star, CheckCircle, XCircle, Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_HALL_IMAGE, DEFAULT_360_IMAGE, getAssetUrl } from '../utils/assetUrl';

const HallManagement = () => {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'banquet',
        city: '',
        state: '',
        address: '',
        maxCapacity: '',
        fullDayPrice: '',
        images: '',
        rotationViewUrl: ''
    });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [selected360File, setSelected360File] = useState(null);

    const fetchHalls = async () => {
        try {
            const { data } = await api.get('/halls');
            setHalls(data.data.halls);
        } catch (err) {
            toast.error('Failed to load halls');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHalls();
    }, []);

    const toggleFeatured = async (id, current) => {
        try {
            await api.patch(`/halls/${id}/featured`, { isFeatured: !current });
            toast.success('Hall status updated');
            fetchHalls();
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleEdit = (hall) => {
        setEditId(hall._id || hall.id);
        setFormData({
            name: hall.name,
            description: hall.description,
            type: hall.type,
            city: hall.location?.city || '',
            state: hall.location?.state || '',
            address: hall.location?.address || '',
            maxCapacity: hall.capacity?.maximum || '',
            fullDayPrice: hall.pricing?.fullDay || '',
            images: hall.images?.map(img => typeof img === 'string' ? img : img.url).join(', ') || '',
            rotationViewUrl: hall.rotationViewUrl || ''
        });
        setShowModal(true);
    };

    const handleAddVenue = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.maxCapacity) newErrors.maxCapacity = 'Capacity is required';
        if (!formData.fullDayPrice) newErrors.fullDayPrice = 'Price is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please correct the highlighted fields');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                description: formData.description || 'A premium venue for your events.',
                type: formData.type,
                location: {
                    address: formData.address || 'Address TBD',
                    city: formData.city,
                    state: formData.state || 'Maharashtra',
                    pincode: '400001'
                },
                contactInfo: {
                    phone: '9876543210',
                    email: 'admin@netlarx.com'
                },
                capacity: {
                    minimum: 50,
                    maximum: parseInt(formData.maxCapacity)
                },
                pricing: {
                    morning: Math.round(parseInt(formData.fullDayPrice) * 0.4),
                    afternoon: Math.round(parseInt(formData.fullDayPrice) * 0.4),
                    evening: Math.round(parseInt(formData.fullDayPrice) * 0.5),
                    fullDay: parseInt(formData.fullDayPrice)
                },
                images: formData.images
                    ? (typeof formData.images === 'string'
                        ? formData.images.split(',').map(s => ({ url: s.trim(), isPrimary: false }))
                        : formData.images.map(img => typeof img === 'string' ? { url: img, isPrimary: false } : img))
                    : [{ url: DEFAULT_HALL_IMAGE, isPrimary: true }],
                rotationViewUrl: formData.rotationViewUrl || DEFAULT_360_IMAGE,
                amenities: ['AC', 'Stage', 'Parking', 'Catering'],
                isActive: true,
                isFeatured: false
            };

            let finalId = editId;
            if (editId) {
                await api.patch(`/halls/${editId}`, payload);
                toast.success('Venue metadata updated!');
            } else {
                const { data } = await api.post('/halls', payload);
                finalId = data.data.hall._id;
                toast.success('Venue profile created!');
            }

            // Phase 2: Handle file uploads if any
            if (selectedFiles || selected360File) {
                toast.loading('Uploading media...', { id: 'uploading' });

                if (selectedFiles) {
                    const fileData = new FormData();
                    Array.from(selectedFiles).forEach(file => fileData.append('images', file));
                    await api.post(`/halls/${finalId}/images`, fileData);
                }

                if (selected360File) {
                    const fileData360 = new FormData();
                    fileData360.append('panorama', selected360File);
                    await api.post(`/halls/${finalId}/360-image`, fileData360);
                }

                toast.success('Media uploaded successfully!', { id: 'uploading' });
            }

            setShowModal(false);
            setEditId(null);
            setSelectedFiles(null);
            setSelected360File(null);
            setFormData({ name: '', description: '', type: 'banquet', city: '', state: '', address: '', maxCapacity: '', fullDayPrice: '', images: '', rotationViewUrl: '' });
            fetchHalls();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const filteredHalls = halls.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.location?.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Hall Inventory">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl lg:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 sm:gap-6">
                    <div className="flex-1 w-full lg:max-w-md relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Find specific venue..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-admin-primary/20 transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="hidden sm:block text-right mr-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Inventory</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{halls.length} Total Halls</p>
                        </div>
                        <AdminButton onClick={() => setShowModal(true)} size="lg" className="w-full sm:w-auto shadow-xl shadow-admin-primary/20 hover:scale-105 active:scale-95 transition-transform">
                            <Plus className="w-5 h-5 mr-2" /> Add Venue
                        </AdminButton>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Listing Detail</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Occupancy</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Base Tariff</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Visibility</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 animate-pulse">Syncing Venue Data...</td></tr>
                            ) : filteredHalls.length > 0 ? (
                                filteredHalls.map((hall) => (
                                    <tr key={hall.id || hall._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                                    <img src={getAssetUrl(hall.images?.[0]?.url || hall.images?.[0] || hall.primaryImage) || DEFAULT_HALL_IMAGE} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1 group-hover:text-admin-primary transition-colors">{hall.name}</p>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                                                        <MapPin className="w-3 h-3 text-admin-primary" /> {hall.location?.city}, {hall.location?.state}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/10 rounded-xl text-sky-600 dark:text-sky-400 font-black text-[10px] uppercase border border-sky-100 dark:border-sky-900/50">
                                                <Users className="w-3.5 h-3.5" /> {hall.capacity?.maximum} Max
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="font-black text-slate-800 dark:text-slate-200 text-base">₹{hall.pricing?.fullDay?.toLocaleString()}</span>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Per Full Cycle</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button
                                                onClick={() => toggleFeatured(hall.id || hall._id, hall.isFeatured)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all shadow-sm ${hall.isFeatured
                                                    ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-900'
                                                    : 'bg-slate-50 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700'
                                                    }`}
                                            >
                                                <Star className={`w-3 h-3 ${hall.isFeatured ? 'fill-current' : ''}`} />
                                                {hall.isFeatured ? 'Promoted' : 'Organic'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-1.5">
                                                <Link to={`/halls/${hall.id || hall._id}`} className="p-2.5 text-slate-400 hover:text-admin-primary hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"><Eye className="w-5 h-5" /></Link>
                                                <button onClick={() => handleEdit(hall)} className="p-2.5 text-slate-400 hover:text-admin-primary hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"><Edit2 className="w-5 h-5" /></button>
                                                <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-800 rounded-xl transition-all shadow-sm"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 dark:text-slate-500 font-medium italic">Your venue search query returned no active entities.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 sm:p-6 space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 animate-pulse">Syncing Venue Data...</div>
                    ) : filteredHalls.length > 0 ? (
                        filteredHalls.map((hall) => (
                            <div key={hall.id || hall._id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-4">
                                {/* Hall Header with Image */}
                                <div className="flex items-start gap-4">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                        <img
                                            src={getAssetUrl(hall.images?.[0]?.url || hall.images?.[0] || hall.primaryImage) || DEFAULT_HALL_IMAGE}
                                            className="w-full h-full object-cover"
                                            alt={hall.name}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1">{hall.name}</h3>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                                            <MapPin className="w-3 h-3 text-admin-primary" /> {hall.location?.city}, {hall.location?.state}
                                        </div>
                                    </div>
                                </div>

                                {/* Hall Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Capacity</p>
                                        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-black text-sm">
                                            <Users className="w-4 h-4" /> {hall.capacity?.maximum}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Price</p>
                                        <p className="font-black text-slate-800 dark:text-slate-200 text-sm">₹{hall.pricing?.fullDay?.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Featured Badge */}
                                <button
                                    onClick={() => toggleFeatured(hall.id || hall._id, hall.isFeatured)}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${hall.isFeatured
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-900/50'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    {hall.isFeatured ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {hall.isFeatured ? 'Featured' : 'Set Featured'}
                                </button>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        to={`/halls/${hall.id || hall._id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-admin-primary hover:border-admin-primary transition-all"
                                    >
                                        <Eye className="w-4 h-4" /> View
                                    </Link>
                                    <button
                                        onClick={() => handleEdit(hall)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-admin-primary text-white rounded-xl hover:bg-admin-primary/90 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 text-slate-400 dark:text-slate-500 font-medium italic">
                            Your venue search query returned no active entities.
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-800/30 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Page View Metrics: {filteredHalls.length} Result Paths</p>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-sm">Back</button>
                        <button className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">Next Flow</button>
                    </div>
                </div>
            </div>

            {/* Add Venue Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{editId ? 'Modify Venue' : 'Register New Venue'}</h2>
                            <button onClick={() => { setShowModal(false); setEditId(null); setFormData({ name: '', description: '', type: 'banquet', city: '', state: '', address: '', maxCapacity: '', fullDayPrice: '', images: '', rotationViewUrl: '' }); setErrors({}); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAddVenue} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venue Name *</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="The Grand Ballroom"
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 ${errors.name ? 'ring-2 ring-red-500' : 'focus:ring-admin-primary/20'}`} />
                                    {errors.name && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-admin-primary/20">
                                        <option value="banquet">Banquet</option>
                                        <option value="wedding">Wedding</option>
                                        <option value="conference">Conference</option>
                                        <option value="party">Party</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="A brief description of the venue..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-admin-primary/20 resize-none" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City *</label>
                                    <input name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="Mumbai"
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 ${errors.city ? 'ring-2 ring-red-500' : 'focus:ring-admin-primary/20'}`} />
                                    {errors.city && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.city}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                                    <input name="state" value={formData.state} onChange={handleInputChange} type="text" placeholder="Maharashtra"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-admin-primary/20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Capacity *</label>
                                    <input name="maxCapacity" value={formData.maxCapacity} onChange={handleInputChange} type="number" placeholder="500"
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 ${errors.maxCapacity ? 'ring-2 ring-red-500' : 'focus:ring-admin-primary/20'}`} />
                                    {errors.maxCapacity && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.maxCapacity}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Day Price (₹) *</label>
                                    <input name="fullDayPrice" value={formData.fullDayPrice} onChange={handleInputChange} type="number" placeholder="150000"
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 ${errors.fullDayPrice ? 'ring-2 ring-red-500' : 'focus:ring-admin-primary/20'}`} />
                                    {errors.fullDayPrice && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.fullDayPrice}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-bold"><Image className="w-4 h-4" /> Media Links</label>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase ml-2">Main Image Gallery (URLs, comma separated)</p>
                                        <input name="images" value={formData.images} onChange={handleInputChange} type="text" placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-admin-primary/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase ml-2">OR Upload Local Images (Up to 5)</p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => setSelectedFiles(e.target.files)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-admin-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase ml-2">360° Panorama View URL (Pannellum format)</p>
                                        <input name="rotationViewUrl" value={formData.rotationViewUrl} onChange={handleInputChange} type="text" placeholder="https://example.com/panorama.jpg"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-admin-primary/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase ml-2">OR Upload 360° Image</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setSelected360File(e.target.files[0])}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-admin-primary/20"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 ml-2 italic">Note: Local uploads will be stored on this server and takes precedence over URL links.</p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <AdminButton type="submit" disabled={saving} className="flex-1 h-14">
                                    {saving ? 'Processing...' : (editId ? 'Update Venue Profile' : 'Launch New Venue')}
                                </AdminButton>
                                <AdminButton type="button" variant="secondary" onClick={() => setShowModal(false)} className="h-14">
                                    Cancel
                                </AdminButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default HallManagement;
