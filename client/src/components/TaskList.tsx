import { Task, TaskFilter } from "@shared/schema";
import TaskItem from "./TaskItem";
import EmptyState from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  filter: TaskFilter;
  onEditTask: (taskId: number) => void;
  onRefresh: () => void;
}

export default function TaskList({ tasks, isLoading, filter, onEditTask, onRefresh }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-[200px]" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <div className="mt-2 flex gap-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState filter={filter} onAddNewTask={() => onEditTask(0)} />;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEditTask}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
