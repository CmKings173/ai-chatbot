# AI Chatbot CMS (Next.js + Privy)
CMS portal (Next.js) để user đăng ký/đăng nhập bằng Google (Privy), tạo site, và nhận `apiKey` + hướng dẫn nhúng widget.

## Kiến trúc
- CMS là **frontend portal** (không dùng Prisma/SQLite).
- CMS gọi trực tiếp backend NestJS qua các endpoint `GET/POST /api/portal/sites` (Privy Bearer token).
- Backend lưu sites vào Postgres/TypeORM và tạo `apiKey` cho từng site.

## User nhận được gì?
- **WordPress**: download plugin `ai-chatbot.zip` + hiển thị `API URL` + `API Key` để nhập vào trang settings của plugin.
- **HTML/React/Next/PHP/Other**: 1 dòng script tag:
  - `public/loader.js` sẽ tự inject `public/chatbox.min.js` + `public/chatbox.min.css`
  - `loader.js` set `window.WPAIChatboxConfig = { apiUrl, apiKey }`

## Setup (local)
1) Cài dependencies
```bash
cd wordpress-plugin/ai-chatbot-cms
npm install
```

2) Tạo file `.env`
```bash
cp .env.example .env
```
Điền:
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `NEXT_PUBLIC_BACKEND_ORIGIN` (ví dụ: `http://localhost:3000`)
- (optional) `NEXT_PUBLIC_APP_URL` (ví dụ: `http://localhost:8080`)

3) Backend cần cấu hình thêm (để CMS gọi được)
- `PRIVY_APP_ID`
- `PRIVY_JWT_VERIFICATION_KEY`
- `CORS_ORIGINS` phải include CMS origin (ví dụ: `http://localhost:8080`)

4) Chạy dev server (khuyến nghị port khác backend)
```bash
PORT=8080 npm run dev
```
Mở `http://localhost:8080`.

## Backend APIs CMS đang dùng
- `GET {BACKEND}/api/portal/sites`
- `POST {BACKEND}/api/portal/sites`
- `GET {BACKEND}/api/portal/sites/:id`

## Embed snippet (ví dụ)
```html
<script async src="https://YOUR-CMS-DOMAIN/loader.js" data-api-url="https://YOUR-BACKEND-ORIGIN" data-api-key="sk_live_..."></script>
```

## Deploy (Railway)
- Set **Root Directory** = `wordpress-plugin/ai-chatbot-cms`.
- Env vars cần set:
  - `NEXT_PUBLIC_PRIVY_APP_ID`
  - `NEXT_PUBLIC_BACKEND_ORIGIN`
  - (optional) `NEXT_PUBLIC_APP_URL`
- Repo này có file `.npmrc` với `include=dev` để đảm bảo Railway build được Next.js + Tailwind kể cả khi `NODE_ENV=production`.
- Nếu gặp lỗi `npm ci` kiểu “package-lock.json not in sync / Missing zod…”, hãy đảm bảo bạn đã push `package-lock.json` mới nhất.

## Notes
- `NEXT_PUBLIC_BACKEND_ORIGIN` là base origin (không include `/api`).
- Nếu website có cache (WordPress/CDN), nhớ purge cache sau khi dán script.
