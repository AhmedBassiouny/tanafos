import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { Login } from '../../pages/Login'
import * as api from '../../lib/api'

// Mock the API
vi.mock('../../lib/api', () => ({
  auth: {
    login: vi.fn(),
  },
}))

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    setUser: vi.fn(),
  }),
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    })
  })

  it('renders login form correctly', () => {
    render(<Login />)
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to continue tracking your progress')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<Login />)
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('prevents login with invalid email format', async () => {
    render(<Login />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    // Enter invalid email and valid password
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'validpassword' } })
    
    // Submit the form
    fireEvent.click(submitButton)
    
    // Wait a moment for any potential API call
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // The key test: API should not be called with invalid email
    expect(api.auth.login).not.toHaveBeenCalled()
    
    // Form should still be visible (not navigated away)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    const mockLoginResponse = {
      data: {
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        token: 'mock-token',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
      },
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(api.auth.login).mockResolvedValueOnce(mockLoginResponse as any)
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(api.auth.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
    
    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token')
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('handles login error', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Invalid email or password',
        },
      },
    }
    
    vi.mocked(api.auth.login).mockRejectedValueOnce(mockError)
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    // Make login promise never resolve to test loading state
    vi.mocked(api.auth.login).mockImplementationOnce(() => new Promise(() => {}))
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  it('has link to signup page', () => {
    render(<Login />)
    
    const signupLink = screen.getByRole('link', { name: 'Create one' })
    expect(signupLink).toHaveAttribute('href', '/signup')
  })

  it('clears field errors when user starts typing', async () => {
    render(<Login />)
    
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    // Trigger validation error
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
    
    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })
  })
})