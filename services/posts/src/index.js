/**
 * NOMAD — Posts Service
 *
 * Dono do calendário de conteúdo. O time NOMAD (admin) cria/edita/remove posts
 * e associa arquivos a datas; o cliente apenas visualiza os posts da sua própria
 * empresa e pode aprovar, reprovar ou comentar. O isolamento por empresa é
 * garantido no servidor: um cliente nunca recebe posts de outra empresa.
 */
const express = require('express')
const cors = require('cors')
const { PORT } = require('./config')
const { requireAuth, requireAdmin } = require('./auth')
const repo = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

// Garante que o usuário pode ver/agir sobre um post (admin vê tudo;
// cliente só a própria empresa).
function canAccess(user, post) {
  if (!post) return false
  if (user.role === 'admin') return true
  return post.clientId === user.clientId
}

const posts = express.Router()
const stats = express.Router()

posts.get('/health', (_req, res) => res.json({ service: 'posts', status: 'ok' }))

// Lista posts. Cliente: forçado à própria empresa. Admin: opcionalmente filtra.
posts.get('/', requireAuth, (req, res) => {
  const month = req.query.month
  let clientId = req.query.clientId || undefined
  if (req.user.role !== 'admin') clientId = req.user.clientId
  res.json({ posts: repo.listPosts({ clientId, month }) })
})

posts.get('/:id', requireAuth, (req, res) => {
  const post = repo.getPost(req.params.id)
  if (!canAccess(req.user, post)) return res.status(404).json({ error: 'Post não encontrado' })
  res.json({ post, events: repo.getEvents(post.id) })
})

posts.get('/:id/events', requireAuth, (req, res) => {
  const post = repo.getPost(req.params.id)
  if (!canAccess(req.user, post)) return res.status(404).json({ error: 'Post não encontrado' })
  res.json({ events: repo.getEvents(post.id) })
})

// ---------- Criação/edição (somente NOMAD) ----------
posts.post('/', requireAuth, requireAdmin, (req, res) => {
  const { clientId, title, scheduledDate } = req.body || {}
  if (!clientId || !title || !scheduledDate) {
    return res.status(400).json({ error: 'Informe ao menos empresa, título e data' })
  }
  res.status(201).json({ post: repo.createPost(req.body, req.user) })
})

posts.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const updated = repo.updatePost(req.params.id, req.body || {}, req.user)
  if (!updated) return res.status(404).json({ error: 'Post não encontrado' })
  res.json({ post: updated })
})

posts.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const ok = repo.deletePost(req.params.id)
  if (!ok) return res.status(404).json({ error: 'Post não encontrado' })
  res.json({ ok: true })
})

// ---------- Ações do cliente ----------
posts.post('/:id/approve', requireAuth, (req, res) => {
  const post = repo.getPost(req.params.id)
  if (!canAccess(req.user, post)) return res.status(404).json({ error: 'Post não encontrado' })
  const updated = repo.setStatus(post.id, 'aprovado', {
    type: 'aprovado',
    author: req.user.name,
    authorRole: req.user.role,
    message: 'Post aprovado pelo cliente.',
  })
  res.json({ post: updated })
})

posts.post('/:id/reject', requireAuth, (req, res) => {
  const post = repo.getPost(req.params.id)
  if (!canAccess(req.user, post)) return res.status(404).json({ error: 'Post não encontrado' })
  const message = (req.body?.message || '').trim()
  if (!message) return res.status(400).json({ error: 'Descreva o motivo da reprovação' })
  const updated = repo.setStatus(post.id, 'reprovado', {
    type: 'reprovado',
    author: req.user.name,
    authorRole: req.user.role,
    message,
  })
  res.json({ post: updated })
})

posts.post('/:id/comment', requireAuth, (req, res) => {
  const post = repo.getPost(req.params.id)
  if (!canAccess(req.user, post)) return res.status(404).json({ error: 'Post não encontrado' })
  const message = (req.body?.message || '').trim()
  if (!message) return res.status(400).json({ error: 'Escreva um comentário' })
  repo.addEvent(post.id, { type: 'comentario', author: req.user.name, authorRole: req.user.role, message })
  res.json({ post: repo.getPost(post.id), events: repo.getEvents(post.id) })
})

// ---------- Estatísticas (somente NOMAD) ----------
stats.get('/overview', requireAuth, requireAdmin, (_req, res) => {
  res.json(repo.stats())
})

app.use('/posts', posts)
app.use('/stats', stats)

app.listen(PORT, () => console.log(`[posts]    http://localhost:${PORT}`))
