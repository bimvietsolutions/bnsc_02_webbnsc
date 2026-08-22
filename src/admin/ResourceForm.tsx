/**
 * admin/ResourceForm.tsx — Biểu mẫu tạo/sửa generic theo cấu hình resource.
 */
import { Suspense, lazy, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Upload, X } from 'lucide-react';
import { adminGet, adminCreate, adminUpdate, uploadFile } from './api';
import { resourceBySlug, type FieldDef } from './resources';
// TipTap nặng ~350KB nên chỉ nạp khi thực sự mở biểu mẫu có trường richtext.
const RichTextEditor = lazy(() => import('./RichTextEditor'));
import { RelationField, TagsField } from './FormFields';

type Values = Record<string, any>;

/** Trường ảnh: nhập URL hoặc tải tệp lên (POST /api/admin/upload). */
function ImageField({ value, onChange }: { value?: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const r = await uploadFile(file);
      onChange(r.url);
    } catch (err: any) {
      setError(err?.message || 'Lỗi upload');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… hoặc tải ảnh lên"
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#1B5FA8] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 bg-[#0B2545] hover:bg-[#1B5FA8] text-white text-sm font-semibold px-3 rounded-lg disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Tải lên
        </button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
      </div>
      {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
      {value ? (
        <div className="relative inline-block mt-2">
          <img src={value} alt="" className="h-24 rounded-lg object-cover border border-slate-200" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-0.5 shadow hover:text-rose-600"
            title="Xóa ảnh"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function defaultValue(f: FieldDef): any {
  switch (f.type) {
    case 'boolean':
      return f.name === 'isActive' || f.name === 'isPublished';
    case 'array':
      return [];
    case 'number':
      return '';
    default:
      return '';
  }
}

export default function ResourceForm() {
  const { resource = '', id } = useParams();
  const def = resourceBySlug(resource);
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const [values, setValues] = useState<Values>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Nạp dữ liệu khi sửa; khởi tạo mặc định khi tạo mới.
  useEffect(() => {
    if (!def) return;
    if (isEdit) {
      setLoading(true);
      adminGet(resource, id!)
        .then((r) => setValues(r.data))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      const init: Values = {};
      def.fields.forEach((f) => (init[f.name] = defaultValue(f)));
      setValues(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, id]);

  if (!def) return <p className="text-slate-500">Không tìm thấy resource.</p>;

  const setVal = (name: string, v: any) => setValues((prev) => ({ ...prev, [name]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload: Values = {};
      for (const f of def.fields) {
        let v = values[f.name];
        if (f.type === 'password') {
          if (!v) continue; // không đổi mật khẩu
          payload[f.name] = v;
          continue;
        }
        if (f.type === 'readonly') continue; // hiển thị thôi, không ghi
        if (f.type === 'number' || f.type === 'relation') {
          v = v === '' || v === null || v === undefined ? null : Number(v);
        } else if (f.type === 'datetime') {
          v = v ? new Date(v).toISOString() : null;
        } else if (f.type === 'tags') {
          v = Array.isArray(v) ? v : [];
        } else if (f.type === 'array') {
          v = Array.isArray(v)
            ? v
            : String(v || '')
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean);
        } else if (f.type === 'boolean') {
          v = !!v;
        }
        payload[f.name] = v;
      }

      if (isEdit) await adminUpdate(resource, id!, payload);
      else await adminCreate(resource, payload);
      navigate(`/admin/${resource}`);
    } catch (err: any) {
      setError(err?.message || 'Lỗi lưu dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#1B5FA8] focus:outline-none';

  const renderField = (f: FieldDef) => {
    const v = values[f.name];
    switch (f.type) {
      case 'textarea':
        return (
          <textarea
            value={v ?? ''}
            onChange={(e) => setVal(f.name, e.target.value)}
            rows={f.name === 'contentBody' || f.name === 'content' ? 10 : 3}
            className={inputCls}
          />
        );
      case 'array':
        return (
          <textarea
            value={Array.isArray(v) ? v.join('\n') : v ?? ''}
            onChange={(e) => setVal(f.name, e.target.value.split('\n'))}
            rows={4}
            className={inputCls}
            placeholder="Mỗi dòng một mục"
          />
        );
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={!!v} onChange={(e) => setVal(f.name, e.target.checked)} />
            <span className="text-sm text-slate-600">Bật</span>
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            value={v ?? ''}
            onChange={(e) => setVal(f.name, e.target.value)}
            className={inputCls}
          />
        );
      case 'password':
        return (
          <input
            type="password"
            value={v ?? ''}
            onChange={(e) => setVal(f.name, e.target.value)}
            className={inputCls}
            autoComplete="new-password"
          />
        );
      case 'select':
        return (
          <select value={v ?? ''} onChange={(e) => setVal(f.name, e.target.value)} className={inputCls}>
            <option value="">— Chọn —</option>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case 'relation':
        return (
          <RelationField
            value={v}
            resource={f.relation!.resource}
            labelField={f.relation!.labelField}
            onChange={(next) => setVal(f.name, next)}
          />
        );
      case 'richtext':
        return (
          <Suspense
            fallback={
              <div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang nạp trình soạn thảo…
              </div>
            }
          >
            <RichTextEditor value={v} onChange={(html) => setVal(f.name, html)} />
          </Suspense>
        );
      case 'tags':
        return <TagsField value={v} onChange={(slugs) => setVal(f.name, slugs)} />;
      case 'datetime':
        return (
          <input
            type="datetime-local"
            // <input datetime-local> cần "YYYY-MM-DDTHH:mm", còn API trả ISO có múi giờ
            value={v ? String(v).slice(0, 16) : ''}
            onChange={(e) => setVal(f.name, e.target.value)}
            className={inputCls}
          />
        );
      case 'readonly':
        return (
          <p className="border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500">
            {v == null || v === '' ? '—' : String(v)}
          </p>
        );
      case 'image':
        return <ImageField value={v} onChange={(url) => setVal(f.name, url)} />;
      default:
        return (
          <input
            type="text"
            value={v ?? ''}
            onChange={(e) => setVal(f.name, e.target.value)}
            className={inputCls}
          />
        );
    }
  };

  return (
    <div className="max-w-5xl">
      <Link
        to={`/admin/${resource}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#1B5FA8] font-semibold mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> {def.label}
      </Link>
      <h1 className="text-xl font-extrabold text-[#0B2545] mb-5">
        {isEdit ? `Sửa ${def.singular}` : `Thêm ${def.singular}`}
      </h1>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải…
        </div>
      ) : (
        <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-6">
          {error && (
            <div className="mb-4 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {def.fields.map((f) => (
              <div
                key={f.name}
                className={
                  f.full || ['textarea', 'array', 'richtext', 'tags'].includes(f.type)
                    ? 'sm:col-span-2'
                    : ''
                }
              >
                <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wide mb-1.5">
                  {f.label} {f.required && <span className="text-rose-500">*</span>}
                </label>
                {renderField(f)}
                {f.help && <p className="text-[11px] text-slate-400 mt-1">{f.help}</p>}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#E09413] text-[#0B2545] font-bold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu
            </button>
            <Link
              to={`/admin/${resource}`}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-4 py-2.5"
            >
              Hủy
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
