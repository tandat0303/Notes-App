import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Tag, ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotesList from "./NotesList";
import NotePreview from "./NotePreview";
import { api } from "../../convex/_generated/api";

export default function TagsView() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const notes = useQuery(
    api.notes.getNotes,
    user && tag ? { userId: user.id, isArchived: false, tagFilter: tag } : "skip"
  );

  const filteredNotes = notes?.filter((note) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower)
    );
  });

  const selectedNote = filteredNotes?.find((note) => note._id === selectedNoteId);

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
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hover:bg-slate-100">
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div className="size-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Tag className="size-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 line-clamp-1">
              Tag: <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">{tag}</Badge>
            </h1>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200" />
            <Input
              placeholder={`Search in ${tag}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>

          {filteredNotes && (
            <p className="text-sm text-slate-600 mt-2 flex items-center gap-1.5">
              <span className="size-1.5 bg-blue-600 rounded-full"></span>
              {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
            </p>
          )}
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
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <Tag className="relative size-16 text-slate-300" />
                  </div>
                  <p className="text-xl font-semibold text-slate-700 mb-2">No notes with "{tag}"</p>
                  <p className="text-sm text-slate-500">Create a note with this tag to see it here</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-600">Select a note to view it</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}