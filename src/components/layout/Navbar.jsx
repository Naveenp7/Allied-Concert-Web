import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Music, User, LogOut, Menu, X, Calendar, MessageCircle, Plus } from 'lucide-react'

const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-800/95 backdrop-blur-sm border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-white">Allied</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/events" 
              className="text-dark-300 hover:text-white transition-colors duration-200"
            >
              Browse Events
            </Link>
            
            {currentUser ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-dark-300 hover:text-white transition-colors duration-200"
                >
                  Dashboard
                </Link>
                
                {userProfile?.role === 'event_manager' && (
                  <Link 
                    to="/artist-discovery" 
                    className="text-dark-300 hover:text-white transition-colors duration-200"
                  >
                    Discover Artists
                  </Link>
                )}
                
                {userProfile?.role === 'event_manager' && (
                  <Link 
                    to="/create-event" 
                    className="flex items-center space-x-1 btn-primary"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Event</span>
                  </Link>
                )}
                
                <Link 
                  to="/messages" 
                  className="text-dark-300 hover:text-white transition-colors duration-200"
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors duration-200">
                    <User className="h-5 w-5" />
                    <span>{userProfile?.name || 'Profile'}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-lg border border-dark-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 rounded-t-lg"
                    >
                      View Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 rounded-b-lg flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-dark-300 hover:text-white transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-dark-300 hover:text-white transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/events" 
                className="text-dark-300 hover:text-white transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Events
              </Link>
              
              {currentUser ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-dark-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {userProfile?.role === 'event_manager' && (
                    <Link 
                      to="/artist-discovery" 
                      className="text-dark-300 hover:text-white transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Discover Artists
                    </Link>
                  )}
                  
                  {userProfile?.role === 'event_manager' && (
                    <Link 
                      to="/create-event" 
                      className="text-primary-500 hover:text-primary-400 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Event
                    </Link>
                  )}
                  
                  <Link 
                    to="/messages" 
                    className="text-dark-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="text-dark-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <button 
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-dark-300 hover:text-white transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-dark-300 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-primary-500 hover:text-primary-400 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
