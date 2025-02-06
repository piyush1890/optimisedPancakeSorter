import { motion } from "framer-motion";
import { type FC } from "react";
import { Hand } from "lucide-react";

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
        repeat: 2,
        repeatType: "reverse",
        times: positions.map((_, i) => i / (positions.length - 1 || 1)),
        ease: "easeInOut"
      }}
      onAnimationComplete={onClick}
    >
      <div className="relative">
        <Hand 
          className="w-24 h-24 text-white drop-shadow-lg transform -rotate-45" 
          strokeWidth={1.5}
        />
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
};