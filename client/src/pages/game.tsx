import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { PancakeStack } from "@/components/game/pancake-stack";
import { LevelComplete } from "@/components/game/level-complete";
import { Progress } from "@/components/ui/progress";

export default function Game() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const { currentLevel, moves, arrangement, level, flipStack, checkWin, nextLevel, stars } = useGameState();

  // Check win condition whenever arrangement changes and animation is complete
  useEffect(() => {
    const checkWinCondition = () => {
      if (checkWin() && !isAnimating && !showComplete) {
        setIsVictory(true);
        setShowComplete(true);
      }
    };

    // Only check win condition if we're not currently animating
    if (!isAnimating) {
      checkWinCondition();
    }
  }, [arrangement, checkWin, isAnimating, showComplete]);

  const handleLevelComplete = () => {
    setShowComplete(false);
    setIsVictory(false);
    nextLevel();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-primary/40 to-indigo-400">
      {/* HUD */}
      <div className="fixed top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/20 to-transparent">
        <div className="container max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-white/90">Level {currentLevel}</h2>
            <p className="text-white/70">Moves: {moves}</p>
          </div>
          <Progress value={moves ? (level?.minMoves || 0) / moves * 100 : 100} className="bg-white/20" />
        </div>
      </div>

      {/* Game Area */}
      <PancakeStack
        arrangement={arrangement}
        onFlip={flipStack}
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
        isVictory={isVictory}
      />

      {/* Level Complete Dialog */}
      <LevelComplete
        isOpen={showComplete}
        onClose={handleLevelComplete}
        stars={stars}
        moves={moves}
        level={currentLevel}
      />
    </div>
  );
}