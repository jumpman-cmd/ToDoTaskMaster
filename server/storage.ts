import { tasks, type Task, type InsertTask, users, type User, type InsertUser } from "@shared/schema";
import { type TaskSortOption } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTasks(userId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  sortTasks(tasks: Task[], sortOption: TaskSortOption): Task[];
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private userCurrentId: number;
  private taskCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    
    // Add some initial tasks for demonstration
    const now = new Date();
    const inTwoDays = new Date();
    inTwoDays.setDate(now.getDate() + 2);
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    
    this.tasks.set(1, {
      id: 1,
      title: "Complete project documentation",
      description: "Write up the final user guide and API documentation",
      dueDate: inTwoDays.toISOString().split('T')[0],
      completed: false,
      createdAt: now,
      userId: null
    });
    
    this.tasks.set(2, {
      id: 2,
      title: "Schedule team meeting",
      description: "Quarterly planning session with the development team",
      dueDate: yesterday.toISOString().split('T')[0],
      completed: true,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      userId: null
    });
    
    this.tasks.set(3, {
      id: 3,
      title: "Review pull requests",
      description: "",
      dueDate: now.toISOString().split('T')[0],
      completed: false,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      userId: null
    });
    
    this.taskCurrentId = 4;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task operations
  async getTasks(userId?: number): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    if (userId) {
      return allTasks.filter(task => task.userId === userId);
    }
    return allTasks;
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const task: Task = { 
      ...insertTask, 
      id,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { 
      ...task, 
      ...updates 
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  sortTasks(tasks: Task[], sortOption: TaskSortOption): Task[] {
    const [sortBy, direction] = sortOption.split('-') as [string, 'asc' | 'desc'];
    
    return [...tasks].sort((a, b) => {
      let valueA: Date, valueB: Date;
      
      if (sortBy === 'dueDate') {
        valueA = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000);
        valueB = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000);
      } else {
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
      }
      
      if (direction === 'asc') {
        return valueA.getTime() - valueB.getTime();
      } else {
        return valueB.getTime() - valueA.getTime();
      }
    });
  }
}

export const storage = new MemStorage();
