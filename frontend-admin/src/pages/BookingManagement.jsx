import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import AdminButton from '../components/ui/AdminButton';
import api from '../api/axios';
import {
    Calendar, CheckCircle, XCircle, Clock,
    MapPin, User, ChevronRight, Filter, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const BookingManagement = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', date: '' });

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.date) params.append('eventDate', filters.date);

            const { data } = await api.get(`/bookings/admin/all?${params.toString()}`);
            setBookings(data.data.bookings);
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filters]);

    const handleAction = async (id, action) => {
        try {
            let endpoint = '';
            let payload = { action, note: `Processed by ${user.role}` };

            if (user.role === 'admin1') endpoint = `/bookings/${id}/admin1-process`;
            else if (user.role === 'admin2') endpoint = `/bookings/${id}/admin2-process`;
            else if (user.role === 'super_admin' || user.role === 'admin3') endpoint = `/bookings/${id}/admin3-process`;

            if (action === 'confirm' && (user.role === 'super_admin' || user.role === 'admin3')) {
                payload = { action: 'approve' };
            }

            await api.patch(endpoint, payload);
            toast.success(`Booking processed successfully`);
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const handleExport = () => {
        toast.success('Generating PDF report...');
        setTimeout(() => toast.success('Report downloaded!'), 2000);
    };

    const statusStyles = {
        'action-pending': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        'approved-admin1': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-500 border-blue-200 dark:border-blue-900',
        'approved-admin2': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500 border-amber-200 dark:border-amber-900',
        'payment-requested': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-500 border-purple-200 dark:border-purple-900',
        'confirmed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-500 border-emerald-200 dark:border-emerald-900',
        'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-500 border-red-200 dark:border-red-900',
        'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-500 border-red-200 dark:border-red-900',
    };

    const getActions = (booking) => {
        if (booking.status === 'cancelled' || booking.status === 'confirmed' || booking.status === 'rejected') return null;

        if ((user?.role === 'admin1' || user?.role === 'super_admin') && booking.status === 'action-pending') {
            return (
                <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold mb-1">Step 1: Document Verification</p>
                    <div className="flex gap-2">
                        <AdminButton size="sm" onClick={() => handleAction(booking.id || booking._id, 'approve')}>
                            Verify & Approve
                        </AdminButton>
                        <AdminButton size="sm" variant="danger" onClick={() => handleAction(booking._id || booking.id, 'reject')}>
                            Reject
                        </AdminButton>
                    </div>
                </div>
            );
        }

        if ((user?.role === 'admin2' || user?.role === 'super_admin') && booking.status === 'approved-admin1') {
            return (
                <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold mb-1">Step 2: Availability & Payment</p>
                    <div className="flex gap-2">
                        <AdminButton size="sm" variant="secondary" onClick={() => handleAction(booking.id || booking._id, 'request-payment')}>
                            Request Payment
                        </AdminButton>
                        <AdminButton size="sm" variant="danger" onClick={() => handleAction(booking.id || booking._id, 'reject')}>
                            Reject
                        </AdminButton>
                    </div>
                </div>
            );
        }

        if ((user?.role === 'admin2' || user?.role === 'super_admin') && booking.status === 'payment-requested') {
            return (
                <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold mb-1">Step 2b: Payment Verification</p>
                    <div className="flex flex-col gap-2">
                        <AdminButton
                            size="sm"
                            onClick={async () => {
                                try {
                                    await api.post(`/bookings/${booking.id || booking._id}/mark-payment`);
                                    toast.success('Payment marked as complete!');
                                    fetchBookings();
                                } catch (err) {
                                    toast.error(err.response?.data?.message || 'Failed to mark payment');
                                }
                            }}
                        >
                            ✓ Mark Paid & Forward
                        </AdminButton>
                        <AdminButton size="sm" variant="danger" onClick={() => handleAction(booking.id || booking._id, 'reject')}>
                            Reject
                        </AdminButton>
                    </div>
                </div>
            );
        }

        if ((user?.role === 'super_admin' || user?.role === 'admin3') && booking.status === 'approved-admin2') {
            return (
                <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold mb-1">Step 3: Final Approval</p>
                    <div className="flex gap-2">
                        <AdminButton size="sm" onClick={() => handleAction(booking.id || booking._id, 'confirm')}>
                            Confirm Booking
                        </AdminButton>
                        <AdminButton size="sm" variant="danger" onClick={() => handleAction(booking.id || booking._id, 'reject')}>
                            Reject
                        </AdminButton>
                    </div>
                </div>
            );
        }

        return <span className="text-xs text-slate-400 italic">Awaiting next tier review...</span>;
    };

    return (
        <AdminLayout title="Booking Management">
            <div className="mb-8 flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="flex flex-wrap gap-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-admin-primary/20 transition-all appearance-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="action-pending">Action Pending</option>
                            <option value="approved-admin1">Admin1 Approved</option>
                            <option value="payment-requested">Payment Requested</option>
                            <option value="approved-admin2">Admin2 Approved</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-admin-primary/20 transition-all"
                        />
                    </div>
                </div>
                <AdminButton variant="secondary" onClick={handleExport}>
                    <Download className="w-4 h-4" /> Export Report (PDF)
                </AdminButton>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Venue Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Price Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operational Flow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 animate-pulse">Processing Booking Streams...</td></tr>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold uppercase border border-slate-200 dark:border-slate-700">
                                                    {booking.user?.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white leading-none mb-1 capitalize">{booking.user?.name}</p>
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded inline-block mt-0.5">{booking.bookingId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-700 dark:text-slate-200 leading-tight mb-1">{booking.halls?.[0]?.name} {booking.halls?.length > 1 ? `+${booking.halls.length - 1} more` : ''}</p>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                                                <span className="flex items-center gap-1 uppercase tracking-tighter"><Calendar className="w-3 h-3 text-admin-primary" /> {new Date(booking.eventDate).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1 uppercase tracking-tighter border-l border-slate-200 dark:border-slate-700 pl-3"><Clock className="w-3 h-3 text-admin-primary" /> {booking.timeSlot}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800 dark:text-slate-200">₹{booking.pricing?.totalAmount?.toLocaleString()}</span>
                                                {booking.halls?.length > 1 && <span className="text-[10px] text-slate-400 font-bold">(Combo Booking)</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${statusStyles[booking.status] || 'bg-slate-100'}`}>
                                                {booking.status?.replace(/-/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end items-center gap-2">
                                                {getActions(booking)}
                                                <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 dark:text-slate-500 italic">No bookings found matching your filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BookingManagement;
