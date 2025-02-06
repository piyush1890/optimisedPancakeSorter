import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useGameState } from "@/hooks/use-game-state";
import { useTutorialState } from "@/hooks/use-tutorial-state";
import { PancakeStack } from "@/components/game/pancake-stack";
import { LevelComplete } from "@/components/game/level-complete";
import { TutorialHand } from "@/components/game/tutorial-hand";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Volume2, VolumeX, Star, ChevronLeft } from "lucide-react";
import { soundEffect } from "@/lib/sound";
import { Button } from "@/components/ui/button";

export default function Game() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialPositions, setTutorialPositions] = useState<{ x: number; y: number }[]>([]);
  const [, params] = useRoute("/game/:id");
  const [, navigate] = useLocation();
  const { tutorialState, completeTutorial } = useTutorialState();

  const { 
    currentLevel, 
    moves, 
    arrangement, 
    level, 
    flipStack, 
    checkWin, 
    nextLevel,
    goToLevel,
    stars, 
    totalStars 
  } = useGameState();

  const calculateTutorialPositions = useCallback(() => {
    if (!currentLevel) return;

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;

    if (currentLevel === 1) {
      setTutorialPositions([
        { 
          x: centerX + 150,  // Position to the right of the stack
          y: centerY + 50   // Point at the middle pancake
        }
      ]);
    } else if (currentLevel === 2) {
      setTutorialPositions([
        { 
          x: centerX + 150,
          y: centerY - 50  // Point at top pancake first
        },
        { 
          x: centerX + 150,
          y: centerY + 150  // Then point at bottom pancake
        }
      ]);
    }
  }, [currentLevel]);

  useEffect(() => {
    if ((currentLevel === 1 && !tutorialState.level1Completed) ||
        (currentLevel === 2 && !tutorialState.level2Completed)) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
        calculateTutorialPositions();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowTutorial(false);
    }
  }, [currentLevel, tutorialState, calculateTutorialPositions]);

  const handleTutorialComplete = useCallback(() => {
    if (currentLevel === 1 || currentLevel === 2) {
      completeTutorial(currentLevel as 1 | 2);
    }
    setShowTutorial(false);
  }, [currentLevel, completeTutorial]);

  useEffect(() => {
    if (params?.id) {
      const levelId = parseInt(params.id);
      goToLevel(levelId);
    }
  }, [params?.id, goToLevel]);

  useEffect(() => {
    setIsAnimating(false);
    setIsVictory(false);
    setShowComplete(false);
  }, [currentLevel]);

  useEffect(() => {
    soundEffect.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    const checkWinCondition = () => {
      if (checkWin() && !isAnimating && !showComplete && !isVictory) {
        setIsVictory(true);
        setTimeout(() => {
          setShowComplete(true);
        }, 2000);
      }
    };

    if (!isAnimating) {
      checkWinCondition();
    }
  }, [arrangement, checkWin, isAnimating, showComplete, isVictory]);

  const handleLevelComplete = () => {
    setShowComplete(false);
    setIsVictory(false);
    nextLevel();
    navigate(`/game/${currentLevel + 1}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-primary/40 to-indigo-400">
      {showTutorial && tutorialPositions.length > 0 && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
          <TutorialHand
            positions={tutorialPositions}
            onClick={handleTutorialComplete}
          />
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/20 to-transparent">
        <div className="container max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="text-white bg-white/10 hover:bg-white/20 border-white/20"
                onClick={() => navigate("/levels")}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Levels
              </Button>
              <h2 className="text-lg font-bold text-white/90">Level {currentLevel}</h2>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-white/90">{totalStars}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-white/70" />
                ) : (
                  <VolumeX className="h-5 w-5 text-white/70" />
                )}
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  className="data-[state=checked]:bg-white/30"
                />
              </div>
              <p className="text-white/70">Moves: {moves}</p>
            </div>
          </div>
          <Progress value={moves ? (level?.minMoves || 0) / moves * 100 : 100} className="bg-white/20" />
        </div>
      </div>

      <div className="game-area">
        <PancakeStack
          arrangement={arrangement}
          onFlip={flipStack}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          isVictory={isVictory}
        />
      </div>

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