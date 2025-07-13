import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Card } from '../components/ui'
import { auth } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { validateEmail, validatePassword } from '../utils/validation'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  
  // Get redirect path from location state
  const from = (location.state as any)?.from?.pathname || '/dashboard'
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  // Error state
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      email: validateEmail(formData.email) || '',
      password: validatePassword(formData.password) || '',
      general: ''
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors(prev => ({ ...prev, general: '' }))

    try {
      const response = await auth.login(formData)
      const { user, token } = response.data
      
      // Save token
      localStorage.setItem('token', token)
      
      // Update auth context
      setUser(user)
      
      // Redirect to original destination
      navigate(from, { replace: true })
    } catch (error: any) {
      const message = error.response?.data?.error || 'Invalid email or password'
      setErrors(prev => ({ ...prev, general: message }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="john@example.com"
            autoComplete="email"
          />
          
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Log In
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}