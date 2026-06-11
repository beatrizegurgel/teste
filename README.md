# NOMAD — Plataforma de Conteúdo

Plataforma em nuvem para a agência **NOMAD** gerenciar a aprovação de conteúdo
dos seus clientes. O time da NOMAD sobe artes, vídeos e PDFs em um calendário e
associa cada peça a uma data; cada cliente faz login e vê **apenas** o
calendário da sua própria empresa, podendo **aprovar, reprovar, comentar** ou
**baixar** o material.

A arquitetura é de **microserviços** com **API gateway**, **autenticação JWT**,
**armazenamento de arquivos** e **front-end React responsivo** com calendário
interativo.

```
┌──────────────┐      /api/*       ┌───────────────┐
│  Front-end   │  ───────────────► │  API Gateway  │  (porta 4000)
│  React+Vite  │                   └──────┬────────┘
│  (porta 5173)│            ┌─────────────┼──────────────┐
└──────────────┘            ▼             ▼              ▼
                      ┌───────────┐ ┌───────────┐ ┌────────────┐
                      │   auth    │ │   posts   │ │   files    │
                      │  (4001)   │ │  (4002)   │ │   (4003)   │
                      │ JWT, users│ │ calendário│ │ upload/    │
                      │ empresas  │ │ aprovação │ │ download   │
                      └─────┬─────┘ └─────┬─────┘ └─────┬──────┘
                         auth.db       posts.db    files.db + disco
```

## Como rodar

Requer Node 18+ (testado no Node 22). Um único `npm install` instala todos os
workspaces (frontend + serviços).

```bash
npm install
npm run dev
```

- Front-end: http://localhost:5173
- Gateway (API): http://localhost:4000/api
- Os bancos SQLite e a pasta de uploads são criados automaticamente no primeiro
  boot, já com **dados de demonstração**.

Para limpar tudo e recriar o seed:

```bash
npm run reset
```

### Docker (opcional)

```bash
docker compose up --build
```

## Contas de demonstração

| Papel             | E-mail               | Senha       | Vê o quê |
|-------------------|----------------------|-------------|----------|
| **Time NOMAD**    | `admin@nomad.studio` | `nomad123`  | Painel de controle: todos os clientes e posts |
| Cliente (Bella)   | `cliente@bella.com`  | `cliente123`| Apenas o calendário da Clínica Estética Bella |
| Cliente (Verde)   | `cliente@verde.com`  | `cliente123`| Apenas o calendário do Mercado Verde Orgânicos |

Na tela de login há botões para preencher essas credenciais com um clique.
Você também pode **cadastrar uma nova empresa** pela tela de registro.

## Papéis e permissões

- **Time NOMAD (admin)** — controle total: cria/edita/exclui posts, faz upload
  de artes/vídeos/PDFs, associa cada arquivo a uma data, gerencia empresas e
  enxerga o calendário de todos os clientes.
- **Cliente** — vê somente o calendário da própria empresa. Em cada post pode
  **aprovar**, **reprovar** (com justificativa), **comentar** o feedback e
  **baixar** o arquivo. Rascunhos da agência ficam ocultos para o cliente.

O isolamento por empresa é garantido **no servidor**: o posts-service e o
files-service derivam o `clientId` do token JWT e nunca retornam dados de outra
empresa, mesmo que a requisição tente forçar outro `clientId`.

## Microserviços

| Serviço   | Porta | Responsabilidade |
|-----------|-------|------------------|
| `gateway` | 4000  | Ponto único de entrada; roteia `/api/auth`, `/api/posts`, `/api/stats`, `/api/files` |
| `auth`    | 4001  | Cadastro, login, emissão/validação de JWT, empresas e usuários |
| `posts`   | 4002  | Posts do calendário, fluxo de aprovação, comentários e estatísticas |
| `files`   | 4003  | Upload e download seguro de artes, vídeos e PDFs (disco + metadados) |

Cada serviço valida o JWT por conta própria (defesa em profundidade) usando o
mesmo `JWT_SECRET`.

## Principais endpoints (via gateway, prefixo `/api`)

```
POST /api/auth/register           cadastro de empresa + usuário cliente
POST /api/auth/login              login (cliente ou NOMAD)
GET  /api/auth/me                 dados do usuário autenticado
GET  /api/auth/clients            (admin) lista empresas
POST /api/auth/clients            (admin) cria empresa + acesso opcional

GET  /api/posts                   lista posts (cliente: só os seus)
POST /api/posts                   (admin) cria post
PUT  /api/posts/:id               (admin) edita post
DELETE /api/posts/:id             (admin) exclui post
POST /api/posts/:id/approve       (cliente) aprova
POST /api/posts/:id/reject        (cliente) reprova com justificativa
POST /api/posts/:id/comment       comenta / dá feedback
GET  /api/stats/overview          (admin) números do painel

POST /api/files                   (admin) upload (multipart "file")
GET  /api/files/:id               download/preview (com checagem de acesso)
```

## Stack

- **Backend:** Node.js, Express, JWT (`jsonwebtoken`), `bcryptjs`,
  `better-sqlite3`, `multer`, `http-proxy-middleware`
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Lucide
- **Infra:** npm workspaces, Docker / docker-compose

## Configuração

Variáveis de ambiente (com padrões de desenvolvimento) estão documentadas em
`.env.example`. Em produção, defina ao menos um `JWT_SECRET` forte e idêntico em
todos os serviços.
