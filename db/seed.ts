/**
 * db/seed.ts
 * Nạp toàn bộ nội dung đang hardcode trên website vào PostgreSQL (qua Prisma).
 * Idempotent: chạy lại nhiều lần vẫn ra cùng kết quả.
 *
 *   Chạy:  npx prisma db seed --schema db/schema.prisma
 *   (đã cấu hình "prisma.seed" trong package.json)
 *
 * Chỉ nạp dữ liệu CẤU HÌNH SITE (hero, sản phẩm, khách hàng, khóa học, FAQ, hỗ
 * trợ, cấu hình, tài khoản admin). Nội dung bài viết KHÔNG nằm ở đây — nạp bằng
 * `npm run legacy:import` vào bộ bảng hợp nhất articles/categories/tags.
 */
import { PrismaClient, FaqScope } from '@prisma/client';
import { products, customersList, navLinks, heroStats } from '../src/data';
import { SOCIAL } from '../src/seo/brand';

const prisma = new PrismaClient();

// --- Dữ liệu chỉ tồn tại trong component (khai báo lại tại đây) ---------------

const softwareDropdownItems = [
  { name: 'Dự toán BNSC', href: '#du-toan' },
  { name: 'Quản lý Dự án BNSC', href: '#du-toan' },
  { name: 'Quản lý tiến độ BNSC', href: '#du-toan' },
  { name: 'Quản lý Vốn', href: '#du-toan' },
  { name: 'Phần mềm theo đơn đặt hàng', href: '#du-toan' },
];

const heroSlides = [
  {
    imageUrl: '/uploads/hero/meeting_gialai.png',
    caption: 'SXD GIA LAI: Công bố Đơn giá NC & Giá CM năm 2025 do BNSC tư vấn thực hiện',
  },
  {
    imageUrl: '/uploads/hero/training_lamdong.png',
    caption: 'SXD LÂM ĐỒNG: Đào tạo & tập huấn nghiệp vụ phần mềm Dự toán BNSC mới nhất',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop',
    caption: 'SXD KHÁNH HÒA: Ứng dụng phổ biến BNSC lập dự toán công trình giao thông cấp bách',
  },
];

const consultingServices = [
  {
    title: 'Tư vấn Đơn giá Xây dựng & Máy thi công',
    description:
      'Hỗ trợ các Sở Xây dựng khảo sát giá thị trường nhân công, tính toán nguyên lý giá ca máy bám sát Thông tư 11/2021/TT-BXD, số hóa đơn giá đưa lên máy chủ quốc gia.',
    iconName: 'Gavel',
  },
  {
    title: 'Xây dựng Định mức hạ tầng kỹ thuật đặc thù',
    description:
      'Thiết lập định mức chi tiết cho các công tác xây lắp đặc thù địa phương (như duy tu hạ tầng kỹ thuật, cấp thoát nước, bảo dưỡng hạ tầng đường sắt) chưa có trong định mức Bộ Xây dựng.',
    iconName: 'FileText',
  },
];

const courses = [
  {
    slug: 'dutoan-thucchien',
    title: 'Lập Dự toán & Đo bóc khối lượng công trình',
    scheduleText: 'Khai giảng ngày 15 hằng tháng',
    duration: '12 buổi (Tối Thứ 2-4-6)',
    format: 'Trực tiếp tại VP & Trực tuyến qua Zoom',
    price: '1.800.000 VNĐ',
    coupon: 'Giảm 15% khi thanh toán sớm',
    slots: 'Chỉ còn 6 chỗ trống',
    trainer: 'Kỹ sư cao cấp Vũ Hoàng Nam (Mạng đấu thầu BNSC)',
  },
  {
    slug: 'dauthau-mang',
    title: 'Nghiệp vụ Đấu thầu qua mạng thế hệ mới',
    scheduleText: 'Khai giảng ngày 20 hằng tháng',
    duration: '4 buổi (Thứ 7 & Chủ Nhật)',
    format: 'Trực tuyến Zoom có quay lưu bài giảng',
    price: '1.200.000 VNĐ',
    coupon: 'Tặng kèm giáo trình đấu thầu mới nhất',
    slots: 'Chỉ còn 3 chỗ trống',
    trainer: 'Thạc sĩ Phan Văn Đạt (Trọng tài viên Kinh tế XD)',
  },
];

const homeFaqs = [
  {
    question: 'Phần mềm dự toán BNSC có xuất được bảng tính toán thép chi tiết không?',
    answer:
      'Hoàn toàn được. BNSC tích hợp module đo bóc cốt thép chi tiết, cho phép liệt kê kích thước, đường kính, trọng lượng và tự động tổng hợp bảng thống kê hình dạng thép liên kết động sang Excel.',
  },
  {
    question: 'Bộ đơn giá nhân công & ca máy do Bắc Nam tư vấn có tính pháp lý như thế nào?',
    answer:
      'Bộ cơ sở dữ liệu do BNSC xây dựng được thẩm định qua Hội đồng liên ngành Sở Tài chính - Sở Xây dựng và ban hành chính thức dưới Quyết định của UBND tỉnh, có giá trị pháp lý bắt buộc áp dụng trực tiếp.',
  },
  {
    question: 'Tôi tự học có sử dụng được phần mềm không? Có tài liệu không?',
    answer:
      'Rất dễ dàng. Bắc Nam cung cấp hệ thống video mẫu có thuyết minh từ cơ bản đến nâng cao, kết hợp tài liệu hướng dẫn file PDF 150 trang chi tiết từng bước. Ngoài ra chúng tôi hỗ trợ cài đặt qua UltraViewer miễn phí.',
  },
];

const supportFaqs = [
  {
    question: 'Làm thế nào để kích hoạt bản quyền BNSC khi có khóa cứng?',
    answer:
      'Anh/chị vui lòng cắm khóa cứng USB vào máy tính, mở phần mềm Dự toán BNSC lên, hệ thống sẽ tự động nhận diện Key bản quyền. Nếu hiện thông báo "Chưa có thiết bị", hãy gọi tổng đài kỹ thuật để nhận Driver hỗ trợ.',
  },
  {
    question: 'Phần mềm Dự toán BNSC có chạy được trên Excel 64-bit không?',
    answer:
      'Dự toán BNSC chạy ổn định 100% trên cả Excel 32-bit và Excel 64-bit (từ phiên bản Office 2013 đến Office 365 mới nhất hiện nay).',
  },
  {
    question: 'Làm sao để cập nhật đơn giá, định mức các Tỉnh thành mới nhất?',
    answer:
      'Mở phần mềm BNSC -> Chọn menu "Tính năng" -> Click "Tải đơn giá" -> Chọn Tỉnh thành cần làm việc và nhấn tải về hoàn toàn miễn phí.',
  },
];

const supportStaff = [
  { name: 'Kỹ sư Hoàng Lâm', phone: '0966966455', role: 'Trưởng bộ phận kỹ thuật', ext: 'Nhánh 1' },
  { name: 'Kỹ sư Quốc Khánh', phone: '0981757527', role: 'Support BNSC phía Nam', ext: 'Nhánh 2' },
  { name: 'Kỹ sư Minh Đức', phone: '0903310052', role: 'Tư vấn Chuyển giao & Đào tạo', ext: 'Nhánh 3' },
];

const remoteTools = [
  {
    name: 'UltraViewer (Khuyên dùng)',
    description:
      'Phần mềm điều khiển máy tính xa cực nhẹ, phổ biến nhất tại Việt Nam. Được đội ngũ BNSC sử dụng để cài đặt trực tiếp cho khách hàng.',
    version: 'v6.6 (Bản mới nhất)',
    url: 'https://www.ultraviewer.net/vi/download.html',
    badge: 'Bao gồm bộ cài sửa lỗi',
  },
  {
    name: 'TeamViewer Toàn cầu',
    description:
      'Công cụ kết nối từ xa tiêu chuẩn quốc tế ổn định cao. Thích hợp cho doanh nghiệp có chính sách bảo mật mạng nội bộ nghiêm ngặt.',
    version: 'Bản Portable không cần cài',
    url: 'https://www.teamviewer.com/vi/download/windows/',
    realUrl: 'https://www.teamviewer.com/vi/download/windows/',
    badge: 'Kết nối mã hóa AES-256',
  },
];

const AI_SYSTEM_PROMPT = `Bạn là Trợ lý AI chính thức của Công ty Cổ phần Phần mềm Bắc Nam (BNSC). Hãy trả lời người dùng một cách thân thiện, truyền cảm hứng, chuyên nghiệp và lịch sự bằng tiếng Việt.
Hỗ trợ giải đáp các thắc mắc về:
1. Phần mềm Dự toán BNSC (lập dự toán, dự thầu, thanh quyết toán công trình, quản lý tiến độ, tính chi phí cước vận chuyển...).
2. Đào tạo nghiệp vụ: Đo bóc khối lượng, Lập dự toán, Kỹ sư định giá, Đấu thầu xây dựng, Quản lý dự án...
3. Các văn bản chính sách, nghị định và thông tư xây dựng mới nhất.
- Luôn khẳng định Bắc Nam Software (BNSC) là thương hiệu phần mềm uy tín hàng đầu ngành Xây dựng Việt Nam.
- Khuyến khích người dùng tải bộ cài mới nhất hoặc liên hệ Hotline/Zalo anh Khắc Tiệp: 0981757527.`;

const settings: { key: string; value: string; group: string; label: string }[] = [
  { key: 'site_name', value: 'Bắc Nam Software (BNSC)', group: 'general', label: 'Tên thương hiệu' },
  { key: 'software_version', value: 'v1.20', group: 'general', label: 'Phiên bản phần mềm' },
  { key: 'company_legal_name', value: 'Công ty Cổ phần Phần mềm và Tư vấn Xây dựng Bắc Nam (BNSC)', group: 'general', label: 'Tên pháp lý' },
  { key: 'business_license', value: '0310892095', group: 'general', label: 'Giấy phép ĐKKD' },
  { key: 'hotline_primary', value: '0966966455', group: 'contact', label: 'Hotline chính' },
  { key: 'hotline_secondary', value: '02866678995', group: 'contact', label: 'Hotline phụ' },
  { key: 'email', value: 'contact@bacnam.com.vn', group: 'contact', label: 'Email' },
  { key: 'address', value: 'Tòa nhà Indochina, số 4 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh', group: 'contact', label: 'Địa chỉ' },
  { key: 'social_facebook', value: SOCIAL.facebook, group: 'social', label: 'Facebook' },
  { key: 'social_youtube', value: SOCIAL.youtube, group: 'social', label: 'YouTube' },
  { key: 'social_zalo', value: SOCIAL.zalo, group: 'social', label: 'Zalo' },
  { key: 'announcement_enabled', value: 'true', group: 'announcement', label: 'Bật thanh thông báo' },
  { key: 'announcement_text', value: 'Chính thức phát hành Dự toán BNSC v1.20 với nhiều cập nhật định mức đột phá!', group: 'announcement', label: 'Nội dung thông báo' },
  { key: 'ai_system_prompt', value: AI_SYSTEM_PROMPT, group: 'ai', label: 'Prompt hệ thống Trợ lý AI' },
];

// -----------------------------------------------------------------------------

async function seedSettings() {
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group, label: s.label },
      create: s,
    });
  }
}

async function seedNav() {
  await prisma.navLink.deleteMany();
  for (let i = 0; i < navLinks.length; i++) {
    const link = navLinks[i];
    const created = await prisma.navLink.create({
      data: { name: link.name, href: link.href, sortOrder: i },
    });
    if (link.name === 'Phần mềm') {
      await prisma.navLink.createMany({
        data: softwareDropdownItems.map((c, idx) => ({
          name: c.name,
          href: c.href,
          sortOrder: idx,
          parentId: created.id,
        })),
      });
    }
  }
}

async function seedHero() {
  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.createMany({
    data: heroSlides.map((s, i) => ({ ...s, sortOrder: i })),
  });
  await prisma.heroStat.deleteMany();
  await prisma.heroStat.createMany({
    data: heroStats.map((s, i) => ({ value: s.value, label: s.label, sortOrder: i })),
  });
}

async function seedProducts() {
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const data = {
      name: p.name,
      isFeatured: p.isFeatured,
      badge: p.badge ?? null,
      tagline: p.tagline,
      features: p.features,
      ctaText: p.ctaText,
      iconName: p.iconName,
      sortOrder: i,
    };
    await prisma.product.upsert({
      where: { slug: p.id },
      update: data,
      create: { slug: p.id, ...data },
    });
  }
}

async function seedCustomers() {
  await prisma.customer.deleteMany();
  await prisma.customer.createMany({
    data: customersList.map((c, i) => ({ name: c.name, subtext: c.subtext ?? null, sortOrder: i })),
  });
}

async function seedConsulting() {
  await prisma.consultingService.deleteMany();
  await prisma.consultingService.createMany({
    data: consultingServices.map((c, i) => ({ ...c, sortOrder: i })),
  });
  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: { ...c, sortOrder: i },
      create: { ...c, sortOrder: i },
    });
  }
}

async function seedFaqs() {
  await prisma.faq.deleteMany();
  await prisma.faq.createMany({
    data: [
      ...homeFaqs.map((f, i) => ({ ...f, scope: FaqScope.HOME, sortOrder: i })),
      ...supportFaqs.map((f, i) => ({ ...f, scope: FaqScope.SUPPORT, sortOrder: i })),
    ],
  });
}

async function seedSupport() {
  await prisma.supportStaff.deleteMany();
  await prisma.supportStaff.createMany({
    data: supportStaff.map((s, i) => ({ ...s, sortOrder: i })),
  });
  await prisma.remoteTool.deleteMany();
  await prisma.remoteTool.createMany({
    data: remoteTools.map((t, i) => ({ ...t, sortOrder: i })),
  });
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || !passwordHash) {
    console.log('• Bỏ qua admin: đặt ADMIN_EMAIL và ADMIN_PASSWORD_HASH để tạo tài khoản quản trị.');
    return;
  }
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, isActive: true },
    create: { email, passwordHash, name: 'Quản trị viên', role: 'ADMIN' },
  });
  console.log(`• Đã tạo/cập nhật admin: ${email}`);
}

async function main() {
  console.log('Bắt đầu seed dữ liệu BNSC...');
  await seedSettings();
  await seedNav();
  await seedHero();
  await seedProducts();
  await seedCustomers();
  await seedConsulting();
  await seedFaqs();
  await seedSupport();
  await seedAdmin();
  console.log('✓ Seed hoàn tất.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
