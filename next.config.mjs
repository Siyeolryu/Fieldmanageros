/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 캐시 파일 충돌을 해결하기 위해 빌드 ID를 동적으로 생성합니다.
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  typedRoutes: true,
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
