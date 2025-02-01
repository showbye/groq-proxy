import { type NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*',
};

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    return new NextResponse('Proxy is Running！Details：https://github.com/tech-shrimp/deno-api-proxy', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const targetUrl = `https://${pathname}`;

  try {
    const headers = new Headers();
    const allowedHeaders = ['accept', 'content-type', 'authorization'];
    for (const [key, value] of request.headers.entries()) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Referrer-Policy', 'no-referrer');


    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Failed to fetch:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
