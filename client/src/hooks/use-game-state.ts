import { useState, useCallback } from "react";
import { levels, calculateStars, isDescendingOrder } from "@/lib/levels";
import { useToast } from "@/hooks/use-toast";

export function useGameState() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [arrangement, setArrangement] = useState(levels[0].arrangement);
  const { toast } = useToast();

  const level = levels.find(l => l.id === currentLevel);

  const flipStack = useCallback((index: number) => {
    setMoves(m => m + 1);
    setArrangement(arr => {
      const newArr = [...arr];
      const subArray = newArr.slice(0, index + 1).reverse();
      newArr.splice(0, index + 1, ...subArray);
      return newArr;
    });
  }, []);

  const checkWin = useCallback(() => {
    return isDescendingOrder(arrangement);
  }, [arrangement]);

  const nextLevel = useCallback(() => {
    const nextLevelData = levels[currentLevel];
    if (nextLevelData) {
      setCurrentLevel(l => l + 1);
      setArrangement(nextLevelData.arrangement);
      setMoves(0);
    } else {
      toast({
        title: "Game Complete!",
        description: "You've completed all available levels!"
      });
    }
  }, [currentLevel, toast]);

  return {
    currentLevel,
    moves,
    arrangement,
    level,
    flipStack,
    checkWin,
    nextLevel,
    stars: level ? calculateStars(moves, level.minMoves) : 0
  };
}