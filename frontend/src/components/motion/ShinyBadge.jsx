import { motion } from "framer-motion";

/**
 * ShinyBadge - Framer Motion Luxury Pill Badge
 */
export const ShinyBadge = ({
  text,
  icon,
  className = "",
  variant = "dark", // "dark", "gold", "subtle"
}) => {
  const variantStyles = {
    dark: "bg-[#181614] text-[#F3EFE8] border-[#2E2A26]",
    gold: "bg-[#2A1F13] text-[#F3D39B] border-[#5E472A]",
    subtle: "bg-white/80 text-[#0D0C0B] border-[#E8E2D6] shadow-sm",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border overflow-hidden backdrop-blur-md ${variantStyles[variant] || variantStyles.dark} ${className}`}
    >
      {/* Animated Subtle Shimmer Overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_3.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Pulsing indicator dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6833E] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C6833E]" />
      </span>

      {icon && <span className="text-xs">{icon}</span>}
      <span className="relative z-10">{text}</span>
    </motion.div>
  );
};

export default ShinyBadge;
