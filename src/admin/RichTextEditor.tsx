/**
 * admin/RichTextEditor.tsx
 * Trình soạn thảo nội dung bài viết (HTML) dựa trên TipTap.
 *
 * Nội dung chuyển từ website cũ là HTML có bảng, ảnh và liên kết — trước đây
 * biên tập viên phải sửa bằng <textarea> thô. Trình soạn thảo này giữ nguyên
 * cấu trúc đó, có nút chèn ảnh (tải thẳng lên /api/admin/upload) và bảng.
 *
 * Có nút "Xem mã HTML" để can thiệp trực tiếp khi cần xử lý markup lạ còn sót
 * từ trình soạn thảo cũ.
 */
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  Bold, Code2, Heading2, Heading3, ImagePlus, Italic, Link2, Link2Off, List, ListOrdered,
  Loader2, Quote, Redo2, Strikethrough, Table as TableIcon, Undo2,
} from 'lucide-react';
import { uploadFile } from './api';

interface RichTextEditorProps {
  value?: string | null;
  onChange: (html: string) => void;
}

function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // giữ con trỏ trong vùng soạn thảo
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-40 ${
        active ? 'bg-[#0B2545] text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [htmlMode, setHtmlMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image.configure({ inline: false, HTMLAttributes: { loading: 'lazy' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value ?? '',
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class: 'article-body admin-editor focus:outline-none',
      },
    },
  });

  // Đồng bộ khi biểu mẫu nạp dữ liệu sau lúc khởi tạo (chế độ sửa).
  useEffect(() => {
    if (!editor) return;
    const incoming = value ?? '';
    if (incoming !== editor.getHTML()) editor.commands.setContent(incoming, { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  const insertImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi tải ảnh lên');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const toggleLink = () => {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = prompt('Nhập địa chỉ liên kết:', 'https://');
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-400 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Đang khởi tạo trình soạn thảo…
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        <ToolbarButton title="Hoàn tác" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Làm lại" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton title="Đậm" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Nghiêng" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Gạch ngang" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton title="Tiêu đề mục" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Tiêu đề phụ" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Danh sách gạch đầu dòng" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Danh sách đánh số" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Trích dẫn" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton title={editor.isActive('link') ? 'Bỏ liên kết' : 'Chèn liên kết'} active={editor.isActive('link')} onClick={toggleLink}>
          {editor.isActive('link') ? <Link2Off className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        </ToolbarButton>
        <ToolbarButton title="Chèn ảnh" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
        </ToolbarButton>
        <ToolbarButton
          title="Chèn bảng 3×3"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>

        <span className="flex-1" />

        <button
          type="button"
          onClick={() => setHtmlMode((m) => !m)}
          className={`h-8 px-2.5 rounded-md text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
            htmlMode ? 'bg-[#0B2545] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> HTML
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={insertImage} />

      {htmlMode ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => {
            onChange(e.target.value);
            editor.commands.setContent(e.target.value, { emitUpdate: false });
          }}
          rows={20}
          spellCheck={false}
          className="w-full px-4 py-3 font-mono text-[12.5px] leading-relaxed text-slate-700 focus:outline-none resize-y"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
