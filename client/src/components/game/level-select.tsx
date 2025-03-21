import { useLocation } from "wouter";
import { Star, Lock, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { levels } from "@/lib/levels";

interface LevelSelectProps {
  currentLevel: number;
  totalStars: number;
  levelStars: Record<number, number>;
}

export function LevelSelect({ currentLevel, totalStars, levelStars }: LevelSelectProps) {
  const [, navigate] = useLocation();

  // Helper function to check if a level is unlocked
  const isLevelUnlocked = (levelId: number) => {
    // First level is always unlocked
    if (levelId === 1) return true;
    // Level is unlocked if it's current level or previous level has stars
    return levelId <= currentLevel || levelStars[levelId - 1] > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-primary/40 to-indigo-400 p-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Select Level</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <span className="text-xl text-white/90">{totalStars}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="text-white bg-white/10 hover:bg-white/20 border-white/20"
              onClick={() => navigate(`/game/${currentLevel}`)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {levels.map((level) => {
            const isLocked = !isLevelUnlocked(level.id);
            const stars = levelStars[level.id] || 0;

            return (
              <Card
                key={level.id}
                className={`relative p-6 flex flex-col items-center gap-4 transition-transform hover:scale-105 
                  ${isLocked ? 'bg-gray-800/50' : 'bg-white/10 backdrop-blur-sm cursor-pointer'}
                  border-white/20`}
                onClick={() => !isLocked && navigate(`/game/${level.id}`)}
              >
                <span className="text-3xl font-bold text-white/90">
                  {level.id}
                </span>

                {isLocked ? (
                  <Lock className="w-8 h-8 text-white/50" />
                ) : (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= stars
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}