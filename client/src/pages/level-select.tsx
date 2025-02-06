import { useGameState } from "@/hooks/use-game-state";
import { LevelSelect } from "@/components/game/level-select";

export default function LevelSelectPage() {
  const { currentLevel, totalStars, levelStars } = useGameState();

  return (
    <LevelSelect
      currentLevel={currentLevel}
      totalStars={totalStars}
      levelStars={levelStars}
    />
  );
}
