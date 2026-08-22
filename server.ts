import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createAuthRouter } from "./server/auth";
import { createPublicRouter } from "./server/routes.public";
import { createAdminRouter } from "./server/routes.admin";
import { createUploadRouter, UPLOAD_DIR } from "./server/routes.upload";
import { createContentRouter } from "./server/routes.content";
import {
  createRedirectMiddleware,
  createSitemapHandler,
  createRobotsHandler,
  createNoIndexMiddleware,
} from "./server/routes.seo";
import { prisma } from "./server/db";

dotenv.config();

// Lưới an toàn: không để lỗi bất đồng bộ lẻ làm sập server.
process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Middlewares
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health/live", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Readiness: có chạm CSDL, khác /health/live chỉ báo tiến trình còn sống.
  // Pipeline deploy dùng endpoint này làm cổng kiểm tra: nếu chỉ dựa vào
  // /health/live thì một bản deploy thiếu migration vẫn báo "khỏe" trong khi
  // mọi API nội dung trả 500. count() trên bảng articles bắt đúng ca đó.
  app.get("/health/ready", async (_req, res) => {
    try {
      await prisma.article.count();
      res.status(200).json({ status: "ready" });
    } catch (err) {
      console.error("health/ready:", err);
      res.status(503).json({ status: "not-ready", error: (err as Error).message });
    }
  });

  // Ensure Gemini Client is initialized safely
  let ai: GoogleGenAI | null = null;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini AI Client successfully initialized via @google/genai.");
    } else {
      console.warn("GEMINI_API_KEY not found in environment variables. AI Q&A will run in mock mode.");
    }
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }

  // API Route for AI Chat Q&A
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Khuyết thiếu nội dung tin nhắn." });
      }

      if (!ai) {
        return res.json({
          text: "Xin chào! Hiện tại tính năng trả lời tự động bằng AI đang ở chế độ ngoại tuyến vì chưa tìm thấy API Key. Quý khách vui lòng liên hệ hotline/Zalo hỗ trợ trực tiếp của anh **Khắc Tiệp (0981757527)** để được phục vụ tốt nhất!"
        });
      }

      const systemInstruction = `Bạn là Trợ lý AI chính thức của Công ty Cổ phần Phần mềm Bắc Nam (BNSC). Hãy trả lời người dùng một cách thân thiện, truyền cảm hứng, chuyên nghiệp và lịch sự bằng tiếng Việt.
Hỗ trợ giải đáp các thắc mắc về:
1. Phần mềm Dự toán BNSC (Phần mềm lập dự toán, dự thầu, thanh quyết toán công trình, quản lý tiến độ, tính chi phí cước vận chuyển theo các định mức...).
2. Đào tạo nghiệp vụ chuyên môn: Đo bóc khối lượng, Lập dự toán, Kỹ sư định giá, Đấu thầu xây dựng, Quản lý dự án...
3. Các văn bản chính sách, nghị định và thông tư xây dựng mới nhất (Thông tư 12/2021/TT-BXD, Thông tư 08/2025/TT-BXD, Thông tư 70/2025/TT-BTC, các văn bản của Bộ Xây dựng).

Lời khuyên cho bạn:
- Luôn khẳng định Bắc Nam Software (BNSC) là thương hiệu phần mềm uy tín hàng đầu trong ngành Xây dựng Việt Nam.
- Khuyến khích người dùng tải bộ cài đặt mới nhất bằng cách click nút "Tải phần mềm BNSC" trực tiếp trên màn hình hoặc liên hệ anh Khắc Tiệp (0981757527) để nhận bản quyền dùng thử.
- Với các câu hỏi sâu về kỹ thuật, hướng dẫn cài đặt bị lỗi, hoặc báo giá lớp học, hãy khuyên người dùng liên hệ Hotline/Zalo anh Khắc Tiệp: 0981757527 để được hỗ trợ tức thì.
- Định dạng câu trả lời gọn gàng, sử dụng các ký tự Markdown (như in đậm **, danh sách gạch đầu dòng, tiêu đề) để dễ đọc. Tránh viết những đoạn văn quá dài dòng.`;

      const contents: any[] = [];
      
      // Map user history format to GoogleGenAI expected structure
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        });
      }

      // Add the latest user prompt
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini service failed:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi khi kết nối với máy chủ AI BNSC." });
    }
  });

  // Phục vụ tệp upload (ảnh/tài liệu) ở cả dev lẫn production.
  // Ảnh mirror từ site cũ nằm ở /uploads/legacy/** — tên tệp có hash nên nội
  // dung không bao giờ đổi theo URL, cache được vĩnh viễn.
  app.use(
    "/uploads",
    express.static(UPLOAD_DIR, {
      maxAge: "30d",
      setHeaders: (res, filePath) => {
        if (filePath.includes(`${path.sep}legacy${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  // sitemap.xml sinh động từ CSDL (đặt trước express.static để ưu tiên bản động).
  app.get("/sitemap.xml", createSitemapHandler());

  // robots.txt sinh động + chặn lập chỉ mục khi SITE_INDEXABLE chưa bật.
  app.get("/robots.txt", createRobotsHandler());
  app.use(createNoIndexMiddleware());

  // 301 các URL gốc của website cũ (bacnam.com.vn/<slug>) sang đường dẫn mới.
  app.use(createRedirectMiddleware());

  // API: xác thực admin, dữ liệu công khai, và quản trị (CRUD)
  app.use("/api/admin/auth", createAuthRouter());
  app.use("/api/public", createContentRouter());
  app.use("/api/public", createPublicRouter());
  app.use("/api/admin/upload", createUploadRouter());
  app.use("/api/admin", createAdminRouter());

  // Bắt lỗi API (vd mất kết nối DB) -> trả JSON 500, không làm sập tiến trình.
  app.use("/api", (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("API error:", err?.message || err);
    if (res.headersSent) return;
    res.status(500).json({ error: "Lỗi máy chủ hoặc cơ sở dữ liệu." });
  });

  // Serve static assets / handle Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`BNSC Server is running on port ${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down gracefully.`);
    server.close((error) => {
      if (error) {
        console.error("Failed to close HTTP server:", error);
        process.exit(1);
      }
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Graceful shutdown timed out.");
      process.exit(1);
    }, 10_000).unref();
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

startServer();
