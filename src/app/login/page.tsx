'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  async function onLogin() {
    setError(null);
    setSubmitting(true);

    try {
      await login();
      // After login resolves, authenticated state should flip and redirect effect above will run.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <Link className="text-sm text-zinc-600 hover:text-zinc-900" href="/">
          ← Trang chủ
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Đăng nhập</h1>
        <p className="mt-2 text-sm text-zinc-700">
          Đăng nhập/đăng ký bằng Google (Gmail) hoặc Email qua Privy.
        </p>

        <button
          type="button"
          onClick={() => void onLogin()}
          disabled={!ready || submitting}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-black px-4 text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {!ready ? 'Đang khởi tạo…' : submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-600">
          Lưu ý: bạn cần cấu hình Google OAuth trong Privy Dashboard và thêm biến môi trường
          (xem <span className="font-mono">.env.example</span>).
        </div>
      </div>
    </div>
  );
}
