import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 캐시 파일 충돌을 해결하기 위해 빌드 ID를 동적으로 생성합니다.
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
