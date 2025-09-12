import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Music, Mail, Lock, User, Eye, EyeOff, Users, Calendar } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    bio: '',
    genres: '',
    instruments: '',
    portfolio: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!formData.role) {
      toast.error('Please select your role')
      return
    }

    setLoading(true)

    try {
      const userData = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio || '',
        ...(formData.role === 'musician' && {
          genres: formData.genres.split(',').map(g => g.trim()).filter(g => g),
          instruments: formData.instruments.split(',').map(i => i.trim()).filter(i => i),
          portfolio: formData.portfolio || '',
          availability: {} // Will be populated with calendar data
        })
      }

      await register(formData.email, formData.password, userData)
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Music className="h-12 w-12 text-primary-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Join Allied Today
          </h2>
          <p className="mt-2 text-sm text-dark-300">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-400">
              Sign in here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'musician'})}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === 'musician'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 hover:border-dark-500'
                }`}
              >
                <Music className="h-8 w-8 mx-auto mb-2 text-primary-500" />
                <div className="text-white font-medium">Musician</div>
                <div className="text-dark-300 text-sm">Looking for gigs</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'event_manager'})}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === 'event_manager'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 hover:border-dark-500'
                }`}
              >
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary-500" />
                <div className="text-white font-medium">Event Manager</div>
                <div className="text-dark-300 text-sm">Hiring musicians</div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-dark-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10 w-full"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-dark-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10 w-full"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-dark-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10 w-full"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-dark-400 hover:text-white" />
                  ) : (
                    <Eye className="h-5 w-5 text-dark-400 hover:text-white" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-dark-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10 w-full"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-dark-400 hover:text-white" />
                  ) : (
                    <Eye className="h-5 w-5 text-dark-400 hover:text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Musician-specific fields */}
            {formData.role === 'musician' && (
              <>
                <div>
                  <label htmlFor="genres" className="block text-sm font-medium text-white mb-2">
                    Genres (comma-separated)
                  </label>
                  <input
                    id="genres"
                    name="genres"
                    type="text"
                    value={formData.genres}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="e.g. Rock, Jazz, Classical"
                  />
                </div>

                <div>
                  <label htmlFor="instruments" className="block text-sm font-medium text-white mb-2">
                    Instruments/Role (comma-separated)
                  </label>
                  <input
                    id="instruments"
                    name="instruments"
                    type="text"
                    value={formData.instruments}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="e.g. Guitar, Vocals, Drums"
                  />
                </div>

                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium text-white mb-2">
                    Portfolio Links (optional)
                  </label>
                  <input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    value={formData.portfolio}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="SoundCloud, YouTube, Spotify, etc."
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
                Bio (optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className="input-field w-full resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-xs text-dark-400 text-center">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary-500 hover:text-primary-400">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-500 hover:text-primary-400">Privacy Policy</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
