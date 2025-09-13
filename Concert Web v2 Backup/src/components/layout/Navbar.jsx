import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, X, Plus, MessageCircle, User, LogOut, Music, Search, Users } from 'lucide-react'
import MobileNavbar from './MobileNavbar'

const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    <nav className={`bg-dark-800 border-b border-dark-700 sticky top-0 z-40 ${isMobile ? 'hidden' : 'block'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-white">Allied</span>
            </Link>
          </div>

          {/* Desktop Navigation - Pill Style */}
          <div className="hidden md:flex items-center">
            {currentUser ? (
              <div className="flex items-center gap-1 bg-dark-700/50 backdrop-blur-sm rounded-full p-1">
                <Link 
                  to="/dashboard" 
                  className={`relative flex items-center justify-center transition-all duration-300 ease-out touch-manipulation select-none cursor-pointer min-h-[40px] ${
                    location.pathname === '/dashboard'
                      ? 'bg-black text-white rounded-full px-4 py-2 min-w-[100px]'
                      : 'bg-white/10 text-gray-300 rounded-full w-10 h-10 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    {location.pathname === '/dashboard' && (
                      <span className="text-sm font-medium whitespace-nowrap">Home</span>
                    )}
                  </div>
                </Link>
                
                <Link 
                  to="/events" 
                  className={`relative flex items-center justify-center transition-all duration-300 ease-out touch-manipulation select-none cursor-pointer min-h-[40px] ${
                    location.pathname === '/events'
                      ? 'bg-black text-white rounded-full px-4 py-2 min-w-[100px]'
                      : 'bg-white/10 text-gray-300 rounded-full w-10 h-10 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    {location.pathname === '/events' && (
                      <span className="text-sm font-medium whitespace-nowrap">Events</span>
                    )}
                  </div>
                </Link>
                
                {userProfile?.role === 'event_manager' && (
                  <Link 
                    to="/artist-discovery" 
                    className={`relative flex items-center justify-center transition-all duration-300 ease-out touch-manipulation select-none cursor-pointer min-h-[40px] ${
                      location.pathname === '/artist-discovery'
                        ? 'bg-black text-white rounded-full px-4 py-2 min-w-[100px]'
                        : 'bg-white/10 text-gray-300 rounded-full w-10 h-10 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {location.pathname === '/artist-discovery' && (
                        <span className="text-sm font-medium whitespace-nowrap">Artists</span>
                      )}
                    </div>
                  </Link>
                )}
                
                <Link 
                  to="/messages" 
                  className={`relative flex items-center justify-center transition-all duration-300 ease-out touch-manipulation select-none cursor-pointer min-h-[40px] ${
                    location.pathname === '/messages'
                      ? 'bg-black text-white rounded-full px-4 py-2 min-w-[100px]'
                      : 'bg-white/10 text-gray-300 rounded-full w-10 h-10 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {location.pathname === '/messages' && (
                      <span className="text-sm font-medium whitespace-nowrap">Messages</span>
                    )}
                  </div>
                </Link>
                
                <div className="relative">
                  <button
                    onClick={toggleMenu}
                    className={`relative flex items-center justify-center transition-all duration-300 ease-out touch-manipulation select-none cursor-pointer min-h-[40px] ${
                      isMenuOpen
                        ? 'bg-black text-white rounded-full px-4 py-2 min-w-[100px]'
                        : 'bg-white/10 text-gray-300 rounded-full w-10 h-10 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {isMenuOpen && (
                        <span className="text-sm font-medium whitespace-nowrap">Profile</span>
                      )}
                    </div>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-700 rounded-md shadow-lg py-1 z-50">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-dark-300 hover:bg-dark-600 hover:text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={() => {
                          handleLogout()
                          setIsMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-dark-300 hover:bg-dark-600 hover:text-white"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-dark-700/50 backdrop-blur-sm rounded-full p-1">
                <Link 
                  to="/login" 
                  className="bg-white/10 text-gray-300 rounded-full w-10 h-10 hover:bg-white/20 hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <User className="h-4 w-4" />
                </Link>
                <Link 
                  to="/register" 
                  className="bg-black text-white rounded-full px-4 py-2 min-w-[100px] flex items-center justify-center transition-all duration-300 hover:bg-gray-800"
                >
                  <span className="text-sm font-medium">Sign Up</span>
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
