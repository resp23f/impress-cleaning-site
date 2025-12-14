import { updateSession } from './lib/supabase/middleware'
import { NextResponse } from 'next/server'

const ALLOWED_COUNTRIES = ['US']

export async function middleware(request) {
  // Allow bots/crawlers through (Google, Bing, etc.)
  const userAgent = request.headers.get('user-agent') || ''
  const isBot = /googlebot|google-site-verification|APIs-Google|AdsBot-Google|Googlebot-Image|Googlebot-News|Googlebot-Video|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|crawler|spider|robot|crawling/i.test(userAgent)

if (isBot) {
  return NextResponse.next()
}
  // Get country from Vercel's geo headers
  const country = request.headers.get('x-vercel-ip-country') || 'US'
  
  // Block non-US traffic
  if (!ALLOWED_COUNTRIES.includes(country)) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Not Available</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #1C294E 0%, #0f172a 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            .container { max-width: 500px; }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { color: #94a3b8; font-size: 1.1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Service Not Available</h1>
            <p>Impress Cleaning Services is currently only available in the United States.</p>
          </div>
        </body>
      </html>`,
      {
        status: 403,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}