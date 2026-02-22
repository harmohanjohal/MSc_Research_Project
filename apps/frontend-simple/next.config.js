/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_WEATHER_API_KEY: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
    NEXT_PUBLIC_WEATHER_LOCATION: process.env.NEXT_PUBLIC_WEATHER_LOCATION,
  },
}

module.exports = nextConfig
