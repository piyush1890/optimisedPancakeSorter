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

  // Calculate tutorial hand positions based on level
  const calculateTutorialPositions = useCallback(() => {
    if (!currentLevel) return;

    console.log('Calculating tutorial positions for level:', currentLevel);

    // Use window dimensions for better positioning
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Calculate center position
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;

    if (currentLevel === 1) {
      // For level 1, show a simple flip at position 2
      console.log('Setting level 1 tutorial position');
      setTutorialPositions([
        { 
          x: centerX,
          y: centerY + 50 // Offset down slightly to point at pancakes
        }
      ]);
    } else if (currentLevel === 2) {
      // For level 2, show a sequence of two flips
      console.log('Setting level 2 tutorial position');
      setTutorialPositions([
        { 
          x: centerX,
          y: centerY - 50 // First flip position
        },
        { 
          x: centerX,
          y: centerY + 100 // Second flip position
        }
      ]);
    }
  }, [currentLevel]);

  // Show tutorial for levels 1 and 2 if not completed
  useEffect(() => {
    console.log('Tutorial effect running:', {
      currentLevel,
      level1Completed: tutorialState.level1Completed,
      level2Completed: tutorialState.level2Completed,
      showTutorial
    });

    if ((currentLevel === 1 && !tutorialState.level1Completed) ||
        (currentLevel === 2 && !tutorialState.level2Completed)) {
      console.log('Should show tutorial');
      // Add a longer delay to ensure game area is mounted
      const timer = setTimeout(() => {
        setShowTutorial(true);
        calculateTutorialPositions();
      }, 1500); // Increased delay
      return () => clearTimeout(timer);
    } else {
      console.log('Should hide tutorial');
      setShowTutorial(false);
    }
  }, [currentLevel, tutorialState, calculateTutorialPositions]);

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    if (currentLevel === 1 || currentLevel === 2) {
      completeTutorial(currentLevel as 1 | 2);
    }
  };

  // Set the level from URL parameter
  useEffect(() => {
    if (params?.id) {
      const levelId = parseInt(params.id);
      // Reset tutorials if starting from level 1
      if (levelId === 1) {
        completeTutorial(1);
      }
      goToLevel(levelId);
    }
  }, [params?.id, goToLevel, completeTutorial]);

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
    const nextLevelNumber = currentLevel + 1;
    nextLevel();
    navigate(`/game/${nextLevelNumber}`);
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

      {/* Game Area */}
      <div className="game-area">
        <PancakeStack
          arrangement={arrangement}
          onFlip={flipStack}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          isVictory={isVictory}
        />
      </div>

      {/* Tutorial Hand */}
      {showTutorial && tutorialPositions.length > 0 && (
        <TutorialHand
          positions={tutorialPositions}
          onClick={handleTutorialComplete}
        />
      )}

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