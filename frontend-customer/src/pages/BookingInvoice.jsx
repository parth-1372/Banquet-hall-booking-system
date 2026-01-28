import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Printer, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';

const BookingInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data } = await api.get(`/bookings/${id}`);
                setBooking(data.data.booking);
            } catch (err) {
                console.error(err);
                navigate('/my-bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id, navigate]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadDetail = () => {
        const content = `
NETLARX PREMIUM VENUE CONNECTION - BOOKING DETAIL
------------------------------------------------
Invoice ID: ${booking.bookingId}
Issue Date: ${new Date().toLocaleDateString()}
Status: ${booking.status.toUpperCase()}

CUSTOMER DETAILS
Name: ${booking.contactDetails?.name}
Email: ${booking.contactDetails?.email}
Phone: ${booking.contactDetails?.phone}

VENUE DETAILS
Name: ${mainHall?.name}
Address: ${mainHall?.location?.address}, ${mainHall?.location?.city}, ${mainHall?.location?.state}

EVENT CONFIGURATION
Date: ${new Date(booking.eventDate).toLocaleDateString()}
Slot: ${booking.timeSlot}
Type: ${booking.eventType}
Guest Count: ${booking.guestCount}

FINANCIAL SUMMARY
Base Price: ₹${booking.pricing?.basePrice}
Discount: ₹${booking.pricing?.discount}
Taxes (GST): ₹${booking.pricing?.taxes}
TOTAL AMOUNT: ₹${booking.pricing?.totalAmount}

------------------------------------------------
This is a digitally generated credential.
        `;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Booking_${booking.bookingId}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">Generating Invoice...</div>;
    if (!booking) return null;

    const mainHall = booking.halls?.[0] || booking.hall;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Action Bar (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <button onClick={() => navigate('/my-bookings')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Back to Trajectory
                </button>
                <div className="flex gap-4">
                    <Button onClick={handleDownloadDetail} variant="ghost" className="text-slate-900 flex items-center gap-2 px-6 h-12 rounded-xl border-slate-200">
                        <Download className="w-4 h-4" /> Download Summary
                    </Button>
                    <Button onClick={handlePrint} className="bg-slate-900 text-white flex items-center gap-2 px-6 h-12 rounded-xl">
                        <Printer className="w-4 h-4" /> Print Invoice
                    </Button>
                </div>
            </div>

            {/* Invoice Sheet */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-slate-100 print:shadow-none print:border-none">
                {/* Header */}
                <div className="bg-slate-900 p-12 text-white flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl italic">N</div>
                            <span className="text-2xl font-black uppercase tracking-tighter italic">Netlarx <span className="text-primary italic">Hackthon</span></span>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Invoice</h1>
                        <p className="text-slate-400 font-medium">Invoice ID: {booking.bookingId}</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4">
                            <CheckCircle2 className="w-4 h-4" /> Confirmed
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Issue Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-12">
                    <div className="grid grid-cols-2 gap-12 mb-12 pb-12 border-b border-slate-100">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Customer Details</h3>
                            <p className="text-xl font-black text-slate-900 mb-1">{booking.contactDetails?.name}</p>
                            <p className="text-slate-500 font-medium">{booking.contactDetails?.email}</p>
                            <p className="text-slate-500 font-medium">{booking.contactDetails?.phone}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Venue Connection</h3>
                            <p className="text-xl font-black text-slate-900 mb-1">{mainHall?.name}</p>
                            <p className="text-slate-500 font-medium">{mainHall?.location?.address}</p>
                            <p className="text-slate-500 font-medium">{mainHall?.location?.city}, {mainHall?.location?.state}</p>
                        </div>
                    </div>

                    <div className="mb-12 pb-12 border-b border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Event Configuration</h3>
                        <div className="grid grid-cols-4 gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</p>
                                <p className="font-black text-slate-900 uppercase text-xs tracking-wider">{new Date(booking.eventDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Slot</p>
                                <p className="font-black text-slate-900 uppercase text-xs tracking-wider">{booking.timeSlot}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Flow</p>
                                <p className="font-black text-slate-900 uppercase text-xs tracking-wider">{booking.eventType}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Entities</p>
                                <p className="font-black text-slate-900 uppercase text-xs tracking-wider">{booking.guestCount} Units</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Financial Ledger</h3>
                        <div className="flex justify-between items-center py-4 border-b border-slate-50 font-medium text-slate-600">
                            <span>Base Rate (Composite Venues)</span>
                            <span className="text-slate-900 font-black">₹{booking.pricing?.basePrice?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-50 font-medium text-slate-600">
                            <span>Combo Entity Discount (5%)</span>
                            <span className="text-emerald-500 font-black">- ₹{booking.pricing?.discount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-50 font-medium text-slate-600">
                            <span>Statutory Taxes (18% GST)</span>
                            <span className="text-slate-900 font-black">₹{booking.pricing?.taxes?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-8">
                            <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Grand Total</span>
                            <span className="text-4xl font-black text-primary">₹{booking.pricing?.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-t border-slate-100">
                    This is a digitally generated credential for your premium event connection.
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    .bg-slate-50 { background: white !important; }
                    .shadow-2xl { box-shadow: none !important; }
                    .rounded-\\[2rem\\] { border-radius: 0 !important; }
                }
            `}} />
        </div>
    );
};

export default BookingInvoice;
