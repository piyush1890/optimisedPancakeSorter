import { useState, useCallback } from "react";
import { levels, calculateStars, isAscendingOrder } from "@/lib/levels";
import { useToast } from "@/hooks/use-toast";

export function useGameState() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const level = levels.find(l => l.id === currentLevel);
  const [arrangement, setArrangement] = useState(level?.arrangement || []);
  const { toast } = useToast();

  const flipStack = useCallback((index: number) => {
    setMoves(m => m + 1);
    setArrangement(arr => {
      const newArr = [...arr];
      const subArray = newArr.slice(index, newArr.length).reverse();
      newArr.splice(index, newArr.length, ...subArray);
      return newArr;
    });
  }, []);

  const checkWin = useCallback(() => {
    return isAscendingOrder(arrangement);
  }, [arrangement]);

  const goToLevel = useCallback((levelId: number) => {
    const levelData = levels.find(l => l.id === levelId);
    if (levelData && levelId <= Math.max(currentLevel, ...Object.keys(levelStars).map(Number))) {
      setCurrentLevel(levelId);
      setArrangement(levelData.arrangement);
      setMoves(0);
    }
  }, [currentLevel, levelStars]);

  const nextLevel = useCallback(() => {
    if (!level) return;

    // Calculate stars for current level
    const currentStars = calculateStars(moves, level.minMoves);

    // Update total stars and level stars
    setTotalStars(prev => {
      const existingStars = levelStars[currentLevel] || 0;
      return prev - existingStars + currentStars;
    });

    setLevelStars(prev => ({
      ...prev,
      [currentLevel]: Math.max(currentStars, prev[currentLevel] || 0)
    }));

    // Move to next level
    const nextLevelData = levels.find(l => l.id === currentLevel + 1);
    if (nextLevelData) {
      setCurrentLevel(prev => prev + 1);
      setArrangement(nextLevelData.arrangement);
      setMoves(0);
    } else {
      toast({
        title: "Game Complete!",
        description: "You've completed all available levels!"
      });
    }
  }, [currentLevel, moves, level, levelStars, toast]);

  return {
    currentLevel,
    moves,
    arrangement,
    level,
    flipStack,
    checkWin,
    nextLevel,
    goToLevel,
    stars: level ? calculateStars(moves, level.minMoves) : 0,
    totalStars,
    levelStars
  };
}