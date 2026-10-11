const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3000

// Kiosk station: the work page to keep on screen (set by kiosk.bat), e.g. praystation.html
const KIOSK_HOME = process.env.KIOSK_HOME
const HOME_URL = `http://localhost:${PORT}/${KIOSK_HOME}`
const DEVTOOLS = 'http://127.0.0.1:9222'
const WATCH_MS = 5 * 1000
const IDLE_MS = 5 * 60 * 1000

let lastActivity = Date.now()

app.use('/ruffle', express.static(path.join(__dirname, 'node_modules/@ruffle-rs/ruffle')))
app.use(express.static(path.join(__dirname, 'public')))

// Visitor activity, sent by kiosk.js
app.post('/kiosk/activity', (req, res) => {
  lastActivity = Date.now()
  res.sendStatus(204)
})

// Unknown page on a kiosk station: back to the work
app.use((req, res) => {
  if (KIOSK_HOME && req.method === 'GET' && (req.headers.accept || '').includes('text/html')) {
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

  const idle = Date.now() - lastActivity >= IDLE_MS
  const good = idle ? [] : pages.filter(p => p.url === HOME_URL)
  const keep = good[0]

  if (!keep) {
    console.log(idle ? 'Idle: restarting work' : `Off the work (${pages.map(p => p.url).join(', ')}): restoring`)
    await fetch(`${DEVTOOLS}/json/new?${HOME_URL}`, { method: 'PUT' })
    lastActivity = Date.now()
  }
  for (const p of pages) {
    if (p !== keep) await fetch(`${DEVTOOLS}/json/close/${p.id}`)
  }
}

app.listen(PORT, () => {
  console.log(`Hypermedia kiosk running at http://localhost:${PORT}`)
  if (KIOSK_HOME) {
    console.log(`Kiosk watchdog on ${HOME_URL}`)
    setInterval(() => watchChrome().catch(err => console.error('Watchdog:', err.message)), WATCH_MS)
  }
})
