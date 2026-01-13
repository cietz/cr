import { NextResponse } from 'next/server';


export function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const referer = req.headers.get('referer')?.toLowerCase() || '';
  const url = req.nextUrl;

  const bots = [
    'facebookexternalhit', 'facebot', 'twitterbot', 'slackbot',
    'whatsapp', 'telegrambot', 'linkedinbot', 'googlebot',
    'bingbot', 'adsbot', 'crawler', 'bot'
  ];

  const isBot = bots.some(bot => ua.includes(bot));

  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);

  const fbclid = url.searchParams.get('fbclid');
  const utmSource = url.searchParams.get('utm_source');
  const utmMedium = url.searchParams.get('utm_medium');
  const utmCampaign = url.searchParams.get('utm_campaign');

  const isFromFacebook = (
    fbclid !== null ||
    utmSource === 'facebook' ||
    referer.includes('facebook.com')
  );

  const isAdTraffic = (
    fbclid !== null ||
    utmMedium === 'paid' ||
    utmMedium === 'cpc'
  ) && utmCampaign !== null;

  if (isBot) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  if (!isMobile) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  if (!(isFromFacebook && isAdTraffic)) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/bolzani', '/alessandra', '/angeloti'], // Pode ajustar para rotas específicas se quiser
};
