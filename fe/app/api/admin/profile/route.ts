import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Prefer Authorization header, fallback to adminToken cookie
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;
    const cookieToken = request.cookies.get('adminToken')?.value;
    // Fallback: if NextRequest.cookies is empty (some fetches), try raw Cookie header
    let rawCookieToken = undefined;
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
          // ignore parse errors
        }
      }
    }
    const adminToken = headerToken || cookieToken || rawCookieToken;

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Resolve backend base URL (fallback to localhost in dev if env not set)
    const backendBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';
    if (!process.env.NEXT_PUBLIC_API_URL && !process.env.API_URL) {
      // Helpful dev log so it's obvious we're falling back to localhost
      console.warn('NEXT_PUBLIC_API_URL / API_URL not set — forwarding admin profile requests to', backendBase);
    }
    const forwardUrl = new URL('/api/admin/profile', backendBase).toString();

    // Forward request to backend
    const response = await fetch(forwardUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to fetch profile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in profile API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Prefer Authorization header, fallback to cookie (mirror GET behavior)
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;
    const cookieToken = request.cookies.get('adminToken')?.value;
    const adminToken = headerToken || cookieToken;

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    const backendBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';
    const forwardUrl = new URL('/api/admin/profile', backendBase).toString();

    // Forward request to backend
    const response = await fetch(forwardUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to update profile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in profile API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}