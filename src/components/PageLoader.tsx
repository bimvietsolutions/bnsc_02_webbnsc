/**
 * components/PageLoader.tsx
 * Fallback hiển thị khi chunk của một route đang được tải (lazy-load).
 */
import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-slate-50 text-[#0B2545]">
      <Loader2 className="w-8 h-8 animate-spin text-[#1B5FA8]" />
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Đang tải nội dung…
      </span>
    </div>
  );
}
