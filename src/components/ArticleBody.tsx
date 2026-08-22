/**
 * components/ArticleBody.tsx
 * Hiển thị nội dung bài viết dạng HTML (dữ liệu chuyển từ website cũ).
 *
 * An toàn: HTML đã được sanitize ở tầng ETL/API bằng allowlist (xem
 * scripts/legacy/transform.mts). Ở đây chỉ còn lo phần trình bày — nhất là
 * 596 bảng và 3.281 ảnh trong kho bài cũ cần hiển thị đúng trên di động.
 *
 * Nội dung cũ không có HTML (nhập tay bằng textarea) vẫn hiển thị đúng nhờ
 * nhánh xuống dòng ở cuối.
 */
import { useEffect, useRef } from 'react';

interface ArticleBodyProps {
  html?: string | null;
  /** Dùng khi bài chưa chuyển sang HTML (nội dung xuống dòng thuần). */
  fallbackText?: string | null;
  className?: string;
}

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

export default function ArticleBody({ html, fallbackText, className = '' }: ArticleBodyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const content = (html ?? '').trim();
  const isHtml = content.length > 0 && looksLikeHtml(content);

  // Hậu xử lý DOM sau khi render: bọc bảng vào khung cuộn ngang và ép tỉ lệ
  // 16:9 cho iframe YouTube. Làm ở đây thay vì trong chuỗi HTML để giữ nội dung
  // trong CSDL sạch, không lẫn markup trình bày.
  useEffect(() => {
    const root = ref.current;
    if (!root || !isHtml) return;

    root.querySelectorAll('table').forEach((table) => {
      if (table.parentElement?.classList.contains('article-table-scroll')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'article-table-scroll';
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    root.querySelectorAll('iframe').forEach((frame) => {
      if (frame.parentElement?.classList.contains('article-embed')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'article-embed';
      frame.parentNode?.insertBefore(wrapper, frame);
      wrapper.appendChild(frame);
      frame.setAttribute('loading', 'lazy');
    });

    // Ảnh cũ hay đặt width cứng bằng thuộc tính HTML -> bỏ để CSS xử lý
    root.querySelectorAll('img').forEach((img) => {
      img.removeAttribute('height');
      img.setAttribute('loading', 'lazy');
      img.setAttribute('referrerpolicy', 'no-referrer');
    });
  }, [content, isHtml]);

  if (!content && !fallbackText) return null;

  if (!isHtml) {
    return (
      <div className={`article-body article-body--plain ${className}`}>
        {(content || fallbackText || '').split('\n').map((line, i) =>
          line.trim() ? <p key={i}>{line}</p> : <br key={i} />,
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`article-body ${className}`}
      // Nội dung đã qua sanitize-html allowlist ở tầng import/API.
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
