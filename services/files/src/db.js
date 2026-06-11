// Camada de dados do files-service: metadados dos arquivos (o binário fica em disco).
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const DATA_DIR = path.join(__dirname, '..', 'data')
const STORAGE_DIR = path.join(__dirname, '..', 'storage')
fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(STORAGE_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'files.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id           TEXT PRIMARY KEY,
    originalName TEXT NOT NULL,
    mimeType     TEXT,
    size         INTEGER,
    storageName  TEXT NOT NULL,         -- nome do arquivo em disco
    clientId     TEXT,                  -- empresa dona do arquivo
    uploadedBy   TEXT,
    createdAt    TEXT NOT NULL
  );
`)

const newId = (p) => `${p}_${crypto.randomBytes(8).toString('hex')}`

function getFile(id) {
  return db.prepare('SELECT * FROM files WHERE id = ?').get(id)
}

function insertFile(rec) {
  db.prepare(
    `INSERT INTO files (id, originalName, mimeType, size, storageName, clientId, uploadedBy, createdAt)
     VALUES (@id, @originalName, @mimeType, @size, @storageName, @clientId, @uploadedBy, @createdAt)`
  ).run(rec)
  return rec
}

function publicFile(f) {
  if (!f) return null
  return { id: f.id, originalName: f.originalName, mimeType: f.mimeType, size: f.size, clientId: f.clientId, createdAt: f.createdAt }
}

// ---------- Seed: artes de exemplo (SVG previewável e baixável) ----------
function sampleSvg(title, subtitle, bg) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="${bg}"/>
  <rect x="60" y="60" width="960" height="960" rx="36" fill="none" stroke="#F5C842" stroke-width="6"/>
  <text x="540" y="470" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="800" fill="#0F0F0F" text-anchor="middle">${title}</text>
  <text x="540" y="560" font-family="Inter, Arial, sans-serif" font-size="38" fill="#1a1a1a" text-anchor="middle">${subtitle}</text>
  <text x="540" y="980" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700" fill="#0F0F0F" text-anchor="middle">NOMAD</text>
</svg>`
}

function seed() {
  if (db.prepare('SELECT COUNT(*) AS n FROM files').get().n > 0) return
  const seeds = [
    { id: 'file_seed_bella_1', originalName: 'antes-depois.svg', title: 'Antes & Depois', subtitle: 'Limpeza de Pele Profunda', bg: '#FFE9A8' },
    { id: 'file_seed_bella_2', originalName: 'skincare-reels.svg', title: 'Skincare', subtitle: '3 passos para o inverno', bg: '#FCD9B8' },
    { id: 'file_seed_bella_3', originalName: 'promo-botox.svg', title: 'Promoção', subtitle: 'Toxina Botulínica', bg: '#FFD0E0' },
  ]
  seeds.forEach((s) => {
    const storageName = `${s.id}.svg`
    fs.writeFileSync(path.join(STORAGE_DIR, storageName), sampleSvg(s.title, s.subtitle, s.bg))
    const stat = fs.statSync(path.join(STORAGE_DIR, storageName))
    insertFile({
      id: s.id,
      originalName: s.originalName,
      mimeType: 'image/svg+xml',
      size: stat.size,
      storageName,
      clientId: 'client_bella',
      uploadedBy: 'Equipe NOMAD',
      createdAt: new Date().toISOString(),
    })
  })
  console.log(`[files] seed inicial: ${seeds.length} artes de exemplo`)
}

seed()

module.exports = { db, STORAGE_DIR, getFile, insertFile, publicFile, newId }
