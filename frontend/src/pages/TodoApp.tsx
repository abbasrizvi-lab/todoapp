"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LogOut, Plus, Edit, Trash2, ListTodo, CheckCircle2, CircleDot } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
}

type FilterType = "all" | "active" | "completed";

const TodoApp = () => {
  const { user, logout, token } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const API_URL = `${API_BASE_URL}/api/v1/todos`;

  useEffect(() => {
    const fetchTodos = async () => {
      if (user?.id && token) {
        try {
          const response = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch To-Dos.");
          }
          const data = await response.json();
          console.log("Fetched todos data:", data);
          const transformedTodos = data.map((todo: any) => ({ ...todo, id: todo._id }));
          setTodos(transformedTodos);
        } catch (error) {
          toast.error((error as Error).message);
        }
      }
      else{
        console.log(`else block`)
      }
    };
    fetchTodos();
  }, [user?.id, token]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) {
      toast.error("To-Do title cannot be empty.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTodoTitle.trim(),
          description: newTodoDescription.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add To-Do.");
      }

      const newTodoData = await response.json();
      console.log("New todo added:", newTodoData);
      const newTodo = { ...newTodoData, id: newTodoData._id };
      setTodos((prevTodos) => [...prevTodos, newTodo]);
      setNewTodoTitle("");
      setNewTodoDescription("");
      toast.success("To-Do added successfully!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: todo.title, description: todo.description, completed: !todo.completed }),
      });

      if (!response.ok) {
        throw new Error("Failed to update To-Do.");
      }

      const updatedTodoData = await response.json();
      setTodos((prevTodos) =>
        prevTodos.map((t) => (t.id === id ? { ...updatedTodoData, id: updatedTodoData._id } : t))
      );
      toast.info("To-Do status updated!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete To-Do.");
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      toast.success("To-Do deleted!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingTodo) return;
    if (!editTitle.trim()) {
      toast.error("To-Do title cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${editingTodo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          completed: editingTodo.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update To-Do.");
      }

      const updatedTodo = await response.json();
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === editingTodo.id ? { ...updatedTodo, id: updatedTodo._id } : todo))
      );
      setEditingTodo(null);
      toast.success("To-Do updated successfully!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleClearCompleted = () => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
    toast.success("Completed To-Dos cleared!");
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeTasksCount = todos.filter(todo => !todo.completed).length;
  const completedTasksCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-500 to-teal-600 p-4">
      <Card className="w-full max-w-2xl mt-8 shadow-xl rounded-xl animate-fade-in-up">
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ListTodo className="h-8 w-8 text-blue-600" />
            Hello, {user?.name || "Guest"}!
          </CardTitle>
          <Button onClick={logout} variant="outline" className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 ease-in-out">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-6 text-center">Manage your tasks efficiently and beautifully.</p>

          {/* Add New To-Do Form */}
          <form onSubmit={handleAddTodo} className="space-y-4 mb-8 p-6 border border-blue-200 rounded-lg shadow-md bg-blue-50 animate-slide-in-down">
            <h3 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
              <Plus className="h-5 w-5" /> Add a New To-Do
            </h3>
            <div>
              <Label htmlFor="newTodoTitle" className="sr-only">To-Do Title</Label>
              <Input
                id="newTodoTitle"
                placeholder="What needs to be done?"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                className="w-full border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="newTodoDescription" className="sr-only">Description (Optional)</Label>
              <Textarea
                id="newTodoDescription"
                placeholder="Add a description (optional)"
                value={newTodoDescription}
                onChange={(e) => setNewTodoDescription(e.target.value)}
                className="w-full min-h-[60px] border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105">
              <Plus className="h-4 w-4" /> Add To-Do
            </Button>
          </form>

          {/* Task Counts */}
          <div className="flex justify-center gap-6 mb-6 text-gray-700 font-medium animate-fade-in">
            <p className="flex items-center gap-2">
              <CircleDot className="h-5 w-5 text-blue-500" /> Active: {activeTasksCount}
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> Completed: {completedTasksCount}
            </p>
          </div>

          {/* Filter and Clear Completed */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 animate-fade-in">
            <ToggleGroup type="single" value={filter} onValueChange={(value: FilterType) => value && setFilter(value)} className="grid grid-cols-3 w-full sm:w-auto">
              <ToggleGroupItem value="all" aria-label="Show all todos" className="flex-grow flex items-center gap-2">
                <ListTodo className="h-4 w-4" /> All
              </ToggleGroupItem>
              <ToggleGroupItem value="active" aria-label="Show active todos" className="flex-grow flex items-center gap-2">
                <CircleDot className="h-4 w-4" /> Active
              </ToggleGroupItem>
              <ToggleGroupItem value="completed" aria-label="Show completed todos" className="flex-grow flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="outline"
              onClick={handleClearCompleted}
              disabled={todos.filter(t => t.completed).length === 0}
              className="w-full sm:w-auto flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300 ease-in-out"
            >
              <Trash2 className="h-4 w-4" /> Clear Completed
            </Button>
          </div>

          {/* To-Do List */}
          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 animate-fade-in flex flex-col items-center gap-4">
                <ListTodo className="h-12 w-12 text-gray-400" />
                <p className="text-lg font-medium">
                  {filter === "all" && "No tasks yet! Your productivity journey starts here."}
                  {filter === "active" && "No active tasks. Time to relax or add new ones!"}
                  {filter === "completed" && "No completed tasks. Get to work!"}
                </p>
                <p className="text-sm text-gray-400">
                  {filter === "all" && "Add your first To-Do above to get started."}
                  {filter === "active" && "All tasks are completed or none exist."}
                  {filter === "completed" && "Complete a task to see it here."}
                </p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ease-in-out",
                    todo.completed ? "opacity-50 bg-green-50 border-green-200 scale-[0.98]" : "hover:shadow-md hover:border-blue-300",
                    "animate-fade-in-left"
                  )}
                >
                  <div className="flex items-start space-x-3 flex-grow">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo.id)}
                      className="h-5 w-5 mt-1 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                    />
                    <div className="grid gap-0.5">
                      <Label
                        htmlFor={`todo-${todo.id}`}
                        className={cn(
                          "text-lg font-medium leading-none",
                          todo.completed ? "text-gray-500 line-through" : "text-gray-800"
                        )}
                      >
                        {todo.title}
                      </Label>
                      {todo.description && (
                        <p className={cn(
                          "text-sm text-gray-500",
                          todo.completed && "text-gray-400 line-through"
                        )}>
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTodo(todo)}
                      className="text-blue-500 hover:bg-blue-100 transition-transform duration-200 ease-in-out hover:scale-110"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-100 transition-transform duration-200 ease-in-out hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="animate-scale-in">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            "{todo.title}" To-Do item.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTodo(todo.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit To-Do Dialog */}
      {editingTodo && (
        <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
          <DialogContent className="sm:max-w-[425px] animate-scale-in">
            <DialogHeader>
              <DialogTitle>Edit To-Do</DialogTitle>
              <DialogDescription>
                Make changes to your To-Do item here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTitle" className="text-right">
                  Title
                </Label>
                <Input
                  id="editTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDescription" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="col-span-3 min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTodo(null)}>Cancel</Button>
              <Button type="submit" onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TodoApp;