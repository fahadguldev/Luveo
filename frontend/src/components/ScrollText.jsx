import { useEffect, useRef, useState } from "react"
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion"
import { cn } from '../lib/utils.js'

export const wrap = (min, max, v) => {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

export const TextScroll = ({
  text = "LuvEo · Premium Leather Accessories · ",
  default_velocity = .2,
  className,
}) => {
  const ParallaxText = ({ children, baseVelocity = 60 }) => {
    const baseX = useMotionValue(0)
    const { scrollY } = useScroll()
    const scrollVelocity = useVelocity(scrollY)
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], { clamp: false })

    const [repetitions, setRepetitions] = useState(6)
    const containerRef = useRef(null)
    const textRef = useRef(null)

    useEffect(() => {
      const calculate = () => {
        if (containerRef.current && textRef.current) {
          const containerW = containerRef.current.offsetWidth
          const textW = textRef.current.offsetWidth
          setRepetitions(Math.max(4, Math.ceil(containerW / textW) + 2))
        }
      }
      setTimeout(calculate, 100)
      const ro = new ResizeObserver(calculate)
      if (containerRef.current) ro.observe(containerRef.current)
      window.addEventListener("resize", calculate)
      return () => { ro.disconnect(); window.removeEventListener("resize", calculate) }
    }, [children])

    const x = useTransform(baseX, (v) => `${wrap(-100 / repetitions, 0, v)}%`)
    const directionFactor = useRef(1)

    useAnimationFrame((t, delta) => {
      let moveBy = directionFactor.current * baseVelocity * (delta / 1000)
      if (velocityFactor.get() < 0) directionFactor.current = -1
      else if (velocityFactor.get() > 0) directionFactor.current = 1
      moveBy += directionFactor.current * moveBy * velocityFactor.get()
      baseX.set(baseX.get() + moveBy)
    })

    return (
      <div className="w-full overflow-hidden whitespace-nowrap" ref={containerRef}>
        <motion.div className="inline-block will-change-transform" style={{ x }}>
          {Array.from({ length: repetitions }).map((_, i) => (
            <span key={i} ref={i === 0 ? textRef : null} className="inline-block">
              {children}
            </span>
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <section
      className={cn("w-full", className)}
      style={{
        background: "var(--prada-black)",
        color: "var(--prada-white)",
        padding: "14px 0",
        overflow: "hidden",
      }}
    >
      <ParallaxText baseVelocity={default_velocity * 20}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.62rem",
            fontWeight: 400,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            paddingRight: "3rem",
          }}
        >
          {text}
        </span>
      </ParallaxText>
    </section>
  )
}

export default TextScroll
