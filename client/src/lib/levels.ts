import type { Level } from "@shared/schema";

// Define sequences for different levels
// Each number in sequence represents the pancake to click (1-based index)
export const levelSequences: Record<number, number[]> = {
  1: [4, 3, 2, 1, 3, 1], // Level 1 sequence
  2: [2, 4, 1, 2, 1], // Level 2 sequence
};

export const levels: Level[] = [
  {
    id: 1,
    arrangement: [3, 1, 4, 2, 5],
    target: [1, 2, 3, 4, 5],
    minMoves: 3,
  },
  {
    id: 2,
    arrangement: [2, 5, 1, 4, 3],
    target: [1, 2, 3, 4, 5],
    minMoves: 4,
  },
  {
    id: 3,
    arrangement: [1, 5, 2, 4, 3],
    target: [1, 2, 3, 4, 5],
    minMoves: 5,
  },
  {
    id: 4,
    arrangement: [1, 5, 2, 4, 3],
    target: [1, 2, 3, 4, 5],
    minMoves: 5,
  },
];

export function calculateStars(moves: number, minMoves: number): number {
  if (moves <= minMoves) return 3;
  if (moves <= minMoves + 2) return 2;
  return 1;
}

export function isAscendingOrder(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] < arr[i]) return false;
  }
  return true;
}
