"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LogOut, Plus, Edit, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
}

const TodoApp = () => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const userTodosKey = useMemo(() => `todos-${user?.id}`, [user?.id]);

  // Load todos from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      const storedTodos = localStorage.getItem(userTodosKey);
      if (storedTodos) {
        try {
          setTodos(JSON.parse(storedTodos));
        } catch (error) {
          console.error("Failed to parse todos from localStorage", error);
          localStorage.removeItem(userTodosKey);
        }
      }
    }
  }, [user?.id, userTodosKey]);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(userTodosKey, JSON.stringify(todos));
    }
  }, [todos, user?.id, userTodosKey]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) {
      toast.error("To-Do title cannot be empty.");
      return;
    }

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title: newTodoTitle.trim(),
      description: newTodoDescription.trim(),
      completed: false,
      userId: user!.id,
    };

    setTodos((prevTodos) => [...prevTodos, newTodo]);
    setNewTodoTitle("");
    setNewTodoDescription("");
    toast.success("To-Do added successfully!");
  };

  const handleToggleComplete = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    toast.info("To-Do status updated!");
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    toast.success("To-Do deleted!");
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  };

  const handleSaveEdit = () => {
    if (!editingTodo) return;
    if (!editTitle.trim()) {
      toast.error("To-Do title cannot be empty.");
      return;
    }

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === editingTodo.id
          ? { ...todo, title: editTitle.trim(), description: editDescription.trim() }
          : todo
      )
    );
    setEditingTodo(null);
    toast.success("To-Do updated successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-500 to-teal-600 p-4">
      <Card className="w-full max-w-2xl mt-8 shadow-xl animate-fade-in-up">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Hello, {user?.email || "Guest"}!
          </CardTitle>
          <Button onClick={logout} variant="outline" className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 ease-in-out">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">Manage your tasks efficiently.</p>

          {/* Add New To-Do Form */}
          <form onSubmit={handleAddTodo} className="space-y-4 mb-8 p-4 border rounded-lg shadow-sm bg-gray-50 animate-slide-in-down">
            <h3 className="text-xl font-semibold text-gray-700">Add a New To-Do</h3>
            <div>
              <Label htmlFor="newTodoTitle" className="sr-only">To-Do Title</Label>
              <Input
                id="newTodoTitle"
                placeholder="What needs to be done?"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                className="w-full"
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
                className="w-full min-h-[60px]"
              />
            </div>
            <Button type="submit" className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105">
              <Plus className="h-4 w-4" /> Add To-Do
            </Button>
          </form>

          {/* To-Do List */}
          <div className="space-y-4">
            {todos.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 animate-fade-in">
                <p className="text-lg">No tasks yet! Add one above.</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "flex items-center justify-between p-4 bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out",
                    todo.completed ? "opacity-60 line-through bg-green-50" : "hover:shadow-md",
                    "animate-fade-in-left" // Animation for list items
                  )}
                >
                  <div className="flex items-center space-x-3 flex-grow">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo.id)}
                      className="h-5 w-5"
                    />
                    <div className="grid gap-1.5">
                      <Label
                        htmlFor={`todo-${todo.id}`}
                        className={cn(
                          "text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                          todo.completed ? "text-gray-500" : "text-gray-800"
                        )}
                      >
                        {todo.title}
                      </Label>
                      {todo.description && (
                        <p className={cn(
                          "text-sm text-gray-500",
                          todo.completed && "text-gray-400"
                        )}>
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTodo(todo)}
                      className="text-blue-500 hover:bg-blue-50 transition-transform duration-200 ease-in-out hover:scale-110"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 transition-transform duration-200 ease-in-out hover:scale-110"
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