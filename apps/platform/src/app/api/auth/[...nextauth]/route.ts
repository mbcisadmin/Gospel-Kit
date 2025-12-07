import { handlers } from '@/auth'; // Refers to auth.ts
import { NextRequest } from 'next/server';

/**
 * Next.js 16 Compatibility Wrapper for NextAuth Handlers
 *
 * Next.js 16 changed API route signatures to include a context parameter
 * with async params. NextAuth v5 doesn't support this yet, so we wrap
 * the handlers to match the new signature.
 *
 * TODO: Remove this wrapper when NextAuth officially supports Next.js 16
 * See: https://github.com/nextauthjs/next-auth/issues/13302
 */

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) => {
  // NextAuth handlers don't use params, so we just call them with request
  // Type assertion needed due to duplicate Next.js types in monorepo
  return await handlers.GET(req as any);
};

export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) => {
  // NextAuth handlers don't use params, so we just call them with request
  // Type assertion needed due to duplicate Next.js types in monorepo
  return await handlers.POST(req as any);
};
