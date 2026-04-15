import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 캐시 파일 충돌을 해결하기 위해 빌드 ID를 동적으로 생성합니다.
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  typedRoutes: true,
  // Vercel 배포 시 프로젝트 루트를 명확히 지정하여 상위 디렉토리 lockfile 경고 해결
  outputFileTracingRoot: __dirname,
  eslint: {
    // 빌드 시 ESLint 무시 (배포용)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 타입 오류 무시 (배포용)
    ignoreBuildErrors: true,
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
