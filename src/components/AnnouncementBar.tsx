import React, { useState } from 'react';
import { Sparkles, X, Download } from 'lucide-react';
import { useApi } from '../lib/api';
import { settingsFallback } from '../lib/publicData';

interface AnnouncementBarProps {
  onDownloadClick: () => void;
}

export default function AnnouncementBar({ onDownloadClick }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { data: settings } = useApi('/api/public/settings', settingsFallback);

  const enabled = (settings.announcement_enabled ?? 'true') !== 'false';
  const text =
    settings.announcement_text ||
    'Chính thức phát hành Dự toán BNSC v1.20 với nhiều cập nhật định mức đột phá!';

  if (!isVisible || !enabled) return null;

  return (
    <div 
      id="announcement-bar"
      className="bg-[#F5A623] text-[#0B2545] font-semibold text-sm py-2.5 px-4 flex items-center justify-between relative transition-all duration-300 z-50 shadow-sm"
    >
      <div className="flex-1 flex flex-wrap items-center justify-center gap-2 text-center">
        <span className="inline-flex items-center gap-1.5 bg-[#0B2545] text-[#F5A623] text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3 h-3 animate-pulse" /> Phiên bản mới
        </span>
        <span className="text-[#0B2545]/90">{text}</span>
        <button 
          onClick={onDownloadClick}
          className="inline-flex items-center gap-1 font-bold underline hover:text-[#0B2545]/80 transition-colors bg-transparent border-none cursor-pointer ml-1 text-sm decoration-2"
        >
          <Download className="w-3.5 h-3.5 inline" /> Tải ngay bản nâng cấp
        </button>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="p-1 hover:bg-[#0b2545]/10 rounded-full transition-colors absolute right-2 md:right-4 top-1/2 -translate-y-1/2 cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
