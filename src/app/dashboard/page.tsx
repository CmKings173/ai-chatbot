'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

import { websiteTypeLabel, type WebsiteType } from '@/lib/site';

type SiteDto = {
  id: string;
  name: string;
  websiteType: WebsiteType;
  domain: string;
  url: string | null;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout, getAccessToken } = usePrivy();

  const [sites, setSites] = useState<SiteDto[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [sitesError, setSitesError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (!ready || !authenticated) return;

    let cancelled = false;

    async function loadSites() {
      setLoadingSites(true);
      setSitesError(null);

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
          headers: { authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message;
          throw new Error(msg || 'Load sites failed');
        }

        const list: SiteDto[] = data?.sites ?? [];
        if (!cancelled) setSites(list);
      } catch (err) {
        if (!cancelled) {
          setSitesError(err instanceof Error ? err.message : 'Load sites failed');
        }
      } finally {
        if (!cancelled) setLoadingSites(false);
      }
    }

    void loadSites();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, getAccessToken, router]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {ready && authenticated ? `User: ${user?.id}` : 'Loading…'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-100"
              href="/"
            >
              Trang chủ
            </Link>
            <button
              type="button"
              onClick={() => void logout().then(() => router.push('/'))}
              disabled={!ready || !authenticated}
              className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Sites</h2>
            <Link
              href="/dashboard/sites/new"
              className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800"
            >
              Tạo site mới
            </Link>
          </div>

          {loadingSites ? (
            <div className="mt-4 text-sm text-zinc-600">Loading…</div>
          ) : sitesError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {sitesError}
            </div>
          ) : sites.length === 0 ? (
            <div className="mt-4 text-sm text-zinc-600">
              Chưa có site nào. Tạo site đầu tiên để lấy code nhúng.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-200">
              {sites.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="mt-1 text-xs text-zinc-600">
                      {websiteTypeLabel(s.websiteType)} · {s.domain}
                      {s.url ? ` · ${s.url}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-100"
                      href={`/dashboard/sites/${s.id}`}
                    >
                      Lấy code nhúng
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
