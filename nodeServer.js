import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logEvents from './logEvents.js'
import EventEmitter from 'events'
import { createServer } from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const myEmitter = new EventEmitter()
myEmitter.on('log', (msg) => logEvents(msg))

const PORT = process.env.PORT ?? 3500
const serveFile = async (filePath, contentType, response) => {
  try {
    const rawData = await fsPromises.readFile(
      filePath,
      contentType.includes('image') ? null : 'utf8'
    )

    const data = contentType === 'application/json'
      ? JSON.parse(rawData)
      : rawData

    response.writeHead(
      filePath.includes('404.html') ? 404 : 200,
      { 'Content-Type': contentType }
    )
    response.end(
      contentType === 'application/json' ? JSON.stringify(data) : data
    )
  } catch (err) {
    console.error(err)
    myEmitter.emit('log', `${err.name}: ${err.message}`)
    response.statusCode = 500
    response.end()
  }
}

const server = createServer(async (req, res) => {
  console.log(req.url, req.method)
  myEmitter.emit('log', 'Log event emitted!')

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
  const pathname = parsedUrl.pathname
  const extension = path.extname(pathname)
  let contentType

  switch (extension) {
    case '.css':
      contentType = 'text/css'
      break
    case '.js':
      contentType = 'text/javascript'
      break
    case '.json':
      contentType = 'application/json'
      break
    case '.jpg':
      contentType = 'image/jpeg'
      break
    case '.png':
      contentType = 'image/png'
      break
    case '.txt':
      contentType = 'text/plain'
      break
    default:
      contentType = 'text/html'
  }

  const trimmedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname
  let filePath =
    contentType === 'text/html' && pathname === '/'
      ? path.join(__dirname, 'views', 'index.html')
      : contentType === 'text/html' && pathname.endsWith('/')
        ? path.join(__dirname, 'views', trimmedPath, 'index.html')
        : contentType === 'text/html'
          ? path.join(__dirname, 'views', trimmedPath)
          : path.join(__dirname, trimmedPath)

  if (!extension && !pathname.endsWith('/')) filePath += '.html'

  try {
    await fsPromises.access(filePath, fs.constants.F_OK)
    await serveFile(filePath, contentType, res)
  } catch {
    switch (path.parse(filePath).base) {
      case 'old-page.html':
        res.writeHead(301, { 'Location': '/new-page.html' })
        res.end()
        break
      case 'www-page.html':
        res.writeHead(301, { 'Location': '/' })
        res.end()
        break
      default:
        await serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res)
    }
  }
})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
