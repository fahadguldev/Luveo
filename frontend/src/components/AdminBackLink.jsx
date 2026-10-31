import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdminBackLink = ({ label = 'Back to Admin Atelier' }) => {
    return (
        <div className="mb-6">
            <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-stone-600 hover:text-[#9B5A2B] text-xs font-mono font-medium tracking-wider uppercase transition group"
            >
                <div className="w-6 h-6 rounded-full bg-stone-200/70 group-hover:bg-[#9B5A2B]/10 flex items-center justify-center transition">
                    <ArrowLeft className="w-3.5 h-3.5 text-stone-700 group-hover:text-[#9B5A2B] transition" />
                </div>
                <span>{label}</span>
            </Link>
        </div>
    );
};

export default AdminBackLink;
