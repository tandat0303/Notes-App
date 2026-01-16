import { useUser } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button';
import { Notebook, Plus, Search, Settings } from 'lucide-react';
import { Input } from './ui/input';
import NotesList from './NotesList';
import NotePreview from './NotePreview';

export default function NotesView() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const notes = [];
  // useQuery(
  //         api.notes.getNotes, 
  //         user ? { userId: user.id, isArchived: false} : "skip"
  // );

  const searchResults = useQuery(api.notes.searchNotes, user && searchTerm.trim()
    ? {userId: user.id, searchTerm: searchTerm.trim()} : "skip");

  const displayNotes = searchTerm.trim() ? searchResults : notes;
  const selectedNote = displayNotes?.find((note) => note._id === selectedNoteId);

  useEffect(() => {
    if (displayNotes && displayNotes.length > 0 && !selectedNoteId && !isMobile){
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

  if (!user) {
    return <div>Please sign in...</div>;
  }

  if (notes === undefined) {
    return <div>Loading notes...</div>;
  }

  return (
    <div className='flex h-screen bg-white'>
      {/* Header */}
      <div className='w-full md:w-80 flex flex-col border-r border-gray-200'>
        <div className='p-4 border-b border-gray-200 bg-white'>
          <div className='flex flex-col items-start justify-between mb-4'>
            <h1 className='text-2xl font-bold mb-2 text-gray-900'>All Notes</h1>

            <div className='flex items-center justify-between gap-2 w-full'>
              <Button 
                size="sm" 
                onClick={handleCreateNewNote}
                className="bg-primary hover:bg-primary/75 gap-2">
                  <Plus className='size-4' /> Create New Note
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/settings")}
              >
                <Settings className='size-4' />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400' />
            <Input 
              placeholder="Search by title, content, or tags..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className='flex-1 overflow-y-auto bg-white'>
          <NotesList 
            notes={displayNotes || []} 
            selectedNoteId={selectedNoteId}
            onNoteSelect={handleSelectNote}
            loading={!displayNotes}
          />
        </div>
      </div>

      {/* Note Preview */}
      {!isMobile && (
        <div className='flex-1 min-w-0 bg-white'>
          {selectedNote ? (
            <NotePreview 
              note={selectedNote} 
              onEdit={() => navigate(`/note/${selectedNote._id}`)} 
            />
           ) : (
            <div className='h-full flex items-center justify-center text-gray-500'>
              {displayNotes?.length === 0 ? <div className='text-center'>
                <Notebook className='size-12 mx-auto mb-4 text-gray-300' />
                <p className='text-lg mb-2'>No notes available</p>
                <p className='text-sm'>
                  Create your first note to get started
                </p>
              </div> : <div className='text-center'>
                <p>Select a note to view it here</p>
                </div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
