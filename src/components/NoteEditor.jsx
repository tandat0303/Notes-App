import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Archive, ArrowLeft, Trash2, Save, Sparkles, MoreVertical, Lock, Unlock, Share } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import TipTapEditor from "./TipTapEditor";
import { LockNoteDialog } from "./LockNoteDialog";
import { LockedNotePreview } from "./LockedNotePreview";
import ShareDialog from "./ShareDialog";
import { Switch } from "./ui/switch";

export default function NoteEditor() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const editorRef = useRef();

  const isNewNote = !noteId;

  const note = useQuery(
    api.notes.getNotes,
    user && noteId ? { userId: user.id } : "skip",
  );

  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const toggleArchive = useMutation(api.notes.toggleArchiveNote);
  const toggleShare = useMutation(api.notes.toggleShareNote);
  const setNoteLock = useMutation(api.notes.setNoteLock);
  const unlockNote = useMutation(api.notes.unlockNote);

  const currentNote = note?.find((n) => n._id === noteId);
  const isLocked = currentNote?.isLocked || false;

  useEffect(() => {
  if (currentNote && !isModified) {
    setTitle(currentNote.title || "");
    setContent(currentNote.content || "");
    setTags(currentNote.tags?.join(", ") || "");
    setIsShared(currentNote.isShared || false);
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
  }, [isModified]);

  const handleToggleShare = async () => {
  if (!currentNote) return;
  
  if (isLocked) {
    toast.error("Cannot change sharing settings for a locked note. Unlock it first.");
    return;
  }

  const newShareState = !isShared;
  setIsShared(newShareState);
  
  try {
    await toggleShare({ id: noteId });
    toast.success(newShareState ? "Note is now public" : "Note is now private");
  } catch (error) {
    // Revert state on error
    setIsShared(!newShareState);
    toast.error("Failed to update share settings");
    console.error("Failed to toggle share:", error);
  }
};

  const handleSave = useCallback(
    async (silent = false) => {
      if (!user || !title.trim()) {
        if (!title.trim()) {
          toast.error("Please enter a title for your note");
        }
        return;
      }

      if (isLocked) {
        toast.error("Cannot edit a locked note. Unlock it first.");
        return;
      }

      setIsSaving(true);

      try {
        const tagArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);

        if (isNewNote) {
          await createNote({
            title: title.trim(),
            content: content.trim(),
            tags: tagArray,
            userId: user.id,
          });
        } else {
          await updateNote({
            id: noteId,
            title: title.trim(),
            content: content.trim(),
            tags: tagArray,
          });
        }

        setIsModified(false);

        if (!silent) {
          toast.success("Note saved successfully");
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to save note:", error);
        toast.error("Failed to save note");
      } finally {
        setIsSaving(false);
      }
    },
    [content, createNote, isNewNote, navigate, noteId, tags, title, updateNote, user, isLocked]
  );

  useEffect(() => {
    if (isModified && !isNewNote && title.trim() && !isLocked) {
      const saveTimer = setTimeout(async () => {
        handleSave(true);
      }, 2000);
      return () => clearTimeout(saveTimer);
    }
  }, [title, content, tags, isModified, isNewNote, handleSave, isLocked]);

  const handleCancel = useCallback(() => {
    if (isModified) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [isModified, navigate]);

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

    if (isLocked) {
      toast.error("Cannot delete a locked note. Unlock it first.");
      return;
    }

    try {
      await deleteNote({ id: noteId });
      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete note: ", error);
      toast.error("Failed to delete note");
    }
  };

  const handleArchive = async () => {
    if (!currentNote) return;

    if (isLocked) {
      toast.error("Cannot archive a locked note. Unlock it first.");
      return;
    }

    try {
      await toggleArchive({ id: noteId });
      toast.success(currentNote.isArchived ? "Note unarchived" : "Note archived");
      navigate("/");
    } catch (error) {
      console.error("Failed to archive note", error);
      toast.error("Failed to archive note");
    }
  };

  const handleShare = () => {
    if (isLocked) {
      toast.error("Cannot share a locked note. Unlock it first.");
      return;
    }
    setShareDialogOpen(true);
  };

  const handleLock = async (password) => {
    try {
      await setNoteLock({ id: noteId, password });
      toast.success("Note locked successfully");
    } catch (error) {
      toast.error("Failed to lock note");
      throw error;
    }
  };

  const handleUnlock = async (password) => {
    try {
      await unlockNote({ id: noteId, password });
      toast.success("Note unlocked successfully");
    } catch (error) {
      toast.error("Incorrect password");
      throw error;
    }
  };

  const handleTitleChange = (value) => {
    if (isLocked) {
      toast.error("Cannot edit a locked note");
      return;
    }
    setTitle(value);
    setIsModified(true);
  };

  const handleContentChange = (value) => {
    if (isLocked) {
      toast.error("Cannot edit a locked note");
      return;
    }
    setContent(value);
    setIsModified(true);
  };

  const handleTagsChange = (value) => {
    if (isLocked) {
      toast.error("Cannot edit a locked note");
      return;
    }
    setTags(value);
    setIsModified(true);
  };

  // Show locked preview for locked notes
  if (isLocked && !isNewNote) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-slate-200 bg-white/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block p-6 border-b border-slate-200 bg-white/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {currentNote?.title || "Locked Note"}
            </h1>
          </div>
        </div>

        <LockedNotePreview 
          note={currentNote} 
          onUnlockClick={() => setUnlockDialogOpen(true)} 
        />

        <LockNoteDialog
          open={unlockDialogOpen}
          onOpenChange={setUnlockDialogOpen}
          onConfirm={handleUnlock}
          isLocking={false}
          noteName={currentNote?.title}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-slate-200 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSave()}
              disabled={isSaving || !title.trim()}
              size="sm"
              className="text-white shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: "var(--gradient-primary)",
                opacity: isSaving || !title.trim() ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSaving && title.trim()) {
                  e.currentTarget.style.background = "var(--gradient-primary-hover)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--gradient-primary)";
              }}
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button
              variant="outline"
              onClick={handleCancel}
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>

            {!isNewNote && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setLockDialogOpen(true)}
                    className="cursor-pointer focus:bg-amber-50"
                  >
                    <Lock className="size-4 mr-2 text-amber-600" />
                    <span className="text-amber-700">Lock Note</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleArchive}
                    className="cursor-pointer mb-1 focus:bg-slate-100"
                  >
                    <Archive className="size-4 mr-2" />
                    {currentNote?.isArchived ? "Unarchive" : "Archive"} Note
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="cursor-pointer text-red-600 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Note
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleShare}
                    className="cursor-pointer mb-1 focus:bg-slate-100"
                    disabled={!isShared}
                  >
                    <Share className="size-4 mr-2" />
                    Share Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block p-6 border-b border-slate-200 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="size-4" />
            </Button>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {isNewNote ? "Create New Note" : `${currentNote?.title || "Edit Note"}`}
              </h1>
              {isModified && (
                <span
                  className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border"
                  style={{
                    color: "#f59e0b",
                    backgroundColor: "#fef3c7",
                    borderColor: "#fde68a",
                  }}
                >
                  <Sparkles className="size-3" />
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isNewNote && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setLockDialogOpen(true)}
                  size="sm"
                  className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                >
                  <Lock className="size-4" />
                  Lock Note
                </Button>

                <Button
                  variant="outline"
                  onClick={handleArchive}
                  size="sm"
                  className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
                >
                  <Archive className="size-4" />
                  {currentNote?.isArchived ? "Unarchive" : "Archive"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(true)}
                  size="sm"
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </>
            )}

            <Button
              variant="outline"
              onClick={handleCancel}
              size="sm"
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </Button>

            <Button
              onClick={() => handleSave()}
              disabled={isSaving || !title.trim()}
              size="sm"
              className="gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
              style={{
                background: "var(--gradient-primary)",
                opacity: isSaving || !title.trim() ? 0.5 : 1,
                cursor: isSaving || !title.trim() ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSaving && title.trim()) {
                  e.currentTarget.style.background = "var(--gradient-primary-hover)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--gradient-primary)";
              }}
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Delete Note
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              This action cannot be undone. This will permanently delete your note.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="border-slate-300">
                Cancel
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={handleDelete}
              size="sm"
              className="gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
            >
              <Trash2 className="size-4" />
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock Note Dialog */}
      <LockNoteDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        onConfirm={handleLock}
        isLocking={true}
        noteName={currentNote?.title}
      />

      {currentNote && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          note={currentNote}
        />
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        {!isNewNote && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2">
                <span className="text-sm font-medium text-slate-600">
                  {isShared ? "Public" : "Private"}
                </span>
                <Switch 
                  className="data-[state=checked]:bg-green-500 [&>span]:bg-white"
                  checked={isShared}
                  onCheckedChange={handleToggleShare}
                  disabled={isLocked}
                />
              </div>
            </div>
          )}
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter note title..."
              className="!text-3xl font-bold border-0 px-4 py-6 shadow-none focus:outline-none !focus:ring-0 !focus:border-0 placeholder:text-slate-400 bg-transparent"
              autoFocus
              disabled={isLocked}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label
              htmlFor="tags"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              <span
                className="w-1 h-4 rounded-full"
                style={{
                  background: "var(--gradient-primary)",
                }}
              ></span>
              Tags
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Enter tags separated by commas (e.g React, Javascript, Note...)"
              className="border-slate-300 rounded-lg transition-all duration-200"
              style={{
                "--tw-ring-color": "var(--color-primary-200)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "";
              }}
              disabled={isLocked}
            />
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="size-1 bg-slate-400 rounded-full"></span>
              Use commas to separate multiple tags
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span
                className="w-1 h-4 rounded-full"
                style={{
                  background: "var(--gradient-primary)",
                }}
              ></span>
              Content
            </Label>
            <div className="border border-slate-300 rounded-xl overflow-hidden min-h-96 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
              <TipTapEditor
                ref={editorRef}
                content={content}
                onChange={handleContentChange}
                placeholder="Start writing your note..."
                editable={!isLocked}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}