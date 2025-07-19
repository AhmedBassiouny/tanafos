import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { Input } from '../../components/ui/Input'

describe('Input', () => {
  it('renders label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders placeholder when provided', () => {
    render(<Input placeholder="Enter your email" />)
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(<Input label="Email" error="Email is required" />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('applies error styling when error exists', () => {
    render(<Input label="Email" error="Email is required" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveClass('border-red-300')
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input label="Email" onChange={handleChange} />)
    
    const input = screen.getByLabelText('Email')
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('supports different input types', () => {
    render(<Input label="Password" type="password" />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('supports required attribute', () => {
    render(<Input label="Email" required />)
    const input = screen.getByLabelText('Email')
    expect(input).toBeRequired()
  })

  it('supports disabled state', () => {
    render(<Input label="Email" disabled />)
    const input = screen.getByLabelText('Email')
    expect(input).toBeDisabled()
  })

  it('supports autoComplete attribute', () => {
    render(<Input label="Email" autoComplete="email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('autoComplete', 'email')
  })

  it('associates label with input correctly', () => {
    render(<Input label="Email Address" />)
    const input = screen.getByLabelText('Email Address')
    const label = screen.getByText('Email Address')
    
    expect(label).toHaveAttribute('for', input.id)
  })

  it('shows no error styling when no error', () => {
    render(<Input label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveClass('border-slate-200')
    expect(input).not.toHaveClass('border-red-300')
  })
})