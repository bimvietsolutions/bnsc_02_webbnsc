/**
 * admin/ResourceList.tsx — Danh sách generic cho một resource.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, Inbox } from 'lucide-react';
import { adminList, adminRemove } from './api';
import { resourceBySlug, type ColumnDef } from './resources';

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
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    if (!def) return;
    setLoading(true);
    adminList(resource)
      .then((r) => setRows(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [resource]);

  if (!def) return <p className="text-slate-500">Không tìm thấy resource.</p>;

  const del = async (id: number) => {
    if (!confirm('Xóa bản ghi này?')) return;
    try {
      await adminRemove(resource, id);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (e: any) {
      alert(e.message || 'Lỗi xóa.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-[#0B2545]">{def.label}</h1>
          <p className="text-sm text-slate-500">{rows.length} bản ghi</p>
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

      {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Inbox className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Chưa có dữ liệu</p>
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
    </div>
  );
}
