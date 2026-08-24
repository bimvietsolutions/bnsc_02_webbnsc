/**
 * scripts/legacy/prune-media.mts
 * Dọn các tệp trong public/uploads/legacy/ mà KHÔNG chỗ nào trong CSDL nhắc tới.
 *
 * Bối cảnh: bản mirror từ website cũ tải về đủ 5 biến thể của mỗi ảnh
 * (image_big / image_default / image_slider / image_mid / image_small), trong
 * khi ETL chỉ ghi vào CSDL 3 biến thể:
 *   coverUrl <- image_default ?? image_big
 *   thumbUrl <- image_mid     ?? image_small
 *   ogImage  <- image_big     ?? image_default
 * Riêng image_slider (image_600x460_*) không cột nào đọc, và image_small
 * (image_140x98_*) chỉ là dự phòng của thumbUrl nên thực tế cũng không dùng.
 *
 * NHƯNG không được xoá theo mẫu tên tệp: một số bài viết nhúng thẳng đúng hai
 * biến thể đó vào HTML nội dung. Xoá "rm image_600x460_*" là mất ảnh của những
 * bài ấy. Vì vậy script quét TOÀN BỘ CSDL — mọi bảng, mọi cột, ép cả dòng về
 * text — rồi mới coi tệp nào là mồ côi. Cách này không phụ thuộc vào việc tác
 * giả script có nhớ hết các cột chứa URL hay không.
 *
 * Mặc định CHỈ BÁO CÁO. Muốn xoá thật phải thêm cờ --delete.
 *
 *   npx tsx scripts/legacy/prune-media.mts              # xem trước
 *   npx tsx scripts/legacy/prune-media.mts --delete     # xoá thật
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UPLOAD_DIR = process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), 'public', 'uploads');
const LEGACY_DIR = path.join(UPLOAD_DIR, 'legacy');

const DELETE = process.argv.includes('--delete');

/** Đuôi tệp coi là tài nguyên có thể bị tham chiếu. */
const FILE_RE =
  /[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|pdf|docx?|xlsx?|pptx?|zip|rar|mp4|webm|mp3)/gi;

/**
 * Rút mọi tên tệp tài nguyên khỏi một đoạn text bất kỳ (một dòng CSDL đã ép về
 * chuỗi). Tách riêng để kiểm thử được mà không cần CSDL — đây là chỗ sai một ly
 * là xoá nhầm ảnh đang dùng.
 */
export function rutTenTep(blob: string | null | undefined): string[] {
  if (!blob) return [];
  return (blob.match(FILE_RE) ?? []).map((s) => s.toLowerCase());
}

/**
 * Ngưỡng an toàn. Nếu quét cả CSDL mà thấy quá ít tên tệp thì gần như chắc
 * chắn đang trỏ nhầm CSDL rỗng — dừng lại thay vì xoá sạch thư mục.
 */
const NGUONG_AN_TOAN = 1000;

function human(bytes: number): string {
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}

/** Liệt kê đệ quy mọi tệp dưới thư mục. */
function walk(dir: string, out: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

async function thuThapThamChieu(): Promise<Set<string>> {
  const rows = await prisma.$queryRaw<{ table_name: string }[]>`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `;

  const found = new Set<string>();
  for (const { table_name } of rows) {
    // x::text ép NGUYÊN DÒNG về chuỗi -> bắt được URL nằm ở bất kỳ cột nào,
    // kể cả cột mới thêm sau này mà script chưa biết.
    const data = await prisma.$queryRawUnsafe<{ blob: string | null }[]>(
      `select x::text as blob from "${table_name}" x`,
    );
    let n = 0;
    for (const r of data) {
      if (!r.blob) continue;
      for (const f of rutTenTep(r.blob)) {
        if (!found.has(f)) n++;
        found.add(f);
      }
    }
    if (n) console.log(`  ${table_name.padEnd(24)} +${n} tên tệp`);
  }
  return found;
}

async function main() {
  if (!fs.existsSync(LEGACY_DIR)) {
    console.error(`Không thấy thư mục ${LEGACY_DIR}. Đặt UPLOAD_DIR nếu chạy ngoài container.`);
    process.exit(1);
  }

  console.log('Quét toàn bộ CSDL để lấy danh sách tệp đang được tham chiếu:');
  const duocDung = await thuThapThamChieu();
  console.log(`\nTổng tên tệp CSDL nhắc tới: ${duocDung.size}`);

  if (duocDung.size < NGUONG_AN_TOAN) {
    console.error(
      `\nDỪNG: chỉ tìm thấy ${duocDung.size} tên tệp (ngưỡng an toàn ${NGUONG_AN_TOAN}).\n` +
        'Nhiều khả năng đang nối vào CSDL rỗng hoặc sai. Không xoá gì cả.',
    );
    process.exit(1);
  }

  const tatCa = walk(LEGACY_DIR);
  const moCoi: { p: string; size: number }[] = [];
  let dungTong = 0;
  let dungBytes = 0;

  for (const p of tatCa) {
    const ten = path.basename(p).toLowerCase();
    const size = fs.statSync(p).size;
    if (duocDung.has(ten)) {
      dungTong++;
      dungBytes += size;
    } else {
      moCoi.push({ p, size });
    }
  }

  const moCoiBytes = moCoi.reduce((s, f) => s + f.size, 0);

  // Nhóm theo tiền tố biến thể để thấy đang xoá cái gì
  const theoBienThe = new Map<string, { n: number; bytes: number }>();
  for (const f of moCoi) {
    const b = path.basename(f.p);
    const m = b.match(/^(image(?:_\d+x\d+|_\d+x)?)_/);
    const k = m ? m[1] : '(khác)';
    const cur = theoBienThe.get(k) ?? { n: 0, bytes: 0 };
    cur.n++;
    cur.bytes += f.size;
    theoBienThe.set(k, cur);
  }

  console.log('\n=== KẾT QUẢ ===');
  console.log(`  tệp trong legacy/     : ${tatCa.length} (${human(dungBytes + moCoiBytes)})`);
  console.log(`  đang được dùng        : ${dungTong} (${human(dungBytes)})`);
  console.log(`  MỒ CÔI                : ${moCoi.length} (${human(moCoiBytes)})`);

  console.log('\n=== MỒ CÔI THEO BIẾN THỂ ===');
  [...theoBienThe]
    .sort((a, b) => b[1].bytes - a[1].bytes)
    .forEach(([k, v]) => console.log(`  ${k.padEnd(18)} ${String(v.n).padStart(6)} tệp   ${human(v.bytes)}`));

  const danhSach = path.join(UPLOAD_DIR, '.legacy', 'orphan-media.txt');
  fs.mkdirSync(path.dirname(danhSach), { recursive: true });
  fs.writeFileSync(danhSach, moCoi.map((f) => f.p).join('\n') + '\n', 'utf8');
  console.log(`\nDanh sách đầy đủ đã ghi: ${danhSach}`);

  if (!DELETE) {
    console.log('\nĐây là chế độ XEM TRƯỚC, chưa xoá gì. Chạy lại với --delete để xoá thật.');
    return;
  }

  let xoa = 0;
  let loi = 0;
  for (const f of moCoi) {
    try {
      fs.unlinkSync(f.p);
      xoa++;
    } catch (e) {
      loi++;
      if (loi <= 5) console.error(`  không xoá được ${f.p}: ${(e as Error).message}`);
    }
  }
  console.log(`\nĐã xoá ${xoa} tệp (${human(moCoiBytes)})${loi ? `, lỗi ${loi} tệp` : ''}.`);
}

// Chỉ chạy khi gọi trực tiếp. Nếu chạy ngay lúc import thì không kiểm thử
// rutTenTep() được mà không đụng vào CSDL.
const goiTrucTiep = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (goiTrucTiep) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
