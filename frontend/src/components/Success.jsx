import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';

const SuccessPayment = () => {
    return (
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center px-4 py-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-2xl text-center space-y-6"
            >
                {/* Gold Atelier Seal Emblem */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9B5A2B] to-[#4A260F] p-1 mx-auto shadow-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#0D0C0B] flex items-center justify-center text-amber-300">
                        <CheckCircle2 className="w-10 h-10 text-[#C6833E]" />
                    </div>
                </div>

                <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-[#9B5A2B] text-xs font-mono font-semibold tracking-widest uppercase mb-2">
                        Commission Confirmed
                    </span>
                    <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
                        Thank You For Your Order
                    </h1>
                    <p className="text-sm text-stone-600 font-light mt-2 leading-relaxed">
                        Your handcrafted leather commission has been received by our atelier. Our artisans will carefully inspect, pack, and wax-seal your piece.
                    </p>
                </div>

                {/* Assurance & Next Steps */}
                <div className="bg-[#FBF9F5] rounded-2xl p-4 sm:p-5 border border-stone-200 text-left text-xs space-y-3">
                    <div className="flex items-start gap-3 text-stone-700">
                        <Package className="w-4 h-4 text-[#9B5A2B] mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-semibold text-stone-900 block">Express Atelier Dispatch</span>
                            <span className="text-stone-500 font-light">Dispatched within 24 to 48 hours with courier tracking.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 text-stone-700">
                        <ShieldCheck className="w-4 h-4 text-[#9B5A2B] mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-semibold text-stone-900 block">Open Parcel Inspection (COD)</span>
                            <span className="text-stone-500 font-light">You may open and inspect your leather item before handing payment to the rider.</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                    <Link to="/profile" className="block">
                        <button className="w-full py-4 bg-[#0D0C0B] text-[#FBF9F5] rounded-xl font-medium tracking-wide hover:bg-stone-800 transition flex items-center justify-center gap-2 shadow-lg">
                            <span>Track Commission in Profile</span>
                            <ArrowRight className="w-4 h-4 text-[#C6833E]" />
                        </button>
                    </Link>
                    <Link to="/all-products" className="block">
                        <button className="w-full py-3 bg-white text-stone-700 border border-stone-200 rounded-xl font-medium text-xs tracking-wider uppercase hover:bg-stone-50 transition">
                            Continue Browsing Atelier
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

const CancelPayment = () => {
    return (
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center px-4 py-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-6"
            >
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <XCircle className="w-9 h-9" />
                </div>

                <div>
                    <h2 className="font-serif text-2xl font-medium text-stone-900">
                        Checkout Incomplete
                    </h2>
                    <p className="text-sm text-stone-600 font-light mt-2">
                        Your checkout session was canceled or interrupted. Your selections have been saved in your cart.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link to="/checkout" className="block">
                        <button className="w-full py-3.5 bg-[#0D0C0B] text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition">
                            Resume Atelier Checkout
                        </button>
                    </Link>
                    <Link to="/" className="block">
                        <button className="w-full py-3 bg-stone-100 text-stone-700 rounded-xl font-medium text-xs tracking-wider uppercase hover:bg-stone-200 transition">
                            Return to Boutique
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export { SuccessPayment, CancelPayment };
