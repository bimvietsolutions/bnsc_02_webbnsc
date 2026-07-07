/**
 * db/create-admin.mts
 * Tạo (hoặc cập nhật mật khẩu) tài khoản quản trị.
 *   npx tsx db/create-admin.mts <email> <password> [Tên hiển thị]
 * Ví dụ:
 *   npx tsx db/create-admin.mts admin@bacnam.com.vn MatKhauManh123 "Quản trị viên"
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.error('Cú pháp: npx tsx db/create-admin.mts <email> <password> [tên]');
  process.exit(1);
}
if (password.length < 6) {
  console.error('Mật khẩu tối thiểu 6 ký tự.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, isActive: true, ...(name ? { name } : {}) },
    create: { email, passwordHash, name: name || 'Quản trị viên', role: 'ADMIN' },
  });
  console.log(`✓ Đã tạo/cập nhật admin: ${user.email} (id ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
