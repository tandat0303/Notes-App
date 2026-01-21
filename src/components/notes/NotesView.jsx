import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Plus, Search, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotesList from "./NotesList";
import NotePreview from "./NotePreview";
import { api } from "../../../convex/_generated/api";
import { NotebookIcon } from "lucide-react";

export default function NotesView() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const notes = useQuery(
    api.notes.getNotes,
    user ? { userId: user.id, isArchived: false } : "skip"
  );

  //Test get token
  // const me = useQuery(api.users.whoami);
  // console.log(me);

  // const debug = useQuery(api.debug.authDebug);
  // console.log("AUTH DEBUG:", debug);


  const searchResults = useQuery(
    api.notes.searchNotes,
    user && searchTerm.trim()
      ? { userId: user.id, searchTerm: searchTerm.trim() }
      : "skip"
  );

  const displayNotes = searchTerm.trim() ? searchResults : notes;
  const selectedNote = displayNotes?.find(
    (note) => note._id === selectedNoteId
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Auto-select first note if none selected and notes available
    if (displayNotes?.length && !selectedNoteId && !isMobile) {
      setSelectedNoteId(displayNotes[0]._id);
    }
  }, [displayNotes, selectedNoteId, isMobile]);

  const handleCreateNew = () => {
    navigate("/new");
  };

  const handleNoteSelect = (noteId) => {
    if (isMobile) {
      navigate(`/note/${noteId}`);
    } else {
      setSelectedNoteId(noteId);
    }
  };

  const handleSearchFocus = () => {
    if (isMobile) {
      navigate("/search");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Notes List Panel */}
      <div className="w-full md:w-80 flex flex-col border-r border-slate-200 bg-white/50 backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
          <div className="flex flex-col items-start justify-between mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="size-8 rounded-lg flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 10px 25px -5px var(--shadow-primary)'
                }}
              >
                <NotebookIcon className="size-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                All Notes
              </h1>
            </div>
            
            <div className="flex items-center justify-between gap-2 w-full">
              <Button
                size="sm"
                onClick={handleCreateNew}
                className="text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg"
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
                <Plus className="size-4" />
                New Note
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/settings")}
                className="hover:bg-slate-100 rounded-lg"
              >
                <Settings className="size-4 text-slate-600" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative group">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400 transition-colors duration-200"
              style={{
                color: 'var(--color-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            />
            <Input
              placeholder="Search by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              className="pl-10 border-slate-300 rounded-lg transition-all duration-200 bg-white focus:ring-2"
              style={{
                '--tw-ring-color': 'var(--color-primary-200)'
              }}
              onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '';
              }}
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/50 to-slate-50/50">
          <NotesList
            notes={displayNotes || []}
            selectedNoteId={selectedNoteId}
            onNoteSelect={handleNoteSelect}
            loading={!displayNotes}
          />
        </div>
      </div>

      {/* Note Preview Panel - Desktop Only */}
      {!isMobile && (
        <div className="flex-1 min-w-0 bg-white">
          {selectedNote ? (
            <NotePreview
              note={selectedNote}
              onEdit={() => navigate(`/note/${selectedNote._id}`)}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              {displayNotes?.length === 0 ? (
                <div className="text-center animate-in fade-in duration-500">
                  <div className="relative inline-block mb-6">
                    <div 
                      className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
                      style={{
                        background: 'var(--gradient-primary)'
                      }}
                    ></div>
                    <NotebookIcon className="relative w-16 h-16 mx-auto text-slate-300" />
                  </div>
                  <p className="text-xl font-semibold text-slate-700 mb-2">No notes yet</p>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                    Create your first note to get started on your journey
                  </p>
                  <Button 
                    onClick={handleCreateNew}
                    className="text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
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
                    <Sparkles className="size-4" />
                    Create First Note
                  </Button>
                </div>
              ) : (
                <div className="text-center animate-in fade-in duration-500">
                  <div 
                    className="size-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(to bottom right, var(--color-primary-100), var(--color-primary-200))'
                    }}
                  >
                    <NotebookIcon 
                      className="size-8"
                      style={{ color: 'var(--color-primary)' }}
                    />
                  </div>
                  <p className="text-lg font-medium text-slate-700">Select a note to view</p>
                  <p className="text-sm text-slate-500 mt-1">Choose from the list on the left</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}