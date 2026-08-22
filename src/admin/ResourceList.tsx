/**
 * admin/ResourceList.tsx — Danh sách generic cho một resource.
 *
 * Phân trang, tìm kiếm và lọc đều chạy phía máy chủ: bảng `articles` có 555 bản
 * ghi nên nạp toàn bộ (như bản trước) sẽ làm treo trang quản trị.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, Inbox, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminList, adminRemove } from './api';
import { resourceBySlug, type ColumnDef } from './resources';

const PAGE_SIZE = 25;

function renderCell(col: ColumnDef, row: any) {
  const raw = col.accessor ? col.accessor(row) : row[col.name];
  if (col.type === 'boolean') {
    return (
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${raw ? 'bg-emerald-500' : 'bg-slate-300'}`} />
    );
  }
  if (col.type === 'datetime') {
    return raw ? new Date(raw).toLocaleString('vi-VN') : '';
  }
  if (col.type === 'badge') {
    return raw ? (
      <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
        {String(raw)}
      </span>
    ) : null;
  }
  const text = raw == null ? '' : String(raw);
  return <span className="line-clamp-1">{text.length > 80 ? text.slice(0, 80) + '…' : text}</span>;
}

export default function ResourceList() {
  const { resource = '' } = useParams();
  const def = resourceBySlug(resource);
  const [params, setParams] = useSearchParams();

  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const page = Math.max(1, Number(params.get('page')) || 1);
  const q = params.get('q') ?? '';
  const filterValues = useMemo(() => {
    const out: Record<string, string> = {};
    for (const f of def?.filters ?? []) {
      const v = params.get(f.name);
      if (v) out[f.name] = v;
    }
    return out;
  }, [params, def]);

  const [searchDraft, setSearchDraft] = useState(q);
  useEffect(() => setSearchDraft(q), [q]);
  useEffect(() => {
    if (searchDraft === q) return;
    const timer = setTimeout(() => update({ q: searchDraft || null, page: null }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
  }

  const filterKey = JSON.stringify(filterValues);

  useEffect(() => {
    if (!def) return;
    let cancelled = false;
    setLoading(true);
    adminList(resource, {
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      q,
      filters: filterValues,
    })
      .then((r) => {
        if (cancelled) return;
        setRows(r.data);
        setTotal(r.total);
        setError('');
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, page, q, filterKey]);

  // Đổi resource -> về trang 1, xoá bộ lọc cũ
  useEffect(() => {
    if (params.toString()) setParams(new URLSearchParams(), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  if (!def) return <p className="text-slate-500">Không tìm thấy resource.</p>;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const del = async (id: number) => {
    if (!confirm('Xóa bản ghi này?')) return;
    try {
      await adminRemove(resource, id);
      setRows((r) => r.filter((x) => x.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e: any) {
      alert(e.message || 'Lỗi xóa.');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-[#0B2545]">{def.label}</h1>
          <p className="text-sm text-slate-500 tabular-nums">
            {total.toLocaleString('vi-VN')} bản ghi
            {totalPages > 1 && ` · trang ${page}/${totalPages}`}
          </p>
        </div>
        {def.canCreate !== false && (
          <Link
            to={`/admin/${resource}/new`}
            className="inline-flex items-center gap-1.5 bg-[#F5A623] hover:bg-[#E09413] text-[#0B2545] font-bold text-sm px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Thêm mới
          </Link>
        )}
      </div>

      {/* Thanh tìm kiếm + bộ lọc */}
      {(def.searchable || def.filters?.length) && (
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          {def.searchable && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder={`Tìm trong ${def.label.toLowerCase()}…`}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-[#1B5FA8]"
              />
              {searchDraft && (
                <button
                  onClick={() => setSearchDraft('')}
                  className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-700"
                  aria-label="Xóa từ khóa"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {def.filters?.map((filter) => (
            <select
              key={filter.name}
              value={filterValues[filter.name] ?? ''}
              onChange={(e) => update({ [filter.name]: e.target.value || null, page: null })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1B5FA8]"
            >
              <option value="">{filter.label}: tất cả</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Inbox className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{q || Object.keys(filterValues).length ? 'Không có kết quả phù hợp' : 'Chưa có dữ liệu'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {def.columns.map((c) => (
                    <th key={c.name} className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {def.columns.map((c) => (
                      <td key={c.name} className="px-4 py-3 text-slate-700 max-w-xs">
                        {renderCell(c, row)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/${resource}/${row.id}`}
                          className="p-1.5 text-slate-500 hover:text-[#1B5FA8] hover:bg-slate-100 rounded-lg"
                          title="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => del(row.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 mt-4">
          <p className="text-xs text-slate-500 tabular-nums">
            {((page - 1) * PAGE_SIZE + 1).toLocaleString('vi-VN')}–
            {Math.min(page * PAGE_SIZE, total).toLocaleString('vi-VN')} trên{' '}
            {total.toLocaleString('vi-VN')}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => update({ page: page > 2 ? String(page - 1) : null })}
              disabled={page <= 1}
              className="px-2.5 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#1B5FA8] disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 tabular-nums px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => update({ page: String(page + 1) })}
              disabled={page >= totalPages}
              className="px-2.5 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#1B5FA8] disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
