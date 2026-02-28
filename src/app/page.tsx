'use client';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';

export default function Home() {
  const { ready, authenticated, user } = usePrivy();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">AI Chatbot CMS</h1>
          <div className="text-sm text-zinc-600">
            {ready && authenticated ? `Signed in: ${user?.id}` : 'Not signed in'}
          </div>
        </div>

        <p className="mt-6 text-zinc-700">
          CMS portal (Next.js) để user đăng ký/đăng nhập bằng Google (Privy) và lấy
          đoạn mã JS nhúng vào website (WordPress/HTML/Next.js/React/PHP...).
        </p>

        <div className="mt-8 flex gap-3">
          {!ready ? (
            <div className="text-zinc-600">Loading…</div>
          ) : authenticated ? (
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-4 text-white hover:bg-zinc-800"
              href="/dashboard"
            >
              Vào dashboard
            </Link>
          ) : (
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-4 text-white hover:bg-zinc-800"
              href="/login"
            >
              Đăng nhập bằng Google
            </Link>
          )}

          <a
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-zinc-900 hover:bg-zinc-100"
            href="/ai-chatbot.zip"
            target="_blank"
            rel="noreferrer"
          >
            Tải plugin WordPress
          </a>
        </div>

        <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-medium">Bước tiếp theo</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-700">
            <li>Setup Privy App (Google OAuth) và thêm env vars.</li>
            <li>User đăng nhập → tạo “Site”.</li>
            <li>Copy đoạn script tag / snippet nhúng vào website.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
