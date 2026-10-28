import { motion } from "framer-motion";

/**
 * AnimatedTabs - Motion Primitive
 * Smooth pill slider driven by Framer Motion layoutId.
 */
export const AnimatedTabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  className = "",
  tabClassName = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#EFECE6] border border-[#E3DDCF] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id || activeTab === tab.value;
        const tabKey = tab.id || tab.value;
        return (
          <button
            key={tabKey}
            type="button"
            onClick={() => onTabChange(tabKey)}
            className={`relative px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-colors duration-200 z-10 rounded-full select-none cursor-pointer ${
              isActive
                ? "text-white"
                : "text-[#5C564E] hover:text-[#0D0C0B]"
            } ${tabClassName}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-[#0D0C0B] rounded-full shadow-md z-[-1]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label || tab.name}
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#DFD9CD] text-[#5C564E]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AnimatedTabs;
