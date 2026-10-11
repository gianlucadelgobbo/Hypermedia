// Kiosk helpers, included in every work page (and in iframes).
// - blocks new windows and window.close: in kiosk mode they trap the visitor
// - logs page loads and blocked calls to the server (logs/kiosk.log)
// - reports visitor activity to the server, which restarts the work when idle
(function () {
  var where = location.pathname + (window === window.top ? '' : ' (iframe)')

  function log(msg) {
    navigator.sendBeacon('/kiosk/log', where + ': ' + msg)
  }

  window.open = function (url, name) {
    log('blocked window.open(' + JSON.stringify(url) + ', ' + JSON.stringify(name) + ')')
    return null
  }
  window.close = function () {
    log('blocked window.close()')
  }

  log('loaded ' + location.href)

  var last = 0
  function activity() {
    var now = Date.now()
    if (now - last < 5000) return
    last = now
    navigator.sendBeacon('/kiosk/activity')
  }

  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (e) {
    window.addEventListener(e, activity, true)
  })
})()
