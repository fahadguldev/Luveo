import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
    Search,
    MessageCircle,
    X,
    Printer,
    Radio,
    Volume2,
    VolumeX,
    Eye,
    Trash2,
    Package
} from 'lucide-react';
import AdminBackLink from './AdminBackLink';
import { getAuthHeaders } from '../lib/auth.js';

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');
    const [statusMessages, setStatusMessages] = useState({});
    const [cancelState, setCancelState] = useState({});
    const [recentOrderId, setRecentOrderId] = useState(null);
    const [liveToast, setLiveToast] = useState(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [audioMuted, setAudioMuted] = useState(false);
    const audioRef = useRef(null);

    // Real-time WebSocket connection using Socket.io
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        audioRef.current.preload = 'auto';

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const socket = io(backendUrl, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            setIsSocketConnected(true);
            socket.emit('join_admin_orders');
        });

        socket.on('disconnect', () => {
            setIsSocketConnected(false);
        });

        socket.on('new_order', (newOrder) => {
            if (!newOrder) return;
            const newId = newOrder._id || newOrder.id;

            setOrders((prevOrders) => {
                const exists = prevOrders.some((o) => (o._id || o.id) === newId);
                if (exists) return prevOrders;
                return [newOrder, ...prevOrders];
            });

            setRecentOrderId(newId);
            setLiveToast({
                id: newId,
                name: newOrder.name || newOrder.customer?.name || 'Customer',
                total: newOrder.orderTotal || newOrder.amount_total || '0',
            });

            if (!audioMuted && audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch((err) => {
                    console.warn('Audio playback restricted by browser policy:', err.message);
                });
            }

            setTimeout(() => {
                setRecentOrderId((prev) => (prev === newId ? null : prev));
            }, 6000);

            setTimeout(() => {
                setLiveToast((prev) => (prev?.id === newId ? null : prev));
            }, 6000);
        });

        return () => {
            socket.off('new_order');
            socket.disconnect();
        };
    }, [audioMuted]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/analytics/all-orders`, {
                    headers: getAuthHeaders(),
                    withCredentials: true
                });
                setOrders(response.data.orders || []);
                setError(null);
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 404) {
                    setOrders([]);
                    setError(null);
                } else {
                    setError('Failed to load orders. Please try again.');
                }
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return dateString;
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/analytics/update-order-status`,
                {
                    orderID: orderId,
                    orderStatus: newStatus,
                },
                {
                    headers: getAuthHeaders(),
                    withCredentials: true
                }
            );

            setStatusMessages((prev) => ({
                ...prev,
                [orderId]: res.data.message || 'Status updated!'
            }));

            setOrders(
                orders.map((order) =>
                    order._id === orderId ? { ...order, orderStatus: newStatus } : order
                )
            );

            setTimeout(() => {
                setStatusMessages((prev) => {
                    const next = { ...prev };
                    delete next[orderId];
                    return next;
                });
            }, 3000);
        } catch (error) {
            setStatusMessages((prev) => ({
                ...prev,
                [orderId]: error.response?.data?.message || 'Error updating order'
            }));

            setTimeout(() => {
                setStatusMessages((prev) => {
                    const next = { ...prev };
                    delete next[orderId];
                    return next;
                });
            }, 3000);
        }
    };

    const cancelOrder = async (orderId) => {
        setCancelState((prev) => ({ ...prev, [orderId]: { loading: true, message: null, error: false } }));
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/admin/cancel-order/${orderId}`, {
                headers: getAuthHeaders(),
                withCredentials: true
            });
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            setCancelState((prev) => ({ ...prev, [orderId]: { loading: false, message: 'Commission cancelled', error: false } }));
        } catch {
            setCancelState((prev) => ({ ...prev, [orderId]: { loading: false, message: 'Failed to cancel', error: true } }));
        }

        setTimeout(() => {
            setCancelState((prev) => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });
        }, 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#9B5A2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-serif text-stone-600 text-sm">Synchronizing Atelier Manifests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center max-w-md shadow-xl space-y-4">
                    <p className="text-rose-700 font-medium text-sm">{error}</p>
                    <AdminBackLink />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF9F5] text-stone-900 px-4 sm:px-8 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <AdminBackLink />

                {/* Header & Live Stream Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9B5A2B] mb-1">
                            <span>Atelier Log & Logistics</span>
                        </div>
                        <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
                            Order Commissions
                        </h1>
                        <p className="text-xs text-stone-500 font-light mt-0.5">
                            Real-time order intake and packaging workflow via MongoDB Change Streams
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium ${
                                isSocketConnected
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                        >
                            <Radio className={`w-3.5 h-3.5 ${isSocketConnected ? 'animate-pulse text-emerald-600' : 'text-rose-500'}`} />
                            <span>{isSocketConnected ? 'Live Stream Online' : 'Stream Disconnected'}</span>
                        </span>

                        <button
                            onClick={() => setAudioMuted(!audioMuted)}
                            type="button"
                            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition shadow-sm"
                            title="Toggle audio alert"
                        >
                            {audioMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-[#9B5A2B]" />}
                        </button>
                    </div>
                </div>

                {/* Live Toast Banner */}
                {liveToast && (
                    <div className="p-4 bg-[#0D0C0B] text-amber-200 rounded-2xl border border-amber-900/60 shadow-xl flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-[#C6833E]/20 text-[#C6833E]">
                                <Package className="w-5 h-5" />
                            </span>
                            <div>
                                <p className="font-serif text-sm font-semibold text-white">
                                    New Commission Arrived!
                                </p>
                                <p className="text-xs text-stone-300">
                                    {liveToast.name} placed an order of PKR {liveToast.total}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setLiveToast(null)}
                            className="p-1 rounded-lg text-stone-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by patron name, email, or order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#9B5A2B] shadow-sm"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {['all', 'pending', 'packing', 'shipped', 'delivered'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-mono uppercase tracking-wider font-semibold whitespace-nowrap transition ${
                                    filterStatus === status
                                        ? 'bg-[#0D0C0B] text-white shadow-md'
                                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Content: Mobile Cards + Desktop Table */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                    {/* Mobile Card List View (Visible on small screens) */}
                    <div className="block lg:hidden divide-y divide-stone-100">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => {
                                const isNew = (order._id || order.id) === recentOrderId;
                                return (
                                    <div
                                        key={order._id || order.id}
                                        className={`p-4 space-y-3 transition ${
                                            isNew ? 'bg-amber-50 ring-2 ring-amber-400' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                                                #{(order._id || '').slice(-6).toUpperCase()}
                                            </span>
                                            <span
                                                className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                                                    order.orderStatus === 'delivered' || order.orderStatus === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : order.orderStatus === 'shipped'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : order.orderStatus === 'packing'
                                                        ? 'bg-amber-100 text-amber-900'
                                                        : 'bg-stone-200 text-stone-800'
                                                }`}
                                            >
                                                {order.orderStatus || 'pending'}
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="font-serif text-sm font-semibold text-stone-900">
                                                {order.name || 'Patron'}
                                            </h4>
                                            <p className="text-xs text-stone-500 font-light">{order.email}</p>
                                            <p className="text-xs text-stone-500 font-light mt-0.5">
                                                {order.city} • {formatDate(order.orderDate)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <div>
                                                <span className="text-[10px] uppercase font-mono text-stone-400 block">Total</span>
                                                <span className="font-serif text-base font-bold text-[#9B5A2B]">
                                                    PKR {Number(order.orderTotal || 0).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOrderClick(order)}
                                                    className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-medium inline-flex items-center gap-1"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View</span>
                                                </button>

                                                {order.phone && (
                                                    <a
                                                        href={`https://wa.me/${order.phone}?text=Hello ${encodeURIComponent(order.name || 'Client')}, your Luveo atelier order (#${(order._id || '').slice(-6)}) of PKR ${order.orderTotal} is currently: ${order.orderStatus}. Thank you for choosing Luveo.`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                                        title="WhatsApp Update"
                                                    >
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status selector */}
                                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-800 flex-1"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="packing">Packing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                            </select>

                                            <button
                                                onClick={() => cancelOrder(order._id)}
                                                disabled={cancelState[order._id]?.loading}
                                                className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 text-xs transition"
                                                title="Cancel Order"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {statusMessages[order._id] && (
                                            <p className="text-[11px] text-emerald-600 font-mono">{statusMessages[order._id]}</p>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-stone-400 font-light text-sm">
                                No commissions match your filter.
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View (Hidden on mobile) */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-stone-100">
                            <thead className="bg-[#FBF9F5]">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-wider text-stone-500">
                                        Date & ID
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-wider text-stone-500">
                                        Patron
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-wider text-stone-500">
                                        Pieces
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-wider text-stone-500">
                                        Total
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-wider text-stone-500">
                                        Status Stage
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-wider text-stone-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-xs">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => {
                                        const isNew = (order._id || order.id) === recentOrderId;
                                        return (
                                            <tr
                                                key={order._id || order.id}
                                                className={`transition hover:bg-stone-50/70 ${
                                                    isNew ? 'bg-amber-50/80 font-medium' : ''
                                                }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-bold text-stone-900 block">
                                                        #{(order._id || '').slice(-6).toUpperCase()}
                                                    </span>
                                                    <span className="text-[11px] text-stone-500 font-light">
                                                        {formatDate(order.orderDate)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-serif text-sm font-semibold text-stone-900 block">
                                                        {order.name || 'N/A'}
                                                    </span>
                                                    <span className="text-stone-500 font-light block">{order.email}</span>
                                                    <span className="text-[11px] text-stone-400 block">{order.city}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-stone-700">
                                                    {order.orderedProducts?.length || 0} item(s)
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-serif text-sm font-bold text-[#9B5A2B]">
                                                        PKR {Number(order.orderTotal || 0).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={order.orderStatus}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="packing">Packing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                    </select>
                                                    {statusMessages[order._id] && (
                                                        <p className="text-[10px] text-emerald-600 mt-1 font-mono">
                                                            {statusMessages[order._id]}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleOrderClick(order)}
                                                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                                                            title="Inspect Full Invoice"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {order.phone && (
                                                            <a
                                                                href={`https://wa.me/${order.phone}?text=Hello ${encodeURIComponent(order.name || 'Client')}, your Luveo atelier order (#${(order._id || '').slice(-6)}) of PKR ${order.orderTotal} is currently: ${order.orderStatus}.`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                                                                title="WhatsApp Customer"
                                                            >
                                                                <MessageCircle className="w-4 h-4" />
                                                            </a>
                                                        )}

                                                        <button
                                                            onClick={() => cancelOrder(order._id)}
                                                            disabled={cancelState[order._id]?.loading}
                                                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                                                            title="Cancel Order"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-stone-400 font-light">
                                            No commission records match your current filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Atelier Invoice & Commission Details Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-stone-100 flex items-center justify-between z-10">
                                <div>
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9B5A2B] block">
                                        Atelier Commission Voucher
                                    </span>
                                    <h3 className="font-serif text-lg font-semibold text-stone-900">
                                        Order Manifest #{selectedOrder._id?.slice(-8).toUpperCase()}
                                    </h3>
                                </div>
                                <button
                                    onClick={closeOrderDetails}
                                    className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Order Metadata Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FBF9F5] p-4 rounded-2xl border border-stone-200 text-xs">
                                    <div>
                                        <span className="text-stone-400 uppercase font-mono text-[10px] block">Order Date</span>
                                        <span className="font-medium text-stone-900 block mt-0.5">
                                            {formatDate(selectedOrder.orderDate)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 uppercase font-mono text-[10px] block">Current Stage</span>
                                        <span className="font-semibold text-[#9B5A2B] uppercase block mt-0.5">
                                            {selectedOrder.orderStatus}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 uppercase font-mono text-[10px] block">Payment Type</span>
                                        <span className="font-medium text-stone-900 block mt-0.5">Cash on Delivery</span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 uppercase font-mono text-[10px] block">Total Amount</span>
                                        <span className="font-serif text-base font-bold text-stone-900 block">
                                            PKR {Number(selectedOrder.orderTotal || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Patron & Shipping Details */}
                                <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-stone-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-stone-400 uppercase font-mono text-[10px] block mb-1">
                                            Patron Information
                                        </span>
                                        <p className="font-semibold text-stone-900 text-sm">{selectedOrder.name}</p>
                                        <p className="text-stone-600 mt-0.5">{selectedOrder.email}</p>
                                        <p className="text-stone-600">{selectedOrder.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 uppercase font-mono text-[10px] block mb-1">
                                            Consignment Destination
                                        </span>
                                        <p className="text-stone-900 font-medium">{selectedOrder.address}</p>
                                        <p className="text-stone-600 mt-0.5">
                                            {[selectedOrder.city, selectedOrder.province, selectedOrder.postalCode]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>
                                    </div>
                                </div>

                                {/* Commission Items */}
                                <div>
                                    <span className="text-stone-400 uppercase font-mono text-[10px] block mb-3">
                                        Artisan Pieces In Order
                                    </span>
                                    <div className="space-y-3">
                                        {selectedOrder.orderedProducts?.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3 text-xs"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-serif text-sm font-semibold text-stone-900 truncate">
                                                        {item.productName || 'Handcrafted Item'}
                                                    </h5>
                                                    <div className="flex items-center gap-3 text-stone-500 mt-1">
                                                        {item.productColor && (
                                                            <span className="inline-flex items-center gap-1">
                                                                {item.productColorHex && (
                                                                    <span
                                                                        className="w-2.5 h-2.5 rounded-full border border-stone-300"
                                                                        style={{ backgroundColor: item.productColorHex }}
                                                                    />
                                                                )}
                                                                {item.productColor}
                                                            </span>
                                                        )}
                                                        <span>Qty: {item.productQuantity || 1}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-serif text-sm font-bold text-stone-900">
                                                        PKR {Number(item.productPrice || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                                    <button
                                        onClick={closeOrderDetails}
                                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="px-4 py-2 bg-[#0D0C0B] hover:bg-stone-800 text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 shadow transition"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Print Invoice</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersPage;
