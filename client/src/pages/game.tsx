import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { PancakeStack } from "@/components/game/pancake-stack";
import { LevelComplete } from "@/components/game/level-complete";
import { Progress } from "@/components/ui/progress";

export default function Game() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const { currentLevel, moves, arrangement, level, flipStack, checkWin, nextLevel, stars } = useGameState();

  useEffect(() => {
    if (checkWin() && !isAnimating && !showComplete) {
      setShowComplete(true);
    }
  }, [arrangement, checkWin, isAnimating]);

  const handleLevelComplete = () => {
    setShowComplete(false);
    nextLevel();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HUD */}
      <div className="fixed top-0 left-0 right-0 p-4 z-10">
        <div className="container max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Level {currentLevel}</h2>
            <p className="text-muted-foreground">Moves: {moves}</p>
          </div>
          <Progress value={moves ? (level?.minMoves || 0) / moves * 100 : 100} />
        </div>
      </div>

      {/* Game Area */}
      <PancakeStack
        arrangement={arrangement}
        onFlip={flipStack}
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
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
