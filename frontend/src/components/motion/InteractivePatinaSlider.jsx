import { useState } from "react";
import { Sparkles, Clock, ShieldCheck } from "lucide-react";

/**
 * InteractivePatinaSlider
 * Highlights how full-grain leather ages into a gorgeous patina over time.
 */
export const InteractivePatinaSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-[#141312] border border-[#2B2723] p-5 sm:p-10 text-white shadow-2xl relative overflow-hidden">
      {/* Background ambient warm leather glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#9B5A2B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C6833E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A231C] border border-[#483B2D] text-[#D8AF72] text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D8AF72]" />
            Natural Patina Evolution
          </div>
          <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-[var(--font-display)]">
            Built to Outlive Fast Fashion.
          </h3>
          <p className="text-[#A39D93] text-xs sm:text-sm mt-1.5 max-w-xl">
            Unlike synthetic leather that cracks and peels, our 100% full-grain hide absorbs oils, sunlight, and handling, darkening into an exquisite, glossy bronze patina unique to you.
          </p>
        </div>

        {/* Milestone Indicator */}
        <div className="bg-[#1C1A17] border border-[#332E27] px-3.5 py-2 rounded-2xl flex items-center gap-2.5 self-stretch sm:self-auto justify-center">
          <Clock className="w-4 h-4 text-[#C6833E]" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#E3DDCF]">
            {sliderPosition < 35
              ? "Day 1: Supple & Matte"
              : sliderPosition < 65
              ? "Year 2: Amber Glow"
              : "Year 5: Deep Bronze Patina"}
          </span>
        </div>
      </div>

      {/* Interactive Comparison Canvas (touch-none enables smooth horizontal dragging on mobile) */}
      <div
        className="relative w-full h-[250px] sm:h-[380px] md:h-[420px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-[#3A332B] shadow-inner touch-none"
        onMouseMove={(e) => (e.buttons === 1 || isDragging) && handleSliderMove(e)}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleSliderMove(e);
        }}
        onMouseUp={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* Under layer: Year 5 Rich Aged Patina */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop')`,
            filter: "contrast(1.08) saturate(1.15)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 text-right">
            <span className="inline-block bg-[#0D0C0B]/90 backdrop-blur-md border border-[#C6833E]/40 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-[#F3D39B] uppercase tracking-wider">
              Year 5 · Rich Golden Patina
            </span>
          </div>
        </div>

        {/* Top clipped layer: Day 1 Natural Pristine */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              width: "100%",
              minWidth: "100%",
              backgroundImage: `url('https://images.unsplash.com/photo-1606503825008-909a67e63c3d?q=80&w=1200&auto=format&fit=crop')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-left">
              <span className="inline-block bg-[#0D0C0B]/90 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                Day 1 · Pristine Matte Grain
              </span>
            </div>
          </div>
        </div>

        {/* Divider Bar & Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_15px_rgba(255,255,255,0.7)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0D0C0B] border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-110 active:scale-95">
            ⇄
          </div>
        </div>
      </div>

      {/* Feature Badges below slider */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-6">
        <div className="bg-[#191715] border border-[#2D2823] p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2E2419] flex items-center justify-center text-[#D8AF72] shrink-0 font-bold text-xs">
            100%
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wide">
              Top-Tier Full-Grain Hide
            </div>
            <div className="text-[11px] text-[#A39D93]">
              Never corrected or plastic-coated
            </div>
          </div>
        </div>

        <div className="bg-[#191715] border border-[#2D2823] p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2E2419] flex items-center justify-center text-[#D8AF72] shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#D8AF72]" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wide">
              10-Year Stitch Guarantee
            </div>
            <div className="text-[11px] text-[#A39D93]">
              German bonded nylon stitching
            </div>
          </div>
        </div>

        <div className="bg-[#191715] border border-[#2D2823] p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2E2419] flex items-center justify-center text-[#D8AF72] shrink-0 font-serif italic text-sm">
            §
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wide">
              Organic Vegetable Tanning
            </div>
            <div className="text-[11px] text-[#A39D93]">
              Natural tree barks & beeswax edges
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractivePatinaSlider;
