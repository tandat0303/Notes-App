import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { Clock, FileText, Lock } from 'lucide-react';

export default function NotesList({ notes, selectedNoteId, onNoteSelect, loading }) {
  if (loading) {
    return (
      <div className='p-4 space-y-3'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='space-y-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200'>
            <Skeleton className="h-5 w-3/4 bg-slate-200" />
            <Skeleton className="h-4 w-full bg-slate-200" />
            <Skeleton className="h-4 w-2/3 bg-slate-200" />

            <div className='flex gap-2'>
              <Skeleton className="h-6 w-16 bg-slate-200 rounded-full" />
              <Skeleton className="h-6 w-20 bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!notes || notes.length === 0) {
    return (
      <div className='p-8 text-center'>
        <FileText className='size-12 mx-auto mb-3 text-slate-300' />
        <p className='text-slate-500 font-medium'>No notes found</p>
        <p className='text-sm text-slate-400 mt-1'>Create your first note to get started</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  }

  const truncateContent = (content, maxLength = 80) => {
    if (!content) return "";

    const plainText = content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > maxLength ? plainText.slice(0, maxLength) + "..." : plainText;
  }

  return (
    <div className='p-3 space-y-2'>
      {notes.map((note) => {
        const isLocked = note.isLocked || false;
        
        return (
          <button 
            key={note._id} 
            onClick={() => onNoteSelect(note._id)}
            className={cn(
              "w-full p-4 text-left rounded-xl transition-all duration-300 group relative overflow-hidden",
              "hover:shadow-md hover:-translate-y-0.5",
              selectedNoteId === note._id 
                ? "shadow-lg border-2" 
                : "bg-white border border-slate-200",
              isLocked && "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white"
            )}
            style={selectedNoteId === note._id ? {
              background: isLocked 
                ? 'linear-gradient(to bottom right, #fef3c7, #fed7aa)'
                : 'linear-gradient(to bottom right, var(--color-primary-50), var(--color-primary-100))',
              borderColor: isLocked ? '#fbbf24' : 'var(--color-primary-200)',
              boxShadow: isLocked 
                ? '0 10px 25px -5px rgba(245, 158, 11, 0.2)'
                : '0 10px 25px -5px var(--shadow-primary-light)'
            } : {}}
          >
            {/* Selected indicator */}
            {selectedNoteId === note._id && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                style={{
                  background: isLocked 
                    ? 'linear-gradient(to bottom, #f59e0b, #ea580c)'
                    : 'var(--gradient-primary)'
                }}
              ></div>
            )}

            <div className='space-y-3 pl-2'>
              {/* Title with Lock Icon */}
              <div className="flex items-start gap-2">
                <h3 
                  className={cn(
                    'font-semibold text-base line-clamp-1 transition-colors duration-200 flex-1',
                    selectedNoteId === note._id 
                      ? 'text-slate-900' 
                      : 'text-slate-800 group-hover:text-slate-900'
                  )}
                >
                  {note.title || "Untitled"}
                </h3>
                {isLocked && (
                  <Lock 
                    className="size-4 flex-shrink-0 mt-0.5"
                    style={{ color: '#f59e0b' }}
                  />
                )}
              </div>

              {/* Content Preview - Hidden if locked */}
              {!isLocked && note.content && (
                <p className='text-sm text-slate-600 line-clamp-2 leading-relaxed'>
                  {truncateContent(note.content)}
                </p>
              )}

              {/* Locked Message */}
              {isLocked && (
                <p className='text-sm text-amber-700 italic flex items-center gap-1.5'>
                  <Lock className="size-3" />
                  <span>This note is locked</span>
                </p>
              )}

              <div className='flex flex-wrap gap-2 items-center justify-between pt-1'>
                <div className='flex gap-1.5 flex-wrap'>
                  {note.tags?.slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index} 
                      className={cn(
                        "text-xs px-2.5 py-0.5 font-medium rounded-full transition-all duration-200",
                        selectedNoteId === note._id && isLocked
                          ? "bg-amber-600 text-white"
                          : selectedNoteId === note._id
                          ? "text-white"
                          : isLocked
                          ? "bg-amber-100 text-amber-700 border border-amber-300"
                          : ""
                      )}
                      style={selectedNoteId === note._id && !isLocked ? {
                        background: 'var(--gradient-primary)'
                      } : !isLocked && selectedNoteId !== note._id ? {
                        backgroundColor: 'var(--color-primary-50)',
                        color: 'var(--color-primary-700)',
                        borderColor: 'var(--color-primary-200)',
                        borderWidth: '1px'
                      } : {}}
                    >
                      {tag}
                    </Badge>
                  ))}

                  {note.tags?.length > 3 && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full font-medium",
                        isLocked && "border-amber-300 text-amber-600 bg-amber-50"
                      )}
                      style={!isLocked ? {
                        borderColor: 'var(--color-primary-300)',
                        color: 'var(--color-primary-600)',
                        backgroundColor: 'var(--color-primary-50)'
                      } : {}}
                    >
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <span className='flex items-center gap-1.5 text-xs text-slate-500 font-medium'>
                  <Clock className='size-3' />
                  {formatDate(note.updatedAt)}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  )
}