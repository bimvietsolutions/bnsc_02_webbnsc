import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
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
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
