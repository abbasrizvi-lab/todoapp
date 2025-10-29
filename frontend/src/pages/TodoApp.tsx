"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

const TodoApp = () => {
  const { user, logout } = useAuth();

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
          <p className="text-gray-600 mb-6">Your personalized To-Do list will appear here.</p>
          {/* Placeholder for To-Do list and input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            <p className="text-lg">Start adding your tasks!</p>
            <p className="text-sm mt-2">This is where your To-Do input form and list will be built next.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoApp;