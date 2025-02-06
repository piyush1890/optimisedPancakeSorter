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
      initial={{ scale: 0, opacity: 0 }}
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
          <path
            d="M12 1C12 1 12.5 2 12.5 4C12.5 6 12 7 12 7C12 7 11.5 6 11.5 4C11.5 2 12 1 12 1Z"
            fill="#FFB800"
            stroke="#CC9200"
            strokeWidth="0.5"
          />
          <path
            d="M12 7C12 7 13 8 13 11C13 14 12 16 12 16C12 16 11 14 11 11C11 8 12 7 12 7Z"
            fill="#FFB800"
            stroke="#CC9200"
            strokeWidth="0.5"
          />
          <path
            d="M12 16C12 16 13 17 13 19C13 21 12 22 12 22C12 22 11 21 11 19C11 17 12 16 12 16Z"
            fill="#FFB800"
            stroke="#CC9200"
            strokeWidth="0.5"
          />
        </svg>
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
    </motion.div>
  );
}