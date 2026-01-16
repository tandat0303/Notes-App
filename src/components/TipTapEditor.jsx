import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import React, { useState, forwardRef, useEffect, useImperativeHandle } from 'react'
import { Button } from './ui/button';
import { Bold } from 'lucide-react';

export const TipTapEditor = forwardRef(( {content, onChange, placeholder }, ref) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [url, setUrl] = useState("");

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder
            }),
            CharacterCount.configure({
                limit: 10000,
            }),
            Link.configure({
                openOnClick: false,
            })
        ],
        content: content || "",
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html);
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none p-4 min-h-96"
            }
        }
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

    if (!editor) {
        return null;
    }

    const addLink = () => {
        if (!url) return;
        editor.chain().focus().setLink({ href: url }).run();
        setUrl("");
        setIsDialogOpen(false);
    };

    const ToolbarButton = ({ onClick, isActive, children, title }) => (
        <Button
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={onClick}
            title={title}
            type="button"
            className="size-8 p-0"
        >
            {children}
        </Button>
    );

    return (
        <div className='w-full'>
            {/* Toolbar */}
            <div className='border-b border-gray-200 p-2 bg-gray-50'>
                <div className='flex items-center gap-1 flex-wrap'>
                    <ToolbarButton>
                        <Bold className='size-4' />
                    </ToolbarButton>
                </div>
            </div>
        </div>
    );
})
