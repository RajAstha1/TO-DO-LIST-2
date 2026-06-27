export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  category: string;
  createdAt: string; // ISO String
}

export type SortOption = "dueDate" | "priority" | "createdAt" | "alphabetical";
