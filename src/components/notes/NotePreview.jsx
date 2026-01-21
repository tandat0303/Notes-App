import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Archive, MoreVertical, Pencil, Share, Trash2, Lock, Unlock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import ShareDialog from "../dialogs/ShareDialog";
import { LockNoteDialog } from "../dialogs/LockNoteDialog";
import { LockedNotePreview } from "./LockedNotePreview";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export default function NotePreview({ note, onEdit }) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [isShared, setIsShared] = useState(note.isShared);

  const toggleArchive = useMutation(api.notes.toggleArchiveNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const setNoteLock = useMutation(api.notes.setNoteLock);
  const unlockNote = useMutation(api.notes.unlockNote);
  const toggleShare = useMutation(api.notes.toggleShareNote);

  const isLocked = note.isLocked || false;

  useEffect(() => {
    setIsShared(note.isShared || false);
  }, [note.isShared, note._id]);

  const formatDate = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  const handleArchive = async () => {
    if (isLocked) {
      toast.error("Cannot archive a locked note. Unlock it first.");
      return;
    }

    try {
      await toggleArchive({ id: note._id });
      toast.success(note.isArchived ? "Note unarchived" : "Note archived");
    } catch (error) {
      console.error("Failed to archive note: ", error);
      toast.error("Failed to archive note");
    }
  };

  const handleDelete = async () => {
    if (isLocked) {
      toast.error("Cannot delete a locked note. Unlock it first.");
      return;
    }

    try {
      await deleteNote({ id: note._id });
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleLock = async (password) => {
    try {
      await setNoteLock({ id: note._id, password });
      toast.success("Note locked successfully");
    } catch (error) {
      toast.error("Failed to lock note");
      throw error;
    }
  };

  const handleUnlock = async (password) => {
    try {
      await unlockNote({ id: note._id, password });
      toast.success("Note unlocked successfully");
    } catch (error) {
      toast.error("Incorrect password");
      throw error;
    }
  };

  const handleShare = () => {
    if (isLocked) {
      toast.error("Cannot share a locked note. Unlock it first.");
      return;
    }
    setShareDialogOpen(true);
  };

  const handleEdit = () => {
    if (isLocked) {
      toast.error("Cannot edit a locked note. Unlock it first.");
      return;
    }
    onEdit();
  };

  const handleToggleShare = async () => {
    if (isLocked) {
      toast.error("Cannot change sharing settings for a locked note. Unlock it first.");
      return;
    }

    const newShareState = !isShared;
    setIsShared(newShareState);
    
    try {
      await toggleShare({ id: note._id });
      toast.success(newShareState ? "Note is now public" : "Note is now private");
    } catch (error) {
      // Revert on error
      setIsShared(!newShareState);
      toast.error("Failed to update share settings");
      console.error("Failed to toggle share:", error);
    }
  };

  // Show locked state
  if (isLocked) {
    return (
      <>
        <LockedNotePreview 
          note={note} 
          onUnlockClick={() => setUnlockDialogOpen(true)} 
        />
        
        <LockNoteDialog
          open={unlockDialogOpen}
          onOpenChange={setUnlockDialogOpen}
          onConfirm={handleUnlock}
          isLocking={false}
          noteName={note.title}
        />
      </>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 mb-4 wrap-break-words leading-tight">
              {note.title || "Untitled"}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Tags</span>
                {note.tags?.length > 0 ? (
                  <div className="flex gap-1.5 flex-wrap">
                    {note.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="text-xs px-2.5 py-0.5 font-medium rounded-full transition-all duration-200"
                        style={{
                          background: "var(--gradient-primary)",
                          color: "white",
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Last edited:</span>
                <span className="text-slate-500">{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <b style={{ color: isShared ? "green" : "orange" }}>
              {isShared ? "Public" : "Private"}
            </b>
            <Switch 
              className="data-[state=checked]:bg-green-500 [&>span]:bg-white"
              checked={isShared}
              onCheckedChange={handleToggleShare}
              disabled={isLocked}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="gap-2 border-slate-300 text-slate-700 text-sm hover:bg-slate-50 rounded-lg transition-all duration-200"
            >
              <Pencil className="size-4" />
              Edit
            </Button>

            <TooltipProvider delayDuration={1000}>
              <Tooltip>
                <TooltipTrigger>
                  <span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isShared}
                      onClick={handleShare}
                      className="gap-2 border-slate-300 text-slate-700 text-sm hover:bg-slate-50 rounded-lg transition-all duration-200"
                    >
                      <Share className="size-4" />
                      Share
                    </Button>
                  </span>
                {!isShared && <TooltipContent>Sharing will be enabled when note is public</TooltipContent>}
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>  

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
                  className="cursor-pointer focus:bg-slate-100"
                >
                  <Archive className="size-4 mr-2" />
                  {note.isArchived ? "Unarchive" : "Archive"} Note
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="cursor-pointer text-red-600 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50/30">
        <div
          className="p-6 prose prose-slate max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: note.content || '<p class="text-slate-400 italic">No content available</p>',
          }}
        />
      </div>

      {/* Dialogs */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        note={note}
      />

      <LockNoteDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        onConfirm={handleLock}
        isLocking={true}
        noteName={note.title}
      />

      {/* Delete Dialog */}
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
              onClick={handleDelete}
              variant="destructive"
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
            >
              <Trash2 className="size-4 mr-2" />
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}