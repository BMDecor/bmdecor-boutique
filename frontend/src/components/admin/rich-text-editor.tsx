'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback } from 'react';
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Minus, Link as LinkIcon, ImageIcon, Undo, Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#C9A86C] underline underline-offset-2' },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your article...',
      }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none text-[#2C2C2C] [&_h2]:font-[family-name:var(--font-playfair)] [&_h2]:text-2xl [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:font-[family-name:var(--font-playfair)] [&_h3]:text-xl [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-[#C9A86C] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#2C2C2C]/70 [&_code]:bg-[#2C2C2C]/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_img]:rounded-lg [&_img]:max-w-full [&_a]:text-[#C9A86C] [&_a]:underline',
      },
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
    // Only sync when content prop changes from outside, not from editor edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active
        ? 'bg-[#2C2C2C] text-white'
        : 'text-[#2C2C2C]/50 hover:text-[#2C2C2C] hover:bg-[#2C2C2C]/5'
    }`;

  return (
    <div className="border border-[#2C2C2C]/15 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#2C2C2C]/10 bg-[#FAF8F5]">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-[#2C2C2C]/10 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-[#2C2C2C]/10 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">
          <List className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-[#2C2C2C]/10 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Blockquote">
          <Quote className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))} title="Code Block">
          <Code className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)} title="Horizontal Rule">
          <Minus className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-[#2C2C2C]/10 mx-1" />

        <button type="button" onClick={addLink} className={btnClass(editor.isActive('link'))} title="Add Link">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button type="button" onClick={addImage} className={btnClass(false)} title="Add Image">
          <ImageIcon className="h-4 w-4" />
        </button>

        <div className="flex-1" />

        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded text-[#2C2C2C]/30 hover:text-[#2C2C2C] disabled:opacity-30" title="Undo">
          <Undo className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded text-[#2C2C2C]/30 hover:text-[#2C2C2C] disabled:opacity-30" title="Redo">
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
