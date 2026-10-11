const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const PORT = process.env.PORT || 3000

// Kiosk station: the work page to keep on screen (set by kiosk.bat), e.g. praystation.html
const KIOSK_HOME = process.env.KIOSK_HOME
const HOME_URL = `http://localhost:${PORT}/${KIOSK_HOME}`
const DEVTOOLS = 'http://127.0.0.1:9222'
const WATCH_MS = 5 * 1000
const IDLE_MS = 5 * 60 * 1000

let lastActivity = Date.now()
let lastTabs = ''

// Log to console and logs/kiosk.log (rotated to kiosk.old.log at startup when over 5 MB)
const LOG_FILE = path.join(__dirname, 'logs', 'kiosk.log')
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
try {
  if (fs.statSync(LOG_FILE).size > 5 * 1024 * 1024) fs.renameSync(LOG_FILE, LOG_FILE.replace('.log', '.old.log'))
} catch {}
function log(msg) {
  const line = `${new Date().toLocaleString('sv-SE')} ${msg}`
  console.log(line)
  fs.appendFile(LOG_FILE, line + '\n', () => {})
}

app.use('/ruffle', express.static(path.join(__dirname, 'node_modules/@ruffle-rs/ruffle')))
app.use(express.static(path.join(__dirname, 'public')))

// Visitor activity, sent by kiosk.js
app.post('/kiosk/activity', (req, res) => {
  lastActivity = Date.now()
  res.sendStatus(204)
})

// Page events, sent by kiosk.js (loads, blocked window.open/close)
app.post('/kiosk/log', express.text({ type: '*/*' }), (req, res) => {
  log(`page ${String(req.body).slice(0, 500)}`)
  res.sendStatus(204)
})

// Unknown page on a kiosk station: back to the work
app.use((req, res) => {
  if (KIOSK_HOME && req.method === 'GET' && (req.headers.accept || '').includes('text/html')) {
    log(`404 ${req.originalUrl} (referer: ${req.headers.referer || '-'}): redirecting to the work`)
    return res.redirect(`/${KIOSK_HOME}`)
  }
  res.sendStatus(404)
})

// Keeps Chrome on the work: exactly one tab, on HOME_URL, restarted after IDLE_MS without input.
// Uses Chrome's DevTools HTTP endpoints (Chrome must run with --remote-debugging-port=9222).
async function watchChrome() {
  let pages
  try {
    pages = (await (await fetch(`${DEVTOOLS}/json/list`)).json()).filter(t => t.type === 'page')
  } catch {
    return // Chrome not running: kiosk.bat will relaunch it
  }

  const tabs = pages.map(p => p.url).join(' | ')
  if (tabs !== lastTabs) {
    log(`tabs (${pages.length}): ${tabs || '-'}`)
    lastTabs = tabs
  }

  const idle = Date.now() - lastActivity >= IDLE_MS
  const good = idle ? [] : pages.filter(p => p.url === HOME_URL)
  const keep = good[0]

  if (!keep) {
    log(idle ? 'idle: restarting the work' : 'off the work: restoring')
    await fetch(`${DEVTOOLS}/json/new?${HOME_URL}`, { method: 'PUT' })
    lastActivity = Date.now()
  }
  for (const p of pages) {
    if (p === keep) continue
    log(`closing tab ${p.url}`)
    await fetch(`${DEVTOOLS}/json/close/${p.id}`)
  }
}

app.listen(PORT, () => {
  log(`server started on http://localhost:${PORT}`)
  if (KIOSK_HOME) {
    log(`kiosk watchdog on ${HOME_URL}`)
    setInterval(() => watchChrome().catch(err => log(`watchdog error: ${err.message}`)), WATCH_MS)
  }
})
