/**
 * scripts/sync-site-settings.mts
 * Đồng bộ CẤU HÌNH SITE lên CSDL đang chạy mà KHÔNG đụng tới nội dung do admin
 * biên tập.
 *
 *   npm run db:sync-settings
 *
 * Vì sao không dùng `npm run db:seed`: seed gọi deleteMany() cho nav_links,
 * hero_slides, hero_stats, customers, consulting_services, faqs, support_staff
 * và remote_tools rồi dựng lại từ mã nguồn — chạy trên production là xoá sạch
 * mọi chỉnh sửa admin đã làm qua trang quản trị. Script này chỉ:
 *   1. upsert đúng các khóa cấu hình liệt kê bên dưới,
 *   2. đổi số điện thoại cũ trong danh sách nhân sự hỗ trợ,
 *   3. gỡ slide hero dùng ảnh kho stock đã bị loại.
 * Chạy lại nhiều lần vẫn ra cùng kết quả.
 */
import { PrismaClient } from '@prisma/client';
import { HOTLINE, LEGAL_NAME, SOCIAL, SUPPORT_ZALO } from '../src/seo/brand.ts';
import { buildAiSystemPrompt } from '../src/lib/aiPrompt.ts';

const prisma = new PrismaClient();

/** Các số điện thoại từng lưu hành trước khi thống nhất về HOTLINE. */
const SO_CU = ['0966965075', '0981757527'];

/** Ảnh slide hero đã loại (ảnh kho stock chụp công trường ở Mỹ). */
const SLIDE_DA_LOAI = [
  '/img/hero-khanh-hoa.jpg',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop',
];

const CAU_HINH: { key: string; value: string; group: string; label: string }[] = [
  { key: 'company_legal_name', value: LEGAL_NAME, group: 'general', label: 'Tên pháp lý' },
  { key: 'hotline_primary', value: HOTLINE, group: 'contact', label: 'Hotline chính' },
  { key: 'social_facebook', value: SOCIAL.facebook, group: 'social', label: 'Facebook' },
  { key: 'social_youtube', value: SOCIAL.youtube, group: 'social', label: 'YouTube' },
  { key: 'social_zalo', value: SOCIAL.zalo, group: 'social', label: 'Zalo' },
  { key: 'zalo_support_name', value: SUPPORT_ZALO.name, group: 'contact', label: 'Người phụ trách Zalo hỗ trợ' },
  { key: 'zalo_support_phone', value: SUPPORT_ZALO.phone, group: 'contact', label: 'Số Zalo hỗ trợ' },
];

async function main() {
  console.log('Đồng bộ cấu hình site (không đụng nội dung biên tập)...\n');

  for (const c of CAU_HINH) {
    const truoc = await prisma.setting.findUnique({ where: { key: c.key } });
    if (truoc?.value === c.value) {
      console.log(`  = ${c.key.padEnd(20)} đã đúng`);
      continue;
    }
    await prisma.setting.upsert({
      where: { key: c.key },
      update: { value: c.value, group: c.group, label: c.label },
      create: c,
    });
    console.log(`  ${truoc ? '~' : '+'} ${c.key.padEnd(20)} ${truoc ? `${truoc.value} -> ` : ''}${c.value}`);
  }

  // Prompt Trợ lý AI: chỉ tạo nếu chưa có. Admin có thể đã sửa tay, không đè.
  const prompt = await prisma.setting.findUnique({ where: { key: 'ai_system_prompt' } });
  if (!prompt) {
    await prisma.setting.create({
      data: {
        key: 'ai_system_prompt',
        value: buildAiSystemPrompt(SUPPORT_ZALO),
        group: 'ai',
        label: 'Prompt hệ thống Trợ lý AI',
      },
    });
    console.log('  + ai_system_prompt     (tạo mới)');
  } else {
    const conSoCu = SO_CU.filter((s) => prompt.value.includes(s));
    console.log(
      conSoCu.length
        ? `  ! ai_system_prompt     giữ nguyên bản admin đã sửa, NHƯNG còn số cũ: ${conSoCu.join(', ')}`
        : '  = ai_system_prompt     đã có, giữ nguyên',
    );
  }

  // Nhân sự hỗ trợ còn giữ số cũ.
  const doiSo = await prisma.supportStaff.updateMany({
    where: { phone: { in: SO_CU } },
    data: { phone: HOTLINE },
  });
  console.log(`\n  Nhân sự hỗ trợ đổi số: ${doiSo.count} dòng -> ${HOTLINE}`);

  // Slide hero dùng ảnh đã loại.
  const goiSlide = await prisma.heroSlide.deleteMany({ where: { imageUrl: { in: SLIDE_DA_LOAI } } });
  console.log(`  Slide hero gỡ bỏ:      ${goiSlide.count} dòng`);

  const conLai = await prisma.heroSlide.count();
  console.log(`  Slide hero còn lại:    ${conLai}\n`);
  console.log('Xong.');
}

main()
  .catch((e) => {
    console.error('Lỗi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
