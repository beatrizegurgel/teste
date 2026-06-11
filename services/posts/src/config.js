module.exports = {
  PORT: process.env.POSTS_PORT || 4002,
  JWT_SECRET: process.env.JWT_SECRET || 'nomad-dev-secret-change-me',
}
