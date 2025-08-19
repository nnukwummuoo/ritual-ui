import { motion } from "framer-motion";

export default function AnyaEyeIcon({ active = false }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className="w-12 h-10"
    >
      {/* Eye Outline */}
      <motion.ellipse
        cx="100"
        cy="100"
        rx="80"
        ry="50"
        stroke="url(#gradientStroke)"
        strokeWidth="6"
        fill="none"
        initial={{ scaleY: 1 }}
        animate={{
          scaleY: active ? [1, 0.1, 1] : 1, // Blink
        }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          repeatDelay: 10,
        }}
      />

      {/* Iris */}
      <motion.circle
        cx="100"
        cy="100"
        r="25"
        fill="url(#gradientFill)"
        animate={{
          scale: active ? [1, 1.05, 1] : 1, // Glow
          rotate: active ? [0, 10, -10, 0] : 0, // Rotation
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Pupil */}
      <motion.circle
        cx="100"
        cy="100"
        r="10"
        fill="black"
        animate={{ opacity: active ? [1, 0.7, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <defs>
        <radialGradient id="gradientFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff7eb3" />
          <stop offset="100%" stopColor="#7ed6ff" />
        </radialGradient>

        <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff9a9e" />
          <stop offset="100%" stopColor="#fad0c4" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}