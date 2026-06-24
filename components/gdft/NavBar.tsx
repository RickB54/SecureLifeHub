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
// Rewired to use SLH's auth provider instead of GDFT's old AuthContext
import { useAuth } from "@/components/auth-provider";

const NavBar = () => {
  const location = useLocation();
  const { user } = useAuth(); // Using SLH's useAuth which provides user
  
  const menuItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/exercises", icon: Dumbbell, label: "Exercises" },
    { path: "/workout", icon: Play, label: "Workout" },
    { path: "/stats", icon: BarChart2, label: "Stats" },
    { path: "/health-dashboard", icon: Activity, label: "Health" },
    { path: "/custom-plans", icon: ClipboardList, label: "Plans" },
    { path: "/my-calendar", icon: CalendarDays, label: "Calendar" },
    { path: "/settings", icon: Settings, label: "Settings" }
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
