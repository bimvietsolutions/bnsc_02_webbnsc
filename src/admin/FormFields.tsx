/**
 * admin/FormFields.tsx
 * Hai trường nhập chuyên biệt cho biểu mẫu quản trị:
 *
 *  - TagsField: gán thẻ chuyên đề cho bài viết (lưu dưới dạng mảng slug).
 *  - RelationField: chọn bản ghi liên kết bằng combobox có tìm kiếm phía máy chủ.
 *    Bắt buộc phải tìm kiếm chứ không đổ hết vào <select>: quan hệ "bài viết
 *    gắn kèm" của Mục lục giáo trình trỏ tới bảng 555 bản ghi.
 */
import { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { adminGet, adminList } from './api';

/** Chuẩn hoá tên thẻ thành slug không dấu. */
export function slugifyTag(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

interface TagsFieldProps {
  value?: string[] | null;
  onChange: (slugs: string[]) => void;
}

export function TagsField({ value, onChange }: TagsFieldProps) {
  const selected = Array.isArray(value) ? value : [];
  const [draft, setDraft] = useState('');
  const [all, setAll] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    adminList<{ slug: string; name: string }>('tags', { take: 200 })
      .then((r) => setAll(r.data))
      .catch(() => setAll([]));
  }, []);

  const add = (raw: string) => {
    const slug = slugifyTag(raw);
    if (!slug || selected.includes(slug)) {
      setDraft('');
      return;
    }
    onChange([...selected, slug]);
    setDraft('');
  };

  const remove = (slug: string) => onChange(selected.filter((s) => s !== slug));

  const nameOf = (slug: string) => all.find((t) => t.slug === slug)?.name ?? slug.replace(/-/g, ' ');

  const suggestions = draft.trim()
    ? all
        .filter((t) => !selected.includes(t.slug) && t.name.toLowerCase().includes(draft.toLowerCase()))
        .slice(0, 6)
    : [];

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((slug) => (
            <span
              key={slug}
              className="inline-flex items-center gap-1 bg-[#1B5FA8]/10 text-[#1B5FA8] text-[12px] font-medium px-2.5 py-1 rounded-full"
            >
              {nameOf(slug)}
              <button
                type="button"
                onClick={() => remove(slug)}
                className="hover:text-rose-600"
                aria-label={`Bỏ thẻ ${nameOf(slug)}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && selected.length) {
              remove(selected[selected.length - 1]);
            }
          }}
          placeholder="Nhập tên thẻ rồi Enter…"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#1B5FA8] focus:outline-none"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((t) => (
              <li key={t.slug}>
                <button
                  type="button"
                  onClick={() => add(t.name)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-[11px] text-slate-400 mt-1">
        Thẻ chưa tồn tại sẽ được tạo tự động khi lưu.
      </p>
    </div>
  );
}

interface RelationFieldProps {
  value?: number | string | null;
  resource: string;
  labelField: string;
  onChange: (id: string) => void;
}

export function RelationField({ value, resource, labelField, onChange }: RelationFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ id: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const boxRef = useRef<HTMLDivElement>(null);

  // Nạp nhãn của giá trị đang chọn (bản ghi có thể không nằm trong 25 mục đầu).
  useEffect(() => {
    if (value == null || value === '') {
      setSelectedLabel('');
      return;
    }
    let cancelled = false;
    adminGet<Record<string, unknown>>(resource, value)
      .then((r) => !cancelled && setSelectedLabel(String(r.data?.[labelField] ?? value)))
      .catch(() => !cancelled && setSelectedLabel(String(value)));
    return () => {
      cancelled = true;
    };
  }, [value, resource, labelField]);

  // Tìm kiếm phía máy chủ, có độ trễ gõ phím.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      adminList<Record<string, any>>(resource, { take: 20, q: query })
        .then((r) => {
          if (cancelled) return;
          setOptions(r.data.map((row) => ({ id: row.id, label: String(row[labelField] ?? row.id) })));
        })
        .catch(() => !cancelled && setOptions([]))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query, resource, labelField]);

  // Đóng khi bấm ra ngoài
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={boxRef}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setQuery('');
          }}
          className="flex-1 text-left border border-slate-200 rounded-lg px-3 py-2 text-sm hover:border-[#1B5FA8] focus:border-[#1B5FA8] focus:outline-none truncate"
        >
          {selectedLabel || <span className="text-slate-400">— Chọn —</span>}
        </button>
        {value != null && value !== '' && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Bỏ chọn"
            className="px-2.5 border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="relative border-b border-slate-100">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Gõ để tìm…"
              className="w-full pl-9 pr-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {loading ? (
              <li className="px-3 py-3 text-sm text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tìm…
              </li>
            ) : options.length === 0 ? (
              <li className="px-3 py-3 text-sm text-slate-400">Không có kết quả</li>
            ) : (
              options.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(String(opt.id));
                      setSelectedLabel(opt.label);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                      String(opt.id) === String(value) ? 'text-[#1B5FA8] font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
