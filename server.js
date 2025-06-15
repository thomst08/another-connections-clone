import fs from 'node:fs/promises'
import express from 'express'

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''

// Create http server
const app = express()

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

app.get("/api/connections/:year-:month-:day", async (req, res) => {
  let params = req.params;
  let year = params.year;
  let month = params.month;
  let day = params.day;

  if (year === undefined || year === "" || month === undefined || month === "" || day === undefined || day === "")
    throw new Error("Missing dates");

  if (year.length !== 4)
    throw new Error("Year incorrect");

  if (month.length > 2)
    throw new Error("Month incorrect");

  if (day.length > 2)
    throw new Error("Day incorrect");

  if (month.length === 1)
    month = `0${month}`;

  if (day.length === 1)
    day = `0${day}`;

  // Example of Connections API
  // "https://www.nytimes.com/svc/connections/v2/{yyyy}-{MM}-{dd}.json"
  const connectionsAPIURL = `https://www.nytimes.com/svc/connections/v2/${year}-${month}-${day}.json`;

  const data = await fetch(connectionsAPIURL)
    .then(res => res.json());

  res.setHeader('Content-Type', 'application/json');
  res.json(data);
});


// Serve HTML
app.get('/', async (req, res) => {
  // app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.ts').render} */
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const rendered = await render(url)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
});

app.use('*all', async (req, res) => {
  res.redirect('/');
});

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://0.0.0.0:${port}`)
})
