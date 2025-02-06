import { useState, useCallback, useEffect } from "react";
import { levels, calculateStars, isAscendingOrder } from "@/lib/levels";
import { useToast } from "@/hooks/use-toast";

// Load initial state from localStorage
const loadGameState = () => {
  try {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const { currentLevel, totalStars, levelStars } = JSON.parse(savedState);
      return {
        currentLevel: currentLevel || 1,
        totalStars: totalStars || 0,
        levelStars: levelStars || {},
      };
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  return { currentLevel: 1, totalStars: 0, levelStars: {} };
};

export function useGameState() {
  const initialState = loadGameState();
  const [currentLevel, setCurrentLevel] = useState(initialState.currentLevel);
  const [moves, setMoves] = useState(0);
  const [totalStars, setTotalStars] = useState(initialState.totalStars);
  const [levelStars, setLevelStars] = useState(initialState.levelStars);
  const level = levels.find(l => l.id === currentLevel);
  const [arrangement, setArrangement] = useState(level?.arrangement || []);
  const { toast } = useToast();

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const gameState = {
      currentLevel,
      totalStars,
      levelStars,
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [currentLevel, totalStars, levelStars]);

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
    // Allow access if the level exists and either:
    // 1. It's level 1
    // 2. It's the current level or earlier
    // 3. The previous level has been completed (has stars)
    if (levelData && (levelId === 1 || levelId <= currentLevel || levelStars[levelId - 1] > 0)) {
      setCurrentLevel(levelId);
      setArrangement(levelData.arrangement);
      setMoves(0);
    }
  }, [currentLevel, levelStars]);

  const nextLevel = useCallback(() => {
    if (!level) return;

    // Calculate stars for current level
    const currentStars = calculateStars(moves, level.minMoves);

    // Update level stars and total stars
    setLevelStars(prev => {
      const existingStars = prev[currentLevel] || 0;
      if (currentStars > existingStars) {
        setTotalStars(total => total + (currentStars - existingStars));
      }
      return {
        ...prev,
        [currentLevel]: Math.max(currentStars, existingStars)
      };
    });

    // Move to next level
    const nextLevelId = currentLevel + 1;
    const nextLevelData = levels.find(l => l.id === nextLevelId);
    if (nextLevelData) {
      setCurrentLevel(nextLevelId);
      setArrangement(nextLevelData.arrangement);
      setMoves(0);
    } else {
      toast({
        title: "Game Complete!",
        description: "You've completed all available levels!"
      });
    }
  }, [currentLevel, moves, level, toast]);

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