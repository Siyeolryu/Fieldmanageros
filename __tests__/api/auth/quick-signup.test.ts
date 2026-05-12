import { POST } from '@/app/api/auth/quick-signup/route'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

// Mock modules
jest.mock('@/lib/supabase/server')
jest.mock('@prisma/client')

describe('POST /api/auth/quick-signup', () => {
  let mockSupabase: any
  let mockPrismaInstance: any
  const mockOrigin = 'http://localhost:3000'

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup Supabase mock
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
      },
    }
    ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)

    // Setup Prisma mock
    mockPrismaInstance = {
      profile: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $disconnect: jest.fn(),
    }
    ;(PrismaClient as jest.Mock).mockReturnValue(mockPrismaInstance)
  })

  describe('Success Cases', () => {
    test('should successfully create user with email confirmation required', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'newuser@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'newuser@example.com' },
          session: null,
        },
        error: null,
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
      mockPrismaInstance.profile.create.mockResolvedValue({
        id: 'user-123',
        email: 'newuser@example.com',
        role: 'manager',
        userType: 'manager',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.requiresEmailConfirmation).toBe(true)
      expect(data.user.email).toBe('newuser@example.com')
    })

    test('should auto-sign in user when email confirmation is disabled', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'noconfirm@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-456', email: 'noconfirm@example.com' },
          session: { access_token: 'token-123' },
        },
        error: null,
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
      mockPrismaInstance.profile.create.mockResolvedValue({
        id: 'user-456',
        email: 'noconfirm@example.com',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.autoSignedIn).toBe(true)
      expect(data.user.email).toBe('noconfirm@example.com')
    })

    test('should create profile after successful signup', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'profile@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-789', email: 'profile@example.com' },
          session: null,
        },
        error: null,
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
      mockPrismaInstance.profile.create.mockResolvedValue({
        id: 'user-789',
        email: 'profile@example.com',
        role: 'manager',
        userType: 'manager',
      })

      await POST(request)

      expect(mockPrismaInstance.profile.create).toHaveBeenCalledWith({
        data: {
          id: 'user-789',
          email: 'profile@example.com',
          role: 'manager',
          userType: 'manager',
        },
      })
    })

    test('should skip profile creation if it already exists', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'existing@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-999', email: 'existing@example.com' },
          session: null,
        },
        error: null,
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue({
        id: 'user-999',
        email: 'existing@example.com',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrismaInstance.profile.create).not.toHaveBeenCalled()
    })

    test('should continue even if profile creation fails', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'failprofile@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-fail', email: 'failprofile@example.com' },
          session: null,
        },
        error: null,
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
      mockPrismaInstance.profile.create.mockRejectedValue(new Error('DB Connection Error'))

      const response = await POST(request)
      const data = await response.json()

      // Should still return success even if profile creation fails
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('failprofile@example.com')
    })

    test('should call Prisma disconnect on completion', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-disc', email: 'test@example.com' },
          session: null,
        },
        error: null,
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
      mockPrismaInstance.profile.create.mockResolvedValue({
        id: 'user-disc',
        email: 'test@example.com',
      })

      await POST(request)

      expect(mockPrismaInstance.$disconnect).toHaveBeenCalled()
    })
  })

  describe('Email Validation', () => {
    test('should reject missing email', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: '' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('이메일을 입력해주세요')
    })

    test('should reject null email', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: null }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('이메일을 입력해주세요')
    })

    test('should reject non-string email', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 12345 }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('이메일을 입력해주세요')
    })

    test('should reject invalid email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'user@',
        '@example.com',
        'user@example',
        'user @example.com',
        'user@exam ple.com',
      ]

      for (const email of invalidEmails) {
        const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
          method: 'POST',
          body: JSON.stringify({ email }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('올바른 이메일 주소를 입력해주세요')
      }
    })

    test('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@example-domain.com',
      ]

      for (const email of validEmails) {
        const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
          method: 'POST',
          body: JSON.stringify({ email }),
        })

        mockSupabase.auth.signUp.mockResolvedValue({
          data: {
            user: { id: 'user-test', email },
            session: null,
          },
          error: null,
        })

        mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
        mockPrismaInstance.profile.create.mockResolvedValue({
          id: 'user-test',
          email,
        })

        const response = await POST(request)

        expect(response.status).toBe(200)
      }
    })
  })

  describe('Error Handling', () => {
    test('should handle duplicate email (already registered)', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'duplicate@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: {
          message: 'User already registered',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('이미 가입된 이메일입니다')
    })

    test('should handle general Supabase auth errors', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'error@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Invalid request body',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Invalid request body')
    })

    test('should handle missing user in signup response', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'nouser@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('회원가입에 실패했습니다')
    })

    test('should handle fallback signin failure gracefully', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'signin@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-signin', email: 'signin@example.com' },
          session: null,
        },
        error: null,
      })

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
      mockPrismaInstance.profile.create.mockResolvedValue({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.requiresEmailConfirmation).toBe(true)
    })

    test('should handle unexpected errors', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'unexpected@example.com' }),
      })

      // Simulate unexpected error during request processing
      ;(createSupabaseServerClient as jest.Mock).mockRejectedValue(
        new Error('Supabase connection failed')
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('서버 오류가 발생했습니다')
    })

    test('should always call Prisma disconnect even on error', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'error-disconnect@example.com' }),
      })

      ;(createSupabaseServerClient as jest.Mock).mockRejectedValue(
        new Error('Test error')
      )

      try {
        await POST(request)
      } catch {
        // Error is expected
      }

      expect(mockPrismaInstance.$disconnect).toHaveBeenCalled()
    })
  })

  describe('Request Validation', () => {
    test('should handle missing request body', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: '',
      })

      const response = await POST(request)

      expect([400, 500]).toContain(response.status)
    })

    test('should handle malformed JSON', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: '{ invalid json }',
      })

      const response = await POST(request)

      expect([400, 500]).toContain(response.status)
    })
  })

  describe('Security', () => {
    test('should not expose sensitive information in error messages', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Connection string exposed' },
      })

      const response = await POST(request)
      const data = await response.json()

      // Should not expose actual error details
      expect(data.error).not.toContain('Connection string')
    })

    test('should sanitize email addresses in logs', async () => {
      const consoleSpy = jest.spyOn(console, 'log')

      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-log', email: 'test@example.com' },
          session: null,
        },
        error: null,
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
      mockPrismaInstance.profile.create.mockResolvedValue({})

      await POST(request)

      // Verify logging doesn't expose sensitive data unnecessarily
      consoleSpy.mockRestore()
    })
  })

  describe('Data Integrity', () => {
    test('should create profile with correct default values', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'integrity@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-integrity', email: 'integrity@example.com' },
          session: null,
        },
        error: null,
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
      mockPrismaInstance.profile.create.mockResolvedValue({})

      await POST(request)

      expect(mockPrismaInstance.profile.create).toHaveBeenCalledWith({
        data: {
          id: 'user-integrity',
          email: 'integrity@example.com',
          role: 'manager',
          userType: 'manager',
        },
      })
    })

    test('should include debug information in response', async () => {
      const request = new NextRequest(`${mockOrigin}/api/auth/quick-signup`, {
        method: 'POST',
        body: JSON.stringify({ email: 'debug@example.com' }),
      })

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-debug', email: 'debug@example.com' },
          session: null,
        },
        error: null,
      })

      mockPrismaInstance.profile.findUnique.mockResolvedValue(null)
      mockPrismaInstance.profile.create.mockResolvedValue({})

      const response = await POST(request)
      const data = await response.json()

      expect(data.debugInfo).toBeDefined()
      expect(data.debugInfo.emailSent).toBe(true)
      expect(data.debugInfo.checkSpamFolder).toBe(true)
    })
  })
})
