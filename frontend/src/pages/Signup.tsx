import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '../components/ui'
import { auth } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { validateEmail, validatePassword, validateUsername } from '../utils/validation'

export const Signup: React.FC = () => {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    general: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors(prev => ({ ...prev, general: '' }))

    try {
      const response = await auth.signup(formData)
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      navigate('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Something went wrong'
      setErrors(prev => ({ ...prev, general: message }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Get started</h1>
          <p className="mt-2 text-slate-600">Create your account to start tracking</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
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
              placeholder="you@example.com"
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
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-accent-600 hover:text-accent-700">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}