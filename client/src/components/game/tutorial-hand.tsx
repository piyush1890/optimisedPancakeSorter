import { motion } from "framer-motion";
import { MousePointer } from "lucide-react";

interface TutorialHandProps {
  onClick: () => void;
  positions: { x: number; y: number }[];
}

export function TutorialHand({ onClick, positions }: TutorialHandProps) {
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: positions.map(p => p.x),
        y: positions.map(p => p.y)
      }}
      transition={{
        duration: 2,
        repeat: 2,
        repeatType: "reverse",
        times: positions.map((_, i) => i / (positions.length - 1)),
        ease: "easeInOut"
      }}
      onAnimationComplete={onClick}
    >
      <div className="relative">
        <MousePointer className="w-8 h-8 text-white drop-shadow-lg" />
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      </div>
    </motion.div>
  );
}
