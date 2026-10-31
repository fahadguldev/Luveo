import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    ShoppingBag,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    Trash2,
    LogOut,
    ArrowRight,
    MapPin,
    Calendar,
    Phone,
    Mail,
    ShieldCheck,
    Sparkles,
    ChevronRight,
    Loader2
} from "lucide-react";

const TRACKING_STAGES = [
    { key: "pending", label: "Commission Placed", desc: "Order recorded & awaiting atelier review", icon: Clock },
    { key: "packing", label: "Atelier Crafting", desc: "Handcrafted, wax-sealed & inspected", icon: Package },
    { key: "shipped", label: "Dispatched", desc: "With express courier for delivery", icon: Truck },
    { key: "delivered", label: "Delivered", desc: "Safely delivered to your door", icon: CheckCircle2 }
];

const getStageIndex = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered" || s === "delievered" || s === "completed") return 3;
    if (s === "shipped" || s === "dispatched") return 2;
    if (s === "packing" || s === "processing" || s === "crafting") return 1;
    return 0; // pending
};

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [cartProducts, setCartProducts] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderedProducts, setOrderedProducts] = useState([]);
    const [activeTab, setActiveTab] = useState("orders"); // default to orders for tracking focus
    const [expandedOrder, setExpandedOrder] = useState(null);

    const navigate = useNavigate();
    const colorSelections = useSelector((state) => state.cart.colorSelections || {});

    // Calculate cart total
    const cartTotal = useMemo(() => {
        return cartProducts
            .reduce((sum, product) => sum + Number(product.discountPrice || product.price || 0), 0)
            .toLocaleString("en-PK");
    }, [cartProducts]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = localStorage.getItem("user");
                if (!storedUser) {
                    throw new Error("No active session found. Please sign in.");
                }

                const user = JSON.parse(storedUser);
                setUserId(user.id || user._id);

                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/user/get-user/${user.id || user._id}`
                );

                if (!response.ok) {
                    // Fallback to local user object
                    setUserData(user);
                    if (user.role === "admin") navigate("/admin");
                    return;
                }

                const data = await response.json();
                setUserData(data.user);

                if (data.user?.role === "admin") {
                    navigate("/admin");
                    return;
                }

                if (data.user?.cart && data.user.cart.length > 0) {
                    await fetchCartProducts(data.user.cart);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUserData(JSON.parse(storedUser));
                } else {
                    setError(err.message || "Failed to load profile");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const fetchCartProducts = async (cartIds) => {
        if (!Array.isArray(cartIds) || cartIds.length === 0) {
            setCartProducts([]);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/product/get-selected-products`,
                { ids: cartIds }
            );
            setCartProducts(response.data || []);
        } catch (err) {
            console.error("Error fetching cart products:", err);
        }
    };

    const fetchOrder = useCallback(async () => {
        const orderHistory = userData?.orderHistory || [];
        let fetchedOrders = [];

        if (orderHistory.length > 0) {
            try {
                const requests = orderHistory.map((orderID) =>
                    axios
                        .get(`${import.meta.env.VITE_BACKEND_URL}/checkout/order-products?id=${orderID}`)
                        .then((res) => ({ orderID, products: res.data?.order }))
                        .catch(() => null)
                );
                const responses = await Promise.all(requests);
                fetchedOrders = responses.filter(Boolean);
            } catch (err) {
                console.error("Error fetching API orders:", err);
            }
        }

        // Also merge any offline / guest orders stored in localStorage
        try {
            const localOrders = JSON.parse(localStorage.getItem("luveo_orders") || "[]");
            const localFormatted = localOrders.map((o) => ({
                orderID: o.orderId || o.orderID || "LUV-LOCAL",
                products: {
                    ...o,
                    orderStatus: o.orderStatus || "pending",
                    orderDate: o.orderDate || new Date().toISOString(),
                    orderedProducts: o.orderedProducts || []
                }
            }));

            // Deduplicate by orderID
            const combined = [...fetchedOrders];
            localFormatted.forEach((local) => {
                if (!combined.some((c) => c.orderID === local.orderID)) {
                    combined.unshift(local);
                }
            });

            setOrderedProducts(combined);
            if (combined.length > 0) {
                setExpandedOrder(combined[0].orderID);
            }
        } catch {
            setOrderedProducts(fetchedOrders);
        }
    }, [userData]);

    useEffect(() => {
        if (userData) {
            fetchOrder();
        }
    }, [userData, fetchOrder]);

    const handleLogout = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/user/logout`,
                {},
                { withCredentials: true }
            );
        } catch {
            // Proceed with local logout regardless of network
        }
        localStorage.clear();
        window.dispatchEvent(new Event("auth-change"));
        navigate("/login");
    };

    const removeFromCart = async (productId) => {
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/product/remove-from-cart`,
                { productId, userId }
            );
            setCartProducts((prev) => prev.filter((product) => product._id !== productId));
            if (userData?.cart) {
                setUserData({
                    ...userData,
                    cart: userData.cart.filter((id) => id !== productId)
                });
            }
        } catch (err) {
            console.error("Error removing product:", err);
            setCartProducts((prev) => prev.filter((product) => product._id !== productId));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-[#9B5A2B] animate-spin mx-auto mb-4" />
                    <p className="font-serif text-lg text-stone-700">Accessing Atelier Client Vault...</p>
                </div>
            </div>
        );
    }

    if (error && !userData) {
        return (
            <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center px-4 py-16">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 text-center shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-amber-50 text-[#9B5A2B] flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="font-serif text-2xl text-stone-900 mb-2">Atelier Vault Session Expired</h2>
                    <p className="text-sm text-stone-600 mb-6 font-light">{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-3.5 bg-[#0D0C0B] text-[#FBF9F5] rounded-xl font-medium tracking-wide hover:bg-stone-800 transition"
                    >
                        Sign In to Client Vault
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF9F5] text-stone-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Atelier Client Profile Banner */}
                <div className="relative rounded-3xl bg-gradient-to-br from-[#0D0C0B] via-[#1A1815] to-[#2B231C] text-white p-6 sm:p-10 shadow-2xl overflow-hidden border border-amber-950/40">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6833E]/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 justify-between">
                        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#9B5A2B] to-[#4A260F] p-1 shadow-inner flex items-center justify-center flex-shrink-0">
                                {userData?.picture ? (
                                    <img
                                        src={userData.picture}
                                        alt={userData?.name || "Member"}
                                        className="w-full h-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <span className="font-serif text-3xl font-light tracking-wider text-amber-200">
                                        {(userData?.name || "L").charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest bg-[#C6833E] text-[#0D0C0B] font-bold shadow">
                                    VIP
                                </span>
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono mb-2">
                                    <Sparkles className="w-3 h-3" />
                                    <span>LUVEO ATELIER PATRON</span>
                                </div>
                                <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-wide">
                                    {userData?.name || "Valued Client"}
                                </h1>
                                <p className="text-stone-400 text-xs sm:text-sm font-light mt-0.5">
                                    {userData?.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleLogout}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white text-xs font-medium border border-white/10 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Patron Assurance Bar */}
                    <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left text-xs text-stone-300">
                        <div>
                            <span className="block text-stone-500 text-[10px] uppercase font-mono">Commission Vault</span>
                            <span className="font-serif text-white text-base">
                                {orderedProducts.length} {orderedProducts.length === 1 ? "Order" : "Orders"}
                            </span>
                        </div>
                        <div>
                            <span className="block text-stone-500 text-[10px] uppercase font-mono">Curated Cart</span>
                            <span className="font-serif text-white text-base">
                                {cartProducts.length} {cartProducts.length === 1 ? "Item" : "Items"}
                            </span>
                        </div>
                        <div>
                            <span className="block text-stone-500 text-[10px] uppercase font-mono">Warranty</span>
                            <span className="font-serif text-amber-300 text-base">Lifetime Grain Guarantee</span>
                        </div>
                        <div>
                            <span className="block text-stone-500 text-[10px] uppercase font-mono">Atelier Service</span>
                            <span className="font-serif text-white text-base">Express Courier (COD)</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation (Mobile friendly pills) */}
                <div className="flex bg-stone-200/70 p-1.5 rounded-2xl max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition flex items-center justify-center gap-2 ${
                            activeTab === "orders"
                                ? "bg-white text-stone-900 shadow-md font-semibold"
                                : "text-stone-600 hover:text-stone-900"
                        }`}
                    >
                        <Truck className="w-4 h-4 text-[#9B5A2B]" />
                        <span>Order Tracking ({orderedProducts.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("cart")}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition flex items-center justify-center gap-2 ${
                            activeTab === "cart"
                                ? "bg-white text-stone-900 shadow-md font-semibold"
                                : "text-stone-600 hover:text-stone-900"
                        }`}
                    >
                        <ShoppingBag className="w-4 h-4 text-[#9B5A2B]" />
                        <span>Atelier Cart ({cartProducts.length})</span>
                    </button>
                </div>

                {/* Content Section */}
                <div className="space-y-6">
                    {activeTab === "orders" ? (
                        /* ================== ORDER TRACKING ================== */
                        <div className="space-y-6">
                            {orderedProducts.length > 0 ? (
                                orderedProducts.map((orderItem) => {
                                    const { orderID, products } = orderItem;
                                    const status = products?.orderStatus || "pending";
                                    const stageIdx = getStageIndex(status);
                                    const isExpanded = expandedOrder === orderID;

                                    return (
                                        <div
                                            key={orderID}
                                            className="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition overflow-hidden"
                                        >
                                            {/* Order Card Header */}
                                            <div
                                                onClick={() => setExpandedOrder(isExpanded ? null : orderID)}
                                                className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition border-b border-stone-100"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="font-mono text-xs font-bold text-stone-900 bg-stone-200/80 px-2.5 py-1 rounded-md">
                                                            #{orderID.slice(-8).toUpperCase()}
                                                        </span>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase ${
                                                                stageIdx === 3
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : stageIdx === 2
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : stageIdx === 1
                                                                    ? "bg-amber-100 text-amber-900"
                                                                    : "bg-stone-200 text-stone-800"
                                                            }`}
                                                        >
                                                            {TRACKING_STAGES[stageIdx]?.label || status}
                                                        </span>
                                                        <span className="text-xs text-stone-500 inline-flex items-center gap-1 font-light">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(products?.orderDate || Date.now()).toLocaleDateString(
                                                                "en-US",
                                                                { month: "short", day: "numeric", year: "numeric" }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-stone-500 font-light pt-1">
                                                        Consigned to: <span className="font-medium text-stone-800">{products?.name}</span> ({products?.city || "Pakistan"})
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                                    <div className="text-left sm:text-right">
                                                        <span className="text-[10px] uppercase font-mono text-stone-500 block">Total Due (COD)</span>
                                                        <span className="font-serif text-lg sm:text-xl font-bold text-[#9B5A2B]">
                                                            PKR {Number(products?.orderTotal || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                                                        <ChevronRight
                                                            className={`w-5 h-5 transition-transform duration-200 ${
                                                                isExpanded ? "rotate-90" : ""
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* LIVE TRACKING TIMELINE BAR (Always visible for clarity) */}
                                            <div className="p-5 sm:p-7 bg-[#FBF9F5]/70 border-b border-stone-100">
                                                <h4 className="font-serif text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-[#9B5A2B]" />
                                                    <span>Live Atelier Consignment Progress</span>
                                                </h4>

                                                {/* Mobile Responsive Tracker */}
                                                <div className="relative">
                                                    {/* Connecting Line */}
                                                    <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-stone-200 -z-0">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#9B5A2B] to-[#C6833E] transition-all duration-500"
                                                            style={{
                                                                width: `${(stageIdx / (TRACKING_STAGES.length - 1)) * 100}%`
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
                                                        {TRACKING_STAGES.map((stage, idx) => {
                                                            const Icon = stage.icon;
                                                            const isCompleted = idx <= stageIdx;
                                                            const isCurrent = idx === stageIdx;

                                                            return (
                                                                <div
                                                                    key={stage.key}
                                                                    className={`flex sm:flex-col items-center sm:items-center gap-3.5 sm:gap-2 p-3 sm:p-2 rounded-2xl ${
                                                                        isCurrent ? "bg-amber-100/60 sm:bg-transparent" : ""
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition shadow-sm ${
                                                                            isCompleted
                                                                                ? "bg-[#9B5A2B] text-white ring-4 ring-amber-100"
                                                                                : "bg-white text-stone-400 border border-stone-300"
                                                                        }`}
                                                                    >
                                                                        <Icon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="text-left sm:text-center">
                                                                        <span
                                                                            className={`block text-xs font-semibold ${
                                                                                isCompleted ? "text-stone-900" : "text-stone-500"
                                                                            }`}
                                                                        >
                                                                            {stage.label}
                                                                        </span>
                                                                        <span className="text-[11px] text-stone-500 font-light block line-clamp-1 sm:line-clamp-2">
                                                                            {stage.desc}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expandable Order Details */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="p-5 sm:p-7 space-y-6"
                                                    >
                                                        {/* Ordered Products Breakdown */}
                                                        <div>
                                                            <h5 className="font-mono text-xs uppercase tracking-wider text-stone-500 mb-3">
                                                                Commissioned Pieces
                                                            </h5>
                                                            <div className="divide-y divide-stone-100">
                                                                {Array.isArray(products?.orderedProducts) &&
                                                                    products.orderedProducts.map((prod, pIdx) => {
                                                                        const img =
                                                                            prod.productImg?.[0] ||
                                                                            prod.productImg ||
                                                                            "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400";
                                                                        return (
                                                                            <div
                                                                                key={pIdx}
                                                                                className="py-3 flex items-center gap-4"
                                                                            >
                                                                                <img
                                                                                    src={img}
                                                                                    alt={prod.productName}
                                                                                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-stone-100 flex-shrink-0"
                                                                                />
                                                                                <div className="flex-1 min-w-0">
                                                                                    <h6 className="font-serif text-sm font-semibold text-stone-900 truncate">
                                                                                        {prod.productName || "Handcrafted Leather Good"}
                                                                                    </h6>
                                                                                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                                                                                        {prod.productColor && (
                                                                                            <span className="inline-flex items-center gap-1">
                                                                                                <span
                                                                                                    className="w-2.5 h-2.5 rounded-full border border-stone-300"
                                                                                                    style={{
                                                                                                        backgroundColor:
                                                                                                            prod.productColorHex ||
                                                                                                            "#4A260F"
                                                                                                    }}
                                                                                                />
                                                                                                {prod.productColor}
                                                                                            </span>
                                                                                        )}
                                                                                        <span>Qty: {prod.productQuantity || 1}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <span className="font-serif text-sm font-semibold text-stone-900">
                                                                                        PKR {Number(prod.productPrice || 0).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>

                                                        {/* Shipping Destination Card */}
                                                        <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 text-xs text-stone-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <span className="font-mono text-[10px] uppercase text-stone-500 block">
                                                                    Delivery Destination
                                                                </span>
                                                                <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                                                                    <MapPin className="w-3.5 h-3.5 text-[#9B5A2B]" />
                                                                    {products?.address}
                                                                </p>
                                                                <p className="text-stone-600 pl-5">
                                                                    {products?.city}, {products?.province || "Pakistan"}{" "}
                                                                    {products?.postalCode || ""}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <span className="font-mono text-[10px] uppercase text-stone-500 block">
                                                                    Consignee Contact
                                                                </span>
                                                                <p className="flex items-center gap-1.5 text-stone-800">
                                                                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                                                                    {products?.phone}
                                                                </p>
                                                                <p className="flex items-center gap-1.5 text-stone-800">
                                                                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                                                                    {products?.email}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Cash on Delivery Open Parcel Reminder */}
                                                        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-3 text-xs text-amber-900">
                                                            <ShieldCheck className="w-4 h-4 text-[#9B5A2B] flex-shrink-0" />
                                                            <span>
                                                                <strong>Open Parcel Inspection:</strong> You are encouraged to verify your leather item with the courier before handing over payment.
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm max-w-lg mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
                                        <Package className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-serif text-xl font-medium text-stone-900 mb-2">
                                        No Atelier Orders Found
                                    </h3>
                                    <p className="text-sm text-stone-500 font-light mb-6">
                                        You have not commissioned any handcrafted leather goods yet. Explore our latest vegetable-tanned collection.
                                    </p>
                                    <Link
                                        to="/all-products"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0D0C0B] text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition"
                                    >
                                        <span>Discover the Collection</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ================== ATELIER CART ================== */
                        <div className="space-y-6">
                            {cartProducts.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Products Column */}
                                    <div className="lg:col-span-2 space-y-4">
                                        {cartProducts.map((product) => {
                                            const selectedColor = colorSelections[product._id];
                                            const colorImages = selectedColor
                                                ? product.colors?.find((c) => c.hex === selectedColor.hex)?.images
                                                : product.colors?.[0]?.images;
                                            const displayImage =
                                                colorImages?.[0] ||
                                                product.colors?.[0]?.images?.[0] ||
                                                "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400";
                                            const displayColor =
                                                selectedColor ||
                                                (product.colors?.[0]
                                                    ? { name: product.colors[0].name, hex: product.colors[0].hex }
                                                    : null);

                                            return (
                                                <div
                                                    key={product._id}
                                                    className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm flex items-center gap-4"
                                                >
                                                    <img
                                                        src={displayImage}
                                                        alt={product.name}
                                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-stone-100 flex-shrink-0 border border-stone-200"
                                                    />

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-serif text-base font-semibold text-stone-900 truncate">
                                                            {product.name}
                                                        </h4>
                                                        {displayColor && (
                                                            <div className="flex items-center gap-2 mt-1 text-xs text-stone-600">
                                                                <span
                                                                    className="w-3 h-3 rounded-full border border-stone-300"
                                                                    style={{ background: displayColor.hex }}
                                                                />
                                                                <span>{displayColor.name}</span>
                                                            </div>
                                                        )}
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <span className="font-serif text-base font-bold text-[#9B5A2B]">
                                                                PKR {Number(product.discountPrice || product.price || 0).toLocaleString()}
                                                            </span>
                                                            <button
                                                                onClick={() => removeFromCart(product._id)}
                                                                className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                                                                title="Remove from cart"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Cart Order Summary Card */}
                                    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm h-fit space-y-4">
                                        <h4 className="font-serif text-lg font-semibold text-stone-900">
                                            Order Summary
                                        </h4>
                                        <div className="space-y-2 text-xs sm:text-sm text-stone-600">
                                            <div className="flex justify-between">
                                                <span>Subtotal ({cartProducts.length} items)</span>
                                                <span className="font-medium text-stone-900">PKR {cartTotal}</span>
                                            </div>
                                            <div className="flex justify-between text-emerald-700">
                                                <span>Express Atelier Shipping</span>
                                                <span className="font-semibold uppercase text-xs">Complimentary</span>
                                            </div>
                                            <div className="flex justify-between text-stone-500">
                                                <span>Payment Method</span>
                                                <span>Cash on Delivery</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-stone-100 flex justify-between items-baseline">
                                            <span className="font-serif text-base font-medium text-stone-900">
                                                Estimated Total
                                            </span>
                                            <span className="font-serif text-2xl font-bold text-[#9B5A2B]">
                                                PKR {cartTotal}
                                            </span>
                                        </div>

                                        <Link to="/checkout" className="block pt-2">
                                            <button className="w-full py-4 bg-[#0D0C0B] text-[#FBF9F5] rounded-xl font-medium tracking-wide hover:bg-stone-800 transition flex items-center justify-center gap-2 shadow-lg">
                                                <span>Proceed to Fast Checkout</span>
                                                <ArrowRight className="w-4 h-4 text-[#C6833E]" />
                                            </button>
                                        </Link>

                                        <p className="text-[11px] text-stone-400 text-center font-light">
                                            Handcrafted in small batches. 100% full-grain leather guaranteed.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm max-w-lg mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-serif text-xl font-medium text-stone-900 mb-2">
                                        Your Vault is Empty
                                    </h3>
                                    <p className="text-sm text-stone-500 font-light mb-6">
                                        Add your favorite MagFlap™ wallet, artisan belt, or travel companion to begin crafting.
                                    </p>
                                    <Link
                                        to="/all-products"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0D0C0B] text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition"
                                    >
                                        <span>Browse Atelier Collection</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
