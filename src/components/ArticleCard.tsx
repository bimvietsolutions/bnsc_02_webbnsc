/**
 * components/ArticleCard.tsx
 * Thẻ bài viết dùng chung cho mọi trang danh sách (Tin tức / Thư viện / Tư vấn /
 * Đào tạo / Thẻ). 67 bài trong kho cũ không có ảnh nên luôn có ảnh thay thế
 * bằng khối gradient watermark "BNSC".
 */
import { Link } from 'react-router-dom';
import { Calendar, Eye, PlayCircle } from 'lucide-react';
import { articleHref, displayDate, type ArticleListItem } from '../lib/content';

interface ArticleCardProps {
  item: ArticleListItem;
  /** 'grid' cho lưới thẻ, 'row' cho danh sách một cột gọn. */
  variant?: 'grid' | 'row';
}

export default function ArticleCard({ item, variant = 'grid' }: ArticleCardProps) {
  const href = articleHref(item);
  const image = item.thumbUrl ?? item.coverUrl;
  const date = displayDate(item);

  if (variant === 'row') {
    return (
      <Link
        to={href}
        className="group flex items-start gap-3.5 bg-white rounded-xl border border-[#E1E5ED] p-3.5 hover:border-[#1B5FA8]/40 hover:shadow-md transition-all"
      >
        <div className="w-24 h-[62px] shrink-0 rounded-lg overflow-hidden bg-[#0B2545] flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={item.coverAlt ?? item.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-mono tracking-widest text-white/25 select-none">BNSC</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-[13.5px] font-medium text-[#1A1A18] leading-snug line-clamp-2 group-hover:text-[#185FA5] transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-[#73726C] mt-1.5">
            {date && <span>{date}</span>}
            {date && <span className="text-gray-300">•</span>}
            <span className="tabular-nums">{item.views.toLocaleString('vi-VN')} lượt xem</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className="group bg-white rounded-xl overflow-hidden border border-[#E1E5ED] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      <div className="relative h-40 w-full overflow-hidden bg-[#0B2545] flex items-center justify-center shrink-0">
        {image ? (
          <img
            src={image}
            alt={item.coverAlt ?? item.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />
            <span className="text-3xl font-medium tracking-widest text-white/10 select-none font-mono">
              BNSC
            </span>
          </>
        )}

        {item.category && (
          <span
            className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-[#0B2545]/90 border border-white/10 backdrop-blur text-[11px] font-medium text-[#F5A623] rounded shadow-sm"
            style={item.category.color ? { color: undefined } : undefined}
          >
            {item.category.emoji ? `${item.category.emoji} ` : ''}
            {item.category.name}
          </span>
        )}

        {item.videoUrl && (
          <span className="absolute top-2.5 right-2.5 bg-black/60 rounded-full p-1 backdrop-blur">
            <PlayCircle className="w-4 h-4 text-white" />
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2.5 text-[11px] text-[#73726C] mb-2">
          {date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#185FA5]" /> {date}
            </span>
          )}
          {date && <span className="text-gray-300 select-none">•</span>}
          <span className="flex items-center gap-1 tabular-nums">
            <Eye className="w-3.5 h-3.5" /> {item.views.toLocaleString('vi-VN')}
          </span>
        </div>

        <h3 className="text-[15px] font-medium text-[#1A1A18] leading-[1.35] mb-1.5 line-clamp-2 group-hover:text-[#185FA5] transition-colors">
          {item.title}
        </h3>

        {item.summary && (
          <p className="text-[#73726C] text-[13px] leading-[1.5] line-clamp-2">{item.summary}</p>
        )}
      </div>
    </Link>
  );
}
