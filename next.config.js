const runtimeConfig = require('./runtimeConfig')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: runtimeConfig.publicRuntimeConfig,
}

module.exports = nextConfig
