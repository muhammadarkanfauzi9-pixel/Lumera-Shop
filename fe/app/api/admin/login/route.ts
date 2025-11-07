import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';
    const forwardUrl = new URL('/api/admin/login', backendBase).toString();

    const resp = await fetch(forwardUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));

    // Determine tokens from backend response
    let adminToken: string | undefined;
    let userToken: string | undefined;

    if (data.token && data.user && data.user.type === 'admin') {
      adminToken = data.token;
    } else if (data.token && data.user && data.user.type === 'user') {
      userToken = data.token;
    }

    // Also handle explicit token fields if backend returns them
    if (data.adminToken) adminToken = data.adminToken;
    if (data.userToken) userToken = data.userToken;

    // If backend set nested tokens
    if (!adminToken && data.user?.token && data.user.type === 'admin') adminToken = data.user.token;
    if (!userToken && data.user?.token && data.user.type === 'user') userToken = data.user.token;

    // Build response and set cookies on the frontend origin if tokens exist
    const nextRes = NextResponse.json(data, { status: resp.status });

    const isProd = process.env.NODE_ENV === 'production';
    if (adminToken) {
      nextRes.cookies.set({
        name: 'adminToken',
        value: adminToken,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: isProd,
        maxAge: 24 * 60 * 60, // 1 day
      });
    }
    if (userToken) {
      nextRes.cookies.set({
        name: 'userToken',
        value: userToken,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: isProd,
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return nextRes;
  } catch (error) {
    console.error('Proxy admin login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
