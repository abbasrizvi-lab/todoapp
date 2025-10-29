"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // Simulate authentication
    if (isLogin) {
      // For simplicity, any non-empty email/password combination "logs in"
      // In a real app, you'd check against stored credentials.
      const storedUsers = JSON.parse(localStorage.getItem("users") || "{}");
      if (storedUsers[email] && storedUsers[email].password === password) {
        login(email, storedUsers[email].id);
        toast.success("Logged in successfully!");
        navigate("/todos");
      } else {
        toast.error("Invalid email or password.");
      }
    } else {
      // Simulate registration
      const storedUsers = JSON.parse(localStorage.getItem("users") || "{}");
      if (storedUsers[email]) {
        toast.error("User with this email already exists.");
      } else {
        const newUserId = `user-${Date.now()}`; // Simple unique ID
        const newUser = { id: newUserId, email, password };
        localStorage.setItem("users", JSON.stringify({ ...storedUsers, [email]: newUser }));
        login(email, newUserId);
        toast.success("Account created and logged in!");
        navigate("/todos");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            {isLogin ? "Welcome Back!" : "Join Us!"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isLogin ? "Log in to manage your tasks." : "Create an account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full py-2 text-lg bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105">
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-800 p-0 h-auto"
            >
              {isLogin ? "Register" : "Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;