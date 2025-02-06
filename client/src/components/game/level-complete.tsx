import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarReward } from "./star-reward";

interface LevelCompleteProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  moves: number;
  level: number;
}

export function LevelComplete({ isOpen, onClose, stars, moves, level }: LevelCompleteProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background/20 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white">
            Level {level} Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="py-8">
          <StarReward count={stars} />
          <p className="text-center mt-4 text-white/90">
            Completed in {moves} moves
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={onClose} size="lg" className="bg-white/20 hover:bg-white/30 text-white">
            Next Level
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}