import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  Eye, 
  Calendar, 
  TrendingUp, 
  ExternalLink,
  BarChart3,
  Clock
} from "lucide-react";

// Helper function to format time ago
function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function NoteAnalytics({ noteId }) {
  const analytics = useQuery(
    api.notes.getNoteAnalytics,
    noteId ? { noteId } : "skip"
  );

  if (!analytics) {
    return (
      <div className="border border-slate-200 rounded-xl shadow-lg bg-white">
        <div className="p-6">
          <h3 className="text-lg font-bold">Share Analytics</h3>
          <p className="text-sm text-slate-600 mt-1">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { viewCount, lastViewedAt, viewers, uniqueReferrers, viewsByDay } = analytics;

  return (
    <div className="border border-slate-200 rounded-xl shadow-lg bg-white">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="size-5" style={{ color: 'var(--color-primary)' }} />
              Share Analytics
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Track how your shared note is performing
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Views */}
          <div className="p-4 rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <div 
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 4px 12px -2px var(--shadow-primary)'
                }}
              >
                <Eye className="size-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{viewCount}</p>
                <p className="text-xs text-slate-600">Total Views</p>
              </div>
            </div>
          </div>

          {/* Last Viewed */}
          <div className="p-4 rounded-lg border border-slate-200 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-purple-500 flex items-center justify-center shadow-lg">
                <Clock className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {lastViewedAt ? timeAgo(lastViewedAt) : "Never"}
                </p>
                <p className="text-xs text-slate-600">Last Viewed</p>
              </div>
            </div>
          </div>

          {/* Unique Referrers */}
          <div className="p-4 rounded-lg border border-slate-200 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-green-500 flex items-center justify-center shadow-lg">
                <ExternalLink className="size-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {uniqueReferrers?.length || 0}
                </p>
                <p className="text-xs text-slate-600">Unique Sources</p>
              </div>
            </div>
          </div>
        </div>

        {/* Views by Day Chart */}
        {viewsByDay && viewsByDay.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <TrendingUp className="size-4" style={{ color: 'var(--color-primary)' }} />
              Views by Day
            </h3>
            <div className="space-y-2">
              {viewsByDay.slice(-7).map((day, index) => {
                const maxCount = Math.max(...viewsByDay.map(d => d.count));
                const percentage = (day.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-24">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                      <div 
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                        style={{ 
                          width: `${Math.max(percentage, 10)}%`,
                          background: 'var(--gradient-primary)'
                        }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {day.count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Viewers */}
        {viewers && viewers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="size-4" style={{ color: 'var(--color-primary)' }} />
              Recent Views ({viewers.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {viewers.slice(-10).reverse().map((viewer, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">
                      {timeAgo(viewer.viewedAt)}
                    </span>
                    <span className="px-2 py-1 bg-white border border-slate-300 rounded-full text-xs">
                      View #{viewers.length - index}
                    </span>
                  </div>
                  {viewer.referrer && (
                    <p className="text-slate-600 truncate">
                      <span className="font-medium">From:</span> {viewer.referrer}
                    </p>
                  )}
                  {viewer.userAgent && (
                    <p className="text-slate-500 truncate mt-1">
                      {viewer.userAgent}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Views State */}
        {viewCount === 0 && (
          <div className="text-center py-8">
            <div 
              className="size-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--color-primary-50)' }}
            >
              <Eye className="size-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">No views yet</p>
            <p className="text-sm text-slate-500">
              Share your note to start tracking views!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}