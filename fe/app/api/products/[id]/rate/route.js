import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const backendRes = await fetch(`http://localhost:5000/api/products/${id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const resBody = await backendRes.json().catch(() => ({ message: 'Invalid response from backend' }));
    if (!backendRes.ok) {
      return NextResponse.json({ message: resBody.message || 'Failed to submit rating' }, { status: backendRes.status });
    }

    return NextResponse.json(resBody, { status: backendRes.status });
  } catch (error) {
    console.error('Error proxying rating:', error);
    return NextResponse.json({ message: 'Failed to submit rating' }, { status: 500 });
  }
}
