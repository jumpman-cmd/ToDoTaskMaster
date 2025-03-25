import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTaskSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Extend the insertTaskSchema with validation rules
const taskFormSchema = insertTaskSchema.extend({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskForm({ taskId, isOpen, onClose, onSuccess }: TaskFormProps) {
  const isEditing = taskId !== null;
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      completed: false,
    },
  });

  // Fetch task data if editing
  useEffect(() => {
    async function fetchTask() {
      if (isEditing) {
        try {
          const response = await fetch(`/api/tasks/${taskId}`, {
            credentials: "include",
          });
          
          if (!response.ok) {
            throw new Error("Failed to fetch task");
          }
          
          const task = await response.json();
          
          form.reset({
            title: task.title,
            description: task.description || "",
            dueDate: task.dueDate || "",
            completed: task.completed,
          });
        } catch (error) {
          console.error("Error fetching task:", error);
          toast({
            title: "Error",
            description: "Failed to load task data",
            variant: "destructive",
          });
          onClose();
        }
      }
    }
    
    fetchTask();
  }, [isEditing, taskId, form, onClose]);

  async function onSubmit(data: TaskFormValues) {
    try {
      if (isEditing) {
        await apiRequest("PATCH", `/api/tasks/${taskId}`, data);
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        await apiRequest("POST", "/api/tasks", data);
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onSuccess();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} task`,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "New Task"}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What needs to be done?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add details (optional)"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
