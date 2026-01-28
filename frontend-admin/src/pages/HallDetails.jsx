import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import AdminButton from '../components/ui/AdminButton';
import api from '../api/axios';
import {
    MapPin, Users, Star, Building2, CheckCircle2,
    XCircle, Clock, Info, Image as ImageIcon,
    ChevronLeft, Settings, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const HallDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hall, setHall] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHall = async () => {
        try {
            const { data } = await api.get(`/halls/${id}`);
            setHall(data.data.hall);
        } catch (err) {
            toast.error('Failed to load venue details');
            navigate('/halls');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHall();
    }, [id]);

    const handleToggleStatus = async () => {
        try {
            await api.patch(`/halls/${id}`, { isActive: !hall.isActive });
            toast.success('Operational status updated');
            fetchHall();
        } catch (err) {
            toast.error('Status update failed');
        }
    };

    if (loading) return <AdminLayout title="Syncing..."><div className="p-20 text-center animate-pulse text-slate-400">Loading Entity Data...</div></AdminLayout>;

    return (
        <AdminLayout title={hall.name}>
            <div className="flex flex-col gap-8 pb-20">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <button onClick={() => navigate('/halls')} className="flex items-center gap-2 text-slate-400 hover:text-admin-primary transition-colors font-bold text-sm">
                        <ChevronLeft className="w-5 h-5" /> Back to Inventory
                    </button>
                    <div className="flex gap-4">
                        <AdminButton variant="secondary" onClick={handleToggleStatus}>
                            {hall.isActive ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            {hall.isActive ? 'Suspend Operations' : 'Activate Venue'}
                        </AdminButton>
                        <AdminButton onClick={() => toast.success('Edit Flow Initialized')}>
                            <Settings className="w-4 h-4 mr-2" /> Modify Blueprint
                        </AdminButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Visual Assets */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative rounded-[40px] overflow-hidden bg-slate-100 dark:bg-slate-900 aspect-[16/9] border border-slate-100 dark:border-slate-800 transition-colors">
                            <img
                                src={hall.images?.[0] || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200"}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-8 left-8 flex gap-2">
                                <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border shadow-xl ${hall.isActive ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200' : 'bg-red-100/80 text-red-700 border-red-200'}`}>
                                    {hall.isActive ? 'Operational' : 'Suspended'}
                                </span>
                                {hall.isFeatured && (
                                    <span className="px-4 py-2 rounded-2xl bg-amber-100/80 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-xl flex items-center gap-2">
                                        <Star className="w-3 h-3 fill-current" /> Promoted
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {hall.images?.slice(1).map((img, i) => (
                                <div key={i} className="rounded-2xl overflow-hidden aspect-square bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-admin-primary transition-all cursor-pointer">
                                    <img src={img} className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-2 hover:border-admin-primary/50 transition-all cursor-pointer">
                                <ImageIcon className="w-6 h-6" />
                                <span className="text-[10px] font-black uppercase">Add Media</span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Entity Overview</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/10 flex items-center justify-center text-sky-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Max Occupancy</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{hall.capacity?.maximum} Humans</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Geometry</p>
                                        <p className="font-bold text-slate-800 dark:text-white capitalize">{hall.location?.city}, {hall.location?.state}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">System Rating</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{hall.rating?.average} / 5.0</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6 relative z-10">Revenue Yield</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-white/60">Full Cycle</span>
                                    <span className="text-2xl font-black">₹{hall.pricing?.fullDay?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end border-t border-white/10 pt-4 text-xs font-bold text-white/60">
                                    <span>Morning Segment</span>
                                    <span>₹{hall.pricing?.morning?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end text-xs font-bold text-white/60">
                                    <span>Noon Segment</span>
                                    <span>₹{hall.pricing?.afternoon?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end text-xs font-bold text-white/60">
                                    <span>Night Segment</span>
                                    <span>₹{hall.pricing?.evening?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 transition-colors">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Structural Description</h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-4xl">
                        {hall.description}
                    </p>

                    <div className="mt-12 pt-12 border-t border-slate-50 dark:border-slate-800 transition-colors">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Amenity Matrix</h4>
                        <div className="flex flex-wrap gap-3">
                            {hall.amenities?.map((tool, i) => (
                                <span key={i} className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold border border-slate-100 dark:border-slate-700 transition-colors">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default HallDetails;
