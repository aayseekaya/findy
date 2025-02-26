/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    })
    return config
  },
  // YAML dosyalarını public olarak erişilebilir yap
  async rewrites() {
    return [
      {
        source: '/api/docs/swagger',
        destination: '/swagger/swagger.yaml',
      },
    ]
  }
}

module.exports = nextConfig 