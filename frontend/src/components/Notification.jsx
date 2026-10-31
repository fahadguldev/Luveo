import { useEffect, useState } from 'react';
import {
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Info,
    X
} from 'lucide-react';

const NOTIFICATION_STYLES = {
    success: {
        bg: 'bg-[#FBF9F5]',
        border: 'border-emerald-600',
        title: 'text-emerald-950 font-serif',
        message: 'text-stone-700',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    },
    error: {
        bg: 'bg-[#FBF9F5]',
        border: 'border-rose-600',
        title: 'text-rose-950 font-serif',
        message: 'text-stone-700',
        icon: <AlertCircle className="w-5 h-5 text-rose-600" />
    },
    info: {
        bg: 'bg-[#0D0C0B] text-white',
        border: 'border-amber-900/50',
        title: 'text-amber-200 font-serif',
        message: 'text-stone-300',
        icon: <Info className="w-5 h-5 text-amber-300" />
    },
    sale: {
        bg: 'bg-[#0D0C0B] text-white',
        border: 'border-[#C6833E]',
        title: 'text-amber-300 font-serif',
        message: 'text-stone-200',
        icon: <Sparkles className="w-5 h-5 text-[#C6833E]" />
    }
};

const NotificationPopup = () => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [timer, setTimer] = useState(4000);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/notification/notification`)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.message && data.message.trim()) {
                    setMessage(data.message);
                    setType(data.type || 'info');
                    setTimer(data.timer || 4000);
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            })
            .catch(() => setVisible(false))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!visible) return;
        const timeout = setTimeout(() => setVisible(false), timer);
        return () => clearTimeout(timeout);
    }, [visible, timer]);

    if (!visible || loading) return null;

    const styles = NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.info;

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 sm:px-0">
            <div
                className={`relative ${styles.bg} p-5 rounded-2xl shadow-2xl border ${styles.border} transition-all duration-300 overflow-hidden`}
            >
                <button
                    onClick={() => setVisible(false)}
                    className="absolute top-3 right-3 text-stone-400 hover:text-white transition"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3.5 pr-6">
                    <div className="p-2 rounded-xl bg-white/10 flex-shrink-0">
                        {styles.icon}
                    </div>
                    <div>
                        <h4 className={`text-sm font-semibold tracking-wide ${styles.title}`}>
                            {type === 'sale' ? 'Atelier Drop & Privilege' : type === 'success' ? 'Confirmed' : type === 'error' ? 'Notice' : 'Boutique Announcement'}
                        </h4>
                        <p className={`text-xs mt-1 leading-relaxed ${styles.message}`}>
                            {message}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 w-full bg-stone-700/30 rounded-full h-1 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#9B5A2B] to-[#C6833E]"
                        style={{
                            width: '100%',
                            animation: `shrink ${timer}ms linear forwards`
                        }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default NotificationPopup;
