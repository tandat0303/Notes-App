import { Archive, Home, Search, Settings, Tags } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      key: "home",
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      key: "search",
      label: "Search",
      icon: Search,
      path: "/search",
    },
    {
      key: "archived",
      label: "Archive",
      icon: Archive,
      path: "/archived",
    },
    {
      key: "tags",
      label: "Tags",
      icon: Tags,
      path: "/tags",
    },
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";

    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 shadow-2xl">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navItems.map((item) => (
          <Button
            key={item.key}
            variant="ghost"
            size="sm"
            onClick={() => navigate(item.path)}
            className={cn(
              "group flex flex-col gap-1.5 h-14 text-xs rounded-xl relative overflow-hidden",
              "transition-all duration-300 ease-out",
              isActive(item.path)
                ? "text-blue-600 font-medium"
                : "text-slate-600 hover:text-blue-600",
            )}
          >
            {/* Active indicator */}
            {isActive(item.path) && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 -z-10" />
            )}

            {/* Icon with animation */}
            <div
              className={cn(
                "relative transition-all duration-300",
                isActive(item.path)
                  ? "scale-110"
                  : "group-hover:scale-110 group-hover:-translate-y-0.5",
              )}
            >
              <item.icon
                className={cn(
                  "size-5 transition-all duration-300",
                  isActive(item.path) && "drop-shadow-sm",
                )}
              />

              {/* Active dot indicator */}
              {isActive(item.path) && (
                <div className="absolute -top-1 -right-1 size-2 bg-blue-600 rounded-full animate-pulse" />
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                "leading-none transition-all duration-300",
                isActive(item.path) && "font-semibold",
              )}
            >
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
