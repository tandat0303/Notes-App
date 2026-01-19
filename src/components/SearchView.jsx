import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NotesList from "./NotesList";
import NotePreview from "./NotePreview";
import { api } from "../../convex/_generated/api";

export default function SearchView() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const searchResults = useQuery(
    api.notes.searchNotes,
    user && searchTerm.trim()
      ? { userId: user.id, searchTerm: searchTerm.trim() }
      : "skip",
  );

  const selectedNote = searchResults?.find(
    (note) => note._id === selectedNoteId,
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (searchResults?.length && !selectedNoteId && !isMobile) {
      setSelectedNoteId(searchResults[0]._id);
    }
  }, [searchResults, selectedNoteId, isMobile]);

  const handleNoteSelect = (noteId) => {
    if (isMobile) {
      navigate(`/note/${noteId}`);
    } else {
      setSelectedNoteId(noteId);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="w-full md:w-80 flex flex-col border-r border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
          <div className="flex items-center gap-3 mb-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div
              className="size-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 10px 25px -5px var(--shadow-primary)",
              }}
            >
              <Search className="size-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Search
            </h1>
          </div>

          <div className="relative group">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200"
              style={{
                color: document.querySelector(":focus-within")
                  ? "var(--color-primary)"
                  : "",
              }}
            />
            <Input
              placeholder="Search by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 rounded-lg"
              style={{
                "--tw-ring-color": "var(--color-primary-200)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "";
              }}
              autoFocus
            />
          </div>

          {searchTerm.trim() && (
            <p className="text-sm text-slate-600 mt-2 flex items-center gap-1.5">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: "var(--color-primary)" }}
              ></span>
              {searchResults?.length || 0} results for "{searchTerm}"
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/50 to-slate-50/50">
          {searchTerm.trim() ? (
            <NotesList
              notes={searchResults || []}
              selectedNoteId={selectedNoteId}
              onNoteSelect={handleNoteSelect}
              loading={searchTerm.trim() && !searchResults}
            />
          ) : (
            <div className="p-8 text-center animate-in fade-in duration-500">
              <div className="relative inline-block mb-6">
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse"
                  style={{ background: "var(--gradient-primary)" }}
                ></div>
                <Search className="relative size-16 text-slate-300" />
              </div>
              <p className="text-lg font-semibold text-slate-700 mb-2">
                Search your notes
              </p>
              <p className="text-sm text-slate-500">
                Enter keywords to find notes by title, content, or tags
              </p>
            </div>
          )}
        </div>
      </div>

      {!isMobile && (
        <div className="flex-1 min-w-0 bg-white">
          {selectedNote ? (
            <NotePreview
              note={selectedNote}
              onEdit={() => navigate(`/note/${selectedNote._id}`)}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-slate-600">
                  {searchTerm.trim()
                    ? "Select a search result to view"
                    : "Enter a search term to begin"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
