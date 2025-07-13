import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '../components/ui'
import { auth } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { validateEmail, validatePassword, validateUsername } from '../utils/validation'

export const Signup: React.FC = () => {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  
  // Error state
  const [errors, setErrors] = useState({
    username: '',
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
      username: validateUsername(formData.username) || '',
      email: validateEmail(formData.email) || '',
      password: validatePassword(formData.password) || '',
      general: ''
    }

    setErrors(newErrors)
    return !newErrors.username && !newErrors.email && !newErrors.password
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors(prev => ({ ...prev, general: '' }))

    try {
      const response = await auth.signup(formData)
      const { user, token } = response.data
      
      // Save token
      localStorage.setItem('token', token)
      
      // Update auth context
      setUser(user)
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Something went wrong'
      setErrors(prev => ({ ...prev, general: message }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}
          
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="johndoe"
            autoComplete="username"
          />
          
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
            autoComplete="new-password"
          />
          
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Sign Up
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  )
}