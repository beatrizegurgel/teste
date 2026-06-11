// Configuração compartilhada do auth-service.
// O JWT_SECRET deve ser idêntico em todos os serviços para que os tokens
// emitidos aqui sejam aceitos pelos demais. Em produção, defina via env.
module.exports = {
  PORT: process.env.AUTH_PORT || 4001,
  JWT_SECRET: process.env.JWT_SECRET || 'nomad-dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
}
