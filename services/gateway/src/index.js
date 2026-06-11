/**
 * NOMAD — API Gateway
 *
 * Ponto único de entrada da plataforma. Não contém regras de negócio:
 * apenas roteia as requisições /api/* para o microserviço responsável e
 * encaminha o header Authorization (JWT) sem alterá-lo. Cada serviço valida
 * o token por conta própria (defesa em profundidade).
 */
const express = require('express')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')

const PORT = process.env.GATEWAY_PORT || 4000
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4001'
const POSTS_URL = process.env.POSTS_URL || 'http://localhost:4002'
const FILES_URL = process.env.FILES_URL || 'http://localhost:4003'

const app = express()
app.use(cors())

// Health check do gateway (não proxia).
app.get('/api/health', (_req, res) => {
  res.json({ service: 'gateway', status: 'ok', time: new Date().toISOString() })
})

// Montamos os proxies na raiz e selecionamos a rota via `pathFilter`, para que
// o middleware enxergue a URL completa (/api/...) e o pathRewrite remova o /api
// corretamente. (Montar via app.use('/api/auth', ...) faria o Express remover o
// prefixo antes do proxy, quebrando o rewrite.)
const startsWith = (...prefixes) => (path) => prefixes.some((p) => path === p || path.startsWith(p + '/'))
const stripApi = { '^/api': '' }
const common = { changeOrigin: true, xfwd: true }

// IMPORTANTE: sem body parser antes dos proxies, para que uploads
// (multipart/form-data) sejam transmitidos como stream para o files-service.
app.use(createProxyMiddleware({ pathFilter: startsWith('/api/auth'), target: AUTH_URL, pathRewrite: stripApi, ...common }))
app.use(createProxyMiddleware({ pathFilter: startsWith('/api/posts', '/api/stats'), target: POSTS_URL, pathRewrite: stripApi, ...common }))
app.use(createProxyMiddleware({ pathFilter: startsWith('/api/files'), target: FILES_URL, pathRewrite: stripApi, ...common }))

app.use('/api', (_req, res) => res.status(404).json({ error: 'Rota não encontrada no gateway' }))

app.listen(PORT, () => {
  console.log(`[gateway]  http://localhost:${PORT}  ->  auth:${AUTH_URL} posts:${POSTS_URL} files:${FILES_URL}`)
})
