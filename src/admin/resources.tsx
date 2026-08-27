/**
 * admin/resources.tsx
 * Khai báo cấu hình CRUD cho từng resource: nhãn, cột danh sách, và các trường
 * biểu mẫu. ResourceList/ResourceForm render generic dựa trên cấu hình này.
 */
import {
  Newspaper, Package, Users, Image, BarChart3, Layers, GraduationCap,
  HelpCircle, Headphones, MonitorSmartphone, Menu, Settings, Inbox, ShieldCheck,
  FileImage, Tags, ListTree, Link2, type LucideIcon,
} from 'lucide-react';

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'array'
  | 'image' | 'relation' | 'password' | 'readonly' | 'datetime'
  // Soạn thảo HTML có thanh công cụ — dùng cho nội dung bài viết chuyển từ site cũ
  | 'richtext'
  // Danh sách thẻ (nhập tự do, lưu dưới dạng mảng slug)
  | 'tags';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  /** cho type 'relation': resource nguồn + trường hiển thị */
  relation?: { resource: string; labelField: string };
  full?: boolean; // chiếm cả 2 cột
}

export interface ColumnDef {
  name: string;
  label: string;
  /** hàm render giá trị (vd category.name) */
  accessor?: (row: any) => any;
  type?: 'text' | 'boolean' | 'badge' | 'datetime';
}

/** Bộ lọc dạng select ở đầu trang danh sách (khớp filterFields ở server). */
export interface FilterDef {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface ResourceDef {
  slug: string;
  label: string;
  singular: string;
  icon: LucideIcon;
  group: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  canCreate?: boolean;
  /** Hiện ô tìm kiếm (server phải khai báo searchFields tương ứng). */
  searchable?: boolean;
  filters?: FilterDef[];
}

const SECTION_OPTIONS = [
  { value: 'NEWS', label: 'Tin tức' },
  { value: 'LIBRARY', label: 'Thư viện' },
  { value: 'CONSULTING', label: 'Tư vấn' },
  { value: 'TRAINING', label: 'Đào tạo' },
];

const F = {
  sortOrder: { name: 'sortOrder', label: 'Thứ tự', type: 'number' as const },
  isActive: { name: 'isActive', label: 'Hiển thị', type: 'boolean' as const },
};

const seo: FieldDef[] = [
  { name: 'metaTitle', label: 'SEO Title', type: 'text' },
  { name: 'metaDescription', label: 'SEO Description', type: 'textarea' },
  { name: 'ogImage', label: 'OG Image (URL)', type: 'image' },
];

export const resourceDefs: ResourceDef[] = [
  {
    slug: 'articles', label: 'Bài viết', singular: 'bài viết', icon: Newspaper, group: 'Nội dung',
    searchable: true,
    filters: [
      { name: 'section', label: 'Mảng', options: SECTION_OPTIONS },
      { name: 'isPublished', label: 'Xuất bản', options: [{ value: 'true', label: 'Đã xuất bản' }, { value: 'false', label: 'Bản nháp' }] },
    ],
    columns: [
      { name: 'title', label: 'Tiêu đề' },
      { name: 'section', label: 'Mảng', type: 'badge' },
      { name: 'category', label: 'Danh mục', accessor: (r) => r.category?.name },
      { name: 'publishedAt', label: 'Đăng lúc', type: 'datetime' },
      { name: 'views', label: 'Lượt xem' },
      { name: 'isPublished', label: 'Xuất bản', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug (URL)', type: 'text', required: true, help: 'Không dấu, duy nhất trên toàn site. Đổi slug sẽ làm hỏng liên kết cũ.' },
      { name: 'section', label: 'Mảng nội dung', type: 'select', options: SECTION_OPTIONS, required: true },
      { name: 'categoryId', label: 'Danh mục', type: 'relation', relation: { resource: 'categories', labelField: 'name' } },
      { name: 'summary', label: 'Tóm tắt', type: 'textarea', full: true, help: 'Dùng cho thẻ bài và meta description.' },
      { name: 'contentHtml', label: 'Nội dung', type: 'richtext', full: true },
      { name: 'tagSlugs', label: 'Thẻ chuyên đề', type: 'tags', full: true },
      { name: 'coverUrl', label: 'Ảnh bìa (URL)', type: 'image' },
      { name: 'thumbUrl', label: 'Ảnh nhỏ danh sách (URL)', type: 'image' },
      { name: 'coverAlt', label: 'Mô tả ảnh (alt)', type: 'text' },
      { name: 'videoUrl', label: 'Video (URL YouTube)', type: 'text' },
      { name: 'author', label: 'Tác giả', type: 'text' },
      { name: 'publishedAt', label: 'Thời điểm đăng', type: 'datetime' },
      { name: 'dateText', label: 'Ngày hiển thị (ghi đè)', type: 'text', help: 'Bỏ trống để tự sinh từ thời điểm đăng.' },
      { name: 'views', label: 'Lượt xem', type: 'number' },
      { name: 'attachmentUrl', label: 'Tệp đính kèm (URL)', type: 'text' },
      { name: 'attachmentName', label: 'Tên tệp', type: 'text' },
      { name: 'attachmentSize', label: 'Dung lượng', type: 'text' },
      { name: 'isPublished', label: 'Xuất bản', type: 'boolean' },
      { name: 'isFeatured', label: 'Nổi bật', type: 'boolean' },
      { name: 'isRecommended', label: 'Đề xuất', type: 'boolean' },
      { name: 'isBreaking', label: 'Tin nóng', type: 'boolean' },
      { name: 'isSlider', label: 'Đưa lên slider trang chủ', type: 'boolean' },
      { name: 'sliderOrder', label: 'Thứ tự trong slider', type: 'number' },
      ...seo,
      { name: 'metaKeywords', label: 'SEO Keywords', type: 'text' },
      { name: 'canonicalUrl', label: 'Canonical URL', type: 'text' },
    ],
  },
  {
    slug: 'categories', label: 'Danh mục', singular: 'danh mục', icon: Layers, group: 'Nội dung',
    searchable: true,
    filters: [{ name: 'section', label: 'Mảng', options: SECTION_OPTIONS }],
    columns: [
      { name: 'name', label: 'Tên' },
      { name: 'slug', label: 'Slug' },
      { name: 'section', label: 'Mảng', type: 'badge' },
      { name: 'parent', label: 'Thuộc mục', accessor: (r) => r.parent?.name },
      { name: 'sortOrder', label: 'Thứ tự' },
      { name: 'isActive', label: 'Hiển thị', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'section', label: 'Mảng nội dung', type: 'select', options: SECTION_OPTIONS, required: true },
      { name: 'parentId', label: 'Thuộc mục cha', type: 'relation', relation: { resource: 'categories', labelField: 'name' }, help: 'Bỏ trống nếu đây là mục gốc.' },
      { name: 'title', label: 'Tiêu đề SEO', type: 'text', full: true },
      { name: 'description', label: 'Mô tả', type: 'textarea', full: true },
      { name: 'emoji', label: 'Biểu tượng tab', type: 'text', help: 'Một emoji, vd ⚙ ▶ 🔍' },
      { name: 'color', label: 'Màu nhãn', type: 'text', help: 'vd #1B5FA8' },
      { name: 'showOnMenu', label: 'Hiện trên menu', type: 'boolean' },
      { name: 'showAtHomepage', label: 'Hiện ở trang chủ', type: 'boolean' },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'tags', label: 'Thẻ chuyên đề', singular: 'thẻ', icon: Tags, group: 'Nội dung',
    searchable: true,
    columns: [
      { name: 'name', label: 'Tên thẻ' },
      { name: 'slug', label: 'Slug' },
    ],
    fields: [
      { name: 'name', label: 'Tên thẻ', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true, help: 'Dùng trong URL /tag/<slug>' },
    ],
  },
  {
    slug: 'series', label: 'Mục lục giáo trình', singular: 'mục', icon: ListTree, group: 'Nội dung',
    searchable: true,
    columns: [
      { name: 'title', label: 'Tiêu đề mục' },
      { name: 'article', label: 'Bài gắn kèm', accessor: (r) => r.article?.title },
      { name: 'sortOrder', label: 'Thứ tự' },
      { name: 'isActive', label: 'Hiển thị', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Tiêu đề mục', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'parentId', label: 'Thuộc phần', type: 'relation', relation: { resource: 'series', labelField: 'title' }, help: 'Bỏ trống nếu đây là giáo trình gốc.' },
      { name: 'articleId', label: 'Bài viết gắn kèm', type: 'relation', relation: { resource: 'articles', labelField: 'title' }, help: 'Bỏ trống nếu mục chưa có nội dung.' },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'redirects', label: 'Chuyển hướng 301', singular: 'chuyển hướng', icon: Link2, group: 'Nội dung',
    searchable: true,
    columns: [
      { name: 'from', label: 'URL cũ' },
      { name: 'to', label: 'URL mới' },
      { name: 'status', label: 'Mã' },
      { name: 'hits', label: 'Lượt dùng' },
    ],
    fields: [
      { name: 'from', label: 'URL cũ', type: 'text', required: true, full: true, help: 'Bắt đầu bằng /, vd /vinh-long-quyet-dinh-325' },
      { name: 'to', label: 'URL mới', type: 'text', required: true, full: true },
      { name: 'status', label: 'Mã HTTP', type: 'number', help: '301 (vĩnh viễn) hoặc 302 (tạm thời)' },
      { name: 'hits', label: 'Lượt dùng', type: 'readonly' },
    ],
  },
  {
    slug: 'products', label: 'Sản phẩm', singular: 'sản phẩm', icon: Package, group: 'Nội dung',
    columns: [
      { name: 'name', label: 'Tên' },
      { name: 'slug', label: 'Slug' },
      { name: 'isFeatured', label: 'Nổi bật', type: 'boolean' },
      { name: 'sortOrder', label: 'Thứ tự' },
    ],
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'isFeatured', label: 'Nổi bật', type: 'boolean' },
      { name: 'badge', label: 'Nhãn (badge)', type: 'text' },
      { name: 'tagline', label: 'Mô tả ngắn', type: 'textarea', full: true },
      { name: 'features', label: 'Tính năng (mỗi dòng 1 mục)', type: 'array', full: true },
      { name: 'ctaText', label: 'Nút CTA', type: 'text' },
      { name: 'iconName', label: 'Icon (lucide)', type: 'text', help: 'Laptop, Scale, GraduationCap...' },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'hero-slides', label: 'Hero – Slide', singular: 'slide', icon: FileImage, group: 'Trang chủ',
    columns: [
      { name: 'caption', label: 'Chú thích' },
      { name: 'sortOrder', label: 'Thứ tự' },
      { name: 'isActive', label: 'Hiển thị', type: 'boolean' },
    ],
    fields: [
      { name: 'imageUrl', label: 'Ảnh (URL)', type: 'image', required: true, full: true },
      { name: 'caption', label: 'Chú thích', type: 'textarea', full: true },
      { name: 'linkUrl', label: 'Liên kết (tùy chọn)', type: 'text' },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'hero-stats', label: 'Hero – Số liệu', singular: 'số liệu', icon: BarChart3, group: 'Trang chủ',
    columns: [
      { name: 'value', label: 'Giá trị' },
      { name: 'label', label: 'Nhãn' },
      { name: 'sortOrder', label: 'Thứ tự' },
    ],
    fields: [
      { name: 'value', label: 'Giá trị', type: 'text', required: true },
      { name: 'label', label: 'Nhãn', type: 'text', required: true },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'customers', label: 'Khách hàng', singular: 'khách hàng', icon: Users, group: 'Trang chủ',
    columns: [
      { name: 'name', label: 'Tên' },
      { name: 'subtext', label: 'Ghi chú' },
      { name: 'sortOrder', label: 'Thứ tự' },
    ],
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'subtext', label: 'Ghi chú', type: 'text' },
      { name: 'logoUrl', label: 'Logo (URL)', type: 'image' },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'consulting-services', label: 'Dịch vụ tư vấn', singular: 'dịch vụ', icon: ShieldCheck, group: 'Tư vấn & Đào tạo',
    columns: [
      { name: 'title', label: 'Tiêu đề' },
      { name: 'sortOrder', label: 'Thứ tự' },
    ],
    fields: [
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true, full: true },
      { name: 'description', label: 'Mô tả', type: 'textarea', full: true },
      { name: 'iconName', label: 'Icon (Gavel/FileText)', type: 'text' },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'courses', label: 'Khóa đào tạo', singular: 'khóa học', icon: GraduationCap, group: 'Tư vấn & Đào tạo',
    columns: [
      { name: 'title', label: 'Tên khóa' },
      { name: 'price', label: 'Học phí' },
      { name: 'sortOrder', label: 'Thứ tự' },
    ],
    fields: [
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'title', label: 'Tên khóa', type: 'text', required: true, full: true },
      { name: 'scheduleText', label: 'Lịch khai giảng', type: 'text' },
      { name: 'duration', label: 'Thời lượng', type: 'text' },
      { name: 'format', label: 'Hình thức', type: 'text' },
      { name: 'price', label: 'Học phí', type: 'text' },
      { name: 'coupon', label: 'Ưu đãi', type: 'text' },
      { name: 'slots', label: 'Chỗ trống', type: 'text' },
      { name: 'trainer', label: 'Giảng viên', type: 'text', full: true },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'faqs', label: 'FAQ', singular: 'câu hỏi', icon: HelpCircle, group: 'Tư vấn & Đào tạo',
    columns: [
      { name: 'question', label: 'Câu hỏi' },
      { name: 'scope', label: 'Khu vực', type: 'badge' },
      { name: 'sortOrder', label: 'Thứ tự' },
    ],
    fields: [
      { name: 'scope', label: 'Khu vực', type: 'select', options: [{ value: 'HOME', label: 'Trang chủ' }, { value: 'SUPPORT', label: 'Hỗ trợ' }], required: true },
      { name: 'question', label: 'Câu hỏi', type: 'textarea', full: true },
      { name: 'answer', label: 'Trả lời', type: 'textarea', full: true },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'support-staff', label: 'Nhân sự hỗ trợ', singular: 'nhân sự', icon: Headphones, group: 'Hỗ trợ',
    columns: [
      { name: 'name', label: 'Họ tên' },
      { name: 'phone', label: 'Điện thoại' },
      { name: 'role', label: 'Vai trò' },
    ],
    fields: [
      { name: 'name', label: 'Họ tên', type: 'text', required: true },
      { name: 'phone', label: 'Điện thoại', type: 'text', required: true },
      { name: 'role', label: 'Vai trò', type: 'text' },
      { name: 'ext', label: 'Nhánh', type: 'text' },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'remote-tools', label: 'Công cụ hỗ trợ', singular: 'công cụ', icon: MonitorSmartphone, group: 'Hỗ trợ',
    columns: [
      { name: 'name', label: 'Tên' },
      { name: 'version', label: 'Phiên bản' },
    ],
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea', full: true },
      { name: 'version', label: 'Phiên bản', type: 'text' },
      { name: 'url', label: 'Link tải', type: 'text', required: true },
      { name: 'realUrl', label: 'Link tải thật (tùy chọn)', type: 'text' },
      { name: 'badge', label: 'Nhãn', type: 'text' },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'nav-links', label: 'Menu điều hướng', singular: 'mục menu', icon: Menu, group: 'Cấu trúc',
    columns: [
      { name: 'name', label: 'Tên' },
      { name: 'href', label: 'Liên kết' },
      { name: 'sortOrder', label: 'Thứ tự' },
    ],
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'href', label: 'Liên kết', type: 'text', required: true, help: 'vd #tin-tuc hoặc /thu-vien' },
      { name: 'parentId', label: 'Thuộc mục cha', type: 'relation', relation: { resource: 'nav-links', labelField: 'name' } },
      F.sortOrder, F.isActive,
    ],
  },
  {
    slug: 'settings', label: 'Cấu hình site', singular: 'cấu hình', icon: Settings, group: 'Hệ thống',
    canCreate: true,
    columns: [
      { name: 'label', label: 'Tên' },
      { name: 'key', label: 'Khóa' },
      { name: 'value', label: 'Giá trị' },
      { name: 'group', label: 'Nhóm', type: 'badge' },
    ],
    fields: [
      { name: 'key', label: 'Khóa (key)', type: 'text', required: true, help: 'Không đổi khi đã dùng ở frontend. Khóa mới chỉ ra được website nếu có tên trong src/lib/settingsKeys.ts — nếu không, giá trị vẫn lưu nhưng API công khai lọc bỏ.' },
      { name: 'label', label: 'Tên hiển thị', type: 'text' },
      { name: 'group', label: 'Nhóm', type: 'text' },
      { name: 'value', label: 'Giá trị', type: 'textarea', full: true },
    ],
  },
  {
    slug: 'leads', label: 'Lead (đăng ký)', singular: 'lead', icon: Inbox, group: 'Hệ thống',
    canCreate: false,
    searchable: true,
    filters: [
      { name: 'status', label: 'Trạng thái', options: [{ value: 'NEW', label: 'Mới' }, { value: 'CONTACTED', label: 'Đã liên hệ' }, { value: 'DONE', label: 'Hoàn tất' }, { value: 'SPAM', label: 'Spam' }] },
      { name: 'type', label: 'Loại', options: [{ value: 'DOWNLOAD', label: 'Tải phần mềm' }, { value: 'REGISTER', label: 'Đăng ký' }, { value: 'CONSULT', label: 'Tư vấn' }] },
    ],
    columns: [
      { name: 'fullName', label: 'Họ tên' },
      { name: 'phone', label: 'Điện thoại' },
      { name: 'type', label: 'Loại', type: 'badge' },
      { name: 'status', label: 'Trạng thái', type: 'badge' },
      { name: 'createdAt', label: 'Thời gian', type: 'datetime' },
    ],
    fields: [
      { name: 'fullName', label: 'Họ tên', type: 'text' },
      { name: 'phone', label: 'Điện thoại', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'province', label: 'Tỉnh/Thành', type: 'text' },
      { name: 'company', label: 'Đơn vị', type: 'text' },
      { name: 'type', label: 'Loại', type: 'select', options: [{ value: 'DOWNLOAD', label: 'Tải phần mềm' }, { value: 'REGISTER', label: 'Đăng ký' }, { value: 'CONSULT', label: 'Tư vấn' }] },
      { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'NEW', label: 'Mới' }, { value: 'CONTACTED', label: 'Đã liên hệ' }, { value: 'DONE', label: 'Hoàn tất' }, { value: 'SPAM', label: 'Spam' }] },
      { name: 'note', label: 'Ghi chú', type: 'textarea', full: true },
      { name: 'source', label: 'Nguồn', type: 'text' },
    ],
  },
  {
    slug: 'admin-users', label: 'Quản trị viên', singular: 'tài khoản', icon: ShieldCheck, group: 'Hệ thống',
    columns: [
      { name: 'email', label: 'Email' },
      { name: 'name', label: 'Tên' },
      { name: 'role', label: 'Quyền', type: 'badge' },
      { name: 'isActive', label: 'Hoạt động', type: 'boolean' },
    ],
    fields: [
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'name', label: 'Tên hiển thị', type: 'text' },
      { name: 'role', label: 'Quyền', type: 'select', options: [{ value: 'ADMIN', label: 'Admin' }, { value: 'EDITOR', label: 'Editor' }] },
      { name: 'password', label: 'Mật khẩu', type: 'password', help: 'Để trống nếu không đổi (khi sửa)' },
      F.isActive,
    ],
  },
  {
    slug: 'media', label: 'Thư viện ảnh/file', singular: 'media', icon: Image, group: 'Hệ thống',
    columns: [
      { name: 'url', label: 'URL' },
      { name: 'mimeType', label: 'Loại' },
    ],
    fields: [
      { name: 'url', label: 'URL', type: 'text', required: true, full: true },
      { name: 'alt', label: 'Alt', type: 'text' },
      { name: 'mimeType', label: 'MIME', type: 'text' },
      { name: 'sizeBytes', label: 'Dung lượng (byte)', type: 'number' },
    ],
  },
];

export const resourceBySlug = (slug: string) => resourceDefs.find((r) => r.slug === slug);

export const resourceGroups = [
  'Nội dung', 'Trang chủ', 'Tư vấn & Đào tạo', 'Hỗ trợ', 'Cấu trúc', 'Hệ thống',
];
