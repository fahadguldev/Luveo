
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
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
    const [cancelState, setCancelState] = useState({}); // { [orderId]: { loading: bool, message: string, error: bool } }
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

            // Prepend new order dynamically without full page reload
            setOrders((prevOrders) => {
                const exists = prevOrders.some((o) => (o._id || o.id) === newId);
                if (exists) return prevOrders;
                return [newOrder, ...prevOrders];
            });

            // Trigger visual flash highlight and toast
            setRecentOrderId(newId);
            setLiveToast({
                id: newId,
                name: newOrder.name || newOrder.customer?.name || 'Customer',
                total: newOrder.orderTotal || newOrder.amount_total || newOrder.amountTotal || '0',
            });

            // Play notification sound
            if (!audioMuted && audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch((err) => {
                    console.warn('Audio playback restricted by browser policy:', err.message);
                });
            }

            // Remove visual highlight after 5 seconds
            setTimeout(() => {
                setRecentOrderId((prev) => (prev === newId ? null : prev));
            }, 5000);

            // Hide toast after 6 seconds
            setTimeout(() => {
                setLiveToast((prev) => (prev?.id === newId ? null : prev));
            }, 6000);
        });

        // Clean up socket listeners and disconnect cleanly on unmount to prevent leaks
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
                setOrders(response.data.orders);
                setError(null);
                setLoading(false);
            } catch (err) {
                // Gracefully handle "no orders" response
                if (err.response?.status === 404) {
                    setOrders([]);
                    setError(null);
                } else {
                    setError('Failed to load orders. Please try again later.');
                }
                setLoading(false);
                console.error('Error fetching orders:', err);
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

    // Filter orders based on search term and status
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Format currency
    // const formatCurrency = (amount, currency = 'AED') => {
    //     return new Intl.NumberFormat('en-AE', {
    //         style: 'currency',
    //         currency: currency.toUpperCase(),
    //         minimumFractionDigits: 2
    //     }).format(amount);
    // };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } catch (error) {
            console.log(error)
            return dateString;
        }
    };

    const formatFieldLabel = (fieldName) => {
        if (!fieldName) return '';
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, (char) => char.toUpperCase())
            .trim();
    };

    const renderFieldValue = (value) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        if (Array.isArray(value)) {
            if (value.length === 0) return '[]';
            return value.join(', ');
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/analytics/update-order-status`, {
                orderID: orderId,
                orderStatus: newStatus,
            }, {
                headers: getAuthHeaders(),
                withCredentials: true
            });

            setStatusMessages(prev => ({
                ...prev,
                [orderId]: res.data.message || 'Status updated successfully!'
            }));

            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, orderStatus: newStatus } : order
            ));

            setTimeout(() => {
                setStatusMessages(prev => {
                    const newMessages = { ...prev };
                    delete newMessages[orderId];
                    return newMessages;
                });
            }, 3000);

        } catch (error) {
            setStatusMessages(prev => ({
                ...prev,
                [orderId]: error.response?.data?.message || 'Error updating order'
            }));

            setTimeout(() => {
                setStatusMessages(prev => {
                    const newMessages = { ...prev };
                    delete newMessages[orderId];
                    return newMessages;
                });
            }, 3000);
        }
    };
    const cancelOrder = async (orderId) => {
        setCancelState(prev => ({ ...prev, [orderId]: { loading: true, message: null, error: false } }));
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/admin/cancel-order/${orderId}`, {
                headers: getAuthHeaders(),
                withCredentials: true
            });
            setOrders(prev => prev.filter(o => o._id !== orderId));
            setCancelState(prev => ({ ...prev, [orderId]: { loading: false, message: 'Order cancelled', error: false } }));
        } catch {
            setCancelState(prev => ({ ...prev, [orderId]: { loading: false, message: 'Failed to cancel order', error: true } }));
        }

        // Clear message after a short delay
        setTimeout(() => {
            setCancelState(prev => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });
        }, 3000);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <AdminBackLink />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-xs text-gray-500 mt-1">Real-time live push updates via MongoDB Atlas Change Streams</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isSocketConnected 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {isSocketConnected ? 'Live Connected' : 'Disconnected'}
                    </span>
                    <button
                        onClick={() => setAudioMuted(!audioMuted)}
                        type="button"
                        className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition text-gray-700"
                        title="Toggle notification sound"
                    >
                        {audioMuted ? '🔕 Sound Off' : '🔔 Sound On'}
                    </button>
                </div>
            </div>

            {/* Live Order Arrival Toast Banner */}
            {liveToast && (
                <div className="mb-6 p-4 bg-emerald-600 text-white rounded-lg shadow-md flex items-center justify-between animate-bounce">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🛍️</span>
                        <div>
                            <p className="font-bold text-sm">New Order Received!</p>
                            <p className="text-xs text-emerald-100">
                                {liveToast.name} placed an order of RS {liveToast.total}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setLiveToast(null)}
                        className="text-white hover:text-emerald-200 font-bold text-lg"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Search by email, name or order ID..."
                        className="w-full p-3 border rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="p-3 border rounded-lg bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="packing">Packing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Send Msg
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cancel Order
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr
                                    key={order._id || order.id}
                                    className={`transition-colors duration-1000 ${
                                        (order._id || order.id) === recentOrderId
                                            ? 'bg-amber-100/90 font-medium text-amber-950 ring-2 ring-amber-400 ring-inset'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <span>{formatDate(order.orderDate)}</span>
                                            {(order._id || order.id) === recentOrderId && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {order.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {order.orderedProducts?.length || 0} items
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.orderTotal}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.orderStatus === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : order.orderStatus === 'dispatched'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900"
                                            onClick={() => handleOrderClick(order)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            name="orderStatus"
                                            value={order.orderStatus}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="packing">Packing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                        </select>
                                        {statusMessages[order._id] && (
                                            <p className="text-xs text-green-500 mt-1">{statusMessages[order._id]}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* WhatsApp Button */}
                                        <a
                                            href={`https://wa.me/${order.phone}?text=Hello, Dear Customer ${order.name}, your order had been successfully placed on Luveo of RS ${order.orderTotal}. Your Order status  is : ${order.orderStatus}, and it will be delievered to you within 5-7 working days.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
                                        >   
                                            Send Message 
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            className="inline-block px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 disabled:opacity-60"
                                            onClick={() => cancelOrder(order._id)}
                                            disabled={cancelState[order._id]?.loading}
                                        >
                                            {cancelState[order._id]?.loading ? 'Cancelling…' : 'Cancel Order'}
                                        </button>
                                        {cancelState[order._id]?.message && (
                                            <p className={`text-xs mt-1 ${cancelState[order._id].error ? 'text-red-500' : 'text-green-500'}`}>
                                                {cancelState[order._id].message}
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                                    There are no orders received yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
                        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between shadow-md">
                            <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={closeOrderDetails}
                                    className="p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <img
                                    className="w-20 md:w-24 h-auto object-contain"
                                    src="./images/logo.png"
                                    alt="Glowz Lifestyle Logo"
                                    loading="eager"
                                />
                            </div>
                        </div>

                        <div className="p-4">
                            {/* Combined Order Summary and Customer Info */}
                            <div className="mb-4 text-sm">
                                <h3 className="text-base font-semibold mb-2">Order Details</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500">Order ID</p>
                                        <p className="font-medium break-all">{selectedOrder._id || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">Order Date</p>
                                        <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">Status</p>
                                        <p className={`font-medium ${selectedOrder.orderStatus === 'completed' ? 'text-green-600' :
                                            selectedOrder.orderStatus === 'dispatched' ? 'text-blue-600' : 'text-yellow-600'
                                            }`}>
                                            {selectedOrder.orderStatus || 'Pending'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total</p>
                                        <p className="font-medium">{selectedOrder.orderTotal}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Customer</p>
                                        <p className="font-medium">{selectedOrder.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Contact</p>
                                        <p className="font-medium text-xs">{selectedOrder.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information - More compact */}
                            <div className="mb-4 text-sm">
                                <h3 className="text-base font-semibold mb-1">Shipping Address</h3>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm">{selectedOrder.address || 'N/A'}</p>
                                    <p className="text-sm">
                                        {[
                                            selectedOrder.city,
                                            selectedOrder.province,
                                            selectedOrder.postalCode
                                        ].filter(Boolean).join(', ')}
                                        {selectedOrder.country ? `, ${selectedOrder.country}` : ''}
                                    </p>
                                    {selectedOrder.orderNotes && (
                                        <div className="mt-1">
                                            <p className="text-xs text-gray-500">Notes: {selectedOrder.orderNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Complete Ordered Product Details */}
                            <div className="mb-4">
                                <h3 className="text-base font-semibold mb-1">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.orderedProducts?.length ? (
                                        selectedOrder.orderedProducts.map((item, index) => {
                                            const lineTotal = Number(item.productPrice || 0) * Number(item.productQuantity || 1);
                                            const reservedKeys = new Set([
                                                '_id',
                                                'productId',
                                                'productName',
                                                'productColor',
                                                'productColorHex',
                                                'productQuantity',
                                                'productPrice',
                                                'productImg',
                                            ]);

                                            const extraFields = Object.entries(item || {}).filter(([key]) => !reservedKeys.has(key));

                                            return (
                                                <div key={item._id || `${item.productId}-${index}`} className="bg-gray-50 border rounded-lg p-3">
                                                    <div className="flex items-center justify-between gap-3 mb-2">
                                                        <h4 className="font-semibold text-sm text-gray-800">Item #{index + 1}: {item.productName || 'Unnamed Product'}</h4>
                                                        <span className="text-xs text-gray-500">Line Total: {lineTotal}</span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                                                        <div>
                                                            <p className="text-gray-500">Item ID</p>
                                                            <p className="font-medium break-all">{item._id || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Product ID</p>
                                                            <p className="font-medium break-all">{item.productId || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Price</p>
                                                            <p className="font-medium">{item.productPrice ?? 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Quantity</p>
                                                            <p className="font-medium">{item.productQuantity ?? 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Color</p>
                                                            <p className="font-medium">{item.productColor || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Color</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{item.productColor|| 'N/A'}</span>
                                                                {item.productColorHex && (
                                                                    <span
                                                                        className="w-4 h-4 rounded border border-gray-300"
                                                                        style={{ backgroundColor: item.productColorHex }}
                                                                        title={item.productColorHex}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {extraFields.length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="text-xs text-gray-500 mb-1">Additional Saved Fields</p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                                {extraFields.map(([key, value]) => (
                                                                    <div key={key} className="bg-white border border-gray-200 rounded px-2 py-1">
                                                                        <p className="text-gray-500">{formatFieldLabel(key)}</p>
                                                                        <p className="font-medium break-words">{renderFieldValue(value)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-gray-500 bg-gray-50 border rounded-lg p-3">No ordered products found for this order.</p>
                                    )}

                                    <div className="bg-gray-50 border rounded-lg p-3 flex justify-end text-sm font-semibold">
                                        <span>Total Order Amount: {selectedOrder.orderTotal}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2 print:hidden">
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={closeOrderDetails}
                                >
                                    Close
                                </button>
                                <button
                                    className="px-3 py-1 bg-indigo-600 border border-transparent rounded-md text-xs font-medium text-white hover:bg-indigo-700"
                                    onClick={() => window.print()}
                                >
                                    Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;