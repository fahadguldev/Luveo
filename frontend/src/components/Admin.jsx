import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    Package,
    Users,
    BarChart3,
    ShoppingCart,
    Bell,
    LogOut,
    ArrowUpRight,
    Clock,
    Truck,
    CheckCircle2,
    DollarSign,
    Menu,
    X,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { getAuthHeaders } from '../lib/auth.js';

const Admin = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dashboard data states
    const [dashboardData, setDashboardData] = useState({
        usersCount: 0,
        productCount: 0,
        revenue: 0,
        pendingOrders: 0,
        packingOrders: 0,
        shippedOrders: 0,
        delieveredOrders: 0,
        recentOrders: []
    });

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const safeFetch = async (url, fallback) => {
            try {
                const res = await fetch(url, {
                    headers: {
                        ...getAuthHeaders(),
                    },
                    credentials: 'include'
                });
                if (!res.ok) {
                    return fallback;
                }
                const data = await res.json().catch(() => fallback);
                return data ?? fallback;
            } catch (err) {
                console.error(`Error fetching ${url}:`, err);
                return fallback;
            }
        };

        try {
            const [usersData, productsData, revenueData, ordersData] = await Promise.all([
                safeFetch(`${import.meta.env.VITE_BACKEND_URL}/user/get-users`, []),
                safeFetch(`${import.meta.env.VITE_BACKEND_URL}/product/get-products`, { products: [] }),
                safeFetch(`${import.meta.env.VITE_BACKEND_URL}/analytics/total-revenue`, { totalRevenue: 0 }),
                safeFetch(`${import.meta.env.VITE_BACKEND_URL}/analytics/all-orders`, { orders: [] })
            ]);

            const orders = ordersData?.orders || [];
            let pending = 0, packing = 0, shipped = 0, delievered = 0;
            orders.forEach((order) => {
                const status = order?.orderStatus?.toLowerCase();
                if (status === 'pending') pending++;
                else if (status === 'packing') packing++;
                else if (status === 'delivered' || status === 'delievered') delievered++;
                else if (status === 'shipped') shipped++;
            });

            setDashboardData({
                usersCount: Array.isArray(usersData) ? usersData.length : 0,
                productCount: productsData?.products?.length || 0,
                revenue: Number(revenueData?.totalRevenue) || 0,
                pendingOrders: pending,
                packingOrders: packing,
                shippedOrders: shipped,
                delieveredOrders: delievered,
                recentOrders: orders
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to refresh metrics');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 600000);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    const handleLogout = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/user/logout`,
                {},
                { withCredentials: true }
            );
        } catch {
            // continue logout
        }
        localStorage.clear();
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };

    const stats = [
        {
            title: 'Gross Revenue',
            value: formatCurrency(dashboardData.revenue),
            sub: 'COD & Online Commissions',
            icon: DollarSign,
            color: 'from-amber-600/20 to-amber-900/10 text-[#C6833E]'
        },
        {
            title: 'Atelier Products',
            value: dashboardData.productCount,
            sub: 'Active Vault Catalog',
            icon: Package,
            color: 'from-stone-600/20 to-stone-900/10 text-stone-700'
        },
        {
            title: 'Registered Patrons',
            value: dashboardData.usersCount,
            sub: 'Client Accounts',
            icon: Users,
            color: 'from-amber-700/20 to-amber-950/10 text-[#9B5A2B]'
        },
        {
            title: 'Pending Review',
            value: dashboardData.pendingOrders,
            sub: 'Needs Attention',
            icon: Clock,
            color: 'from-amber-500/20 to-amber-700/10 text-amber-700'
        },
        {
            title: 'Atelier Crafting',
            value: dashboardData.packingOrders,
            sub: 'Wax-sealing & Packing',
            icon: ShieldCheck,
            color: 'from-stone-500/20 to-stone-700/10 text-stone-800'
        },
        {
            title: 'Courier Dispatched',
            value: dashboardData.shippedOrders,
            sub: 'In Transit',
            icon: Truck,
            color: 'from-blue-500/20 to-blue-700/10 text-blue-700'
        },
        {
            title: 'Completed Deliveries',
            value: dashboardData.delieveredOrders,
            sub: 'Delivered to Clients',
            icon: CheckCircle2,
            color: 'from-emerald-500/20 to-emerald-700/10 text-emerald-700'
        }
    ];

    const navItems = [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard },
        { path: '/orders', label: 'Order Commissions', icon: ShoppingCart, count: dashboardData.pendingOrders },
        { path: '/add-product', label: 'Products & Stock', icon: Package },
        { path: '/analytics', label: 'Analytics & Traffic', icon: BarChart3 },
        { path: '/add-users', label: 'Client Accounts', icon: Users },
        { path: '/notification', label: 'VIP Broadcasts', icon: Bell }
    ];

    return (
        <div className="flex h-screen bg-[#FBF9F5] text-stone-900 overflow-hidden font-sans">
            {/* Mobile Header / Hamburger Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0D0C0B] border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-white font-normal tracking-wider">
                        LUVEO <span className="font-mono text-xs text-[#C6833E]">ATELIER</span>
                    </span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition"
                    aria-label="Toggle Navigation"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Backdrop for mobile drawer */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                />
            )}

            {/* Sidebar Navigation */}
            <aside
                className={`fixed lg:static top-0 bottom-0 left-0 z-40 bg-[#0D0C0B] text-white w-72 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-amber-950/40 shadow-2xl ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="p-6">
                    {/* Brand */}
                    <div className="pb-6 mb-6 border-b border-white/10 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9B5A2B] to-[#4A260F] p-0.5 flex items-center justify-center shadow-lg">
                                <span className="font-serif font-bold text-lg text-amber-200">L</span>
                            </div>
                            <div>
                                <span className="font-serif text-xl tracking-wider block font-medium">LUVEO</span>
                                <span className="text-[10px] font-mono tracking-widest text-[#C6833E] uppercase block">
                                    Admin Suite
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) setSidebarOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-medium tracking-wide transition group ${
                                        active
                                            ? 'bg-gradient-to-r from-[#9B5A2B] to-[#7A3F18] text-white shadow-lg'
                                            : 'text-stone-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            className={`w-4 h-4 transition ${
                                                active ? 'text-amber-200' : 'text-stone-400 group-hover:text-amber-300'
                                            }`}
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.count > 0 && (
                                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#C6833E] text-[#0D0C0B] rounded-full">
                                            {item.count}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Footer Info & Logout */}
                <div className="p-6 border-t border-white/10 space-y-3">
                    <Link
                        to="/"
                        target="_blank"
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs transition"
                    >
                        <span className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>View Public Boutique</span>
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-stone-500" />
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 text-xs font-medium transition"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Atelier</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 lg:pt-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9B5A2B] mb-1">
                                <span>Overview Dashboard</span>
                            </div>
                            <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
                                Atelier Performance Suite
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
                                Real-time monitoring of artisan commissions, customer vault activity, and logistics.
                            </p>
                        </div>

                        {error && (
                            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm hover:shadow-md transition relative overflow-hidden group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div
                                            className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                                            Metric
                                        </span>
                                    </div>
                                    <p className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
                                        {isLoading ? '...' : stat.value}
                                    </p>
                                    <p className="text-xs font-medium text-stone-700 mt-1">{stat.title}</p>
                                    <p className="text-[11px] text-stone-400 font-light mt-0.5">{stat.sub}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Commissions Activity Feed */}
                    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-stone-100 flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="font-serif text-xl font-medium text-stone-900">
                                    Recent Atelier Commissions
                                </h3>
                                <p className="text-xs text-stone-500 font-light">
                                    Incoming orders awaiting packaging or delivery confirmation
                                </p>
                            </div>
                            <Link
                                to="/orders"
                                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#9B5A2B] hover:underline"
                            >
                                <span>View Full Manifest</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="p-6">
                            {dashboardData.recentOrders.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dashboardData.recentOrders.slice(0, 6).map((item, index) => {
                                        const status = (item.orderStatus || 'pending').toLowerCase();
                                        return (
                                            <div
                                                key={item._id || index}
                                                className="p-5 rounded-2xl bg-[#FBF9F5] border border-stone-200 hover:border-amber-900/30 transition space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-xs font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200">
                                                        #{(item._id || '').slice(-6).toUpperCase()}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                                                            status === 'completed' || status === 'delivered'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : status === 'shipped' || status === 'dispatched'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : status === 'packing'
                                                                ? 'bg-amber-100 text-amber-900'
                                                                : 'bg-stone-200 text-stone-800'
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </div>

                                                <div>
                                                    <p className="font-serif text-sm font-semibold text-stone-900 truncate">
                                                        {item.name || 'Anonymous Client'}
                                                    </p>
                                                    <p className="text-xs text-stone-500 font-light">
                                                        {item.city || 'Pakistan'} • {formatDate(item.orderDate || new Date())}
                                                    </p>
                                                </div>

                                                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                                                    <span className="font-serif text-sm font-bold text-[#9B5A2B]">
                                                        {formatCurrency(item.orderTotal || 0)}
                                                    </span>
                                                    <Link
                                                        to="/orders"
                                                        className="text-xs font-medium text-stone-700 hover:text-[#9B5A2B] inline-flex items-center gap-1"
                                                    >
                                                        <span>Inspect</span>
                                                        <ArrowUpRight className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-stone-400 font-light text-sm">
                                    No commissions recorded yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Admin;
