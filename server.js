const express = require('express')
const path = require('path')
const fs = require('fs')
const dgram = require('dgram')
const { exec } = require('child_process')
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

// OSC remote control (e.g. from a Stream Deck), UDP port 9000:
// /hypermedia/shutdown and /hypermedia/reboot. Sent to the LAN broadcast address it reaches every station.
const OSC_PORT = process.env.OSC_PORT || 9000
const OSC_COMMANDS = {
  '/hypermedia/shutdown': 'shutdown /s /f /t 0',
  '/hypermedia/reboot': 'shutdown /r /f /t 0',
}
const osc = dgram.createSocket({ type: 'udp4', reuseAddr: true })
osc.on('message', (msg, from) => {
  const address = msg.toString('latin1', 0, msg.indexOf(0) < 0 ? msg.length : msg.indexOf(0))
  const command = OSC_COMMANDS[address]
  log(`osc ${address} from ${from.address}${command ? '' : ' (ignored)'}`)
  if (!command) return
  if (process.platform !== 'win32') return log(`osc: not on Windows, skipping "${command}"`)
  exec(command, err => err && log(`osc error: ${err.message}`))
})
osc.on('error', err => log(`osc error: ${err.message}`))
osc.bind(OSC_PORT, () => log(`osc listening on udp ${OSC_PORT}`))

app.listen(PORT, () => {
  log(`server started on http://localhost:${PORT}`)
  if (KIOSK_HOME) {
    log(`kiosk watchdog on ${HOME_URL}`)
    setInterval(() => watchChrome().catch(err => log(`watchdog error: ${err.message}`)), WATCH_MS)
  }
})
