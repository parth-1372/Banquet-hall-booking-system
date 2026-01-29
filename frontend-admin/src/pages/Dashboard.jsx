import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users, Building2, CalendarCheck, TrendingUp,
    ArrowUpRight, Clock, ShieldCheck, AlertCircle, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data.data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const data = [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 2000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
    ];

    const statCards = [
        { label: 'Total Revenue', value: stats ? `₹${stats.overview.totalRevenue.toLocaleString()}` : '₹0', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', link: '/bookings' },
        { label: 'Total Bookings', value: stats?.overview.totalBookings || '0', icon: CalendarCheck, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/10', link: '/bookings' },
        { label: 'Pending Requests', value: stats?.overview.pendingBookings || '0', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', link: '/bookings?status=pending' },
        { label: 'Active Halls', value: stats?.overview.totalHalls || '0', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10', link: '/halls' },
    ];

    return (
        <AdminLayout title="Dashboard Overview">
            {/* Stat Grid - Responsive 1-2-4 column layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
                {statCards.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(stat.link)}
                        className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full uppercase tracking-tighter">
                                <ArrowUpRight className="w-3 h-3" /> +12%
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-2">{stat.label}</p>
                            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">{loading ? '...' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-10">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Revenue Analytics</h3>
                            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium">Weekly performance overview</p>
                        </div>
                        <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 px-4 py-2 outline-none w-full sm:w-auto">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="h-[250px] sm:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#f1f5f9'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis hide={true} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                                    itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-6 sm:mb-8">Recent Bookings</h3>
                    <div className="space-y-4 sm:space-y-6 flex-1 overflow-auto pr-2 no-scrollbar">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : stats?.recentBookings.length > 0 ? (
                            stats.recentBookings.map((booking) => (
                                <Link to="/bookings" key={booking.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-50 dark:bg-sky-900/20 rounded-xl flex items-center justify-center text-sky-500 font-bold flex-shrink-0">
                                        {booking.user?.name?.[0]}
                                    </div>
                                    <div className="flex-1 overflow-hidden min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{booking.user?.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate uppercase mt-0.5">
                                            {booking.halls?.[0]?.name} {booking.halls?.length > 1 ? `(+${booking.halls.length - 1} more)` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">₹{booking.pricing?.totalAmount?.toLocaleString()}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase hidden sm:block">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-slate-400 text-center py-10">No recent bookings</p>
                        )}
                    </div>
                    <Link
                        to="/bookings"
                        className="mt-6 sm:mt-8 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl text-center text-admin-primary font-bold text-sm hover:bg-admin-primary hover:text-white transition-all flex items-center justify-center gap-2 group"
                    >
                        View All Activities <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
