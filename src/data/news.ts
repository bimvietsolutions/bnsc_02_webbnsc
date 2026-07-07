/**
 * data/news.ts
 * Nguồn dữ liệu tập trung cho mục Tin tức. Mỗi bài có `slug` để tạo URL riêng
 * (/tin-tuc/:slug) phục vụ SEO và điều hướng bằng router.
 */
import { uniqueSlug } from '../utils/slug';

export type NewsCategory = 'Văn bản QPPL' | 'Nội bộ' | 'Chuyên ngành' | 'Khuyến mãi';

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  date: string;
  views: number;
  category: NewsCategory;
  excerpt: string;
  contentBody: string;
  imageUrl?: string;
}

type RawNews = Omit<NewsArticle, 'slug'>;

const RAW_NEWS: RawNews[] = [
  {
    id: 1,
    title: 'Vĩnh Long: Quyết định 325 và 327/QĐ-SXD Công bố đơn giá nhân công & máy thi công năm 2026',
    date: '18 Thg 5, 2026',
    views: 367,
    category: 'Văn bản QPPL',
    excerpt: 'Ngày 18/5/2026, Sở Xây dựng tỉnh Vĩnh Long đã ký ban hành các Quyết định 325/QĐ-SXD và 327/QĐ-SXD về việc công bố đơn giá nhân công xây dựng và giá ca máy thi công làm cơ sở quản lý chi phí đầu tư xây dựng trên địa bàn tỉnh.',
    contentBody: `Căn cứ Nghị định số 10/2021/NĐ-CP ngày 09/02/2021 của Chính phủ về quản lý chi phí đầu tư xây dựng;
Căn cứ Thông tư số 11/2021/TT-BXD ngày 31/8/2021 của Bộ trưởng Bộ Xây dựng hướng dẫn một số nội dung xác định và quản lý chi phí đầu tư xây dựng;

Sở Xây dựng tỉnh Vĩnh Long chính thức ban hành:
1. Quyết định số 325/QĐ-SXD công bố Đơn giá nhân công xây dựng năm 2026 trên địa bàn tỉnh Vĩnh Long.
2. Quyết định số 327/QĐ-SXD công bố Bảng giá ca máy và thiết bị thi công xây dựng năm 2026 trên địa bàn tỉnh Vĩnh Long.

Các quyết định này có hiệu lực kể từ ngày ký. Phần mềm dự toán BNSC đã cập nhật đầy đủ cơ sở dữ liệu của các quyết định nêu trên, hỗ trợ quý khách hàng tra cứu và áp dụng tự động cho các công trình nhanh nhất.`,
  },
  {
    id: 2,
    title: 'An Giang: Quyết định 2116/QĐ-UBND Công bố đơn giá NC & MTC năm 2026',
    date: '6 Thg 5, 2026',
    views: 226,
    category: 'Văn bản QPPL',
    excerpt: 'Ủy ban nhân dân tỉnh An Giang công bố bộ đơn giá nhân công mới nhất và bảng giá ca máy thi công làm cơ sở quản lý chi phí đầu tư xây dựng công trình trên địa bàn tỉnh An Giang chính xác hơn.',
    contentBody: `Ủy ban nhân dân tỉnh An Giang công bố Quyết định số 2116/QĐ-UBND ban hành bảng công bố giá nhân công và máy thi công đầu năm 2026 bám sát biến động thị trường lao động xây dựng thực tế và các quy định của Chính phủ.

Dữ liệu mới đã được chuẩn hóa vào máy chủ gốc của phần mềm BNSC. Người sử dụng chỉ cần mở tính năng "Tải đơn giá" là có thể cập nhật ngay lập tức toàn bộ định mức và hệ số nhân công tương ứng cho khu vực I, II, III.`,
  },
  {
    id: 3,
    title: 'Cần Thơ: Quyết định 595/QĐ-SXD Công bố đơn giá NC & MTC năm 2026',
    date: '5 Thg 5, 2026',
    views: 644,
    category: 'Văn bản QPPL',
    excerpt: 'Sở Xây dựng TP. Cần Thơ chính thức ban hành bảng công bố giá nhân công và máy thi công đầu năm 2026 bám sát biến động thị trường lao động xây dựng thực tế và các quy định của Chính phủ.',
    contentBody: `Sở Xây dựng TP. Cần Thơ ban hành Quyết định số 595/QĐ-SXD công bố giá nhân công xây dựng quý mới quốc gia năm 2026. Bảng đơn giá làm cơ sở để các cá nhân, doanh nghiệp lập báo cáo nghiên cứu khả thi, khảo sát xây dựng dự thầu cho tất cả hạng mục trung tâm thành phố và ngoại thành quận huyện.`,
  },
  {
    id: 4,
    title: 'Lễ ký thỏa thuận hợp tác với Phân hiệu trường Đại học GTVT tại TP.HCM',
    date: '10 Thg 5, 2022',
    views: 3900,
    category: 'Nội bộ',
    excerpt: 'Bắc Nam Software ký kết biên bản ghi nhớ toàn diện cùng Trường Đại học Giao thông vận tải Phân hiệu tại TP.HCM nhằm tài trợ gói phần mềm bản quyền Dự toán BNSC.',
    contentBody: `Tại buổi lễ ký kết trang trọng, đại diện lãnh đạo Bắc Nam Software và Ban Giám hiệu Phân hiệu Trường Đại học Giao thông vận tải tại TP.HCM đã thống nhất các điều khoản hợp tác dài hạn.

Theo đó, Bắc Nam Software tài trợ bản quyền miễn phí phần mềm Dự toán BNSC phục vụ công tác giảng dạy môn Kinh tế xây dựng và Đo bóc khối lượng, hỗ trợ giáo trình đào tạo, tổ chức kiểm tra và cấp chứng chỉ định mức uy tín cho sinh viên năm cuối.`,
  },
  {
    id: 5,
    title: 'Cần Thơ: Quyết định 27/2026/QĐ-UBND ban hành Định mức vận chuyển đặc thù đường thủy',
    date: '19 Thg 3, 2026',
    views: 390,
    category: 'Văn bản QPPL',
    excerpt: 'Ủy ban nhân dân thành phố Cần Thơ quy định về định mức dự toán vận chuyển hàng hóa đặc thù bằng phương tiện đường thủy phục vụ công tác xây lắp, vận hành đường sông.',
    contentBody: `UBND TP. Cần Thơ vừa ban hành Quyết định 27/2026/QĐ-UBND về định mức vận chuyển vật liệu đặc thù qua cano, sà lan và tàu cứu hộ đường sông nội tỉnh. Đây là cơ sở cốt lõi để các doanh nghiệp thi công cầu đường thủy, nạo vét kênh rạch nội vùng ĐBSCL lập dự toán chi phí chính xác.`,
  },
  {
    id: 6,
    title: 'Đắk Lắk: QĐ 21/2026/QĐ-UBND ban hành Bộ đơn giá dịch vụ công ích đô thị năm 2026',
    date: '13 Thg 3, 2026',
    views: 580,
    category: 'Chuyên ngành',
    excerpt: 'UBND tỉnh Đắk Lắk ban hành Bộ đơn giá làm cơ sở xác định chi phí các dịch vụ rác thải, xử lý cây xanh và chiếu sáng khu đô thị lớn.',
    contentBody: `Quyết định số 21/2026/QĐ-UBND quy định đơn giá dịch vụ công ích đô thị trên địa bàn tỉnh Đắk Lắk bao gồm:
- Thu gom, vận chuyển và xử lý chất thải rắn sinh hoạt.
- Duy trì hệ thống cây xanh, tỉa cành định kỳ phòng bão.
- Duy trì hệ thống chiếu sáng công cộng đô thị thông minh.

Dữ liệu đặc thù này đã được tổng hợp chi tiết và cập nhật đầy đủ vào ứng dụng Dự toán BNSC phục vụ đắc lực cho các Công ty Môi trường Đô thị địa phương.`,
  },
  {
    id: 7,
    title: 'BỘ XÂY DỰNG: Thông tư 04/2026/TT-BXD Định mức bảo dưỡng kết cấu hạ tầng đường sắt quốc gia',
    date: '30 Thg 1, 2026',
    views: 727,
    category: 'Văn bản QPPL',
    excerpt: 'Thông tư số 04/2026/TT-BXD của Bộ Xây dựng quy định về định mức dự toán bảo dưỡng kỹ thuật, sửa chữa định kỳ kết cấu hạ tầng đường sắt quốc gia.',
    contentBody: `Bộ Xây dựng ban hành Thông tư số 04/2026/TT-BXD quy định định mức dự toán bảo dưỡng trực tiếp hệ thống tà vẹt, đường ray, cầu hầm sắt quốc gia. Thông tư là cơ sở để các Ban Quản lý Dự án Đường sắt lập kế hoạch vốn bảo trì hằng năm.`,
  },
  {
    id: 8,
    title: 'Đà Nẵng: Quyết định 152-153/QĐ-SXD Công bố đơn giá NC & MTC năm 2026',
    date: '12 Thg 2, 2026',
    views: 3295,
    category: 'Văn bản QPPL',
    excerpt: 'Sở Xây dựng TP. Đà Nẵng công bố các đơn giá nhân công tương ứng trên địa bàn Hải Châu, Liên Chiểu, Ngũ Hành Sơn giúp đồng bộ kiểm tra xây lắp số.',
    contentBody: `Các Quyết định số 152 và 153/QĐ-SXD điều chỉnh chính thức hệ số lương nhân công các nhóm 1 đến nhóm 4 và chi phí thuê máy rải nhựa, máy xúc cơ giới trên địa bàn Đà Nẵng. Bắc Nam Software đã cập nhật tệp đơn giá lên đám mây, khách hàng có thể cài đặt dễ dàng.`,
  },
  {
    id: 9,
    title: 'TCT Tân Cảng Sài Gòn (Bộ Quốc phòng): Ứng dụng 31 bộ phần mềm Dự toán BNSC',
    date: '15 Thg 12, 2017',
    views: 3452,
    category: 'Nội bộ',
    excerpt: 'Ứng dụng thử nghiệm thành công 31 bộ giấy phép Dự toán BNSC cho hoạt động xây dựng công trình cảng biển Hải đoàn tiền phương quốc phòng.',
    contentBody: `Đáp ứng yêu cầu nghiêm ngặt về tiến độ và độ bảo mật kỹ thuật quốc phòng, Tổng công ty Tân Cảng Sài Gòn đã ký kết sở hữu bản quyền hàng loạt phần mềm BNSC, hướng tới số hóa hoàn toàn sơ đồ tổng mức đầu tư xây dựng quân cảng.`,
  },
  {
    id: 10,
    title: 'CHÚC MỪNG NĂM MỚI BÍNH NGỌ 2026 – Thông báo lịch nghỉ Tết và ưu đãi đặc biệt',
    date: '1 Thg 1, 2025',
    views: 1523,
    category: 'Khuyến mãi',
    excerpt: 'Lời tri ân và kính chúc Tết gửi tới hàng nghìn kỹ sư, cơ quan quản lý chuyên môn cùng chương trình giảm giá lên đến 15% khóa cứng BNSC.',
    contentBody: `Bắc Nam Software kính chúc Quý Khách hàng, Quý Đối tác một năm mới Bính Ngọ 2026 an khang thịnh vượng!
Lịch nghỉ tết kéo dài từ ngày 26 âm lịch đến mùng 6 âm lịch. Nhằm tri ân khách hàng, Bắc Nam áp dụng chương trình ưu đãi đặc biệt 15% trực tiếp khi nâng cấp khóa cứng hoặc cập nhật tệp định mức chuyên dụng.`,
  },
  {
    id: 11,
    title: 'Ban QLĐTXD Y tế TP.HCM: Ứng dụng phần mềm Dự toán BNSC để thẩm tra dự toán',
    date: '15 Thg 10, 2017',
    views: 3545,
    category: 'Nội bộ',
    excerpt: 'Triển khai công tác chuẩn hóa dự toán bệnh viện công nghệ cao trên phạm vi thành phố dựa trên giải pháp chuyên sâu của BNSC.',
    contentBody: `Giải pháp phần mềm từ BNSC giúp tối ưu hóa 45% thời gian đo bóc khối lượng, đối soát mã hóa danh mục thiết bị y tế chuyên dụng nhập khẩu cho Ban Quản lý đầu tư xây dựng các công trình Y tế TP.HCM.`,
  },
  {
    id: 12,
    title: 'Cần Thơ: QĐ 50/2025/QĐ-UBND ban hành Định mức dự toán các công tác xây dựng đặc thù',
    date: '15 Thg 12, 2025',
    views: 171,
    category: 'Chuyên ngành',
    excerpt: 'Bộ định mức chuyên môn bổ sung cho các công tác phục hồi, bảo tồn di sản sông nước ĐBSCL và trùng tu di tích văn hóa.',
    contentBody: `Công bố chi tiết nhóm công việc đặc trưng tôn tạo di sản kiến trúc trên sông vùng Nam Bộ. Phần mềm BNSC đã số hóa và gắn mã nội bộ giúp việc áp dụng định mức không gặp bất kỳ vướng mắc nào.`,
  },
  {
    id: 13,
    title: 'Lễ ký kết hợp tác với Trường Cao đẳng Xây dựng số 2 (Bộ Xây dựng)',
    date: '23 Thg 4, 2022',
    views: 3791,
    category: 'Nội bộ',
    excerpt: 'Hỗ trợ sinh viên thực tập tiếp cận sớm với các công nghệ thẩm định dự toán hàng đầu phục vụ thiết thực đồ án tốt nghiệp.',
    contentBody: `Lễ ký kết diễn ra thành công tốt đẹp mở ra nhiều cơ hội thực tập, việc làm trực tiếp tại phòng dự án liên kết của Bắc Nam Software dành cho những sinh viên xuất sắc của trường.`,
  },
];

const usedSlugs = new Set<string>();
export const newsArticles: NewsArticle[] = RAW_NEWS.map((item) => ({
  ...item,
  slug: uniqueSlug(item.title, usedSlugs),
}));

const bySlug = new Map(newsArticles.map((a) => [a.slug, a]));
const byId = new Map(newsArticles.map((a) => [a.id, a]));

export const getNewsBySlug = (slug: string): NewsArticle | undefined => bySlug.get(slug);
export const getNewsById = (id: number): NewsArticle | undefined => byId.get(id);
