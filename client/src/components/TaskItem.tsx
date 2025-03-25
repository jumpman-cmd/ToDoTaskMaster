import { useState } from "react";
import { Task } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { formatDate, getDueDateClasses } from "@/lib/date";
import { toast } from "@/hooks/use-toast";

interface TaskItemProps {
  task: Task;
  onEdit: (taskId: number) => void;
  onRefresh: () => void;
}

export default function TaskItem({ task, onEdit, onRefresh }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleTaskCompletion = async () => {
    try {
      setIsUpdating(true);
      await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        completed: !task.completed,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
      console.error("Failed to update task:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onRefresh();
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`task-transition bg-white rounded-lg border p-4 shadow-sm hover:shadow ${
        task.completed ? "border-green-500 bg-green-50" : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={toggleTaskCompletion}
          disabled={isUpdating}
          className={`mt-1 ${
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-slate-300 bg-white"
          }`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <h3
              className={`text-base font-medium ${
                task.completed ? "line-through text-slate-500" : ""
              }`}
            >
              {task.title}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(task.id)}
                className="text-slate-400 hover:text-primary"
                disabled={isDeleting || isUpdating}
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button
                onClick={deleteTask}
                className="text-slate-400 hover:text-red-500"
                disabled={isDeleting || isUpdating}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-1 text-sm ${
                task.completed ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 ${getDueDateClasses(
                  task
                )}`}
              >
                <Calendar className="h-4 w-4" />
                <span>{formatDate(task.dueDate)}</span>
              </span>
            )}

            <span className="text-slate-500 inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(task.createdAt.toString())}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
