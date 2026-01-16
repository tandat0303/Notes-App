import { useUser } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Archive, ArrowLeft, Trash2 } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { TipTapEditor } from './TipTapEditor';

export default function NoteEditor() {
  
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef();

  const isNewNote = !noteId;

  const note = 
    useQuery(api.notes.getNotes, user && noteId ? 
      { userId: user.id } : "skip"
    );

  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const toggleArchive = useMutation(api.notes.toggleArchiveNote);

  const currentNote = note?.find((n) => n._id === noteId);

  useEffect(() => {
    if (currentNote && !isModified) {
      setTitle(currentNote.title || "");
      setContent(currentNote.content || "");
      setTags(currentNote.tags?.join(", ") || "");
    }
  }, [currentNote, isModified]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isModified) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isModified])
  
  const handleSave = useCallback(() => {
    async (silent = false) => {
      if (!user || !title.trim()) {
        if (!title.trim()) {
          toast.error("Please enter a title for your note")
        }

        return;
      }

      setIsSaving(true);

      try {
        const tagsArray = tags.split(",")
                            .map((tag) => tag.trim())
                            .filter((tag) => tag.length > 0);
      
        if (isNewNote) {
          await createNote({
            title: title.trim(),
            content: content.trim(),
            tags: tagsArray,
            userId: user.id,
          });
        } else {
          await updateNote({
            id: noteId,
            title: title.trim(),
            content: content.trim(),
            tags: tagsArray
          });
        }

        setIsModified(false);

        if (!silent) {
          toast.success("Note saved successfully");
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to save note: ", error);
        toast.error("Failed to save note");
      } finally {
        setIsSaving(false);
      }
    }
  }, [content, createNote, isNewNote, navigate, noteId, tags, title, updateNote, user]);

  {/* Auto save */}
  useEffect(() => {
    if (isModified && !isNewNote && title.trim()) {
      const saveTimer = setTimeout(async () => {
        handleSave(true);
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [title, content, tags, isModified, isNewNote, handleSave])

  const handleCancel = useCallback(() => {
    if (isModified) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?"))
      {
        navigate("/")
      } else {
        navigate("/new");
      }
    }
  }, [isModified, navigate]);

  {/* Keyboard shortcuts */}
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSave();
            break;
          case "Enter":
            e.preventDefault();
            handleSave();
            break;
          case "Escape":
            e.preventDefault();
            handleCancel();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [title, content, tags, handleCancel, handleSave]);

  const handleDelete = async () => {
    if (!currentNote) return;

    try {
      await deleteNote({ id: noteId });
      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete note: ", error);
      toast.error("Failed to delete note");
    }
  }

  const handleArchive = async () => {
    if(!currentNote) return;

    try {
      await toggleArchive({ id: noteId });
      toast.success(currentNote.isArchived ? "Note unarchived" : "Note archived");
      navigate("/");
    } catch (error) {
      console.error("Failed to archive note", error);
      toast.error("Failed to archive note");
    }
  }

  const handleTitleChange = (value) => {
    setTitle(value);
    setIsModified(true);
  }

  const handleContentChange = (value) => {
    setContent(value);
    setIsModified(true);
  }

  const handleTagsChange = (value) => {
    setTags(value);
    setIsModified(true);
  }

  return (    
    <div className='h-screen flex flex-col bg-white'>
      {/* Mobile Header */}
      <div className='md:hidden p-4 border-b border-gray-200 bg-white'>
        <div className='flex items-center justify-between'>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2 text-gray-700"
          >
            <ArrowLeft className='size-4' />Go back
          </Button>

          <div className='flex items-center gap-2'>
            <Button onClick={() => handleSave()} 
                    disabled={isSaving || !title.trim()} 
                    size="sm"
                    className="bg-primary hover:bg-primary/75"
            >
              {isSaving ? "Saving" : "Save"}
            </Button>

            <Button
              variant="outline"
              onClick={handleCancel}
              size="sm"
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className='hidden md:block p-6 border-b border-gray-200 bg-white'>
        <div className='flex flex-wrap gap-2 items-center justify-between'>
          <div className='flex flex-wrap items-center gap-4'>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2 text-gray-700"
            >
              <ArrowLeft className='size-4' />
            </Button>

            <div className='text-2xl font-semibold text-gray-900'>
              {isNewNote 
                ? "Create New Note" 
                : `${currentNote?.title || "Edit Note"}`}
              {isModified && "· Modified"}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {!isNewNote && (
              <>
                <Button
                  variant="outline"
                  onClick={handleArchive}
                  size="sm"
                  className="gap-2 border-gray-300 text-gray-700"
                >
                  <Archive className='size-4' />
                  {currentNote?.isArchived ? "Unarchived" : "Archive"}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="gap-2 border-red-300 text-red-600 hover:bg-red-50">
                        <Trash2 className='size-4' /> Delete Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Note</DialogTitle>
                      
                      <DialogDescription>
                        This is a permanent action. Are you sure you want to continue?
                      </DialogDescription>
                      
                      <DialogFooter>
                        <DialogClose className="text-sm mr-4">Cancel</DialogClose>

                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          size="sm"
                          className="gap-2"
                        >
                          <Trash2 className='size-4' />Delete Note
                        </Button>
                      </DialogFooter>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </>
            )}

            <Button
              variant="outline"
              onClick={handleCancel}
              size="sm"
              className="gap-2 border-gray-300 text-gray-700"
            >
              Cancel
            </Button>

            <Button
              onClick={() => handleSave()}
              disabled={isSaving || !title.trim()}
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/75"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-4xl mx-auto p-6 space-y-6'>
          <div className='space-y-2'>
            <Input 
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter note title..."
              className="!text-2xl font-semibold border-0 px-4 py-6 shadow-none focus:outline-none !focus:ring-0 !focus:border-0 placeholder:text-gray-400" autoFocus
            />
          </div>

          {/* Tags */}
          <div className='space-y-2'>
            <Label 
              htmlFor="tags"
              className="text-sm font-medium text-gray-700">
                Tags
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Enter tags separated by commas (e.g React, Javascript, Note...)"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className='text-xs text-gray-500'>
              Use commas to separate mutiple tags
            </p>
          </div>

          {/* Content */}
          <div className='space-y-2'>
            <Label className="text-sm font-medium text-gray-700">Content</Label>
            <div className='border border-gray-300 rounded-lg overflow-hidden min-h-96'>
              <TipTapEditor  
                ref={editorRef} 
                content={content} 
                onChange={handleContentChange} 
                placeholder="Start writing your note..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
