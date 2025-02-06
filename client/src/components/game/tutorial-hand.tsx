import { motion } from "framer-motion";
import { type FC } from "react";

interface TutorialHandProps {
  onClick: () => void;
  positions: { x: number; y: number }[];
}

export const TutorialHand: FC<TutorialHandProps> = ({ onClick, positions }) => {
  // Create animation sequence based on positions
  const sequence = {
    x: positions.map(p => p.x),
    y: positions.map(p => p.y),
  };

  return (
    <motion.div
      className="fixed pointer-events-none z-[100]"
      initial={{ scale: 1, opacity: 1 }}
      animate={{
        scale: 1,
        opacity: 1,
        ...sequence
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        times: positions.map((_, i) => i / (positions.length - 1 || 1)),
        ease: "easeInOut",
        repeatDelay: 0.5
      }}
    >
      <div className="relative cursor-pointer" onClick={onClick} style={{ pointerEvents: 'auto' }}>
        <svg 
          width="96" 
          height="96" 
          viewBox="0 0 24 24" 
          fill="none" 
          className="drop-shadow-lg"
        >
          {/* Hand base */}
          <path
            d="M12 22c-1.5 0-2.5-0.5-3.5-1.5S7 18.5 7 17V8c0-1.1 0.9-2 2-2s2 0.9 2 2v5h1V4c0-1.1 0.9-2 2-2s2 0.9 2 2v9h1V6c0-1.1 0.9-2 2-2s2 0.9 2 2v7"
            fill="#FFB800"
            stroke="#CC9200"
            strokeWidth="0.5"
          />
          {/* Pointing finger */}
          <path
            d="M14 13V4c0-1.1 0.9-2 2-2s2 0.9 2 2v9"
            fill="#FFB800"
            stroke="#CC9200"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    </motion.div>
  );
}