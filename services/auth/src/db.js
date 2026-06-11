// Camada de dados do auth-service (SQLite via better-sqlite3).
// Cada microserviço é dono do seu próprio banco — aqui ficam empresas
// (clientes da agência) e usuários.
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')

const DATA_DIR = path.join(__dirname, '..', 'data')
fs.mkdirSync(DATA_DIR, { recursive: true })
const db = new Database(path.join(DATA_DIR, 'auth.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    niche     TEXT,
    createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    role         TEXT NOT NULL,           -- 'admin' | 'client'
    clientId     TEXT,                    -- empresa do cliente (null para admin)
    createdAt    TEXT NOT NULL
  );
`)

const newId = (p) => `${p}_${crypto.randomBytes(6).toString('hex')}`

function publicClient(c) {
  if (!c) return null
  return { id: c.id, name: c.name, niche: c.niche, createdAt: c.createdAt }
}

function clientName(clientId) {
  if (!clientId) return null
  const c = db.prepare('SELECT name FROM clients WHERE id = ?').get(clientId)
  return c ? c.name : null
}

function publicUser(u) {
  if (!u) return null
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    clientId: u.clientId || null,
    clientName: clientName(u.clientId),
    createdAt: u.createdAt,
  }
}

// ---------- Empresas (clientes) ----------
function listClients() {
  return db.prepare('SELECT * FROM clients ORDER BY name').all().map(publicClient)
}

function getClient(id) {
  return publicClient(db.prepare('SELECT * FROM clients WHERE id = ?').get(id))
}

function createClient({ name, niche }) {
  const client = { id: newId('client'), name, niche: niche || null, createdAt: new Date().toISOString() }
  db.prepare('INSERT INTO clients (id, name, niche, createdAt) VALUES (@id, @name, @niche, @createdAt)').run(client)
  return publicClient(client)
}

// ---------- Usuários ----------
function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').toLowerCase())
}

function getUser(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
}

function createUser({ name, email, password, role, clientId }) {
  const user = {
    id: newId('user'),
    name,
    email: String(email).toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    clientId: clientId || null,
    createdAt: new Date().toISOString(),
  }
  db.prepare(
    `INSERT INTO users (id, name, email, passwordHash, role, clientId, createdAt)
     VALUES (@id, @name, @email, @passwordHash, @role, @clientId, @createdAt)`
  ).run(user)
  return user
}

function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.passwordHash)
}

// ---------- Seed (apenas no primeiro boot) ----------
function seed() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n
  if (count > 0) return

  // IDs fixos para que os outros serviços (posts/files) consigam semear
  // dados coerentes referenciando as mesmas empresas.
  const bella = { id: 'client_bella', name: 'Clínica Estética Bella', niche: 'Estética & Saúde', createdAt: new Date().toISOString() }
  const verde = { id: 'client_verde', name: 'Mercado Verde Orgânicos', niche: 'Alimentação Saudável', createdAt: new Date().toISOString() }
  db.prepare('INSERT INTO clients (id, name, niche, createdAt) VALUES (@id, @name, @niche, @createdAt)').run(bella)
  db.prepare('INSERT INTO clients (id, name, niche, createdAt) VALUES (@id, @name, @niche, @createdAt)').run(verde)

  createUser({ name: 'Equipe NOMAD', email: 'admin@nomad.studio', password: 'nomad123', role: 'admin', clientId: null })
  createUser({ name: 'Dra. Marina (Bella)', email: 'cliente@bella.com', password: 'cliente123', role: 'client', clientId: bella.id })
  createUser({ name: 'João (Mercado Verde)', email: 'cliente@verde.com', password: 'cliente123', role: 'client', clientId: verde.id })

  console.log('[auth] seed inicial criado (admin@nomad.studio / cliente@bella.com / cliente@verde.com)')
}

seed()

module.exports = {
  db,
  listClients,
  getClient,
  createClient,
  findUserByEmail,
  getUser,
  createUser,
  verifyPassword,
  publicUser,
  clientName,
}
