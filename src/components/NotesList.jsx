import React from "react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "./ui/badge";
import { Clock, FileText } from "lucide-react";

export default function NotesList({
  notes,
  selectedNoteId,
  onNoteSelect,
  loading,
}) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200"
          >
            <Skeleton className="h-5 w-3/4 bg-slate-200" />
            <Skeleton className="h-4 w-full bg-slate-200" />
            <Skeleton className="h-4 w-2/3 bg-slate-200" />

            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 bg-slate-200 rounded-full" />
              <Skeleton className="h-6 w-20 bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="size-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500 font-medium">No notes found</p>
        <p className="text-sm text-slate-400 mt-1">
          {!window.location.pathname.includes("archived")
            ? "Create your first note to get started"
            : "You haven't archived any notes yet."}
        </p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const truncateContent = (content, maxLength = 80) => {
    if (!content) return "";

    const plainText = content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > maxLength
      ? plainText.slice(0, maxLength) + "..."
      : plainText;
  };

  return (
    <div className="p-3 space-y-2">
      {notes.map((note) => (
        <button
          key={note._id}
          onClick={() => onNoteSelect(note._id)}
          className={cn(
            "w-full p-4 text-left rounded-xl transition-all duration-300 group relative overflow-hidden",
            "hover:shadow-md hover:-translate-y-0.5",
            selectedNoteId === note._id
              ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg shadow-blue-100/50"
              : "bg-white border border-slate-200 hover:border-blue-200",
          )}
        >
          {/* Selected indicator */}
          {selectedNoteId === note._id && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-full"></div>
          )}

          <div className="space-y-3 pl-2">
            <h3
              className={cn(
                "font-semibold text-base line-clamp-1 transition-colors duration-200",
                selectedNoteId === note._id
                  ? "text-slate-900"
                  : "text-slate-800 group-hover:text-blue-600",
              )}
            >
              {note.title || "Untitled"}
            </h3>

            {note.content && (
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {truncateContent(note.content)}
              </p>
            )}

            <div className="flex flex-wrap gap-2 items-center justify-between pt-1">
              <div className="flex gap-1.5 flex-wrap">
                {note.tags?.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    className={cn(
                      "text-xs px-2.5 py-0.5 font-medium rounded-full transition-all duration-200",
                      selectedNoteId === note._id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
                    )}
                  >
                    {tag}
                  </Badge>
                ))}

                {note.tags?.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2.5 py-0.5 border-blue-300 text-blue-600 bg-blue-50/50 rounded-full font-medium"
                  >
                    +{note.tags.length - 3}
                  </Badge>
                )}
              </div>

              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="size-3" />
                {formatDate(note.updatedAt)}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
