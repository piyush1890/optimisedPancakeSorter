import { users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStars(userId: number, stars: number): Promise<User>;
  updateLevel(userId: number, level: number): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, stars: 0, currentLevel: 1 };
    this.users.set(id, user);
    return user;
  }

  async updateStars(userId: number, stars: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    user.stars = stars;
    this.users.set(userId, user);
    return user;
  }

  async updateLevel(userId: number, level: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    user.currentLevel = level;
    this.users.set(userId, user);
    return user;
  }
}

export const storage = new MemStorage();
