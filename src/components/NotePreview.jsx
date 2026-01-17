import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Archive, MoreVertical, Pencil, Share, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import ShareDialog from "./ShareDialog";

export default function NotePreview({ note, onEdit }) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const toggleArchive = useMutation(api.notes.toggleArchiveNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  const formatDate = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  const handleArchive = async () => {
    try {
      await toggleArchive({ id: note._id });
      toast.success(note.isArchived ? "Note unarchived" : "Note archived");
    } catch (error) {
      console.error("Failed to archive note: ", error);
      toast.error("Failed to archive note");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote({ id: note._id });
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 wrap-break-words leading-tight">
              {note.title || "Untitled"}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Tags</span>
                {note.tags?.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-primary/25 text-primary hover:bg-primary/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span>None</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-900">Last edited:</span>
                <span>{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-2 border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
            >
              <Pencil className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2 border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
            >
              <Share className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleArchive} className="mb-1">
                  <Archive className="size-4 mr-2" />
                  {note.isArchived ? "Unarchive" : "Archive"} Note
                </DropdownMenuItem>

                <Dialog>
                  <DialogTrigger asChild className="w-full">
                    <Button variant="destructive">
                      <Trash2 className="size-4 mr-2" />
                      Delete Note
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Note</DialogTitle>
                      <DialogDescription>
                        Deleting a note is a permanent action. Proceed with
                        caution.
                      </DialogDescription>

                      <DialogFooter>
                        <DialogClose className="text-sm mr-4">
                          Cancel
                        </DialogClose>

                        <Button onClick={handleDelete} variant="destructive">
                          Delete Note
                        </Button>
                      </DialogFooter>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="p-6 prose prose-gray max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: note.content || '<p class="text-gray-500">No Content</p>',
          }}
        />
      </div>

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        note={note}
      />
    </div>
  );
}
