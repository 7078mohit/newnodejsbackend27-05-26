const BASE = process.env.API_BASE || 'http://localhost:5000';

const routes = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: '/horoscope/leo/daily' },
  { method: 'GET', path: '/api/lang' },
  { method: 'GET', path: '/api/faqs/get-faqs' },
  { method: 'GET', path: '/api/auth/user-stats' },
  { method: 'GET', path: '/api/astrologer/all' },
  { method: 'GET', path: '/api/transits/get-trasnsit' },
  { method: 'GET', path: '/api/transits/get-planet-transits' },
  { method: 'GET', path: '/api/banners/get-banner' },
  { method: 'GET', path: '/api/products/all' },
  { method: 'GET', path: '/api/astro_skills' },
  { method: 'GET', path: '/api/communication/requests/000000000000000000000000' },
];

let failed = 0;

for (const { method, path } of routes) {
  try {
    const res = await fetch(`${BASE}${path}`, { method });
    const ok = res.status < 500;
    console.log(`${ok ? 'OK' : 'FAIL'} ${method} ${path} -> ${res.status}`);
    if (!ok) failed += 1;
  } catch (err) {
    console.log(`FAIL ${method} ${path} -> ${err.message}`);
    failed += 1;
  }
}

process.exit(failed > 0 ? 1 : 0);
