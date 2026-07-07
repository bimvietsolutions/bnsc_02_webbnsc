/**
 * admin/ResourceForm.tsx — Biểu mẫu tạo/sửa generic theo cấu hình resource.
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { adminGet, adminCreate, adminUpdate, adminList } from './api';
import { resourceBySlug, type FieldDef } from './resources';

type Values = Record<string, any>;

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
  const [relOptions, setRelOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const relationFields = useMemo(() => (def?.fields ?? []).filter((f) => f.type === 'relation'), [def]);

  // Nạp options cho các trường quan hệ.
  useEffect(() => {
    relationFields.forEach((f) => {
      if (!f.relation) return;
      adminList(f.relation.resource)
        .then((r) =>
          setRelOptions((prev) => ({
            ...prev,
            [f.name]: r.data.map((row: any) => ({
              value: String(row.id),
              label: String(row[f.relation!.labelField] ?? row.id),
            })),
          })),
        )
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

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
        if (f.type === 'number' || f.type === 'relation') {
          v = v === '' || v === null || v === undefined ? null : Number(v);
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
          <select
            value={v == null ? '' : String(v)}
            onChange={(e) => setVal(f.name, e.target.value)}
            className={inputCls}
          >
            <option value="">— Chọn —</option>
            {(relOptions[f.name] ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case 'image':
        return (
          <div>
            <input
              type="text"
              value={v ?? ''}
              onChange={(e) => setVal(f.name, e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
            {v ? (
              <img src={v} alt="" className="mt-2 h-20 rounded-lg object-cover border border-slate-200" />
            ) : null}
          </div>
        );
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
    <div className="max-w-3xl">
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
              <div key={f.name} className={f.full || f.type === 'textarea' || f.type === 'array' ? 'sm:col-span-2' : ''}>
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
