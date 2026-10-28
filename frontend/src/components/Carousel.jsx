import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Award, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import ShinyBadge from "./motion/ShinyBadge";

const HERO_SLIDES = [
  {
    id: 1,
    tag: "Signature Innovation",
    badge: "MagFlap™ Patented Mechanism",
    title: "Engineered for Permanence.",
    subtitle: "Handcrafted in 100% Full-Grain Leather",
    description:
      "Ultra-slim RFID-shielded architecture with our signature magnetic card ejection. Minimal in the pocket, monumental in hand.",
    image: "/images/luveo/banner.jpeg",
    fallbackImage:
      "https://www.waldorleather.com/cdn/shop/files/travel_navy_grey_4.5.jpg?v=1752426246",
    primaryCta: { label: "Shop MagFlap™ Wallets", path: "/products/magnetic-wallet" },
    highlights: ["RFID Shielded", "N52 Magnet Ejection", "10-Year Warranty"],
  },
  {
    id: 2,
    tag: "Italian Bridle Leather",
    badge: "Solid Brushed Brass Hardware",
    title: "3.8mm Thick Solid Hide.",
    subtitle: "Built to Outlive Fast Fashion",
    description:
      "Cut from a single unbonded strip of full-grain vegetable-tanned hide. Never laminated, never cracked, paired with solid brass.",
    image:
      "https://images.unsplash.com/photo-1664286074176-5206ee5dc878?q=80&w=1600&auto=format&fit=crop",
    fallbackImage:
      "https://images.unsplash.com/photo-1664286074176-5206ee5dc878?q=80&w=1600&auto=format&fit=crop",
    primaryCta: { label: "Shop Artisan Belts", path: "/products/leather-belts" },
    highlights: ["Single-Cut Hide", "Hand-Burnished Edges", "Zero Composite"],
  },
  {
    id: 3,
    tag: "Voyager Series",
    badge: "Executive Travel & Bifolds",
    title: "The Art of Refined Carry.",
    subtitle: "Classic Wallets & Travel Folios",
    description:
      "Hand-creased edges, French saddle stitching, and buttery vegetable-tanned pull-up leather that develops a breathtaking golden patina.",
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1600&auto=format&fit=crop",
    fallbackImage:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1600&auto=format&fit=crop",
    primaryCta: { label: "Explore Classic Wallets", path: "/products/men-wallets" },
    highlights: ["Hand-Saddle Stitched", "Passport Sized", "Ages With You"],
  },
];

export const Carousel = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentIdx];

  const handleNext = () => setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
  const handlePrev = () =>
    setCurrentIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <section
      className="relative w-full min-h-[85vh] sm:min-h-screen bg-[#0D0C0B] flex items-center justify-center overflow-hidden pt-24 sm:pt-28 pb-12 sm:pb-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Luveo Leather Showcase"
    >
      {/* Background Image Carousel with Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slide.image}
            onError={(e) => {
              if (slide.fallbackImage && e.target.src !== slide.fallbackImage) {
                e.target.src = slide.fallbackImage;
              }
            }}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Multi-layered cinematic luxury scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C0B] via-[#0D0C0B]/60 to-[#0D0C0B]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0C0B]/90 via-[#0D0C0B]/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 sm:px-10 lg:px-16 flex flex-col justify-end min-h-[60vh] sm:min-h-[70vh]">
        <div className="max-w-2xl">
          {/* Badge & Category Pill */}
          <motion.div
            key={`badge-${slide.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center gap-2.5 mb-3"
          >
            <ShinyBadge text={slide.badge} variant="gold" />
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-semibold text-[#E3DDCF]/80">
              {slide.tag}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            key={`title-${slide.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold text-white leading-[1.1] tracking-tight font-[var(--font-display)]"
          >
            {slide.title}
            <span className="block text-xl sm:text-3xl md:text-4xl font-normal text-[#D8AF72] mt-1.5 font-serif italic">
              {slide.subtitle}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            key={`desc-${slide.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-3.5 text-sm sm:text-base md:text-lg text-[#D2CBC1] leading-relaxed max-w-xl font-light"
          >
            {slide.description}
          </motion.p>

          {/* Feature Highlights Pills */}
          <motion.div
            key={`pills-${slide.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-2 mt-5"
          >
            {slide.highlights.map((highlight) => (
              <span
                key={highlight}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-white/10 backdrop-blur-md text-[#EBE6DC] border border-white/15"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6833E]" />
                {highlight}
              </span>
            ))}
          </motion.div>

          {/* CTA Buttons - Mobile Optimized Touch Targets */}
          <motion.div
            key={`cta-${slide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-7"
          >
            <Link
              to={slide.primaryCta.path}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 rounded-xl bg-white text-[#0D0C0B] font-bold text-xs sm:text-sm tracking-wide uppercase shadow-[0_12px_30px_rgba(255,255,255,0.18)] transition-all duration-300 hover:bg-[#F3EFE8] active:scale-[0.98]"
            >
              <span>{slide.primaryCta.label}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#catalog-section"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold text-xs sm:text-sm tracking-wide uppercase border border-white/20 transition-all duration-300 hover:bg-white/20 active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-[#D8AF72]" />
              <span>Instant Catalog (COD) ↓</span>
            </a>
          </motion.div>
        </div>

        {/* Bottom Bar: Indicators & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-white/15">
          {/* Trust Stat Ticker */}
          <div className="flex items-center gap-6 text-[11px] sm:text-xs text-[#B5AEA3]">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#C6833E]" />
              <span>100% Full-Grain Hide</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#C6833E]" />
              <span>10-Year Stitch Warranty</span>
            </div>
          </div>

          {/* Slide Switchers */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-1.5 rounded-full transition-all duration-400 cursor-pointer ${
                    currentIdx === idx ? "w-8 bg-[#C6833E]" : "w-3 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
