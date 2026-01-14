import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Define protected routes
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/builder') || (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth'));

    // 2. Check for token
    const token = request.cookies.get('token')?.value;

    if (isProtectedRoute) {
        if (!token) {
            // Redirect to login if accessing UI
            if (!pathname.startsWith('/api/')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            // Return 401 for API
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me');
            const { payload } = await jwtVerify(token, secret);

            // 3. Add userId to headers so downstream API routes can use it
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', payload.userId as string);
            requestHeaders.set('x-user-email', payload.email as string);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        } catch (e) {
            // Invalid token
            if (!pathname.startsWith('/api/')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }
    }

    // 4. Redirect logged-in users away from auth pages
    if ((pathname === '/login' || pathname === '/signup') && token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me');
            await jwtVerify(token, secret);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch (e) {
            // Token invalid, let them proceed to login
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/telegram/webhook).*)'],
};
