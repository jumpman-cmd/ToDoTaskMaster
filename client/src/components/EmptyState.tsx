import { Button } from "@/components/ui/button";
import { PlusIcon, ClipboardList } from "lucide-react";
import { TaskFilter } from "@shared/schema";

interface EmptyStateProps {
  filter: TaskFilter;
  onAddNewTask: () => void;
}

export default function EmptyState({ filter, onAddNewTask }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
      <ClipboardList className="h-16 w-16 mx-auto text-slate-300" />
      
      <h3 className="mt-2 text-sm font-medium text-slate-600">No tasks found</h3>
      
      {filter === "all" && (
        <p className="mt-1 text-sm text-slate-500">Get started by creating your first task.</p>
      )}
      
      {filter === "active" && (
        <p className="mt-1 text-sm text-slate-500">No active tasks at the moment.</p>
      )}
      
      {filter === "completed" && (
        <p className="mt-1 text-sm text-slate-500">You haven't completed any tasks yet.</p>
      )}
      
      <div className="mt-6">
        <Button onClick={onAddNewTask} className="inline-flex items-center">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add a New Task
        </Button>
      </div>
    </div>
  );
}
