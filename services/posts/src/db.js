// Camada de dados do posts-service (SQLite).
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const DATA_DIR = path.join(__dirname, '..', 'data')
fs.mkdirSync(DATA_DIR, { recursive: true })
const db = new Database(path.join(DATA_DIR, 'posts.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id            TEXT PRIMARY KEY,
    clientId      TEXT NOT NULL,
    clientName    TEXT,
    title         TEXT NOT NULL,
    caption       TEXT,
    format        TEXT,                  -- Feed | Reels | Stories | Carrossel | Outro
    scheduledDate TEXT NOT NULL,         -- YYYY-MM-DD
    scheduledTime TEXT,                  -- HH:MM
    status        TEXT NOT NULL,         -- rascunho|aguardando|aprovado|reprovado|publicado
    fileId        TEXT,
    fileName      TEXT,
    fileType      TEXT,                  -- mime type do anexo
    createdBy     TEXT,
    createdAt     TEXT NOT NULL,
    updatedAt     TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id         TEXT PRIMARY KEY,
    postId     TEXT NOT NULL,
    type       TEXT NOT NULL,            -- criado|editado|enviado|aprovado|reprovado|comentario|publicado
    author     TEXT,
    authorRole TEXT,
    message    TEXT,
    createdAt  TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_posts_client ON posts(clientId);
  CREATE INDEX IF NOT EXISTS idx_events_post ON events(postId);
`)

const newId = (p) => `${p}_${crypto.randomBytes(6).toString('hex')}`
const now = () => new Date().toISOString()

function addEvent(postId, { type, author, authorRole, message }) {
  const ev = { id: newId('ev'), postId, type, author: author || null, authorRole: authorRole || null, message: message || null, createdAt: now() }
  db.prepare(
    `INSERT INTO events (id, postId, type, author, authorRole, message, createdAt)
     VALUES (@id, @postId, @type, @author, @authorRole, @message, @createdAt)`
  ).run(ev)
  return ev
}

function getEvents(postId) {
  return db.prepare('SELECT * FROM events WHERE postId = ? ORDER BY createdAt ASC').all(postId)
}

function getPost(id) {
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(id)
}

function listPosts({ clientId, month } = {}) {
  let sql = 'SELECT * FROM posts'
  const where = []
  const args = {}
  if (clientId) { where.push('clientId = @clientId'); args.clientId = clientId }
  if (month) { where.push("substr(scheduledDate, 1, 7) = @month"); args.month = month }
  if (where.length) sql += ' WHERE ' + where.join(' AND ')
  sql += ' ORDER BY scheduledDate ASC, scheduledTime ASC'
  return db.prepare(sql).all(args)
}

function createPost(data, actor) {
  const post = {
    id: newId('post'),
    clientId: data.clientId,
    clientName: data.clientName || null,
    title: data.title,
    caption: data.caption || null,
    format: data.format || 'Feed',
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime || '09:00',
    status: data.status || 'aguardando',
    fileId: data.fileId || null,
    fileName: data.fileName || null,
    fileType: data.fileType || null,
    createdBy: actor?.name || null,
    createdAt: now(),
    updatedAt: now(),
  }
  db.prepare(
    `INSERT INTO posts (id, clientId, clientName, title, caption, format, scheduledDate, scheduledTime, status, fileId, fileName, fileType, createdBy, createdAt, updatedAt)
     VALUES (@id, @clientId, @clientName, @title, @caption, @format, @scheduledDate, @scheduledTime, @status, @fileId, @fileName, @fileType, @createdBy, @createdAt, @updatedAt)`
  ).run(post)
  addEvent(post.id, { type: 'criado', author: actor?.name || 'NOMAD', authorRole: 'admin', message: 'Post criado pela NOMAD.' })
  if (post.status === 'aguardando') {
    addEvent(post.id, { type: 'enviado', author: actor?.name || 'NOMAD', authorRole: 'admin', message: 'Enviado para aprovação do cliente.' })
  }
  return post
}

function updatePost(id, patch, actor) {
  const current = getPost(id)
  if (!current) return null
  const merged = { ...current, ...patch, updatedAt: now() }
  db.prepare(
    `UPDATE posts SET clientId=@clientId, clientName=@clientName, title=@title, caption=@caption,
       format=@format, scheduledDate=@scheduledDate, scheduledTime=@scheduledTime, status=@status,
       fileId=@fileId, fileName=@fileName, fileType=@fileType, updatedAt=@updatedAt
     WHERE id=@id`
  ).run(merged)
  addEvent(id, { type: 'editado', author: actor?.name || 'NOMAD', authorRole: 'admin', message: 'Post atualizado pela NOMAD.' })
  // Reenvio para aprovação reinicia o ciclo.
  if (current.status !== 'aguardando' && merged.status === 'aguardando') {
    addEvent(id, { type: 'enviado', author: actor?.name || 'NOMAD', authorRole: 'admin', message: 'Reenviado para aprovação do cliente.' })
  }
  return getPost(id)
}

function setStatus(id, status, event) {
  db.prepare('UPDATE posts SET status=@status, updatedAt=@updatedAt WHERE id=@id').run({ id, status, updatedAt: now() })
  if (event) addEvent(id, event)
  return getPost(id)
}

function deletePost(id) {
  db.prepare('DELETE FROM events WHERE postId = ?').run(id)
  return db.prepare('DELETE FROM posts WHERE id = ?').run(id).changes > 0
}

function stats() {
  const byStatus = db.prepare('SELECT status, COUNT(*) AS n FROM posts GROUP BY status').all()
  const total = db.prepare('SELECT COUNT(*) AS n FROM posts').get().n
  const perClient = db
    .prepare(
      `SELECT clientId, clientName,
        COUNT(*) AS total,
        SUM(CASE WHEN status='aguardando' THEN 1 ELSE 0 END) AS aguardando,
        SUM(CASE WHEN status IN ('aprovado','publicado') THEN 1 ELSE 0 END) AS aprovados,
        SUM(CASE WHEN status='reprovado' THEN 1 ELSE 0 END) AS reprovados
       FROM posts GROUP BY clientId, clientName ORDER BY clientName`
    )
    .all()
  const counts = { rascunho: 0, aguardando: 0, aprovado: 0, reprovado: 0, publicado: 0 }
  byStatus.forEach((r) => { counts[r.status] = r.n })
  return { total, counts, perClient }
}

// ---------- Seed ----------
function pad(n) { return String(n).padStart(2, '0') }

function seed() {
  if (db.prepare('SELECT COUNT(*) AS n FROM posts').get().n > 0) return
  const d = new Date()
  const ym = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
  const day = (n) => `${ym}-${pad(n)}`

  const samples = [
    { clientId: 'client_bella', clientName: 'Clínica Estética Bella', title: 'Antes & Depois — Limpeza de Pele', caption: 'Resultado real de uma sessão de limpeza de pele profunda. ✨ Agende a sua!', format: 'Carrossel', scheduledDate: day(3), scheduledTime: '10:00', status: 'aprovado', fileId: 'file_seed_bella_1', fileName: 'antes-depois.svg', fileType: 'image/svg+xml' },
    { clientId: 'client_bella', clientName: 'Clínica Estética Bella', title: 'Reels — Dica de skincare', caption: '3 passos para uma pele radiante no inverno. Salve esse vídeo! 💛', format: 'Reels', scheduledDate: day(6), scheduledTime: '18:30', status: 'aguardando', fileId: 'file_seed_bella_2', fileName: 'skincare-reels.svg', fileType: 'image/svg+xml' },
    { clientId: 'client_bella', clientName: 'Clínica Estética Bella', title: 'Promoção de Botox', caption: 'Pacote especial de toxina botulínica neste mês. Vagas limitadas!', format: 'Feed', scheduledDate: day(9), scheduledTime: '12:00', status: 'reprovado', fileId: 'file_seed_bella_3', fileName: 'promo-botox.svg', fileType: 'image/svg+xml' },
    { clientId: 'client_bella', clientName: 'Clínica Estética Bella', title: 'Stories — Bastidores da clínica', caption: 'Um tour rápido pelo nosso espaço renovado.', format: 'Stories', scheduledDate: day(12), scheduledTime: '20:00', status: 'aguardando' },
    { clientId: 'client_bella', clientName: 'Clínica Estética Bella', title: 'Depoimento de cliente', caption: '"Melhor decisão que tomei pela minha autoestima." — Cliente Ana', format: 'Feed', scheduledDate: day(16), scheduledTime: '11:00', status: 'aguardando' },
    { clientId: 'client_bella', clientName: 'Clínica Estética Bella', title: 'Post publicado — Dia da Mulher', caption: 'Celebrando todas as mulheres com um mimo especial. 💐', format: 'Feed', scheduledDate: day(1), scheduledTime: '09:00', status: 'publicado' },
    { clientId: 'client_bella', clientName: 'Clínica Estética Bella', title: 'Rascunho — Campanha de inverno', caption: 'Conceito inicial da campanha de inverno (em definição).', format: 'Carrossel', scheduledDate: day(24), scheduledTime: '15:00', status: 'rascunho' },

    { clientId: 'client_verde', clientName: 'Mercado Verde Orgânicos', title: 'Cesta da semana', caption: 'Confira os orgânicos fresquinhos que chegaram hoje! 🥬🍅', format: 'Feed', scheduledDate: day(4), scheduledTime: '08:30', status: 'aprovado' },
    { clientId: 'client_verde', clientName: 'Mercado Verde Orgânicos', title: 'Reels — Receita fit', caption: 'Salada colorida em 5 minutos. Ingredientes 100% orgânicos.', format: 'Reels', scheduledDate: day(11), scheduledTime: '17:00', status: 'aguardando' },
    { clientId: 'client_verde', clientName: 'Mercado Verde Orgânicos', title: 'Feirinha de sábado', caption: 'Neste sábado tem feira especial com 20% off em folhas.', format: 'Stories', scheduledDate: day(18), scheduledTime: '09:00', status: 'aguardando' },
  ]

  const insert = db.transaction((items) => {
    items.forEach((s) => {
      const post = createPost(s, { name: 'Equipe NOMAD' })
      if (s.status === 'aprovado') {
        addEvent(post.id, { type: 'aprovado', author: 'Cliente', authorRole: 'client', message: 'Post aprovado pelo cliente.' })
      }
      if (s.status === 'reprovado') {
        addEvent(post.id, { type: 'reprovado', author: 'Cliente', authorRole: 'client', message: 'Prefiro outra foto, essa ficou escura. Podemos trocar?' })
      }
    })
  })
  insert(samples)
  console.log(`[posts] seed inicial: ${samples.length} posts em ${ym}`)
}

seed()

module.exports = { db, getPost, listPosts, createPost, updatePost, setStatus, deletePost, addEvent, getEvents, stats }
