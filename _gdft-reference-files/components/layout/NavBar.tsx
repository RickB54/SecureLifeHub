
// We need to add the Calendar link to the bottom navigation
// I'll add it between Plans and Settings in the menu items array

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Dumbbell, 
  Play, 
  BarChart2, 
  Settings,
  ClipboardList,
  CalendarDays,
  User,
  Activity
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NavBar = () => {
  const location = useLocation();
  const { user } = useAuth(); // Assuming useAuth is exported and available
  
  const menuItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/exercises", icon: Dumbbell, label: "Exercises" },
    { path: "/workout", icon: Play, label: "Workout" },
    { path: "/stats", icon: BarChart2, label: "Stats" },
    { path: "/health-dashboard", icon: Activity, label: "Health" },
    { path: "/custom-plans", icon: ClipboardList, label: "Plans" },
    { path: "/my-calendar", icon: CalendarDays, label: "Calendar" },
    // Show Settings if logged in, otherwise show Login
    { 
      path: user ? "/settings" : "/login", 
      icon: user ? Settings : User, 
      label: user ? "Settings" : "Login" 
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gym-dark border-t border-gray-800 flex justify-around items-center z-[100]">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            location.pathname === item.path
              ? "text-gym-blue"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;
