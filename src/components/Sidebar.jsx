import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";

import React from "react";
import {
  NotebookIcon,
  Archive,
  Search,
  Tag,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/clerk-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const tags = useQuery(
    api.notes.getUserTags,
    user ? { userId: user.id } : "skip",
  );

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col h-screen relative shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-auto pb-20">
        <div className="space-y-2">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200",
              isActive("/")
                ? "text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800/70 hover:text-white hover:translate-x-1",
            )}
            style={
              isActive("/")
                ? {
                    background: "var(--gradient-primary)",
                    boxShadow: "0 10px 25px -5px var(--shadow-primary)",
                  }
                : {}
            }
            onClick={() => navigate("/")}
            title="All Notes (Ctrl + 1)"
          >
            <NotebookIcon className="size-5" /> All Notes
            <span className="ml-auto text-xs opacity-75 font-mono">Ctrl + 1</span>
          </Button>

          <Button
            variant={isActive("/archived") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200",
              isActive("/archived")
                ? "text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800/70 hover:text-white hover:translate-x-1",
            )}
            style={
              isActive("/archived")
                ? {
                    background: "var(--gradient-primary)",
                    boxShadow: "0 10px 25px -5px var(--shadow-primary)",
                  }
                : {}
            }
            onClick={() => navigate("/archived")}
            title="Archived Notes (Ctrl+2)"
          >
            <Archive className="size-5" /> Archived
            <span className="ml-auto text-xs opacity-75 font-mono">Ctrl + 2</span>
          </Button>

          <Button
            variant={isActive("/search") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200",
              isActive("/search")
                ? "text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800/70 hover:text-white hover:translate-x-1",
            )}
            style={
              isActive("/search")
                ? {
                    background: "var(--gradient-primary)",
                    boxShadow: "0 10px 25px -5px var(--shadow-primary)",
                  }
                : {}
            }
            onClick={() => navigate("/search")}
            title="Search Notes (Ctrl+3)"
          >
            <Search className="size-5" /> Search
            <span className="ml-auto text-xs opacity-75 font-mono">Ctrl + 3</span>
          </Button>

          <Button
            variant={isActive("/settings") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200",
              isActive("/settings")
                ? "text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800/70 hover:text-white hover:translate-x-1",
            )}
            style={
              isActive("/settings")
                ? {
                    background: "var(--gradient-primary)",
                    boxShadow: "0 10px 25px -5px var(--shadow-primary)",
                  }
                : {}
            }
            onClick={() => navigate("/settings")}
            title="Settings (Ctrl+4)"
          >
            <Settings className="size-5" /> Settings
            <span className="ml-auto text-xs opacity-75 font-mono">Ctrl + 4</span>
          </Button>
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
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white hover:translate-x-1",
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
                  onClick={() => navigate(`/tags/${tag}`)}
                >
                  <Tag className="size-4" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="absolute bottom-0 z-10 w-full border-t border-slate-700/50 py-4 px-4 bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-sm">
        <SignOutButton>
          <Button
            className="w-full cursor-pointer bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            size="sm"
          >
            <LogOut className="size-4" /> Log out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
