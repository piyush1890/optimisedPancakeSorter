import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  stars: integer("stars").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface Level {
  id: number;
  arrangement: number[];
  target: number[];
  minMoves: number;
}
