# Hypermedia — Net Art

**Net Art** section of the *Hypermedia* exhibition at **MAM – Media Art Museum** in Rome.

Historic Flash (SWF) works from the 2000s, played in the browser through [Ruffle](https://ruffle.rs), the open-source Flash emulator, and shown on full-screen kiosk stations.

## Works

| Work | Artist | Page | Windows launcher |
|---|---|---|---|
| Schematic Beta | PrayStation Joshua Davis | `praystation.html` | `start-praystation.bat` |
| DMGI.O | GMUNK (Bradley G. Munkowitz) | `r3dev.html` | `start-gmunk.bat` |
| Simian6 | Ross Mawdsley | `simian6.html` | `start-simian6.bat` |

The gallery of all works is in `index.html`.

## Structure

```
server.js            static Express server (port 3000)
public/              work pages and gallery
public/content/      SWF files and assets for each work
start-*.bat          Windows kiosk launchers, one work per station
```

The `.swf` files in the root of `public/` (`61.swf`…`67a.swf`, `A.swf`, `news1-6.swf`) belong to **Simian6**: the main movie (`content/simian6/swf/start.swf`) loads them with paths relative to the site root, so they must stay there.

Ruffle is installed via npm (`@ruffle-rs/ruffle`) and served by the server at `/ruffle`.

## Running

Requirements: Node.js and Google Chrome.

```bash
npm install
npm start          # http://localhost:3000
```

### Kiosk

- **Windows**: double-click `start-<work>.bat`. It starts the server and opens Chrome in kiosk mode on that work (via `kiosk.bat`); if Chrome is closed it reopens, and the server is restarted if it stopped.
- **Dedicated station**: `AttivaKiosk.bat` replaces the Windows desktop with the chosen work at login; `DisattivaKiosk.bat` restores it. `BloccaKiosk.reg` / `SbloccaKiosk.reg` disable / re-enable the Windows key. Full setup steps (in Italian) are in `guidaRapida.txt`.
- **macOS**: `npm run kiosk` opens the gallery in full-screen Chrome.

Chrome is launched with `--autoplay-policy=no-user-gesture-required` so audio starts without user interaction.
