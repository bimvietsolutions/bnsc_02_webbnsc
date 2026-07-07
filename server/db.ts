/**
 * server/db.ts
 * Prisma client dùng chung (singleton) để tránh tạo nhiều kết nối khi dev reload.
 */
import { PrismaClient } from '@prisma/client';

// Tránh sập server ngay khi khởi động nếu quên đặt DATABASE_URL: đặt placeholder
// để PrismaClient khởi tạo được; truy vấn sẽ lỗi (và frontend tự dùng fallback).
if (!process.env.DATABASE_URL) {
  console.warn('⚠ DATABASE_URL chưa được đặt — API dữ liệu sẽ không hoạt động cho tới khi cấu hình.');
  process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/placeholder?schema=public';
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
