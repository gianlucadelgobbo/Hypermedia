const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3000

app.use('/ruffle', express.static(path.join(__dirname, 'node_modules/@ruffle-rs/ruffle')))
app.use(express.static(path.join(__dirname, 'public')))

app.listen(PORT, () => {
  console.log(`Hypermedia kiosk running at http://localhost:${PORT}`)
})
