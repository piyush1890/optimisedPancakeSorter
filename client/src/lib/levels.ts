import type { Level } from "@shared/schema";

export const levels: Level[] = [
  {
    id: 1,
    arrangement: [3, 1, 4, 2, 5],
    target: [1, 2, 3, 4, 5],
    minMoves: 3
  },
  {
    id: 2,
    arrangement: [2, 5, 1, 4, 3],
    target: [1, 2, 3, 4, 5],
    minMoves: 4
  },
  {
    id: 3,
    arrangement: [4, 2, 5, 1, 3],
    target: [1, 2, 3, 4, 5],
    minMoves: 5
  },
  {
    id: 4,
    arrangement: [5, 3, 2, 4, 1],
    target: [1, 2, 3, 4, 5],
    minMoves: 5
  },
  {
    id: 5,
    arrangement: [3, 5, 4, 1, 2],
    target: [1, 2, 3, 4, 5],
    minMoves: 6
  }
];

export function calculateStars(moves: number, minMoves: number): number {
  if (moves <= minMoves) return 3;
  if (moves <= minMoves + 2) return 2;
  return 1;
}

export function isAscendingOrder(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return true;
}