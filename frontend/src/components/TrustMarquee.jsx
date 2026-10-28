import { Shield, Sparkles, Feather, Scissors, Award, Compass, RefreshCw } from "lucide-react";

const PILLARS = [
  { icon: Shield, text: "100% Full-Grain Leather" },
  { icon: Sparkles, text: "MagFlap™ Magnetic Ejection" },
  { icon: Award, text: "Solid Brushed Brass Hardware" },
  { icon: Scissors, text: "Saddle-Stitched by Hand" },
  { icon: Compass, text: "Aerospace RFID Faraday Shield" },
  { icon: Feather, text: "Ages into a Golden Patina" },
  { icon: RefreshCw, text: "10-Year Craftsmanship Warranty" },
  { icon: Shield, text: "Open Parcel Delivery in Pakistan" },
];

export const TrustMarquee = () => {
  return (
    <div className="w-full bg-[#0D0C0B] text-[#FAF8F5] py-4 border-y border-[#262320] overflow-hidden select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Double the list to create a seamless infinite loop */}
        {[...PILLARS, ...PILLARS].map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <div
              key={index}
              className="inline-flex items-center gap-3 mx-6 sm:mx-8 text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-[#DCD6CA]"
            >
              <Icon className="w-4 h-4 text-[#C6833E]" />
              <span>{pillar.text}</span>
              <span className="text-[#595248] ml-6">✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustMarquee;
