/**
 * NOMAD — Servidor combinado (produção / deploy)
 *
 * Para facilitar a publicação em um host gratuito, este servidor roda os três
 * microserviços (auth, posts, files) no mesmo processo e serve o front-end já
 * compilado (frontend/dist) na mesma porta. Assim, a aplicação inteira fica
 * acessível por uma única URL pública.
 *
 * Em desenvolvimento continue usando `npm run dev` (microserviços separados +
 * Vite com hot reload). Em produção: `npm run build && npm start`.
 */
const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')

// Importa apenas os routers — graças ao guard `require.main === module`,
// importar estes módulos NÃO sobe servidores separados.
const { router: authRouter } = require('./services/auth/src/index')
const { postsRouter, statsRouter } = require('./services/posts/src/index')
const { router: filesRouter } = require('./services/files/src/index')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ service: 'nomad-combined', status: 'ok', time: new Date().toISOString() }))

// API (mesmos caminhos que o gateway expõe em dev).
app.use('/api/auth', authRouter)
app.use('/api/posts', postsRouter)
app.use('/api/stats', statsRouter)
app.use('/api/files', filesRouter)
app.use('/api', (_req, res) => res.status(404).json({ error: 'Rota de API não encontrada' }))

// Front-end estático + fallback de SPA.
const dist = path.join(__dirname, 'frontend', 'dist')
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
} else {
  app.get('*', (_req, res) =>
    res
      .status(503)
      .send('<h1>NOMAD</h1><p>Front-end ainda não compilado. Rode <code>npm run build</code> antes de <code>npm start</code>.</p>')
  )
}

const PORT = process.env.PORT || process.env.GATEWAY_PORT || 4000
app.listen(PORT, () => console.log(`[nomad] servidor combinado em http://localhost:${PORT}`))
