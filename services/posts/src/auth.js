// Verificação de JWT (mesmo segredo do auth-service) — defesa em profundidade.
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('./config')

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Token de autenticação ausente' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acesso restrito ao time NOMAD' })
  next()
}

module.exports = { requireAuth, requireAdmin }
