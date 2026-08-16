// Tiny static file server for mythologia + same-origin reverse proxy to the
// self-hosted GoatCounter analytics instance.
//
// GoatCounter runs privately on STATS_UPSTREAM under the /stats base-path; the
// browser only ever talks to this origin (:8000/stats/*), so no CORS, extra
// subdomain, or public DNS is needed. The tracking beacon lives at /stats/count
// and the loader at /stats/count.js. GoatCounter routes to a site by Host, so
// we pin STATS_VHOST to the site configured for this map.
//
// Zero dependencies — Node's built-in http/fs only. Serves index.html at / and
// static files (versions/, README, etc.) relative to this file's directory.
//
// Env overrides: PORT, STATS_UPSTREAM (set '' to disable proxying), STATS_VHOST.

import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, normalize, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 8000
const HOST = process.env.HOST || '0.0.0.0'

// Set STATS_UPSTREAM='' to disable the proxy (e.g. dev without GoatCounter running).
const STATS_UPSTREAM = process.env.STATS_UPSTREAM ?? 'http://127.0.0.1:8085'
const STATS_VHOST = process.env.STATS_VHOST || 'mythologia.elphiene.com'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/plain; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
}

const statsTarget = STATS_UPSTREAM ? new URL(STATS_UPSTREAM) : null

// Same-origin reverse proxy for /stats/* → the private GoatCounter instance.
function proxyStats(req, res) {
  const proxyReq = http.request(
    {
      hostname: statsTarget.hostname,
      port: statsTarget.port,
      method: req.method,
      path: req.url, // keeps the /stats prefix + query string
      headers: {
        ...req.headers,
        // GoatCounter picks the site by Host; pin it so counting works even when
        // the incoming Host is an IP or :8000 (LAN/VPN viewing).
        host: STATS_VHOST,
        'x-forwarded-host': STATS_VHOST,
        'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'https',
        'x-forwarded-for': req.socket.remoteAddress,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res)
    }
  )
  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'content-type': 'text/plain' })
      res.end('stats upstream unavailable')
    }
  })
  req.pipe(proxyReq)
}

async function serveStatic(req, res) {
  // Resolve the URL path safely under ROOT (block ../ traversal).
  const urlPath = decodeURIComponent((req.url.split('?')[0]))
  let rel = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  if (rel === '/' || rel === '') rel = '/index.html'
  const filePath = join(ROOT, rel)
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('forbidden')
    return
  }

  try {
    const info = await stat(filePath)
    if (info.isDirectory()) {
      return serveFile(join(filePath, 'index.html'), res)
    }
    return serveFile(filePath, res)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('not found')
  }
}

async function serveFile(filePath, res) {
  try {
    const body = await readFile(filePath)
    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream'
    res.writeHead(200, { 'content-type': type }).end(body)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('not found')
  }
}

const server = http.createServer((req, res) => {
  if (statsTarget && (req.url === '/stats' || req.url.startsWith('/stats/') || req.url.startsWith('/stats?'))) {
    return proxyStats(req, res)
  }
  return serveStatic(req, res)
})

server.listen(PORT, HOST, () => {
  console.log(`mythologia listening on http://${HOST}:${PORT}`)
  if (statsTarget) {
    console.log(`  /stats/* → ${STATS_UPSTREAM} (Host: ${STATS_VHOST})`)
  } else {
    console.log('  stats proxy disabled (STATS_UPSTREAM empty)')
  }
})
