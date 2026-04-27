/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Git commit hash 기반 빌드 ID (캐싱 최적화)
  generateBuildId: async () => {
    try {
      const { execSync } = require('child_process')
      const gitHash = execSync('git rev-parse --short HEAD')
        .toString()
        .trim()
      return `build-${gitHash}`
    } catch (error) {
      // Git이 없거나 에러 발생 시 타임스탬프 사용
      console.warn('Git hash를 가져올 수 없어 타임스탬프를 사용합니다.')
      return `build-${Date.now()}`
    }
  },
  // Vercel 배포 시 프로젝트 루트를 명확히 지정하여 상위 디렉토리 lockfile 경고 해결
  outputFileTracingRoot: process.cwd(),
  eslint: {
    // 개발 중에는 warning 허용, 출시 전에는 false로 변경
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 개발 중에는 warning 허용, 출시 전에는 false로 변경
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
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=0, stale-while-revalidate',
          },
        ],
      },
    ]
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
