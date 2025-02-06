import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useGameState } from "@/hooks/use-game-state";
import { PancakeStack } from "@/components/game/pancake-stack";
import { LevelComplete } from "@/components/game/level-complete";
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
  const [, params] = useRoute("/game/:id");
  const [, navigate] = useLocation();

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

  // Set the level from URL parameter
  useEffect(() => {
    if (params?.id) {
      const levelId = parseInt(params.id);
      goToLevel(levelId);
    }
  }, [params?.id, goToLevel]);

  // Reset animation states when level changes
  useEffect(() => {
    setIsAnimating(false);
    setIsVictory(false);
    setShowComplete(false);
  }, [currentLevel]);

  // Update sound effect state when toggle changes
  useEffect(() => {
    soundEffect.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Check win condition whenever arrangement changes and animation is complete
  useEffect(() => {
    const checkWinCondition = () => {
      if (checkWin() && !isAnimating && !showComplete && !isVictory) {
        setIsVictory(true);
        // Delay showing the completion dialog to allow for victory animation
        setTimeout(() => {
          setShowComplete(true);
        }, 2000);
      }
    };

    // Only check win condition if we're not currently animating
    if (!isAnimating) {
      checkWinCondition();
    }
  }, [arrangement, checkWin, isAnimating, showComplete, isVictory]);

  const handleLevelComplete = () => {
    console.log('Level complete handler called');
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
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="text-white bg-white/10 hover:bg-white/20 border-white/20"
                onClick={() => navigate("/")}
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