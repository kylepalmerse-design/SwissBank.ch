import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { loginSchema, transferSchema } from "@shared/schema";

const MemoryStoreSession = MemoryStore(session);

declare module "express-session" {
  interface SessionData {
    username: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware with in-memory storage
  app.use(
    session({
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
      secret: process.env.SESSION_SECRET || "helvetia-private-bank-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax",
      },
    })
  );

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const { username, password } = result.data;
      const user = await storage.authenticateUser(username, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.username = username;
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    try {
      // Disable caching to prevent 304 responses
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      if (!req.session.username) {
        console.error("GET /api/user - No username in session");
        return res.status(401).json({ message: "Not authenticated" });
      }

      console.log(`GET /api/user - Fetching user: ${req.session.username}`);
      const user = await storage.getUser(req.session.username);
      
      if (!user) {
        console.error(`GET /api/user - User not found: ${req.session.username}`);
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`GET /api/user - Success: ${req.session.username}`);
      res.json(user);
    } catch (error: any) {
      console.error("GET /api/user - Error:", error.message || error);
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });

  // Create transfer endpoint
  app.post("/api/transfers", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const result = transferSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid transfer data",
          errors: result.error.errors 
        });
      }

      const transferResponse = await storage.createTransfer(
        req.session.username,
        result.data
      );

      res.json(transferResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Transfer failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
