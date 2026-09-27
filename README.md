# Hypermedia — Net Art

Sezione **Net Art** della mostra *Hypermedia* al **MAM – Media Art Museum** di Roma.

Opere storiche in Flash (SWF) degli anni 2000, riprodotte nel browser tramite [Ruffle](https://ruffle.rs), l'emulatore Flash open source, e presentate in postazioni kiosk a schermo intero.

## Opere

| Opera | Autore | Pagina | Launcher Windows |
|---|---|---|---|
| PrayStation | Joshua Davis | `praystation.html` | `start-praystation.bat` |
| R3:DEV | gmunk | `r3dev.html` | `start-gmunk.bat` |
| Simian6 | | `simian6.html` | `start-simian6.bat` |

La galleria con tutte le opere è in `index.html`.

## Struttura

```
server.js            server Express statico (porta 3000)
public/              pagine delle opere e galleria
public/content/      file SWF e asset delle opere
start-*.bat          avvio kiosk su Windows, un'opera per postazione
```

I file `.swf` nella radice di `public/` (`61.swf`…`67a.swf`, `A.swf`, `news1-6.swf`) fanno parte di **Simian6**: il filmato principale (`content/simian6/swf/start.swf`) li carica con percorsi relativi alla root del sito, quindi devono restare lì.

Ruffle è installato via npm (`@ruffle-rs/ruffle`) e servito dal server su `/ruffle`.

## Avvio

Requisiti: Node.js e Google Chrome.

```bash
npm install
npm start          # http://localhost:3000
```

### Kiosk

- **Windows**: doppio clic su `start-<opera>.bat`. Avvia il server e apre Chrome in modalità kiosk sull'opera; alla chiusura di Chrome il server viene terminato.
- **macOS**: `npm run kiosk` apre la galleria in Chrome a schermo intero.

Chrome viene avviato con `--autoplay-policy=no-user-gesture-required` perché l'audio parta senza interazione.
