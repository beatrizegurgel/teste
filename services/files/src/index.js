/**
 * NOMAD — Files Service
 *
 * Armazena artes, vídeos e PDFs em disco (metadados em SQLite). Apenas o time
 * NOMAD faz upload; o download exige autenticação e respeita o isolamento por
 * empresa — um cliente só baixa arquivos da sua própria empresa.
 */
const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { PORT, MAX_UPLOAD_MB } = require('./config')
const { requireAuth, requireAdmin } = require('./auth')
const repo = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, repo.STORAGE_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ''
    cb(null, `${repo.newId('f')}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 } })

const router = express.Router()

router.get('/health', (_req, res) => res.json({ service: 'files', status: 'ok' }))

// Upload — somente NOMAD. O clientId associa o arquivo à empresa do post.
router.post('/', requireAuth, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  const rec = repo.insertFile({
    id: repo.newId('file'),
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    storageName: req.file.filename,
    clientId: req.body.clientId || null,
    uploadedBy: req.user.name,
    createdAt: new Date().toISOString(),
  })
  res.status(201).json({ file: repo.publicFile(rec) })
})

function authorize(req, file) {
  if (!file) return false
  if (req.user.role === 'admin') return true
  // Cliente só acessa arquivos sem dono definido ou da sua própria empresa.
  return !file.clientId || file.clientId === req.user.clientId
}

router.get('/:id/meta', requireAuth, (req, res) => {
  const file = repo.getFile(req.params.id)
  if (!authorize(req, file)) return res.status(404).json({ error: 'Arquivo não encontrado' })
  res.json({ file: repo.publicFile(file) })
})

// Download/preview do binário (com checagem de acesso).
router.get('/:id', requireAuth, (req, res) => {
  const file = repo.getFile(req.params.id)
  if (!authorize(req, file)) return res.status(404).json({ error: 'Arquivo não encontrado' })
  const full = path.join(repo.STORAGE_DIR, file.storageName)
  if (!fs.existsSync(full)) return res.status(410).json({ error: 'Arquivo indisponível no armazenamento' })
  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream')
  const disposition = req.query.download ? 'attachment' : 'inline'
  res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(file.originalName)}"`)
  fs.createReadStream(full).pipe(res)
})

// Tratamento de erros do multer (ex.: arquivo grande demais) no nível do
// router, para funcionar tanto standalone quanto no server.js combinado.
router.use((err, _req, res, _next) => {
  if (err) return res.status(400).json({ error: err.message || 'Falha no upload' })
})

app.use('/files', router)

if (require.main === module) {
  app.listen(PORT, () => console.log(`[files]    http://localhost:${PORT}  (max ${MAX_UPLOAD_MB}MB)`))
}

module.exports = { app, router }
