import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import React, {
  useState,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { Button } from "../ui/button";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

const TipTapEditor = forwardRef(({ content, onChange, placeholder }, ref) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [url, setUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none p-6 min-h-96",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  useImperativeHandle(ref, () => ({
    focus: () => editor?.commands.focus(),
    getEditor: () => editor,
  }));

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
            break;
          case "i":
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
            break;
          case "u":
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
            break;
          case "z":
            if (e.shiftKey) {
              e.preventDefault();
              editor.chain().focus().redo().run();
            } else {
              e.preventDefault();
              editor.chain().focus().undo().run();
            }
            break;
          case "y":
            e.preventDefault();
            editor.chain().focus().redo().run();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
    setUrl("");
    setIsDialogOpen(false);
  };

  const ToolbarButton = ({ onClick, isActive, children, title, disabled }) => {
    const buttonStyle = isActive
      ? {
          background: "var(--gradient-primary)",
          color: "white",
          boxShadow: "0 4px 6px -1px var(--shadow-primary-light)",
        }
      : {};

    return (
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        title={title}
        type="button"
        disabled={disabled}
        className={`
              size-9 p-0 rounded-lg transition-all duration-200 relative
              ${isActive ? "" : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"}
              ${disabled ? "opacity-40 cursor-not-allowed" : ""}
            `}
        style={buttonStyle}
        onMouseEnter={(e) => {
          if (isActive && !disabled) {
            e.currentTarget.style.background = "var(--gradient-primary-hover)";
          }
        }}
        onMouseLeave={(e) => {
          if (isActive && !disabled) {
            e.currentTarget.style.background = "var(--gradient-primary)";
          }
        }}
      >
        {children}
        {isActive && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full"></span>
        )}
      </Button>
    );
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="border-b border-slate-200 p-3 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center gap-1.5 flex-wrap">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold (Ctrl + B)"
          >
            <Bold className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic (Ctrl + I)"
          >
            <Italic className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline (Ctrl + U)"
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="Inline Code"
          >
            <Code className="size-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6 bg-slate-300" />

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="size-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6 bg-slate-300" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="size-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6 bg-slate-300" />

          <ToolbarButton
            onClick={() => setIsDialogOpen(true)}
            isActive={editor.isActive("link")}
            title="Add Link"
          >
            <LinkIcon className="size-4" />
          </ToolbarButton>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Add Link
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Enter the URL you want to link to
                </DialogDescription>
              </DialogHeader>

              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
                className="border-slate-300 rounded-lg"
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

              <DialogFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addLink}
                  className="text-white"
                  style={{
                    background: "var(--gradient-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--gradient-primary-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--gradient-primary)";
                  }}
                >
                  Add Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Separator orientation="vertical" className="mx-1 h-6 bg-slate-300" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl + Z)"
            disabled={!editor.can().undo()}
          >
            <Undo className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl + Shift + Z / Ctrl + Y)"
            disabled={!editor.can().redo()}
          >
            <Redo className="size-4" />
          </ToolbarButton>
        </div>
      </div>

      <EditorContent editor={editor} />

      {/* Footer */}
      <div className="border-t border-slate-200 p-3 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">
              {editor.storage.characterCount.characters()} characters ·{" "}
              {editor.storage.characterCount.words()} words
            </span>

            {/* Active formatting indicator */}
            {(editor.isActive("bold") ||
              editor.isActive("italic") ||
              editor.isActive("underline")) && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  color: "var(--color-primary)",
                  backgroundColor: "var(--color-primary-50)",
                }}
              >
                <span
                  className="size-1.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: "var(--color-primary)",
                  }}
                ></span>
                Active: {editor.isActive("bold") && "Bold "}
                {editor.isActive("italic") && "Italic "}
                {editor.isActive("underline") && "Underline"}
              </span>
            )}
          </div>

          <span className="text-slate-500">
            <span
              className={`font-semibold ${
                editor.storage.characterCount.characters() > 9000
                  ? "text-amber-600"
                  : editor.storage.characterCount.characters() > 8000
                    ? "text-orange-500"
                    : "text-slate-600"
              }`}
            >
              {editor.storage.characterCount.characters()}
            </span>
            {" / 10,000"}
          </span>
        </div>
      </div>
    </div>
  );
});

TipTapEditor.displayName = "TipTapEditor";

export default TipTapEditor;
