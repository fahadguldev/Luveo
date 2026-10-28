import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, CheckCircle2 } from "lucide-react";
import AnimatedTabs from "./AnimatedTabs";

/**
 * LeatherAnatomy - Interactive Framer Motion Craftsmanship Breakdown
 */
export const LeatherAnatomy = () => {
  const [activeItem, setActiveItem] = useState("wallet");
  const [selectedHotspot, setSelectedHotspot] = useState(0);

  const productData = {
    wallet: {
      title: "The MagFlap™ Magnetic Wallet",
      subtitle: "Ultra-slim engineering meets heritage leather craftsmanship",
      image: "https://www.waldorleather.com/cdn/shop/collections/E0127C8F-00FD-4D9A-B501-9DBC77D98CAC.jpg?v=1769830638&width=800",
      hotspots: [
        {
          id: 0,
          x: 28,
          y: 35,
          title: "MagFlap™ Snap Ejector",
          desc: "Dual rare-earth N52 neodymium magnets deliver a satisfying snap while preventing accidental card drops.",
          tag: "Patented Tech",
        },
        {
          id: 1,
          x: 65,
          y: 42,
          title: "Aerospace RFID Faraday Cage",
          desc: "Inner copper-nickel woven mesh shields all standard 13.56 MHz RFID scanners to protect credit and ID cards from skimming.",
          tag: "Max Security",
        },
        {
          id: 2,
          x: 48,
          y: 78,
          title: "Hand-Burnished Wax Edges",
          desc: "Sealed with organic carnauba beeswax through 7 cycles of sanding and heat-creasing for zero fraying.",
          tag: "Atelier Finish",
        },
        {
          id: 3,
          x: 75,
          y: 68,
          title: "Grade-A Full-Grain Cowhide",
          desc: "1.2mm top-layer aniline pull-up leather that breathes, heals from superficial scratches, and ages with a golden glow.",
          tag: "Zero Synthetic",
        },
      ],
    },
    belt: {
      title: "The Hand-Burnished Artisan Belt",
      subtitle: "3.8mm thick solid hide cut from the densest part of the cattle bend",
      image: "https://images.unsplash.com/photo-1664286074176-5206ee5dc878?q=80&w=800&auto=format&fit=crop",
      hotspots: [
        {
          id: 0,
          x: 25,
          y: 45,
          title: "Solid Italian Brushed Brass",
          desc: "Cast from 100% solid brass with a matte brushed finish that will never chip, flake, or rust.",
          tag: "Solid Metal",
        },
        {
          id: 1,
          x: 52,
          y: 50,
          title: "Single-Piece English Bridle Hide",
          desc: "A singular 3.8mm thick cut of vegetable-tanned leather. Never glued, never bonded with scrap filler.",
          tag: "Zero Composite",
        },
        {
          id: 2,
          x: 78,
          y: 45,
          title: "Saddle-Stitched Heavy Nylon Thread",
          desc: "Triple-reinforced keeper loop sewn with rot-proof bonded nylon thread tested to 45 lbs of tensile pull.",
          tag: "Lifetime Stitch",
        },
      ],
    },
  };

  const current = productData[activeItem];
  const activeSpot = current.hotspots[selectedHotspot] || current.hotspots[0];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-12 bg-[#F6F3EC] border-y border-[#E8E2D6] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE4D7] border border-[#DCD5C5] text-[#9B5A2B] text-xs font-bold uppercase tracking-widest mb-3">
            <Layers className="w-3.5 h-3.5" />
            Atelier Precision
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0D0C0B] font-[var(--font-display)]">
            Anatomy of Permanence
          </h2>
          <p className="text-[#6D675E] text-sm sm:text-base mt-3">
            Inspect every component, seam, and magnet. We believe luxury lies in uncompromised material honesty.
          </p>

          {/* Toggle Switch */}
          <div className="mt-6 flex justify-center">
            <AnimatedTabs
              tabs={[
                { id: "wallet", label: "MagFlap™ Wallet" },
                { id: "belt", label: "Artisan Leather Belt" },
              ]}
              activeTab={activeItem}
              onTabChange={(tab) => {
                setActiveItem(tab);
                setSelectedHotspot(0);
              }}
            />
          </div>
        </div>

        {/* Interactive Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D6] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          {/* Interactive Image with Hotspot Pins */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#ECE6DB] flex items-center justify-center p-4">
            <motion.img
              key={activeItem}
              src={current.image}
              alt={current.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover rounded-xl"
            />

            {/* Hotspot Pins */}
            {current.hotspots.map((spot, idx) => {
              const isSelected = selectedHotspot === idx;
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setSelectedHotspot(idx)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  aria-label={spot.title}
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isSelected ? "bg-[#9B5A2B]" : "bg-black/40"
                      }`}
                    />
                    <span
                      className={`relative inline-flex items-center justify-center rounded-full h-7 w-7 text-xs font-bold transition-transform duration-200 shadow-lg ${
                        isSelected
                          ? "bg-[#0D0C0B] text-white ring-4 ring-[#9B5A2B]/40 scale-110"
                          : "bg-white text-[#0D0C0B] hover:scale-105"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hotspot Detail Card */}
          <div className="flex flex-col justify-between h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeItem}-${activeSpot.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#FAF8F5] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EFECE5] text-[#9B5A2B] border border-[#DFD8CA]">
                    {activeSpot.tag}
                  </span>
                  <span className="text-xs font-semibold text-[#8C867C]">
                    Feature {selectedHotspot + 1} of {current.hotspots.length}
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-bold text-[#0D0C0B] tracking-tight mb-2">
                  {activeSpot.title}
                </h4>

                <p className="text-[#686258] text-sm sm:text-base leading-relaxed">
                  {activeSpot.desc}
                </p>

                <div className="mt-6 pt-6 border-t border-[#ECE5D8] flex items-center gap-3 text-xs text-[#524D45]">
                  <CheckCircle2 className="w-4 h-4 text-[#9B5A2B]" />
                  <span>Certified 100% full-grain leather construction</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Hotspots mini switcher */}
            <div className="mt-4 flex flex-wrap gap-2">
              {current.hotspots.map((spot, idx) => (
                <button
                  key={spot.id}
                  onClick={() => setSelectedHotspot(idx)}
                  className={`text-xs px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedHotspot === idx
                      ? "bg-[#0D0C0B] text-white shadow-sm"
                      : "bg-[#EFECE6] text-[#5C564D] hover:bg-[#E5E0D5]"
                  }`}
                >
                  {idx + 1}. {spot.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeatherAnatomy;
