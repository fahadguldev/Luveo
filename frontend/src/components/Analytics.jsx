import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart3,
    Eye,
    Globe,
    TrendingUp,
    Search,
    ArrowUpDown,
    Award
} from 'lucide-react';
import AdminBackLink from './AdminBackLink';

const Analytics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('visitCount');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [totalVisits, setTotalVisits] = useState('0');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/product/get-products`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const resData = await response.json();
                setData(Array.isArray(resData.products) ? resData.products : []);
                setError(null);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products");
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const getTotalVisits = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/globalVisitCount`);
            setTotalVisits(response.data?.message?.globalVisitCount || 0);
        } catch {
            setTotalVisits(0);
        }
    };

    useEffect(() => {
        getTotalVisits();
    }, []);

    const filteredData = (data || [])
        .filter((product) => product?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return (a[sortBy] || 0) > (b[sortBy] || 0) ? 1 : -1;
            } else {
                return (a[sortBy] || 0) < (b[sortBy] || 0) ? 1 : -1;
            }
        });

    const totalProductVisits = (data || []).reduce((total, product) => total + (product?.visitCount || 0), 0);
    const avgVisits = data.length ? (totalProductVisits / data.length).toFixed(1) : 0;
    const topProducts = data.length ? [...data].sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0)).slice(0, 3) : [];
    const visitsCount = Number(totalVisits) || 0;
    const productVisitRate = visitsCount > 0 ? (totalProductVisits / visitsCount) * 100 : 0;

    return (
        <div className="min-h-screen bg-[#FBF9F5] text-stone-900 px-4 sm:px-8 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <AdminBackLink />

                {/* Header */}
                <div className="pb-4 border-b border-stone-200">
                    <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9B5A2B] mb-1">
                        <span>Traffic & Patron Engagement</span>
                    </div>
                    <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
                        Atelier Product Analytics
                    </h1>
                    <p className="text-xs text-stone-500 font-light mt-0.5">
                        Inspect customer impressions, high-interest leather designs, and boutique traffic.
                    </p>
                </div>

                {loading && (
                    <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm">
                        <div className="w-10 h-10 border-4 border-[#9B5A2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="font-serif text-stone-600 text-sm">Compiling boutique metrics...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-1">
                                <div className="flex items-center justify-between text-stone-400 mb-2">
                                    <Globe className="w-4 h-4 text-[#9B5A2B]" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest">Global</span>
                                </div>
                                <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                                    {Number(totalVisits).toLocaleString()}
                                </p>
                                <p className="text-[11px] text-stone-500 font-medium">Boutique Visits</p>
                            </div>

                            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-1">
                                <div className="flex items-center justify-between text-stone-400 mb-2">
                                    <Eye className="w-4 h-4 text-[#C6833E]" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest">Views</span>
                                </div>
                                <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                                    {totalProductVisits.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-stone-500 font-medium">Product Impressions</p>
                            </div>

                            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-1">
                                <div className="flex items-center justify-between text-stone-400 mb-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest">Rate</span>
                                </div>
                                <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
                                    {productVisitRate.toFixed(1)}%
                                </p>
                                <p className="text-[11px] text-stone-500 font-medium">Interest Ratio</p>
                            </div>

                            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-1">
                                <div className="flex items-center justify-between text-stone-400 mb-2">
                                    <BarChart3 className="w-4 h-4 text-stone-600" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest">Average</span>
                                </div>
                                <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                                    {avgVisits}
                                </p>
                                <p className="text-[11px] text-stone-500 font-medium">Avg Views / Item</p>
                            </div>

                            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
                                <div className="flex items-center justify-between text-stone-400 mb-2">
                                    <Award className="w-4 h-4 text-[#9B5A2B]" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest">Pieces</span>
                                </div>
                                <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                                    {data.length}
                                </p>
                                <p className="text-[11px] text-stone-500 font-medium">Catalogued Designs</p>
                            </div>
                        </div>

                        {/* Top Performing Showcase */}
                        <div className="bg-gradient-to-br from-[#0D0C0B] to-[#251B14] rounded-3xl p-6 sm:p-8 text-white border border-amber-950/40 shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-[#C6833E]" />
                                    <h3 className="font-serif text-lg sm:text-xl font-normal tracking-wide">
                                        Top Performing Atelier Pieces
                                    </h3>
                                </div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6833E]">
                                    Client Favorites
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {topProducts.map((topProduct, index) => (
                                    <div
                                        key={topProduct._id || index}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition"
                                    >
                                        <img
                                            src={
                                                topProduct.colors?.[0]?.images?.[0] ||
                                                "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=200"
                                            }
                                            alt={topProduct.name}
                                            className="w-14 h-14 rounded-xl object-cover border border-white/10 bg-stone-900 flex-shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] font-mono text-amber-300 font-bold">
                                                #{index + 1} MOST VIEWED
                                            </span>
                                            <h4 className="font-serif text-sm font-semibold text-white truncate">
                                                {topProduct.name}
                                            </h4>
                                            <span className="text-xs text-stone-300 font-mono mt-0.5 block">
                                                {topProduct.visitCount || 0} client views
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-serif text-lg font-semibold text-stone-900">
                                        Complete Catalog Views
                                    </h3>
                                    <p className="text-xs text-stone-500 font-light">
                                        Sort and filter individual piece engagement
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="relative flex-1 sm:flex-initial">
                                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search designs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#9B5A2B]"
                                        />
                                    </div>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800"
                                    >
                                        <option value="visitCount">Sort by Views</option>
                                        <option value="name">Sort by Name</option>
                                    </select>

                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
                                        title="Toggle Sort Direction"
                                    >
                                        <ArrowUpDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-stone-100 text-xs">
                                    <thead className="bg-[#FBF9F5]">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-mono uppercase tracking-wider text-stone-500 text-[11px]">
                                                Leather Piece
                                            </th>
                                            <th className="px-6 py-3 text-left font-mono uppercase tracking-wider text-stone-500 text-[11px]">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left font-mono uppercase tracking-wider text-stone-500 text-[11px]">
                                                Impressions
                                            </th>
                                            <th className="px-6 py-3 text-left font-mono uppercase tracking-wider text-stone-500 text-[11px]">
                                                Engagement Share
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {filteredData.map((product) => {
                                            const highestViews = topProducts[0]?.visitCount || 1;
                                            const percent = Math.min(100, Math.round(((product.visitCount || 0) / highestViews) * 100));
                                            return (
                                                <tr key={product._id} className="hover:bg-stone-50/70 transition">
                                                    <td className="px-6 py-4 flex items-center gap-3">
                                                        <img
                                                            src={
                                                                product.colors?.[0]?.images?.[0] ||
                                                                "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=150"
                                                            }
                                                            alt={product.name}
                                                            className="w-10 h-10 rounded-xl object-cover border border-stone-200 bg-stone-100"
                                                        />
                                                        <div>
                                                            <span className="font-serif text-sm font-semibold text-stone-900 block">
                                                                {product.name}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-stone-400">
                                                                #{product._id.slice(-6).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-serif text-sm font-semibold text-[#9B5A2B]">
                                                        PKR {Number(product.discountPrice || product.price || 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-mono font-medium text-stone-800">
                                                        {(product.visitCount || 0).toLocaleString()} views
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="w-32 sm:w-48 bg-stone-100 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-[#9B5A2B] to-[#C6833E] h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Analytics;
