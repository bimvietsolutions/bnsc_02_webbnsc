/**
 * admin/resources.tsx
 * Khai báo cấu hình CRUD cho từng resource: nhãn, cột danh sách, và các trường
 * biểu mẫu. ResourceList/ResourceForm render generic dựa trên cấu hình này.
 */
import {
  Newspaper, BookOpen, Package, Users, Image, BarChart3, Layers, GraduationCap,
  HelpCircle, Headphones, MonitorSmartphone, Menu, Settings, Inbox, ShieldCheck,
  FileImage, type LucideIcon,
} from 'lucide-react';

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'array'
  | 'image' | 'relation' | 'password' | 'readonly' | 'datetime';

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

export interface ResourceDef {
  slug: string;
  label: string;
  singular: string;
  icon: LucideIcon;
  group: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  canCreate?: boolean;
}

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
    slug: 'news', label: 'Tin tức', singular: 'tin tức', icon: Newspaper, group: 'Nội dung',
    columns: [
      { name: 'title', label: 'Tiêu đề' },
      { name: 'category', label: 'Danh mục', accessor: (r) => r.category?.name },
      { name: 'views', label: 'Lượt xem' },
      { name: 'isPublished', label: 'Xuất bản', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug (URL)', type: 'text', required: true, help: 'Duy nhất, không dấu' },
      { name: 'categoryId', label: 'Danh mục', type: 'relation', relation: { resource: 'news-categories', labelField: 'name' }, required: true },
      { name: 'excerpt', label: 'Tóm tắt', type: 'textarea', full: true },
      { name: 'contentBody', label: 'Nội dung', type: 'textarea', full: true },
      { name: 'imageUrl', label: 'Ảnh (URL)', type: 'image' },
      { name: 'author', label: 'Tác giả', type: 'text' },
      { name: 'dateText', label: 'Ngày hiển thị', type: 'text', help: 'vd 18 Thg 5, 2026' },
      { name: 'views', label: 'Lượt xem', type: 'number' },
      { name: 'isPublished', label: 'Xuất bản', type: 'boolean' },
      ...seo,
    ],
  },
  {
    slug: 'library', label: 'Thư viện', singular: 'bài thư viện', icon: BookOpen, group: 'Nội dung',
    columns: [
      { name: 'title', label: 'Tiêu đề' },
      { name: 'category', label: 'Danh mục', accessor: (r) => r.category?.name },
      { name: 'views', label: 'Lượt xem' },
      { name: 'isPublished', label: 'Xuất bản', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug (URL)', type: 'text', required: true },
      { name: 'categoryId', label: 'Danh mục', type: 'relation', relation: { resource: 'library-categories', labelField: 'name' }, required: true },
      { name: 'summary', label: 'Tóm tắt', type: 'textarea', full: true },
      { name: 'content', label: 'Nội dung chi tiết', type: 'textarea', full: true },
      { name: 'imageUrl', label: 'Ảnh (URL)', type: 'image' },
      { name: 'videoUrl', label: 'Video (URL)', type: 'text' },
      { name: 'author', label: 'Tác giả', type: 'text' },
      { name: 'dateText', label: 'Ngày hiển thị', type: 'text' },
      { name: 'views', label: 'Lượt xem', type: 'number' },
      { name: 'attachmentUrl', label: 'File đính kèm (URL)', type: 'text' },
      { name: 'attachmentName', label: 'Tên file', type: 'text' },
      { name: 'attachmentSize', label: 'Dung lượng', type: 'text' },
      { name: 'isPublished', label: 'Xuất bản', type: 'boolean' },
      ...seo,
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
    slug: 'news-categories', label: 'Danh mục Tin tức', singular: 'danh mục', icon: Layers, group: 'Cấu trúc',
    columns: [
      { name: 'name', label: 'Tên' },
      { name: 'slug', label: 'Slug' },
      { name: 'sortOrder', label: 'Thứ tự' },
    ],
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      F.sortOrder,
    ],
  },
  {
    slug: 'library-categories', label: 'Danh mục Thư viện', singular: 'danh mục', icon: Layers, group: 'Cấu trúc',
    columns: [
      { name: 'name', label: 'Tên' },
      { name: 'slug', label: 'Slug' },
      { name: 'sortOrder', label: 'Thứ tự' },
    ],
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      F.sortOrder,
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
      { name: 'key', label: 'Khóa (key)', type: 'text', required: true, help: 'Không đổi khi đã dùng ở frontend' },
      { name: 'label', label: 'Tên hiển thị', type: 'text' },
      { name: 'group', label: 'Nhóm', type: 'text' },
      { name: 'value', label: 'Giá trị', type: 'textarea', full: true },
    ],
  },
  {
    slug: 'leads', label: 'Lead (đăng ký)', singular: 'lead', icon: Inbox, group: 'Hệ thống',
    canCreate: false,
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
