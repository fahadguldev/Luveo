import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import AdminBackLink from './AdminBackLink';
import { getAuthHeaders } from '../lib/auth.js';

const NotificationForm = () => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [timer, setTimer] = useState(3000);
    const [currentNotification, setCurrentNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFeedback, setStatusFeedback] = useState(null);

    const API_URL = `${import.meta.env.VITE_BACKEND_URL}/notification`;

    const notify = (msg, isError = false) => {
        setStatusFeedback({ msg, isError });
        setTimeout(() => setStatusFeedback(null), 4000);
    };

    useEffect(() => {
        axios.get(`${API_URL}/notification`)
            .then(res => {
                if (res.data) {
                    setCurrentNotification(res.data);
                    setMessage(res.data.message || '');
                    setType(res.data.type || 'info');
                    setTimer(res.data.timer || 3000);
                }
            })
            .catch(() => setCurrentNotification(null))
            .finally(() => setLoading(false));
    }, [API_URL]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/add-notification`, {
                message, type, timer
            }, {
                headers: getAuthHeaders(),
                withCredentials: true
            });

            setCurrentNotification(res.data);
            notify('Atelier broadcast updated successfully!');
        } catch (err) {
            console.error(err);
            notify('Error saving notification banner', true);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/delete-notification`, {
                headers: getAuthHeaders(),
                withCredentials: true
            });
            setCurrentNotification(null);
            setMessage('');
            setType('info');
            setTimer(3000);
            notify('Broadcast banner deactivated.');
        } catch (err) {
            console.error(err);
            notify('Error deleting broadcast banner', true);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBF9F5] text-stone-900 px-4 sm:px-8 py-8">
            <div className="max-w-xl mx-auto space-y-6">
                <AdminBackLink />

                <div className="pb-4 border-b border-stone-200">
                    <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9B5A2B] mb-1">
                        <span>Boutique Announcement</span>
                    </div>
                    <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
                        VIP Broadcast Banner
                    </h1>
                    <p className="text-xs text-stone-500 font-light mt-0.5">
                        Manage floating announcement pills and promotional notifications visible to boutique visitors.
                    </p>
                </div>

                {statusFeedback && (
                    <div
                        className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                            statusFeedback.isError
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                    >
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{statusFeedback.msg}</span>
                    </div>
                )}

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#9B5A2B] flex items-center justify-center">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-serif text-base font-semibold text-stone-900">
                                Configure Banner
                            </h3>
                            <p className="text-xs text-stone-500 font-light">Set message copy, intent tag, and duration</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-3 border-[#9B5A2B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs text-stone-500">Loading current announcement...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="font-mono uppercase text-[10px] text-stone-500 block mb-1">
                                    Broadcast Copy
                                </label>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="e.g. Complimentary wax conditioning with every MagFlap™ order."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs text-stone-900"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-mono uppercase text-[10px] text-stone-500 block mb-1">
                                        Style / Tone
                                    </label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs text-stone-900"
                                    >
                                        <option value="info">Atelier Info (Obsidian)</option>
                                        <option value="sale">Exclusive Drop (Amber)</option>
                                        <option value="warning">Low Stock Notice (Rose)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-mono uppercase text-[10px] text-stone-500 block mb-1">
                                        Display Duration (ms)
                                    </label>
                                    <input
                                        type="number"
                                        value={timer}
                                        onChange={(e) => setTimer(Number(e.target.value))}
                                        min={1000}
                                        step={500}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs text-stone-900"
                                    />
                                </div>
                            </div>

                            {/* Live Preview Pill */}
                            <div className="pt-2">
                                <span className="font-mono uppercase text-[10px] text-stone-500 block mb-2">
                                    Patron View Preview
                                </span>
                                <div className="p-3.5 rounded-2xl bg-[#0D0C0B] text-white flex items-center justify-between text-xs border border-amber-950/40">
                                    <div className="flex items-center gap-2 truncate">
                                        <Sparkles className="w-3.5 h-3.5 text-[#C6833E] flex-shrink-0" />
                                        <span className="truncate">{message || 'Your announcement will appear here.'}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-amber-300 uppercase px-2 py-0.5 rounded-full bg-white/10 ml-2 flex-shrink-0">
                                        {type}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-[#0D0C0B] text-[#FBF9F5] rounded-xl font-medium tracking-wide hover:bg-stone-800 transition shadow"
                                >
                                    Publish Announcement
                                </button>

                                {currentNotification && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="w-full py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-medium text-xs transition flex items-center justify-center gap-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Deactivate Banner</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationForm;
