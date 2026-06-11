module.exports = {
  PORT: process.env.FILES_PORT || 4003,
  JWT_SECRET: process.env.JWT_SECRET || 'nomad-dev-secret-change-me',
  MAX_UPLOAD_MB: Number(process.env.MAX_UPLOAD_MB || 50),
}
