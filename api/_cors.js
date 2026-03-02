const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(.*\.)?worldmonitor\.app$/,
  /^https:\/\/worldmonitor-[a-z0-9-]+-elie-[a-z0-9]+\.vercel\.app$/,
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/tauri\.localhost(:\d+)?$/,
  /^https?:\/\/[a-z0-9-]+\.tauri\.localhost(:\d+)?$/i,
  /^tauri:\/\/localhost$/,
  /^asset:\/\/localhost$/,
];

const CORS_EXTRA_ORIGINS = (process.env.CORS_EXTRA_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const EXTRA_ORIGIN_PATTERNS = CORS_EXTRA_ORIGINS.map((o) => new RegExp(`^${o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*')}$`));
const CORS_DEFAULT_ORIGIN = process.env.CORS_DEFAULT_ORIGIN || '';

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))) return true;
  if (EXTRA_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))) return true;
  return false;
}

export function getCorsHeaders(req, methods = 'GET, OPTIONS') {
  const origin = req.headers.get('origin') || '';
  const allowOrigin = isAllowedOrigin(origin) ? origin : (CORS_DEFAULT_ORIGIN || '');
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-WorldMonitor-Key',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function isDisallowedOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  return !isAllowedOrigin(origin);
}
