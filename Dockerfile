# Imagem única compartilhada pelos microserviços (monorepo com workspaces).
# Cada container roda um serviço diferente via "command" no docker-compose.
FROM node:22-bookworm-slim

# Ferramentas para compilar módulos nativos (better-sqlite3), caso não haja binário pronto.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependências aproveitando o cache de camadas.
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/
COPY services/gateway/package.json ./services/gateway/
COPY services/auth/package.json ./services/auth/
COPY services/posts/package.json ./services/posts/
COPY services/files/package.json ./services/files/
RUN npm install

COPY . .

EXPOSE 4000 4001 4002 4003 5173
CMD ["npm", "run", "dev"]
