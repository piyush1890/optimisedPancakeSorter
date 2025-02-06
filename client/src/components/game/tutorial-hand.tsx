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
      initial={{ scale: 1 }}
      animate={{
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
          style={{ transform: 'rotate(-45deg)' }}
          className="drop-shadow-lg"
        >
          {/* Main palm and folded fingers */}
          <path
            d="M9 14c0-2 0-6 0-8s1-4 3-4 3 2 3 4v4c1-2 1-6 3-6s3 2 3 4v10c0 4-3 6-7 6s-7-2-7-6V8"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="0.75"
          />
          {/* Extended index finger */}
          <path
            d="M12 14V4c0-2 1-4 3-4s3 2 3 4v10"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="0.75"
          />
        </svg>
      </div>
    </motion.div>
  );
}