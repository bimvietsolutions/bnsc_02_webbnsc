/**
 * components/Pagination.tsx
 * Phân trang phía máy chủ. Rút gọn dải số trang khi nhiều trang (555 bài chia
 * 12 bài/trang -> tới ~32 trang cho mục Tin tức).
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

/** Dải trang hiển thị: luôn có trang đầu/cuối, 2 trang quanh trang hiện tại. */
function pageWindow(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const items: (number | '…')[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(totalPages - 1, page + 1);

  if (from > 2) items.push('…');
  for (let i = from; i <= to; i++) items.push(i);
  if (to < totalPages - 1) items.push('…');
  items.push(totalPages);
  return items;
}

export default function Pagination({ page, totalPages, total, pageSize, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  const go = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    onChange(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const btn =
    'min-w-[36px] h-9 px-2.5 rounded-lg text-[13px] font-medium border transition-colors flex items-center justify-center';

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-[#E1E5ED]"
      aria-label="Phân trang"
    >
      <p className="text-[13px] text-[#73726C] tabular-nums order-2 sm:order-1">
        Hiển thị <strong className="text-[#0B2545]">{first.toLocaleString('vi-VN')}</strong>–
        <strong className="text-[#0B2545]">{last.toLocaleString('vi-VN')}</strong> trên{' '}
        <strong className="text-[#0B2545]">{total.toLocaleString('vi-VN')}</strong> bài
      </p>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
          className={`${btn} border-[#E1E5ED] bg-white text-[#0B2545] hover:border-[#1B5FA8] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E1E5ED]`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageWindow(page, totalPages).map((item, i) =>
          item === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-[#73726C] select-none">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => go(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`${btn} tabular-nums ${
                item === page
                  ? 'bg-[#0B2545] text-white border-transparent'
                  : 'border-[#E1E5ED] bg-white text-[#0B2545] hover:border-[#1B5FA8]'
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          aria-label="Trang sau"
          className={`${btn} border-[#E1E5ED] bg-white text-[#0B2545] hover:border-[#1B5FA8] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E1E5ED]`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
