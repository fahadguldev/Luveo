import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const LEATHER_CATEGORIES = [
  {
    id: "magnetic-wallet",
    title: "MagFlap™ & Magnetic Wallets",
    tagline: "Ultra-slim with instant card ejection",
    badge: "Patent Innovation",
    value: "magnetic-wallet",
    image:
      "https://www.waldorleather.com/cdn/shop/collections/E0127C8F-00FD-4D9A-B501-9DBC77D98CAC.jpg?v=1769830638&width=700",
    span: "col-span-1 md:col-span-2 lg:col-span-2",
    aspect: "aspect-[16/10] sm:aspect-[16/9]",
  },
  {
    id: "leather-belts",
    title: "Artisan Leather Belts",
    tagline: "3.8mm solid hide & solid Italian brass",
    badge: "Indestructible",
    value: "leather-belts",
    image:
      "https://images.unsplash.com/photo-1664286074176-5206ee5dc878?q=80&w=800&auto=format&fit=crop",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
    aspect: "aspect-[4/5]",
  },
  {
    id: "men-wallets",
    title: "Classic Bifolds & Cardholders",
    tagline: "Timeless heritage saddle-stitched billfolds",
    badge: "Purist Favorite",
    value: "men-wallets",
    image:
      "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?q=80&w=800&auto=format&fit=crop",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
    aspect: "aspect-[4/5]",
  },
  {
    id: "long-wallet",
    title: "Long Wallets & Travel Folios",
    tagline: "Passports, currency & executive documents",
    badge: "Executive Carry",
    value: "long-wallet",
    image:
      "https://www.waldorleather.com/cdn/shop/collections/Untitled_design-59.png?v=1770982930&width=700",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
    aspect: "aspect-[4/5]",
  },
  {
    id: "women-bags",
    title: "Women's Leather Bags",
    tagline: "Pebbled full-grain totes & day satchels",
    badge: "Atelier Line",
    value: "women-bags",
    image:
      "https://images.pexels.com/photos/23223837/pexels-photo-23223837.jpeg?auto=compress&cs=tinysrgb&w=800",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
    aspect: "aspect-[4/5]",
  },
  {
    id: "accessories",
    title: "Tech Sleeves & EDC Accessories",
    tagline: "Laptop folios, key docks & desk mats",
    badge: "Everyday Carry",
    value: "accessories",
    image:
      "https://images.unsplash.com/photo-1611461527944-1a718332613b?q=80&w=800&auto=format&fit=crop",
    span: "col-span-1 md:col-span-2 lg:col-span-2",
    aspect: "aspect-[16/10] sm:aspect-[16/9]",
  },
];

export const Explore = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12 bg-[#FBF9F5]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEATHER_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => navigate(`/products/${cat.value}`)}
              className={`group relative overflow-hidden rounded-3xl cursor-pointer bg-[#181614] border border-[#E8E2D6] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 ${cat.span} ${cat.aspect}`}
            >
              {/* Background Image with Zoom */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${cat.image})` }}
              />

              {/* Multi-step Dark Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 group-hover:from-black/90 transition-colors duration-500" />

              {/* Top Badge */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#F4EFE8] border border-white/15">
                  {cat.badge}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-10 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug font-[var(--font-display)]">
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#D8D2C5] mt-1.5 font-medium max-w-md">
                    {cat.tagline}
                  </p>
                </div>

                {/* Arrow Icon Pill */}
                <div className="w-11 h-11 rounded-full bg-white text-[#0D0C0B] flex items-center justify-center shrink-0 shadow-lg group-hover:bg-[#C6833E] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Explore;
