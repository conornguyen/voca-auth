import { Suspense } from 'react';
import AuthForms from './AuthForms';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* ─── Animated gradient background ─── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-2xl animate-pulse [animation-delay:4s]" />
      </div>

      {/* ─── Grid pattern overlay ─── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* ─── Hero ─── */}
      <header className="mb-10 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Secure SSO Gateway
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Voca <span className="text-primary/80">Auth</span>
        </h1>
        <p className="mt-3 max-w-lg text-base text-muted-foreground sm:text-lg">
          Centralized identity for the entire Voca ecosystem.
          <br className="hidden sm:block" />
          Sign in once, access everything.
        </p>
      </header>

      {/* ─── Auth Forms ─── */}
      <main className="w-full max-w-md px-4">
        <Suspense fallback={null}>
          <AuthForms />
        </Suspense>
      </main>

      {/* ─── Footer ─── */}
      <footer className="mt-12 text-center text-xs text-muted-foreground/60">
        &copy; {new Date().getFullYear()} Voca Platform &middot; All rights reserved
      </footer>
    </div>
  );
}
