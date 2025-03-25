import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTaskSchema, taskSortOptionSchema, taskFilterSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      // Get all tasks
      const tasks = await storage.getTasks();
      
      // Handle sorting if provided
      let sortedTasks = [...tasks];
      const sortOption = req.query.sort as string;
      
      if (sortOption) {
        try {
          const validatedSortOption = taskSortOptionSchema.parse(sortOption);
          sortedTasks = storage.sortTasks(tasks, validatedSortOption);
        } catch (error) {
          console.error("Invalid sort option:", error);
          // Continue with default sorting if invalid
        }
      }
      
      // Handle filtering if provided
      const filter = req.query.filter as string;
      if (filter) {
        try {
          const validatedFilter = taskFilterSchema.parse(filter);
          
          if (validatedFilter === "active") {
            sortedTasks = sortedTasks.filter(task => !task.completed);
          } else if (validatedFilter === "completed") {
            sortedTasks = sortedTasks.filter(task => task.completed);
          }
          // "all" filter doesn't need filtering
        } catch (error) {
          console.error("Invalid filter option:", error);
          // Return all tasks if filter is invalid
        }
      }
      
      res.json(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Validate partial task data
      const taskUpdateSchema = insertTaskSchema.partial();
      const taskData = taskUpdateSchema.parse(req.body);
      
      const updatedTask = await storage.updateTask(id, taskData);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
