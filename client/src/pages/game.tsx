import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useGameState } from "@/hooks/use-game-state";
import { useTutorialState } from "@/hooks/use-tutorial-state";
import { PancakeStack } from "@/components/game/pancake-stack";
import { LevelComplete } from "@/components/game/level-complete";
import { GuideHand } from "@/components/game/guide-hand";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Volume2, VolumeX, Star, ChevronLeft } from "lucide-react";
import { soundEffect } from "@/lib/sound";
import { Button } from "@/components/ui/button";

// Level 1 guide sequence
const LEVEL_1_SEQUENCE = [4, 3, 2, 1, 3, 1];

export default function Game() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [guideIndex, setGuideIndex] = useState(0);
  const [, params] = useRoute("/game/:id");
  const [, navigate] = useLocation();
  const { tutorialState } = useTutorialState();

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

  useEffect(() => {
    if (params?.id) {
      const levelId = parseInt(params.id);
      goToLevel(levelId);
      setGuideIndex(0); // Reset guide index when changing levels
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

  const handleFlip = (index: number) => {
    // For level 1, check if the flip matches the guide sequence
    if (currentLevel === 1 && !isAnimating && !isVictory) {
      const targetIndex = LEVEL_1_SEQUENCE[guideIndex] - 1; // Convert 1-based to 0-based
      if (index === targetIndex) {
        flipStack(index);
        setGuideIndex(prev => prev + 1);
      }
    } else if (!isAnimating && !isVictory) {
      flipStack(index);
    }
  };

  const handleLevelComplete = () => {
    setShowComplete(false);
    setIsVictory(false);
    nextLevel();
    navigate(`/game/${currentLevel + 1}`);
  };

  // Show guide hand only for level 1 and if not completed
  const showGuide = currentLevel === 1 && !tutorialState.level1Completed && guideIndex < LEVEL_1_SEQUENCE.length;

  // Get current target index for highlighting
  const currentTargetIndex = currentLevel === 1 && guideIndex < LEVEL_1_SEQUENCE.length 
    ? LEVEL_1_SEQUENCE[guideIndex] - 1 
    : undefined;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-primary/40 to-indigo-400">
      {showGuide && (
        <GuideHand
          sequence={LEVEL_1_SEQUENCE}
          currentIndex={guideIndex}
          stackHeight={window.innerHeight * 0.6}
          containerHeight={window.innerHeight}
        />
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
          onFlip={handleFlip}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          isVictory={isVictory}
          targetIndex={currentTargetIndex}
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