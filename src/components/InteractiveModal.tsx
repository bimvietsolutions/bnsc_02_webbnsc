/**
 * components/InteractiveModal.tsx — Hộp thoại "Cổng dịch vụ Bắc Nam".
 *
 * Ba biểu mẫu dùng chung một Dialog: Tải dùng thử · Đăng ký bản quyền · Đào tạo
 * & tư vấn. Cả ba đều ghi một bản ghi vào bảng `leads`.
 *
 * Dựng theo chuẩn Dialog của crm-erp-design-system:
 *  - Escape đóng, bẫy focus trong hộp thoại, khóa cuộn <body>, trả focus về
 *    đúng phần tử đã mở hộp thoại; role/aria đầy đủ.
 *  - Header + Footer dính, chỉ phần thân cuộn, max-height 90vh.
 *  - Footer PC: Hủy bên trái, nút chính bên phải. Mobile: xếp dọc, chính ở trên.
 *  - Kiểm tra từng ô khi rời ô (blur); lỗi hiện ngay dưới ô, viền chuyển đỏ;
 *    sửa đúng là lỗi biến mất ngay, không đợi blur lần hai.
 *  - Màu/viền lấy từ token `bns-*` khai báo ở src/index.css, không gõ hex.
 *
 * Hai hành vi giả đã bỏ:
 *  1. Tab "Đăng nhập" trước đây chỉ là giao diện — không gọi API, chờ 1,2 giây
 *     rồi báo "Kết nối hệ thống thành công". Đăng nhập thật nay chỉ có một nơi
 *     duy nhất là /dang-nhap, nên tab đó thay bằng liên kết sang trang ấy.
 *  2. Form báo thành công kể cả khi API lưu lead trả về lỗi (lỗi bị nuốt im
 *     lặng). Nay chờ API trả kết quả thật rồi mới báo.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Check, ShieldCheck, Download, Loader2, Send, BadgeCheck,
  GraduationCap, AlertCircle, LogIn,
} from 'lucide-react';
import { apiSend } from '../lib/api';

type Tab = 'download' | 'register' | 'consult';
type FieldName = 'fullName' | 'phone' | 'email';

interface InteractiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 'login' được chấp nhận để tương thích lời gọi cũ; quy về 'register'. */
  initialTab?: Tab | 'login';
  selectedProductId?: string;
}

/** Một nguồn cấu hình cho tab + tiêu đề + nhãn nút, không rải if/else khắp JSX. */
const TABS: { id: Tab; label: string; icon: typeof Download; title: string; submit: string }[] = [
  { id: 'download', label: 'Tải dùng thử', icon: Download, title: 'Tải phần mềm Dự toán BNSC', submit: 'Bắt đầu tải bản v1.20' },
  { id: 'register', label: 'Đăng ký', icon: BadgeCheck, title: 'Đăng ký bản quyền', submit: 'Gửi đăng ký' },
  { id: 'consult', label: 'Đào tạo & tư vấn', icon: GraduationCap, title: 'Đăng ký đào tạo & tư vấn', submit: 'Gửi thông tin đăng ký' },
];

const LEAD_TYPE: Record<Tab, 'DOWNLOAD' | 'REGISTER' | 'CONSULT'> = {
  download: 'DOWNLOAD',
  register: 'REGISTER',
  consult: 'CONSULT',
};

const PROVINCES = [
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Vĩnh Long', 'An Giang',
  'Đắk Lắk', 'Tây Ninh', 'Khánh Hòa', 'Gia Lai', 'Đồng Nai', 'Bà Rịa - Vũng Tàu',
];

const COURSES = [
  { value: 'dutoan-thucchien', label: 'Lập dự toán & đo bóc khối lượng công trình' },
  { value: 'dauthau-mang', label: 'Hồ sơ dự thầu & đấu thầu qua mạng' },
  { value: 'thanh-quyettoan', label: 'Thanh quyết toán vốn đầu tư xây dựng' },
  { value: 'tuvan-dongia', label: 'Đơn giá - Chỉ số giá (Sở Xây dựng)' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VN_PHONE_RE = /^(0|\+84)\d{8,10}$/;

/** Ô bắt buộc dùng chung cho cả ba biểu mẫu -> kiểm tra ở một chỗ. */
function validateField(name: FieldName, raw: string): string {
  const v = raw.trim();
  if (name === 'fullName') return v.length < 2 ? 'Vui lòng nhập họ và tên' : '';
  if (name === 'phone') {
    if (!v) return 'Vui lòng nhập số điện thoại';
    return VN_PHONE_RE.test(v.replace(/[\s.()-]/g, '')) ? '' : 'Số điện thoại không đúng định dạng';
  }
  if (!v) return 'Vui lòng nhập email';
  return EMAIL_RE.test(v) ? '' : 'Email không đúng định dạng';
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const inputBase =
  'w-full bg-bns-surface rounded-xl px-4 py-3 text-sm text-bns-text-primary border transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-bns-blue/25';

export default function InteractiveModal({
  isOpen, onClose, initialTab = 'download', selectedProductId,
}: InteractiveModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab === 'login' ? 'register' : initialTab);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState(PROVINCES[0]);
  const [company, setCompany] = useState('');
  const [course, setCourse] = useState(COURSES[0].value);

  const [errors, setErrors] = useState<Record<FieldName, string>>({ fullName: '', phone: '', email: '' });
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({ fullName: false, phone: false, email: false });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const fieldRefs: Record<FieldName, React.RefObject<HTMLInputElement | null>> = {
    fullName: nameRef,
    phone: phoneRef,
    email: emailRef,
  };
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tab = TABS.find((t) => t.id === activeTab)!;

  // Đặt lại toàn bộ trạng thái mỗi lần mở, tránh mang lỗi của lần trước sang.
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab === 'login' ? 'register' : initialTab);
    setIsDone(false);
    setProgress(0);
    setIsSubmitting(false);
    setFormError('');
    setErrors({ fullName: '', phone: '', email: '' });
    setTouched({ fullName: false, phone: false, email: false });
  }, [isOpen, initialTab]);

  // Escape đóng · bẫy focus · khóa cuộn body · trả focus về nơi đã mở.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [isOpen, onClose]);

  // Dọn interval mô phỏng tải nếu người dùng đóng hộp thoại giữa chừng.
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (isOpen && !isDone) nameRef.current?.focus();
  }, [isOpen, isDone, activeTab]);

  const setField = useCallback((name: FieldName, value: string) => {
    const setter = { fullName: setFullName, phone: setPhone, email: setEmail }[name];
    setter(value);
    // Đang có lỗi mà người dùng sửa thành hợp lệ -> xóa lỗi ngay, không đợi blur.
    setErrors((prev) => (prev[name] && !validateField(name, value) ? { ...prev, [name]: '' } : prev));
  }, []);

  const handleBlur = (name: FieldName, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const switchTab = (id: Tab) => {
    setActiveTab(id);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const next: Record<FieldName, string> = {
      fullName: validateField('fullName', fullName),
      phone: validateField('phone', phone),
      email: validateField('email', email),
    };
    setErrors(next);
    setTouched({ fullName: true, phone: true, email: true });

    const invalid = (Object.keys(next) as FieldName[]).filter((k) => next[k]);
    if (invalid.length) {
      // Banner tổng chỉ tóm tắt số lỗi rồi nhảy tới ô đầu tiên — nội dung chi
      // tiết đã hiện inline dưới từng ô, không lặp lại.
      setFormError(`Còn ${invalid.length} ô chưa hợp lệ, vui lòng kiểm tra lại.`);
      fieldRefs[invalid[0]].current?.focus();
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await apiSend('/api/public/leads', 'POST', {
        type: LEAD_TYPE[activeTab],
        fullName,
        phone,
        email,
        province,
        company,
        productSlug: selectedProductId || undefined,
        courseSlug: activeTab === 'consult' ? course : undefined,
        source: `modal:${activeTab}`,
      });
    } catch {
      setIsSubmitting(false);
      setFormError(
        'Chưa gửi được thông tin lúc này. Vui lòng thử lại, hoặc gọi hotline 0981 757 527 để được hỗ trợ trực tiếp.',
      );
      return;
    }

    if (activeTab === 'download') {
      let value = 0;
      timerRef.current = setInterval(() => {
        value += 8;
        if (value >= 100) {
          value = 100;
          if (timerRef.current) clearInterval(timerRef.current);
          setIsSubmitting(false);
          setIsDone(true);
        }
        setProgress(value);
      }, 120);
    } else {
      setIsSubmitting(false);
      setIsDone(true);
    }
  };

  if (!isOpen) return null;

  const fieldClass = (name: FieldName, extra = '') =>
    `${inputBase} ${extra} ${
      touched[name] && errors[name]
        ? 'border-bns-danger focus:ring-bns-danger/25'
        : 'border-bns-border focus:border-bns-blue'
    }`;

  const FieldError = ({ name }: { name: FieldName }) =>
    touched[name] && errors[name] ? (
      <p id={`err-${name}`} className="mt-1.5 flex items-center gap-1 text-xs text-bns-danger">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        {errors[name]}
      </p>
    ) : null;

  const describedBy = (name: FieldName) => (touched[name] && errors[name] ? `err-${name}` : undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-bns-navy/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bnsc-modal-title"
        className="animate-scaleUp relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-bns-border bg-bns-surface text-left text-bns-text-primary shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-bns-blue to-bns-accent" />

        {/* Header — dính đỉnh */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-bns-border bg-bns-surface-muted px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-bns-blue">
              Cổng dịch vụ Bắc Nam
            </span>
            <h3
              id="bnsc-modal-title"
              className="mt-0.5 truncate text-lg font-extrabold tracking-tight text-bns-navy sm:text-xl"
            >
              {isDone ? 'Đã ghi nhận thông tin' : tab.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="-mr-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-bns-text-secondary transition-colors hover:bg-bns-border/60 hover:text-bns-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-bns-blue sm:h-10 sm:w-10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        {!isDone && (
          <div
            role="tablist"
            aria-label="Chọn dịch vụ"
            className="flex shrink-0 overflow-x-auto border-b border-bns-border bg-bns-surface-muted/60 text-sm"
          >
            {TABS.map(({ id, label, icon: Icon }) => {
              const on = id === activeTab;
              return (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => switchTab(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bns-blue ${
                    on
                      ? 'border-bns-accent bg-bns-surface text-bns-navy'
                      : 'border-transparent text-bns-text-secondary hover:text-bns-navy'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Body — vùng duy nhất được cuộn */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {isDone ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-bns-success-soft text-bns-success">
                <Check className="h-8 w-8 stroke-[3]" aria-hidden="true" />
              </div>

              {activeTab === 'download' && (
                <>
                  <h4 className="mb-2 text-xl font-bold text-bns-navy">Đăng ký thông tin thành công!</h4>
                  <p className="mx-auto mb-6 max-w-sm text-sm text-bns-text-secondary">
                    Bộ cài đặt đang được gửi tới máy tính của bạn qua đường truyền an toàn của Bắc Nam Software.
                  </p>
                  <div className="mb-6 w-full space-y-3.5 rounded-xl border border-bns-border bg-bns-surface-muted p-4 text-left">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 shrink-0 text-bns-blue" aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold text-bns-text-secondary">Tập tin tải về</span>
                        <span className="break-all text-sm font-extrabold text-bns-navy">
                          DutoanBNSC_Setup_v1.20_Full_2026.zip
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 border-t border-bns-border pt-3">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-bns-success" aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold text-bns-success">
                          Chứng chỉ số an toàn SHA-256
                        </span>
                        <span className="select-all font-mono text-xs text-bns-text-secondary">
                          Verified MD5: e2efbfcc5b364db3bd9db8
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-bns-text-secondary">
                    Nếu quá trình tải không tự bắt đầu, vui lòng kiểm tra hộp thư{' '}
                    <strong className="font-semibold text-bns-navy">{email}</strong> để nhận liên kết thay thế.
                  </p>
                </>
              )}

              {activeTab === 'register' && (
                <>
                  <h4 className="mb-2 text-xl font-bold text-bns-navy">Đã nhận phiếu đăng ký bản quyền!</h4>
                  <p className="mx-auto mb-6 max-w-sm text-sm text-bns-text-secondary">
                    Cảm ơn anh/chị <strong className="font-bold text-bns-navy">{fullName}</strong>. Bộ phận kinh doanh
                    sẽ liên hệ để xác nhận gói bản quyền phù hợp.
                  </p>
                  <div className="w-full rounded-xl border border-bns-border bg-bns-info-soft p-4 text-sm font-medium text-bns-blue">
                    Chúng tôi sẽ gọi tới số <strong className="font-mono font-bold">{phone}</strong> trong giờ hành
                    chính và gửi báo giá qua <strong className="font-semibold">{email}</strong>.
                  </div>
                </>
              )}

              {activeTab === 'consult' && (
                <>
                  <h4 className="mb-2 text-xl font-bold text-bns-navy">Gửi lịch đăng ký thành công!</h4>
                  <p className="mx-auto mb-6 max-w-sm text-sm text-bns-text-secondary">
                    Chuyên viên tư vấn đã ghi nhận phiếu đăng ký của anh/chị{' '}
                    <strong className="font-bold text-bns-navy">{fullName}</strong>.
                  </p>
                  <div className="w-full rounded-xl border border-bns-border bg-bns-success-soft p-4 text-sm font-medium text-bns-success">
                    Điện thoại viên sẽ liên hệ qua số <strong className="font-mono font-bold">{phone}</strong> trong
                    vòng 15–30 phút để xác nhận khóa học.
                  </div>
                </>
              )}
            </div>
          ) : (
            <form id="bnsc-lead-form" onSubmit={handleSubmit} noValidate className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border-l-[3px] border-bns-danger bg-bns-danger-soft p-3.5 text-sm font-medium text-bns-danger"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <p className="rounded-xl border border-bns-blue/15 bg-bns-info-soft p-3 text-xs leading-normal text-bns-text-secondary">
                {activeTab === 'download' &&
                  'Nhận miễn phí khóa bản quyền học tập v1.20 kèm bộ dữ liệu đơn giá mới nhất của 63 tỉnh thành.'}
                {activeTab === 'register' &&
                  'Điền thông tin để nhận báo giá bản quyền và tư vấn gói phù hợp với quy mô đơn vị.'}
                {activeTab === 'consult' &&
                  'Các khóa bồi dưỡng do kỹ sư nhiều năm kinh nghiệm trực tiếp hướng dẫn. Học viên được tặng license Dự toán BNSC.'}
              </p>

              <fieldset className="space-y-4 border-0 p-0">
                <legend className="mb-1 text-xs font-bold uppercase tracking-wider text-bns-text-secondary">
                  Thông tin liên hệ
                </legend>

                <div>
                  <label htmlFor="lead-fullname" className="mb-1.5 block text-xs font-semibold text-bns-navy">
                    Họ và tên <span className="text-bns-danger">*</span>
                  </label>
                  <input
                    id="lead-fullname"
                    ref={nameRef}
                    type="text"
                    autoComplete="name"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setField('fullName', e.target.value)}
                    onBlur={(e) => handleBlur('fullName', e.target.value)}
                    aria-invalid={touched.fullName && !!errors.fullName}
                    aria-describedby={describedBy('fullName')}
                    className={fieldClass('fullName')}
                  />
                  <FieldError name="fullName" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="lead-phone" className="mb-1.5 block text-xs font-semibold text-bns-navy">
                      Số điện thoại <span className="text-bns-danger">*</span>
                    </label>
                    <input
                      id="lead-phone"
                      ref={phoneRef}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="0912 345 678"
                      value={phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      onBlur={(e) => handleBlur('phone', e.target.value)}
                      aria-invalid={touched.phone && !!errors.phone}
                      aria-describedby={describedBy('phone')}
                      className={fieldClass('phone', 'font-mono tabular-nums')}
                    />
                    <FieldError name="phone" />
                  </div>
                  <div>
                    <label htmlFor="lead-email" className="mb-1.5 block text-xs font-semibold text-bns-navy">
                      Email <span className="text-bns-danger">*</span>
                    </label>
                    <input
                      id="lead-email"
                      ref={emailRef}
                      type="email"
                      autoComplete="email"
                      placeholder="kysu@congty.vn"
                      value={email}
                      onChange={(e) => setField('email', e.target.value)}
                      onBlur={(e) => handleBlur('email', e.target.value)}
                      aria-invalid={touched.email && !!errors.email}
                      aria-describedby={describedBy('email')}
                      className={fieldClass('email')}
                    />
                    <FieldError name="email" />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-0 p-0">
                <legend className="mb-1 text-xs font-bold uppercase tracking-wider text-bns-text-secondary">
                  {activeTab === 'consult' ? 'Khóa học & đơn vị công tác' : 'Đơn vị công tác'}
                </legend>

                {activeTab === 'consult' && (
                  <div>
                    <label htmlFor="lead-course" className="mb-1.5 block text-xs font-semibold text-bns-navy">
                      Khóa đào tạo
                    </label>
                    <select
                      id="lead-course"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className={`${inputBase} border-bns-border focus:border-bns-blue`}
                    >
                      {COURSES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="lead-province" className="mb-1.5 block text-xs font-semibold text-bns-navy">
                      Đơn giá địa phương áp dụng
                    </label>
                    <select
                      id="lead-province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className={`${inputBase} border-bns-border focus:border-bns-blue`}
                    >
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="lead-company" className="mb-1.5 block text-xs font-semibold text-bns-navy">
                      Cơ quan / doanh nghiệp
                    </label>
                    <input
                      id="lead-company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Tổng Công ty CP Xây dựng 1"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className={`${inputBase} border-bns-border focus:border-bns-blue`}
                    />
                  </div>
                </div>
              </fieldset>

              <p className="pt-1 text-[11px] leading-normal text-bns-text-tertiary">
                Khi gửi thông tin, anh/chị đồng ý để Bắc Nam Software liên hệ tư vấn và cam kết bảo mật dữ liệu theo
                Luật An toàn thông tin mạng hiện hành.
              </p>

              <div className="border-t border-bns-border pt-4 text-center text-xs text-bns-text-secondary">
                Đã có tài khoản quản trị nội dung?{' '}
                <Link
                  to="/dang-nhap"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 font-semibold text-bns-blue hover:underline"
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                  Đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer — dính đáy. PC: Hủy trái, nút chính phải. Mobile: xếp dọc, chính ở trên. */}
        <div className="shrink-0 border-t border-bns-border bg-bns-surface px-5 py-4 sm:px-6">
          {isDone ? (
            <div className="flex sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-11 w-full rounded-lg bg-bns-navy px-6 text-sm font-bold text-white transition-colors hover:bg-bns-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-bns-blue focus-visible:ring-offset-2 sm:w-auto"
              >
                Đóng
              </button>
            </div>
          ) : isSubmitting && activeTab === 'download' ? (
            <div className="space-y-2" role="status" aria-live="polite">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-bns-blue">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Đang chuẩn bị gói cài đặt…
                </span>
                <span className="tabular-nums text-bns-text-secondary">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-bns-border">
                <div
                  className="h-full rounded-full bg-bns-accent transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-11 rounded-lg border border-bns-border px-6 text-sm font-semibold text-bns-text-secondary transition-colors hover:border-bns-border-strong hover:text-bns-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-bns-blue disabled:opacity-60 sm:mr-auto"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="bnsc-lead-form"
                disabled={isSubmitting}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-bns-navy px-6 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-bns-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-bns-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Đang gửi…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {tab.submit}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
