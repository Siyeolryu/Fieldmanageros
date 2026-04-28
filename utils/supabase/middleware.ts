import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: 세션 새로고침 및 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // API 경로는 미들웨어에서 리다이렉트하지 않음 (각 API 라우트에서 직접 인증 처리)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return supabaseResponse;
  }

  // 게스트 모드 허용: 모든 페이지 접근 가능
  // UI는 모두 보이지만, 데이터 저장 시 로그인 유도 메시지 표시
  // 보호된 페이지 경로 설정은 제거 - 게스트도 UI 접근 가능

  // 이미 로그인한 사용자가 로그인 페이지 접근 시 대시보드로 리다이렉트
  if ((request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/signup') && user) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return supabaseResponse;
};
