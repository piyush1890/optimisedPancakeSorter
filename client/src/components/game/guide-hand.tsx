import { motion } from "framer-motion";
import { type FC, useEffect, useState } from "react";

interface GuideHandProps {
  sequence: number[];
  currentIndex: number;
  stackHeight: number;
  containerHeight: number;
}

export const GuideHand: FC<GuideHandProps> = ({ sequence, currentIndex, stackHeight, containerHeight }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentIndex >= sequence.length) return;
    
    // Target pancake's index (1-based to 0-based conversion)
    const targetPancakeIndex = sequence[currentIndex] - 1;
    
    // Calculate Y position based on pancake position in stack
    // Note: stackHeight is the total height of viewport
    const pancakeHeight = stackHeight / 5; // Assuming 5 pancakes
    const targetY = containerHeight / 2 - (targetPancakeIndex * pancakeHeight);
    
    setPosition({
      x: window.innerWidth / 2 + 200, // Position to the right of stack
      y: targetY
    });
  }, [sequence, currentIndex, stackHeight, containerHeight]);

  return (
    <motion.div
      className="fixed pointer-events-none z-[100]"
      animate={position}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
    >
      <svg 
        width="96" 
        height="96" 
        viewBox="0 0 550 400" 
        className="drop-shadow-lg"
        style={{ transform: 'rotate(180deg)' }} // Point left
      >
        <symbol id="hand" viewBox="-364.275 -463.175 728.602 926.3">
          <g>
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              fill="#FFFFFF" 
              d="M209.5,105.85c0-0.4,0-0.817,0-1.25l-0.15-68.4l0.15-15.55l-0.15,15.55l0.15,68.4C209.5,105.033,209.5,105.45,209.5,105.85v32.8l8.4-1c9.167-0.667,22.7-1,40.6-1c30.833,0,52.25-13.667,64.25-41c3.767-8.533,6.35-17.933,7.75-28.2c0.7-5.133,1.033-9.4,1-12.8l-0.25-51c-6.167-121.433-18.083-214.5-35.75-279.2c-17.633-64.7-33.3-115.967-47-153.8l-364-1c-36.2,172.967-108.183,307.633-215.95,404C-306.75,88.383-249.1,89.7-158.5-22.4v373.05c0.1,3,0.417,6.55,0.95,10.649c1.3,10.267,3.683,19.667,7.15,28.2c10.367,25.533,28.333,39.134,53.9,40.8c25.6-1.666,43.583-15.267,53.95-40.8c3.466-8.533,5.85-17.934,7.15-28.2c0.533-4.1,0.833-7.649,0.9-10.649V225.55v-117v117h8.4c9.167-0.666,22.7-1,40.6-1c30.833,0,52.25-13.666,64.25-41c3.767-8.533,6.35-17.933,7.75-28.2c0.567-4.1,0.9-7.65,1-10.65v-75v75v42h8.4c9.167-0.667,22.7-1,40.6-1c30.833,0,52.25-13.667,64.25-41c3.767-8.534,6.35-17.934,7.75-28.2C209.067,112.4,209.4,108.85,209.5,105.85z M209.05,11.7l0.3,24.5L209.05,11.7z"
            />
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              fill="none" 
              stroke="#000000" 
              strokeWidth="65.65" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeMiterlimit="3" 
              d="M209.5,105.85c-0.1,3-0.433,6.55-1,10.65c-1.4,10.267-3.983,19.667-7.75,28.2c-12,27.333-33.417,41-64.25,41c-17.9,0-31.433,0.333-40.6,1h-8.4v-42v-75 M87.5,144.7c-0.1,3-0.433,6.55-1,10.65c-1.4,10.267-3.983,19.667-7.75,28.2c-12,27.334-33.417,41-64.25,41c-17.9,0-31.433,0.334-40.6,1h-8.4v-117 M-34.5,225.55V350.65c-0.067,3-0.367,6.55-0.9,10.649c-1.3,10.267-3.684,19.667-7.15,28.2c-10.367,25.533-28.35,39.134-53.95,40.8c-25.567-1.666-43.533-15.267-53.9-40.8c-3.467-8.533-5.85-17.934-7.15-28.2c-0.534-4.1-0.85-7.649-0.95-10.649V-22.4c-90.6,112.1-148.25,110.783-172.95-3.95c107.767-96.367,179.75-231.033,215.95-404l364,1c13.7,37.833,29.367,89.1,47,153.8c17.667,64.7,29.583,157.767,35.75,279.2l0.25,51c0.033,3.4-0.3,7.667-1,12.8c-1.4,10.267-3.983,19.667-7.75,28.2c-12,27.333-33.417,41-64.25,41c-17.9,0-31.433,0.333-40.6,1l-8.4,1v-32.8c0-0.4,0-0.817,0-1.25l-0.15-68.4l0.15-15.55 M209.05,11.7l0.3,24.5"
            />
          </g>
        </symbol>
        <use 
          xlinkHref="#hand" 
          width="728.602" 
          height="926.3" 
          x="-364.275" 
          y="-463.175" 
          transform="matrix(0.353 0 0 -0.353 256.5 196.6499)" 
          overflow="visible"
        />
      </svg>
    </motion.div>
  );
};
