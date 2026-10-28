import { Link } from "react-router-dom";
import { Shield, Sparkles, Award, Heart, ArrowUpRight } from "lucide-react";

const FOOTER_SECTIONS = [
  {
    title: "Wallets & Small Goods",
    links: [
      { label: "MagFlap™ Magnetic Wallets", href: "/products/magnetic-wallet" },
      { label: "Artisan Leather Belts", href: "/products/leather-belts" },
      { label: "Classic Bifold 8-Card", href: "/products/men-wallets" },
      { label: "Executive Long Wallets", href: "/products/long-wallet" },
      { label: "Minimalist Card Sleeves", href: "/all-products" },
    ],
  },
  {
    title: "Leather Atelier",
    links: [
      { label: "Full-Grain Sourcing & Hides", href: "/all-products" },
      { label: "The Patina Evolution Guide", href: "/all-products" },
      { label: "10-Year Stitch Warranty", href: "/all-products" },
      { label: "Care & Conditioning Balsams", href: "/all-products" },
      { label: "Custom Monogramming", href: "/all-products" },
    ],
  },
  {
    title: "Concierge & Support",
    links: [
      { label: "Track Your Dispatch", href: "/profile" },
      { label: "Open Parcel Delivery Policy", href: "/all-products" },
      { label: "Refunds & Exchanges", href: "/all-products" },
      { label: "Atelier FAQ", href: "/all-products" },
      { label: "WhatsApp Concierge", href: "https://wa.me/923000000000" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="bg-[#0D0C0B] text-[#FAF8F5] pt-16 pb-12 border-t border-[#262320]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Top Atelier Assurance Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-14 border-b border-[#262320]">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#1C1A17] border border-[#332E27] text-[#C6833E]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                100% Full-Grain Hide
              </h4>
              <p className="text-xs text-[#8C867C] mt-1">
                Zero PU, synthetic fillers, or bonded scrap leather.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#1C1A17] border border-[#332E27] text-[#C6833E]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                10-Year Stitch Warranty
              </h4>
              <p className="text-xs text-[#8C867C] mt-1">
                Triple-reinforced saddle stitching built to outlast decades.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#1C1A17] border border-[#332E27] text-[#C6833E]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                MagFlap™ Precision
              </h4>
              <p className="text-xs text-[#8C867C] mt-1">
                Rare-earth N52 magnetic snap ejection mechanism.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#1C1A17] border border-[#332E27] text-[#C6833E]">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Open Parcel Delivery
              </h4>
              <p className="text-xs text-[#8C867C] mt-1">
                Inspect your leather before payment across Pakistan.
              </p>
            </div>
          </div>
        </div>

        {/* Main Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14 border-b border-[#262320]">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <Link to="/" className="inline-block">
                <span className="font-[var(--font-display)] text-3xl font-extrabold tracking-[0.2em] uppercase text-white">
                  LUVEO
                </span>
                <span className="block text-[10px] uppercase tracking-[0.26em] font-semibold text-[#8C867C] mt-1">
                  Bespoke Leather Goods · Est. 2024
                </span>
              </Link>
              <p className="text-sm text-[#A39D93] mt-4 max-w-sm leading-relaxed">
                We craft minimal, high-utility leather goods designed to age alongside you. Every piece begins with carefully selected full-grain hides, vegetable tanning, and hand-burnished wax edges.
              </p>
            </div>

            <div className="mt-6 text-xs text-[#6B655C]">
              Proudly Handcrafted in Pakistan · Shipped Globally
            </div>
          </div>

          {/* Navigation Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-white font-[var(--font-display)]">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs text-[#9C968C] hover:text-[#D8AF72] transition-colors duration-200 flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C6833E]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B655C]">
          <p>© {new Date().getFullYear()} LUVEO Leather Co. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Authenticity Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
