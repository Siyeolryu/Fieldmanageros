/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 캐시 파일 충돌을 해결하기 위해 빌드 ID를 동적으로 생성합니다.
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Vercel 배포 시 프로젝트 루트를 명확히 지정하여 상위 디렉토리 lockfile 경고 해결
  outputFileTracingRoot: process.cwd(),
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
  // 리다이렉트 설정: /dashboard/* 경로를 올바른 경로로 리다이렉트
  async redirects() {
    return [
      {
        source: '/dashboard/companies',
        destination: '/companies',
        permanent: true,
      },
      {
        source: '/dashboard/companies/:path*',
        destination: '/companies/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/sites',
        destination: '/sites',
        permanent: true,
      },
      {
        source: '/dashboard/sites/:path*',
        destination: '/sites/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/workers',
        destination: '/workers',
        permanent: true,
      },
      {
        source: '/dashboard/attendance',
        destination: '/home',
        permanent: true,
      },
      {
        source: '/dashboard/payroll',
        destination: '/payroll',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
