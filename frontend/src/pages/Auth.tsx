"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // New state for user's name
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!email || !password || (!isLogin && !name)) {
      toast.error("All fields are required.");
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

    const url = isLogin
      ? `${API_BASE_URL}/api/v1/auth/login`
      : `${API_BASE_URL}/api/v1/auth/signup`;

    const body = isLogin
      ? JSON.stringify({ email, password })
      : JSON.stringify({ name, email, password });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      console.log("👉 Fetching from:", url);


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "An error occurred.");
      }

      // Assuming the backend returns a user object and a token
      if (isLogin) {
        console.log(data)
        console.log("API_BASE_URL:", API_BASE_URL);
        const { user: userData, access_token: token } = data;
        const user = { ...userData, id: userData._id };
        login(user, token);
      } else {
        console.log(data)
        console.log("API_BASE_URL:", API_BASE_URL);
        const { access_token: token } = data;
        const user = { name, email, id: data._id };
        login(user, token);
      }
      toast.success(isLogin ? "Logged in successfully!" : "Account created and logged in!");
      navigate("/todos");
    } catch (error) {
      console.log(error)
      toast.error((error as Error).message);
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
            {!isLogin && ( // Show name input only for registration
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            )}
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
              onClick={() => {
                setIsLogin(!isLogin);
                // Clear form fields when switching between login/register
                setEmail("");
                setPassword("");
                setName("");
              }}
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