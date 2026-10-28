import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, CheckCircle, ArrowRight } from "lucide-react";

export const ExploreWithUs = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-12 bg-[#FBF9F5]">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#0D0C0B] border border-[#2B2723] p-8 sm:p-14 lg:p-16 text-white shadow-2xl">
        {/* Ambient Warm Leather Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#9B5A2B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#C6833E]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Column: Copy & Perks */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#262019] border border-[#483928] text-[#D8AF72] text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D8AF72]" />
              The Luveo Atelier Society
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-[var(--font-display)]">
              Craftsmanship in Your Inbox.
            </h2>

            <p className="mt-4 text-[#B5AEA3] text-sm sm:text-base leading-relaxed max-w-lg">
              Receive private invitations to small-batch leather drops, behind-the-scenes hide sourcing, and complimentary monogramming on your first piece.
            </p>

            {/* Perks list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {[
                "10% off your first wallet or belt",
                "Private access to limited drops",
                "Free annual leather balm care guide",
                "Complimentary laser monogramming",
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#E3DDCF]">
                  <CheckCircle className="w-4 h-4 text-[#C6833E] shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="bg-[#181614] border border-[#332E27] rounded-2xl p-6 sm:p-8 flex flex-col justify-center shadow-xl">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-14 h-14 rounded-full bg-[#2C2114] border border-[#5E472A] text-[#D8AF72] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
                  Welcome to the Atelier.
                </h3>
                <p className="text-sm text-[#A39D93] mt-2">
                  We have dispatched your complimentary welcome gift and welcome voucher to{" "}
                  <span className="text-white font-medium">{email}</span>.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="atelier-email" className="text-xs font-semibold uppercase tracking-wider text-[#D8D2C5]">
                    Enter Your Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867C]" />
                    <input
                      id="atelier-email"
                      type="email"
                      required
                      placeholder="alexander@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#24211D] border border-[#3D372E] text-white text-sm placeholder:text-[#6E685E] outline-none focus:border-[#C6833E] focus:ring-1 focus:ring-[#C6833E] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-white text-[#0D0C0B] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#F3EFE8] transition-all shadow-md cursor-pointer"
                >
                  <span>Join The Atelier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-[#736E66] text-center mt-1">
                  We respect your privacy. Unsubscribe at any time with a single click.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreWithUs;
