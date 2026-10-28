import { motion } from "framer-motion";

export const Heading = ({
  heading,
  subHeading,
  description,
  align = "center",
  className = "",
}) => {
  const alignClasses = {
    center: "text-center mx-auto items-center",
    left: "text-left items-start",
    right: "text-right ml-auto items-end",
  };

  return (
    <div
      className={`px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-8 max-w-4xl flex flex-col ${
        alignClasses[align] || alignClasses.center
      } ${className}`}
    >
      {/* Subheading / Atelier Category Label */}
      {subHeading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-2 sm:mb-3"
        >
          <span className="w-5 sm:w-6 h-[1.5px] bg-[#9B5A2B]" />
          <span className="text-[11px] sm:text-[13px] font-bold tracking-[0.2em] uppercase text-[#9B5A2B] font-[var(--font-sans)]">
            {subHeading}
          </span>
          <span className="w-5 sm:w-6 h-[1.5px] bg-[#9B5A2B]" />
        </motion.div>
      )}

      {/* Main Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold text-[#0D0C0B] leading-[1.15] tracking-tight font-[var(--font-display)]"
      >
        {heading}
      </motion.h2>

      {/* Optional Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-base text-[#736E66] max-w-xl mt-2 sm:mt-3 font-normal leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

export default Heading;
