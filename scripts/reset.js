#!/usr/bin/env node
// Apaga bancos SQLite e arquivos enviados para recriar o seed no próximo boot.
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'services')
const targets = [
  'auth/data',
  'posts/data',
  'files/data',
  'files/storage',
]

let removed = 0
for (const t of targets) {
  const full = path.join(root, t)
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true })
    removed++
    console.log('removido:', path.relative(path.join(__dirname, '..'), full))
  }
}
console.log(removed ? `\nPronto. ${removed} pasta(s) limpa(s). O seed será recriado ao iniciar os serviços.` : 'Nada para limpar.')
