'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

import { WEBSITE_TYPES, type WebsiteType, websiteTypeLabel } from '@/lib/site';

export default function NewSitePage() {
  const router = useRouter();
  const { ready, authenticated, getAccessToken } = usePrivy();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [websiteType, setWebsiteType] = useState<WebsiteType>('WORDPRESS');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  const canSubmit = useMemo(() => {
    return (
      ready &&
      authenticated &&
      name.trim().length > 0 &&
      url.trim().length > 0 &&
      !submitting
    );
  }, [ready, authenticated, name, url, submitting]);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.replace(/\/$/, '');
      if (!backendOrigin) {
        throw new Error('Missing NEXT_PUBLIC_BACKEND_ORIGIN');
      }

      const res = await fetch(`${backendOrigin}/api/portal/sites`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          websiteType,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message;
        throw new Error(msg || 'Create site failed');
      }

      const siteId: string | undefined = data?.site?.id;
      if (!siteId) throw new Error('Missing site id');

      router.push(`/dashboard/sites/${siteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create site failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Tạo site mới</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Tạo site để nhận <span className="font-mono">apiKey</span> và code nhúng.
            </p>
          </div>
          <Link
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-100"
            href="/dashboard"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium">Tên site</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: myshop.vn"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Website URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ví dụ: https://myshop.vn"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
            <p className="mt-1 text-xs text-zinc-600">
              Hệ thống sẽ tự tách domain từ URL và tạo <span className="font-mono">apiKey</span> cho site.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Loại website</label>
            <select
              value={websiteType}
              onChange={(e) => setWebsiteType(e.target.value as WebsiteType)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            >
              {WEBSITE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {websiteTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={!canSubmit}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-4 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {submitting ? 'Đang tạo…' : `Tạo site (${websiteTypeLabel(websiteType)})`}
          </button>
        </div>
      </div>
    </div>
  );
}
