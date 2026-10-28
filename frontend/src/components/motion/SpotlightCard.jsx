import { useRef, useState } from "react";

/**
 * SpotlightCard - Framer / Motion Primitive
 * A sleek card with a mouse-following radial spotlight glow.
 */
export const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(198, 131, 62, 0.14)", // Warm cognac/gold glow
  borderColor = "rgba(232, 226, 214, 0.8)",
  ...props
}) => {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl bg-white border border-[${borderColor}] transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Dynamic Radial Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500 ease-out z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

export default SpotlightCard;
