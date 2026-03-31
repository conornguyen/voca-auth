'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Zod Schemas ────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Component ──────────────────────────────────────────────────

export default function AuthForms() {
  const searchParams = useSearchParams();
  const redirectUrl =
    searchParams.get('redirectUrl') || searchParams.get('callbackUrl');

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  // ─── Shared post-auth logic ─────────────────────────────────

  async function mintSessionAndRedirect(
    idToken: string,
    extra?: { fullName?: string }
  ) {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, ...extra }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create session');
    }

    // Validate redirect URL and navigate
    if (redirectUrl) {
      const validationRes = await fetch(
        `/api/auth/validate-redirect?url=${encodeURIComponent(redirectUrl)}`
      );
      const { valid, url } = await validationRes.json();

      if (valid) {
        window.location.replace(url);
        return;
      }
    }

    // Fallback: reload to root
    window.location.replace('/');
  }

  // ─── Login handler ──────────────────────────────────────────

  async function onLogin(values: LoginFormValues) {
    if (!auth) {
      setServerError('Firebase is not configured. Please contact support.');
      return;
    }

    setServerError(null);
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const idToken = await credential.user.getIdToken();
      await mintSessionAndRedirect(idToken);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  }

  // ─── Register handler ──────────────────────────────────────

  async function onRegister(values: RegisterFormValues) {
    if (!auth) {
      setServerError('Firebase is not configured. Please contact support.');
      return;
    }

    setServerError(null);
    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const idToken = await credential.user.getIdToken();
      await mintSessionAndRedirect(idToken, { fullName: values.fullName });
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Tabs defaultValue="login" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Sign In</TabsTrigger>
        <TabsTrigger value="register">Create Account</TabsTrigger>
      </TabsList>

      {/* ─── Login Tab ─── */}
      <TabsContent value="login">
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4"
            >
              {serverError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  disabled={loading}
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ─── Register Tab ─── */}
      <TabsContent value="register">
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Get started</CardTitle>
            <CardDescription>
              Create a new account to join the Voca ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={registerForm.handleSubmit(onRegister)}
              className="space-y-4"
            >
              {serverError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Jane Doe"
                  disabled={loading}
                  {...registerForm.register('fullName')}
                />
                {registerForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@company.com"
                  disabled={loading}
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...registerForm.register('password')}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
