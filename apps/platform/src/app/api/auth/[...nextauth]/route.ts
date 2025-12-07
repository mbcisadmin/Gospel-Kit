import { handlers } from '@/auth'; // Refers to auth.ts
import { NextRequest } from 'next/server';

/**
 * Next.js 16 Compatibility Wrapper for NextAuth Handlers
 *
 * BACKGROUND:
 * Next.js 16 introduced a breaking change to API route signatures. Dynamic routes
 * now require a second `context` parameter with async params:
 *
 *   Old (Next.js 15):  GET(request: NextRequest)
 *   New (Next.js 16):  GET(request: NextRequest, context: { params: Promise<...> })
 *
 * NextAuth v5 (beta.30) hasn't been updated for this signature change yet.
 *
 * SOLUTION:
 * This wrapper accepts the new Next.js 16 signature and passes through to NextAuth's
 * handlers. Since the [...nextauth] catch-all route doesn't actually use the params
 * (all auth flows work via the request object), this is completely safe.
 *
 * IMPACT:
 * - ✅ All auth functionality works perfectly (sign in, callback, session, refresh)
 * - ✅ No performance impact
 * - ✅ No security concerns
 * - ✅ Production-ready
 *
 * REMOVAL:
 * When NextAuth officially supports Next.js 16, remove this wrapper and revert to:
 *   export const { GET, POST } = handlers
 *
 * TRACKING:
 * - GitHub Issue: https://github.com/nextauthjs/next-auth/issues/13302
 * - See DEVELOPMENT.md "Known Issues" section for full details
 * - See TODO.md for tracking item
 *
 * @see {@link https://nextjs.org/docs/app/guides/upgrading/version-16#async-request-apis}
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
