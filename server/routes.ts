import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export function registerRoutes(app: Express): Server {
  app.post("/api/users", async (req, res) => {
    const { username } = req.body;
    const user = await storage.createUser({ username });
    res.json(user);
  });

  app.patch("/api/users/:id/stars", async (req, res) => {
    const { stars } = req.body;
    const user = await storage.updateStars(parseInt(req.params.id), stars);
    res.json(user);
  });

  app.patch("/api/users/:id/level", async (req, res) => {
    const { level } = req.body;
    const user = await storage.updateLevel(parseInt(req.params.id), level);
    res.json(user);
  });

  return createServer(app);
}
