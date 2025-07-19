import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../lib/api'

export const Layout: React.FC = () => {
  const location = useLocation()
  const { user, setUser } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    auth.logout()
    setUser(null)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16">
            {/* Logo and desktop nav */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-slate-900 hover:text-accent-600 transition-colors">
                Tanafos
              </Link>
              
              {user && (
                <div className="hidden sm:flex sm:items-center sm:ml-10 sm:space-x-1">
                  <Link
                    to="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-accent-50 text-accent-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/leaderboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/leaderboard')
                        ? 'bg-accent-50 text-accent-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Leaderboard
                  </Link>
                </div>
              )}
            </div>

            {/* Desktop right side */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                      <span className="text-accent-700 font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-3 border-b border-slate-100">
                    <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                      <span className="text-accent-700 font-medium text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.username}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-base font-medium ${
                      isActive('/dashboard')
                        ? 'bg-accent-50 text-accent-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/leaderboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-base font-medium ${
                      isActive('/leaderboard')
                        ? 'bg-accent-50 text-accent-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Leaderboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}