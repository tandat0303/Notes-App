import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Archive, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import NotesList from "./NotesList";
import NotePreview from "./NotePreview";
import { api } from "../../convex/_generated/api";

export default function ArchiveView() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const notes = useQuery(
    api.notes.getNotes,
    user ? { userId: user.id, isArchived: true } : "skip",
  );

  const filteredNotes = notes?.filter((note) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  });

  const selectedNote = filteredNotes?.find(
    (note) => note._id === selectedNoteId,
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (filteredNotes?.length && !selectedNoteId && !isMobile) {
      setSelectedNoteId(filteredNotes[0]._id);
    }
  }, [filteredNotes, selectedNoteId, isMobile]);

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
            <div
              className="size-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 10px 25px -5px var(--shadow-primary)",
              }}
            >
              <Archive className="size-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Archived
            </h1>
          </div>

          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400 transition-colors duration-200"
              style={{
                color: document.querySelector(":focus-within")
                  ? "var(--color-primary)"
                  : "",
              }}
            />
            <Input
              placeholder="Search archived notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 rounded-lg transition-all duration-200"
              style={{
                "--tw-ring-color": "var(--color-primary-200)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "";
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/50 to-slate-50/50">
          <NotesList
            notes={filteredNotes || []}
            selectedNoteId={selectedNoteId}
            onNoteSelect={handleNoteSelect}
            loading={!filteredNotes}
          />
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
              {filteredNotes?.length === 0 ? (
                <div className="text-center animate-in fade-in duration-500">
                  <div className="relative inline-block mb-6">
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
                      style={{
                        background: "var(--gradient-primary)",
                      }}
                    ></div>
                    <Archive className="relative size-16 text-slate-300" />
                  </div>
                  <p className="text-xl font-semibold text-slate-700 mb-2">
                    No archived notes
                  </p>
                  <p className="text-sm text-slate-500">
                    Archived notes will appear here
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-600">
                    Select an archived note to view it
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
