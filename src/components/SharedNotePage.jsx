import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  Tag as TagIcon, 
  User, 
  Lock,
  Share2,
  ExternalLink 
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";

export default function SharedNotePage() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Query để lấy shared note (cần tạo API endpoint mới trong Convex)
  const sharedNote = useQuery(
    api.notes.getSharedNote,
    noteId ? { noteId } : "skip"
  );

  const formatDate = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown date";
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  // Loading state
  if (sharedNote === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Note not found or not shared
  if (!sharedNote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-6">
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
              style={{ background: 'var(--gradient-primary)' }}
            ></div>
            <Lock className="relative size-20 text-slate-300" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Note Not Found
          </h1>
          <p className="text-slate-600 mb-8">
            This note doesn't exist, hasn't been shared, or is no longer available.
          </p>
          
          <Button
            onClick={() => navigate("/")}
            className="text-white shadow-lg"
            style={{
              background: 'var(--gradient-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--gradient-primary)';
            }}
          >
            <ArrowLeft className="size-4 mr-2" />
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Share2 className="size-4" />
                <span className="hidden sm:inline font-medium">Shared Note</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              <ExternalLink className="size-4" />
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Note Header */}
        <article className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Title Section */}
          <div className="p-8 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
            <h1 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
              {sharedNote.title || "Untitled Note"}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap gap-6 text-sm">
              {/* Author */}
              {sharedNote.authorName && (
                <div className="flex items-center gap-2 text-slate-600">
                  <div 
                    className="size-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'var(--gradient-primary)',
                      opacity: 0.1
                    }}
                  >
                    <User className="size-4" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Author</p>
                    <p className="font-semibold text-slate-700">{sharedNote.authorName}</p>
                  </div>
                </div>
              )}

              {/* Last Updated */}
              <div className="flex items-center gap-2 text-slate-600">
                <div 
                  className="size-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'var(--gradient-primary)',
                    opacity: 0.1
                  }}
                >
                  <Calendar className="size-4" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="font-semibold text-slate-700">{formatDate(sharedNote.updatedAt)}</p>
                </div>
              </div>

              {/* Tags */}
              {sharedNote.tags && sharedNote.tags.length > 0 && (
                <div className="flex items-center gap-2 text-slate-600">
                  <div 
                    className="size-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'var(--gradient-primary)',
                      opacity: 0.1
                    }}
                  >
                    <TagIcon className="size-4" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tags</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {sharedNote.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          className="text-xs px-2 py-0.5 font-medium rounded-full"
                          style={{
                            background: 'var(--gradient-primary)',
                            color: 'white'
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                      {sharedNote.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            borderColor: 'var(--color-primary)',
                            color: 'var(--color-primary)'
                          }}
                        >
                          +{sharedNote.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {sharedNote.content ? (
              <div
                className="prose prose-slate max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sharedNote.content }}
              />
            ) : (
              <p className="text-slate-400 italic text-center py-12">
                This note has no content yet.
              </p>
            )}
          </div>
        </article>

        {/* Footer CTA */}
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-slate-200 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Like what you see?
            </h3>
            <p className="text-slate-600 mb-6">
              Create your own beautiful notes with Notes.io
            </p>
            <Button
              onClick={() => navigate("/")}
              className="text-white shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: 'var(--gradient-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary)';
              }}
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </div>

      {/* Branding Footer */}
      <footer className="mt-12 py-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            Powered by{" "}
            <button
              onClick={() => navigate("/")}
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Truong Tan Dat - Notes.io
            </button>
            {" "}· Simple, Beautiful Note-Taking
          </p>
        </div>
      </footer>
    </div>
  );
}