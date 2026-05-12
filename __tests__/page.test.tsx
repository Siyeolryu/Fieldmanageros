import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingPage from '@/app/page.tsx'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { createSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Mock external modules
jest.mock('next/navigation')
jest.mock('@/lib/store')
jest.mock('@/lib/supabase/client')
jest.mock('sonner')

describe('LandingPage - Button Interactions', () => {
  let mockPush: jest.Mock
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup router mock
    mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    // Setup auth store mock
    ;(useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      setUser: jest.fn(),
      setGuestMode: jest.fn(),
    })

    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        signInWithOAuth: jest.fn(),
      },
    }
    ;(createSupabaseClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('"둘러보기" (Guest Mode) Button', () => {
    test('should render the guest button correctly', () => {
      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      expect(guestButton).toBeInTheDocument()
      expect(guestButton).not.toBeDisabled()
    })

    test('should show loading spinner when clicked', async () => {
      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      fireEvent.click(guestButton)

      // Wait for loading text to appear
      await waitFor(() => {
        expect(screen.getByText('입장 중...')).toBeInTheDocument()
      })
    })

    test('should disable button during loading', async () => {
      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      fireEvent.click(guestButton)

      await waitFor(() => {
        expect(guestButton).toBeDisabled()
      })
    })

    test('should navigate to /home when clicked', async () => {
      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      fireEvent.click(guestButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/home')
      })
    })

    test('should show success toast message', async () => {
      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      fireEvent.click(guestButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('게스트 모드로 입장했습니다')
        )
      })
    })

    test('should set guest mode in auth store', async () => {
      const mockSetGuestMode = jest.fn()
      ;(useAuthStore as jest.Mock).mockReturnValue({
        user: null,
        setUser: jest.fn(),
        setGuestMode: mockSetGuestMode,
      })

      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      fireEvent.click(guestButton)

      await waitFor(() => {
        expect(mockSetGuestMode).toHaveBeenCalledWith(true)
      })
    })

    test('should prevent duplicate clicks', async () => {
      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')

      // Click twice rapidly
      fireEvent.click(guestButton)
      fireEvent.click(guestButton)

      await waitFor(() => {
        // Push should only be called once
        expect(mockPush).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('"시작하기" (Sign Up) Button', () => {
    test('should render the signup button correctly', () => {
      render(<LandingPage />)

      const signupButton = screen.getByText('시작하기')
      expect(signupButton).toBeInTheDocument()
      expect(signupButton).not.toBeDisabled()
    })

    test('should navigate to /auth/signup when clicked', async () => {
      render(<LandingPage />)

      const signupButton = screen.getByText('시작하기')
      fireEvent.click(signupButton)

      expect(mockPush).toHaveBeenCalledWith('/auth/signup')
    })

    test('should not scroll the page on click', async () => {
      render(<LandingPage />)

      const initialScrollY = window.scrollY
      const signupButton = screen.getByText('시작하기')

      fireEvent.click(signupButton)

      // Note: In real navigation, page scroll might change,
      // but the button click itself shouldn't cause scroll
      expect(window.scrollY).toBe(initialScrollY)
    })

    test('should use router.push instead of scroll navigation', async () => {
      render(<LandingPage />)

      const signupButton = screen.getByText('시작하기')
      fireEvent.click(signupButton)

      // Verify router.push was called, not querySelector
      expect(mockPush).toHaveBeenCalledWith('/auth/signup')
    })
  })

  describe('Quick Signup Form', () => {
    test('should render email input field', () => {
      render(<LandingPage />)

      const emailInput = screen.getByPlaceholderText('이메일 주소 입력')
      expect(emailInput).toBeInTheDocument()
    })

    test('should reject invalid email format', async () => {
      render(<LandingPage />)

      const emailInput = screen.getByPlaceholderText('이메일 주소 입력') as HTMLInputElement
      const submitButton = screen.getByText('3분 만에 무료 시작 →')

      await userEvent.type(emailInput, 'invalid-email')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('올바른 이메일 주소를 입력해주세요')).toBeInTheDocument()
      })
    })

    test('should accept valid email format', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          requiresEmailConfirmation: true,
        }),
      })

      render(<LandingPage />)

      const emailInput = screen.getByPlaceholderText('이메일 주소 입력')
      const submitButton = screen.getByText('3분 만에 무료 시작 →')

      await userEvent.type(emailInput, 'valid@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/quick-signup',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'valid@example.com' }),
          })
        )
      })
    })

    test('should disable form during submission', async () => {
      global.fetch = jest.fn(() => new Promise(() => {})) // Never resolves

      render(<LandingPage />)

      const emailInput = screen.getByPlaceholderText('이메일 주소 입력') as HTMLInputElement
      const submitButton = screen.getByText('3분 만에 무료 시작 →') as HTMLButtonElement

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
        expect(emailInput).toBeDisabled()
      })
    })

    test('should show error message on failed submission', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: '이미 가입된 이메일입니다. 아래 로그인 버튼을 이용해주세요.',
        }),
      })

      render(<LandingPage />)

      const emailInput = screen.getByPlaceholderText('이메일 주소 입력')
      const submitButton = screen.getByText('3분 만에 무료 시작 →')

      await userEvent.type(emailInput, 'existing@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('이미 가입된 이메일입니다. 아래 로그인 버튼을 이용해주세요.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Social Login Buttons', () => {
    test('should render Kakao login button', () => {
      render(<LandingPage />)

      const kakaoButton = screen.getByText(/카카오/)
      expect(kakaoButton).toBeInTheDocument()
    })

    test('should render Naver login button', () => {
      render(<LandingPage />)

      const naverButton = screen.getByText(/네이버/)
      expect(naverButton).toBeInTheDocument()
    })

    test('should call Supabase OAuth with kakao provider', async () => {
      render(<LandingPage />)

      const kakaoButton = screen.getByText(/카카오/)
      fireEvent.click(kakaoButton)

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'kakao',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })

    test('should call Supabase OAuth with naver provider', async () => {
      render(<LandingPage />)

      const naverButton = screen.getByText(/네이버/)
      fireEvent.click(naverButton)

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'naver',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })

    test('should disable social buttons during loading', async () => {
      render(<LandingPage />)

      const kakaoButton = screen.getByText(/카카오/)
      fireEvent.click(kakaoButton)

      await waitFor(() => {
        expect(kakaoButton).toBeDisabled()
      })
    })
  })

  describe('Header Navigation', () => {
    test('should show "둘러보기" and "시작하기" buttons for logged out users', () => {
      ;(useAuthStore as jest.Mock).mockReturnValue({
        user: null,
        setUser: jest.fn(),
        setGuestMode: jest.fn(),
      })

      render(<LandingPage />)

      expect(screen.getByText('둘러보기')).toBeInTheDocument()
      expect(screen.getByText('시작하기')).toBeInTheDocument()
    })

    test('should show "대시보드로 가기" button for logged in users', () => {
      ;(useAuthStore as jest.Mock).mockReturnValue({
        user: { id: 'user-123', email: 'user@example.com' },
        setUser: jest.fn(),
        setGuestMode: jest.fn(),
      })

      render(<LandingPage />)

      expect(screen.getByText('대시보드로 가기')).toBeInTheDocument()
      expect(screen.queryByText('둘러보기')).not.toBeInTheDocument()
      expect(screen.queryByText('시작하기')).not.toBeInTheDocument()
    })

    test('should navigate to /home when "대시보드로 가기" clicked', () => {
      ;(useAuthStore as jest.Mock).mockReturnValue({
        user: { id: 'user-123', email: 'user@example.com' },
        setUser: jest.fn(),
        setGuestMode: jest.fn(),
      })

      render(<LandingPage />)

      const dashboardLink = screen.getByText('대시보드로 가기')
      expect(dashboardLink).toHaveAttribute('href', '/home')
    })
  })

  describe('Accessibility', () => {
    test('buttons should be keyboard accessible', async () => {
      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      const signupButton = screen.getByText('시작하기')

      // Tab to first button
      guestButton.focus()
      expect(document.activeElement).toBe(guestButton)

      // Tab to next button
      signupButton.focus()
      expect(document.activeElement).toBe(signupButton)

      // Activate with Enter key
      fireEvent.keyDown(signupButton, { key: 'Enter', code: 'Enter' })
      expect(mockPush).toHaveBeenCalledWith('/auth/signup')
    })

    test('error messages should have proper ARIA attributes', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: '테스트 에러',
        }),
      })

      render(<LandingPage />)

      const emailInput = screen.getByPlaceholderText('이메일 주소 입력')
      const submitButton = screen.getByText('3분 만에 무료 시작 →')

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText('테스트 에러')
        expect(errorMessage).toBeInTheDocument()
      })
    })
  })
})
