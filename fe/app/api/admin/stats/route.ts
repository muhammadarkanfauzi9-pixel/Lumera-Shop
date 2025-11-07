import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Prefer Authorization header, fallback to adminToken cookie
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;
    const cookieToken = request.cookies.get('adminToken')?.value;

    // Fallback: parse raw Cookie header if NextRequest.cookies is empty
    let rawCookieToken: string | undefined;
    if (!cookieToken) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        try {
          const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
            const [k, ...v] = c.trim().split('=');
            return [k, decodeURIComponent(v.join('='))];
          }));
          rawCookieToken = cookies['adminToken'];
        } catch {
          // ignore
        }
      }
    }

    const adminToken = headerToken || cookieToken || rawCookieToken;

    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const backendBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';
    const forwardUrl = new URL('/api/admin/stats', backendBase).toString();

    const resp = await fetch(forwardUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Error forwarding admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
