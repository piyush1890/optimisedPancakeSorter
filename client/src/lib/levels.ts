import type { Level } from "@shared/schema";

export const levels: Level[] = [
  {
    id: 1,
    arrangement: [3, 1, 4, 2, 5],
    target: [5, 4, 3, 2, 1],
    minMoves: 3
  },
  {
    id: 2,
    arrangement: [2, 5, 1, 4, 3],
    target: [5, 4, 3, 2, 1],
    minMoves: 4
  },
  // Add more levels as needed
];

export function calculateStars(moves: number, minMoves: number): number {
  if (moves <= minMoves) return 3;
  if (moves <= minMoves + 2) return 2;
  return 1;
}
