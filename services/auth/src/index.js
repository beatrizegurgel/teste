/**
 * NOMAD — Auth Service
 *
 * Cadastro e login de clientes, emissão de JWT, e gestão de empresas/usuários
 * pelo time NOMAD (admin). Multi-tenant: cada usuário "client" pertence a uma
 * empresa (clientId); usuários "admin" representam a agência e não têm empresa.
 */
const express = require('express')
const cors = require('cors')
const { PORT } = require('./config')
const { signToken, requireAuth, requireAdmin } = require('./auth')
const repo = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

const router = express.Router()

router.get('/health', (_req, res) => res.json({ service: 'auth', status: 'ok' }))

// Cadastro público: cria uma nova empresa + o primeiro usuário (cliente).
router.post('/register', (req, res) => {
  const { name, email, password, companyName } = req.body || {}
  if (!name || !email || !password || !companyName) {
    return res.status(400).json({ error: 'Informe nome, e-mail, senha e nome da empresa' })
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres' })
  }
  if (repo.findUserByEmail(email)) {
    return res.status(409).json({ error: 'Já existe uma conta com este e-mail' })
  }
  const client = repo.createClient({ name: companyName })
  const user = repo.createUser({ name, email, password, role: 'client', clientId: client.id })
  const pub = repo.publicUser(user)
  res.status(201).json({ token: signToken(pub), user: pub })
})

// Login para clientes e para o time NOMAD.
router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Informe e-mail e senha' })
  const user = repo.findUserByEmail(email)
  if (!user || !repo.verifyPassword(user, password)) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' })
  }
  const pub = repo.publicUser(user)
  res.json({ token: signToken(pub), user: pub })
})

// Dados do usuário autenticado.
router.get('/me', requireAuth, (req, res) => {
  const user = repo.getUser(req.user.id)
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
  res.json({ user: repo.publicUser(user) })
})

// ---------- Gestão de empresas/usuários (apenas NOMAD) ----------
router.get('/clients', requireAuth, requireAdmin, (_req, res) => {
  res.json({ clients: repo.listClients() })
})

router.post('/clients', requireAuth, requireAdmin, (req, res) => {
  const { name, niche, ownerEmail, ownerName, ownerPassword } = req.body || {}
  if (!name) return res.status(400).json({ error: 'Informe o nome da empresa' })
  const client = repo.createClient({ name, niche })
  let owner = null
  // Opcionalmente já cria o usuário de acesso do cliente.
  if (ownerEmail && ownerPassword) {
    if (repo.findUserByEmail(ownerEmail)) {
      return res.status(409).json({ error: 'Já existe uma conta com o e-mail do responsável' })
    }
    const u = repo.createUser({
      name: ownerName || name,
      email: ownerEmail,
      password: ownerPassword,
      role: 'client',
      clientId: client.id,
    })
    owner = repo.publicUser(u)
  }
  res.status(201).json({ client, owner })
})

router.post('/users', requireAuth, requireAdmin, (req, res) => {
  const { name, email, password, clientId, role } = req.body || {}
  if (!name || !email || !password || !clientId) {
    return res.status(400).json({ error: 'Informe nome, e-mail, senha e empresa' })
  }
  if (!repo.getClient(clientId)) return res.status(404).json({ error: 'Empresa não encontrada' })
  if (repo.findUserByEmail(email)) return res.status(409).json({ error: 'E-mail já cadastrado' })
  const u = repo.createUser({ name, email, password, role: role === 'admin' ? 'admin' : 'client', clientId })
  res.status(201).json({ user: repo.publicUser(u) })
})

app.use('/auth', router)

// Standalone (microserviço) quando executado diretamente; em produção o
// server.js combinado importa apenas o `router`.
if (require.main === module) {
  app.listen(PORT, () => console.log(`[auth]     http://localhost:${PORT}`))
}

module.exports = { app, router }
