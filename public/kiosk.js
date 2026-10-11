// Kiosk helpers, included in every work page (and in iframes).
// - blocks new windows: in kiosk mode they open full screen and trap the visitor
// - reports visitor activity to the server, which restarts the work when idle
(function () {
  window.open = function () { return null }

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
