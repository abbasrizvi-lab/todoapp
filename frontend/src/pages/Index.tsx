"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Settings } from "lucide-react";

const Index = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on authentication status
    if (isLoggedIn) {
      navigate("/todos");
    } else {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  // While redirecting, show a minimal loading indicator
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="mb-8">
        <Settings
          className="w-16 h-16 text-gray-400 animate-spin"
          style={{ animationDuration: "3s" }}
        />
      </div>
      <h1 className="text-xl font-medium text-gray-300 text-center max-w-md">
        Loading your experience...
      </h1>
    </div>
  );
};

export default Index;