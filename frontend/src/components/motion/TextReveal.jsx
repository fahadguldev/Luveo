import { motion } from "framer-motion";

/**
 * TextReveal - Framer Motion Staggered Headline Animation
 */
export const TextReveal = ({
  text,
  className = "",
  delay = 0,
  tag = "h1",
}) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: () => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 120,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  const Component = tag;

  return (
    <Component className={`overflow-hidden ${className}`}>
      <motion.span
        className="inline-flex flex-wrap gap-x-[0.28em] gap-y-1"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {words.map((word, index) => (
          <motion.span
            variants={child}
            key={`${word}-${index}`}
            className="inline-block"
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};

export default TextReveal;
