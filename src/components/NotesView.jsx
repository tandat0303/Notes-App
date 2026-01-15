import { useUser } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotesView() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState("null");
  const [isMobile, setIsMobile] = useState(false);
  
  const notes = useQuery(api.notes.getNotes, user ? { userId: user.id, isArchived: false} : "skip");
  const searchResults = useQuery(api.notes.searchNotes, user && searchTerm.trim()
    ? {userId: user.id, searchTerm: searchTerm.trim()} : "skip");

  const displayNotes = searchTerm.trim() ? searchResults : notes;
  const selectedNote = displayNotes?.find((note) => note._id === selectedNoteId);

  useEffect(() => {
    if (displayNotes?.length && !selectedNoteId && !isMobile){
      setSelectedNoteId(displayNotes[0]._id);
    }
  }, [displayNotes, selectedNoteId, isMobile])

  const handleCreateNewNote = () => {
    navigate("/new");
  }

  const handleSelectNote = (noteId) => {
    if (isMobile) {
      navigate(`/note/${noteId}`);
    } else {
      setSelectedNoteId(noteId);
    }
  }

  const handleSearchFocus = () => {
    if (isMobile) {
      navigate("/search");
    }
  }

  return (
    <div>NotesView</div>
  )
}
