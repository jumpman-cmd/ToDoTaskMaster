import { useQuery } from "@tanstack/react-query";
import { Task, TaskFilter, TaskSortOption } from "@shared/schema";

export function useTasks(filter: TaskFilter = "all", sortOption: TaskSortOption = "dueDate-asc") {
  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: [`/api/tasks?filter=${filter}&sort=${sortOption}`],
  });

  // Filter tasks for UI display
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return {
    tasks,
    isLoading,
    activeTasks,
    completedTasks,
    refetch,
  };
}
