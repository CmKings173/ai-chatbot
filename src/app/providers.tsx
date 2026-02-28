'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-2xl font-semibold">AI Chatbot CMS</h1>
          <p className="mt-3 text-sm text-zinc-700">
            Thiếu biến môi trường <span className="font-mono">NEXT_PUBLIC_PRIVY_APP_ID</span>.
          </p>
          <p className="mt-2 text-sm text-zinc-700">
            Hãy copy <span className="font-mono">.env.example</span> thành{' '}
            <span className="font-mono">.env</span> và điền giá trị từ Privy Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Allow Google OAuth and email as a fallback (useful if OAuth is blocked in some browsers/webviews)
        loginMethods: ['google', 'email'],
        appearance: {
          theme: 'light',
          landingHeader: 'AI Chatbot CMS',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
