// Helpers de JWT e middleware de autenticação/autorização.
const jwt = require('jsonwebtoken')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('./config')

// Cria um token a partir do usuário. Os claims viajam com o token para que os
// outros microserviços não precisem consultar o banco de auth.
function signToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role, // 'admin' (time NOMAD) | 'client' (cliente final)
    clientId: user.clientId || null,
    clientName: user.clientName || null,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Middleware: exige um Bearer token válido e o disponibiliza em req.user.
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

// Middleware: exige que o usuário tenha o papel de admin (time NOMAD).
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao time NOMAD' })
  }
  next()
}

module.exports = { signToken, requireAuth, requireAdmin }
