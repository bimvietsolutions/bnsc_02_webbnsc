/**
 * components/ScrollManager.tsx
 * Quản lý cuộn khi điều hướng bằng router:
 * - Có hash (#tu-van): cuộn mượt tới section tương ứng.
 * - Không hash: cuộn lên đầu trang khi đổi pathname.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToId } from '../utils/scroll';

export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.replace('#', ''));
      // Chờ nội dung render xong rồi mới cuộn tới section.
      const timer = window.setTimeout(() => scrollToId(id), 60);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
