import { useState } from "react";
import { TaskSortOption, TaskFilter } from "@shared/schema";
import { useTasks } from "@/hooks/useTasks";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [sortOption, setSortOption] = useState<TaskSortOption>("dueDate-asc");

  const {
    tasks,
    isLoading,
    activeTasks,
    completedTasks,
    refetch
  } = useTasks(filter, sortOption);

  const openNewTaskModal = () => {
    setEditingTaskId(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (taskId: number) => {
    setEditingTaskId(taskId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 bg-white rounded-lg">
      {/* App Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <Button onClick={openNewTaskModal} className="gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Task
          </Button>
        </div>

        {/* App Summary */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-600">
            <span>{activeTasks.length}</span> active tasks,{" "}
            <span>{completedTasks.length}</span> completed
          </p>

          {/* Sort Options */}
          <div className="mt-2 sm:mt-0">
            <span className="text-sm text-slate-500 mr-2">Sort by:</span>
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as TaskSortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate-asc">Due Date (earliest)</SelectItem>
                <SelectItem value="dueDate-desc">Due Date (latest)</SelectItem>
                <SelectItem value="creationDate-desc">Creation Date (newest)</SelectItem>
                <SelectItem value="creationDate-asc">Creation Date (oldest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex -mb-px space-x-6 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              filter === "all"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              filter === "active"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              filter === "completed"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Completed
          </button>
        </nav>
      </div>

      {/* Task List */}
      <TaskList 
        tasks={tasks} 
        isLoading={isLoading}
        filter={filter}
        onEditTask={openEditTaskModal}
        onRefresh={refetch}
      />

      {/* Task Form Modal */}
      {isModalOpen && (
        <TaskForm
          taskId={editingTaskId}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            refetch();
          }}
        />
      )}
    </div>
  );
}
