import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Star } from 'lucide-react';

interface StarRewardProps {
  count: number;
  onComplete?: () => void;
}

export function StarReward({ count, onComplete }: StarRewardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const stars = containerRef.current.children;
    
    gsap.fromTo(stars, 
      {
        scale: 0,
        opacity: 0,
        y: 100
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.2,
        ease: "back.out(1.7)",
        onComplete: () => onComplete?.()
      }
    );
  }, [count, onComplete]);

  return (
    <div ref={containerRef} className="flex gap-4 justify-center items-center">
      {Array.from({ length: 3 }).map((_, i) => (
        <Star
          key={i}
          className={`w-16 h-16 ${i < count ? 'text-yellow-400' : 'text-gray-400'}`}
          fill={i < count ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}
