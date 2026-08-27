import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import * as brand from './src/seo/brand';

/**
 * index.html là HTML tĩnh nên không import được hằng số TypeScript. Plugin này
 * thay các placeholder %BRAND_*% bằng giá trị trong src/seo/brand.ts, để logo,
 * favicon, tiêu đề, mô tả và tên miền chỉ khai báo đúng một nơi thay vì bị chép
 * cứng song song ở index.html.
 */
function brandHtml(siteUrl: string): Plugin {
  const values: Record<string, string> = {
    BRAND_LANG: brand.LANG,
    BRAND_LOCALE: brand.LOCALE,
    BRAND_NAME: brand.BRAND_NAME,
    BRAND_TITLE: brand.DEFAULT_TITLE,
    BRAND_DESCRIPTION: brand.DEFAULT_DESCRIPTION,
    BRAND_OG_DESCRIPTION: brand.OG_DESCRIPTION,
    BRAND_THEME_COLOR: brand.THEME_COLOR,
    BRAND_LOGO: brand.LOGO_PATH,
    BRAND_FAVICON: brand.FAVICON_PATH,
    BRAND_FAVICON_TYPE: brand.FAVICON_TYPE,
    BRAND_SITE_URL: siteUrl,
  };

  return {
    name: 'bnsc-brand-html',
    transformIndexHtml(html) {
      return html.replace(/%BRAND_[A-Z_]+%/g, (token) => {
        const key = token.slice(1, -1);
        const value = values[key];
        if (value === undefined) throw new Error(`index.html dùng ${token} nhưng brand.ts chưa khai báo.`);
        // Giá trị nằm trong thuộc tính HTML -> escape dấu nháy kép và &.
        return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      });
    },
  };
}

export default defineConfig(() => {
  const siteUrl = (process.env.VITE_SITE_URL || brand.DEFAULT_SITE_URL).replace(/\/$/, '');
  return {
    plugins: [react(), tailwindcss(), brandHtml(siteUrl)],
    // Tài nguyên tĩnh của trang nằm ở static/, KHÔNG phải public/.
    // public/uploads là dữ liệu lúc chạy (ảnh admin tải lên + ~2,8 GB ảnh mirror
    // từ website cũ) do Express phục vụ trực tiếp tại /uploads; để nó trong
    // publicDir sẽ khiến mỗi lần build copy toàn bộ vào dist/.
    publicDir: 'static',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      exclude: ['@google/genai', 'express', 'dotenv'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
