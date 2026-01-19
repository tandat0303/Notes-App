import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

import {
  NotebookIcon,
  Archive,
  Search,
  Tag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/clerk-react";

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const tags = useQuery(
    api.notes.getUserTags,
    user ? { userId: user.id } : "skip",
  );

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-collapse on tablet
      if (window.innerWidth < 1280 && window.innerWidth >= 1024) {
        setIsCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close mobile sidebar after navigation
    if (isMobile && setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col shadow-2xl transform transition-transform duration-300 lg:hidden",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile Header with Close */}
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                style={{
                  background: "var(--gradient-primary)",
                  boxShadow: "0 10px 25px -5px var(--shadow-primary)",
                }}
              >
                <NotebookIcon className="size-6 text-white" />
              </div>
              <span
                className="text-xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--color-primary-light), var(--color-primary))",
                }}
              >
                Notes.io
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="size-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-auto pb-20">
            <div className="space-y-2">
              <NavButton
                icon={NotebookIcon}
                label="All Notes"
                path="/"
                isActive={isActive("/")}
                onClick={() => handleNavigation("/")}
                shortcut="Ctrl + 1"
              />
              <NavButton
                icon={Archive}
                label="Archived"
                path="/archived"
                isActive={isActive("/archived")}
                onClick={() => handleNavigation("/archived")}
                shortcut="Ctrl + 2"
              />
              <NavButton
                icon={Search}
                label="Search"
                path="/search"
                isActive={isActive("/search")}
                onClick={() => handleNavigation("/search")}
                shortcut="Ctrl + 3"
              />
              <NavButton
                icon={Settings}
                label="Settings"
                path="/settings"
                isActive={isActive("/settings")}
                onClick={() => handleNavigation("/settings")}
                shortcut="Ctrl + 4"
              />
            </div>

            {/* Tags section */}
            {tags && tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-slate-400 px-3 mb-3 uppercase tracking-wide">
                  Tags
                </h3>
                <div className="space-y-1">
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 text-sm h-9 rounded-lg transition-all duration-200",
                        location.pathname === `/tags/${tag}`
                          ? "text-white"
                          : "text-slate-400 hover:bg-slate-800/70 hover:text-white hover:translate-x-1"
                      )}
                      style={
                        location.pathname === `/tags/${tag}`
                          ? {
                              background: "var(--gradient-primary)",
                              opacity: 0.7,
                              boxShadow:
                                "0 4px 15px -3px var(--shadow-primary-light)",
                            }
                          : {}
                      }
                      onClick={() => handleNavigation(`/tags/${tag}`)}
                    >
                      <Tag className="size-4" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Logout */}
          <div className="border-t border-slate-700/50 py-4 px-4 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
            <SignOutButton>
              <Button 
                className="w-full cursor-pointer text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 10px 25px -5px var(--shadow-primary)'
                }}
              >
                <LogOut className="size-4" /> Log out
              </Button>
            </SignOutButton>
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div
      className={cn(
        "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col h-screen relative shadow-2xl transition-all duration-300 hidden lg:flex",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 z-10 size-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors duration-200 group"
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {isCollapsed ? (
          <ChevronRight className="size-4 text-slate-400 group-hover:text-white" />
        ) : (
          <ChevronLeft className="size-4 text-slate-400 group-hover:text-white" />
        )}
      </button>

      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 flex-shrink-0"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 10px 25px -5px var(--shadow-primary)",
            }}
          >
            <NotebookIcon className="size-6 text-white" />
          </div>
          {!isCollapsed && (
            <span
              className="text-xl font-bold bg-clip-text text-transparent whitespace-nowrap"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-primary-light), var(--color-primary))",
              }}
            >
              Notes.io
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-auto pb-20">
        <div className="space-y-2">
          <NavButton
            icon={NotebookIcon}
            label="All Notes"
            path="/"
            isActive={isActive("/")}
            onClick={() => handleNavigation("/")}
            shortcut="Ctrl + 1"
            isCollapsed={isCollapsed}
          />
          <NavButton
            icon={Archive}
            label="Archived"
            path="/archived"
            isActive={isActive("/archived")}
            onClick={() => handleNavigation("/archived")}
            shortcut="Ctrl + 2"
            isCollapsed={isCollapsed}
          />
          <NavButton
            icon={Search}
            label="Search"
            path="/search"
            isActive={isActive("/search")}
            onClick={() => handleNavigation("/search")}
            shortcut="Ctrl + 3"
            isCollapsed={isCollapsed}
          />
          <NavButton
            icon={Settings}
            label="Settings"
            path="/settings"
            isActive={isActive("/settings")}
            onClick={() => handleNavigation("/settings")}
            shortcut="Ctrl + 4"
            isCollapsed={isCollapsed}
          />
        </div>

        {/* Tags section */}
        {tags && tags.length > 0 && !isCollapsed && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-400 px-3 mb-3 uppercase tracking-wide">
              Tags
            </h3>
            <div className="space-y-1">
              {tags.map((tag) => (
                <Button
                  key={tag}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 text-sm h-9 rounded-lg transition-all duration-200",
                    location.pathname === `/tags/${tag}`
                      ? "text-white"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white hover:translate-x-1"
                  )}
                  style={
                    location.pathname === `/tags/${tag}`
                      ? {
                          background: "var(--gradient-primary)",
                          opacity: 0.7,
                          boxShadow:
                            "0 4px 15px -3px var(--shadow-primary-light)",
                        }
                      : {}
                  }
                  onClick={() => handleNavigation(`/tags/${tag}`)}
                >
                  <Tag className="size-4" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-700/50 py-4 px-4 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
        <SignOutButton>
          <Button
            className={cn(
              "cursor-pointer text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
              isCollapsed ? "w-12 h-12 p-0" : "w-full"
            )}
            style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 10px 25px -5px var(--shadow-primary)'
                }}
            size="sm"
            title={isCollapsed ? "Log out" : ""}
          >
            <LogOut className="size-4" />
            {!isCollapsed && <span className="ml-2">Log out</span>}
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}

// Reusable Nav Button Component
function NavButton({ icon: Icon, label, path, isActive, onClick, shortcut, isCollapsed }) {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "rounded-lg transition-all duration-200",
        isCollapsed ? "w-12 h-12 p-0 justify-center" : "w-full justify-start gap-3 h-11",
        isActive
          ? "text-white shadow-lg"
          : "text-slate-300 hover:bg-slate-800/70 hover:text-white hover:translate-x-1"
      )}
      style={
        isActive
          ? {
              background: "var(--gradient-primary)",
              boxShadow: "0 10px 25px -5px var(--shadow-primary)",
            }
          : {}
      }
      onClick={onClick}
      title={isCollapsed ? label : `${label} (${shortcut})`}
    >
      <Icon className="size-5" />
      {!isCollapsed && (
        <>
          <span>{label}</span>
          <span className="ml-auto text-xs opacity-75 font-mono">{shortcut}</span>
        </>
      )}
    </Button>
  );
}