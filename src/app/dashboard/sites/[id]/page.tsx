'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

import { type WebsiteType, websiteTypeLabel } from '@/lib/site';

type SiteDto = {
  id: string;
  name: string;
  websiteType: WebsiteType;
  domain: string;
  url: string | null;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
};

function getErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;

  const d = data as { message?: unknown };

  if (Array.isArray(d.message)) {
    return d.message.filter((m) => typeof m === 'string').join(', ');
  }

  if (typeof d.message === 'string') {
    return d.message;
  }

  return null;
}

export default function SiteDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const siteId = params?.id;

  const { ready, authenticated, getAccessToken } = usePrivy();

  const [site, setSite] = useState<SiteDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cmsOrigin = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    );
  }, []);

  const backendOrigin = useMemo(() => {
    return process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.replace(/\/$/, '') || '';
  }, []);

  const loaderUrl = useMemo(() => {
    return cmsOrigin ? `${cmsOrigin}/loader.js` : '';
  }, [cmsOrigin]);

  const pluginZipUrl = useMemo(() => {
    return cmsOrigin ? `${cmsOrigin}/ai-chatbot.zip` : '';
  }, [cmsOrigin]);

  const oneLineSnippet = useMemo(() => {
    if (!site || !loaderUrl || !backendOrigin) return '';

    return `<script async src="${loaderUrl}" data-api-url="${backendOrigin}" data-api-key="${site.apiKey}"></script>`;
  }, [site, loaderUrl, backendOrigin]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (!ready || !authenticated || !siteId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();
        if (!token) {
          router.push('/login');
          return;
        }

        if (!backendOrigin) {
          throw new Error('Missing NEXT_PUBLIC_BACKEND_ORIGIN');
        }

        const res = await fetch(`${backendOrigin}/api/portal/sites/${siteId}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(getErrorMessage(data) || 'Load site failed');
        }

        const s: SiteDto | undefined = data?.site;
        if (!s) throw new Error('Missing site');

        if (!cancelled) {
          setSite(s);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Load site failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, siteId, getAccessToken, router, backendOrigin]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Cài đặt widget</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Site: <span className="font-mono">{site?.id || siteId}</span>
            </p>
          </div>
          <Link
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-100"
            href="/dashboard"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
          {loading ? (
            <div className="text-sm text-zinc-600">Loading…</div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : site ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-zinc-600">Tên</div>
                  <div className="text-sm font-medium">{site.name}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">Loại website</div>
                  <div className="text-sm font-medium">
                    {websiteTypeLabel(site.websiteType)}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-zinc-600">Domain</div>
                  <div className="text-sm font-medium">{site.domain}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600">URL</div>
                  <div className="break-all text-sm font-medium">
                    {site.url || '—'}
                  </div>
                </div>
              </div>

              {site.websiteType === 'WORDPRESS' ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">1) Tải plugin WordPress</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <a
                        className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800"
                        href={pluginZipUrl}
                      >
                        Download ai-chatbot.zip
                      </a>
                      <a
                        className="text-sm text-blue-700 hover:underline"
                        href={pluginZipUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {pluginZipUrl}
                      </a>
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
                    <div className="font-medium">2) Nhập cấu hình trong WordPress</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                      <li>
                        <span className="font-mono">API URL</span>: {backendOrigin || '(chưa cấu hình NEXT_PUBLIC_BACKEND_ORIGIN)'}
                      </li>
                      <li>
                        <span className="font-mono">API Key</span>: <span className="font-mono">{site.apiKey}</span>
                      </li>
                    </ul>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => void copy(site.apiKey)}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-100"
                      >
                        {copied ? 'Đã copy' : 'Copy API Key'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Script nhúng (1 dòng)</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        Dán vào <span className="font-mono">&lt;head&gt;</span> hoặc trước <span className="font-mono">&lt;/body&gt;</span>.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copy(oneLineSnippet)}
                      disabled={!oneLineSnippet}
                      className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
                    >
                      {copied ? 'Đã copy' : 'Copy'}
                    </button>
                  </div>

                  <pre className="mt-3 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-5">
                    <code>{oneLineSnippet || 'Missing NEXT_PUBLIC_BACKEND_ORIGIN / NEXT_PUBLIC_APP_URL'}</code>
                  </pre>

                  <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-600">
                    Mẹo: nếu website bị cache, hãy hard refresh hoặc purge cache sau khi thêm script.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-zinc-600">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}
