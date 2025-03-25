import { format, parseISO, isToday, isPast, isFuture } from "date-fns";
import { Task } from "@shared/schema";

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error("Invalid date format:", error);
    return 'Invalid date';
  }
}

export function getDueDateClasses(task: Task): string {
  if (!task.dueDate) return 'text-slate-500';
  
  try {
    const dueDate = parseISO(task.dueDate);
    
    if (task.completed) {
      return 'text-green-500';
    } else if (isPast(dueDate) && !isToday(dueDate)) {
      return 'text-red-500';
    } else if (isToday(dueDate)) {
      return 'text-amber-500';
    } else if (isFuture(dueDate)) {
      return 'text-slate-500';
    }
    
    return 'text-slate-500';
  } catch (error) {
    console.error("Invalid date in getDueDateClasses:", error);
    return 'text-slate-500';
  }
}
