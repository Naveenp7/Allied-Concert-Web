import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Home, 
  Calendar, 
  Users, 
  MessageCircle, 
  User,
  Search,
  Plus,
  Music
} from 'lucide-react'

const MobileNavbar = () => {
  const { userProfile } = useAuth()
  const location = useLocation()
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isActive = (path) => {
    return location.pathname === path
  }

  // Don't render if not mobile or no user
  if (!isMobile || !userProfile) {
    return null
  }

  const getNavItems = () => {
    if (!userProfile) return []

    if (userProfile.role === 'event_manager') {
      return [
        {
          path: '/dashboard',
          icon: Home,
          label: 'Home',
          isMain: true
        },
        {
          path: '/events',
          icon: Search,
          label: 'Events'
        },
        {
          path: '/artist-discovery',
          icon: Users,
          label: 'Artists'
        },
        {
          path: '/create-event',
          icon: Plus,
          label: 'Create'
        },
        {
          path: '/messages',
          icon: MessageCircle,
          label: 'Messages'
        }
      ]
    } else {
      return [
        {
          path: '/dashboard',
          icon: Home,
          label: 'Home',
          isMain: true
        },
        {
          path: '/events',
          icon: Search,
          label: 'Events'
        },
        
        {
          path: '/messages',
          icon: MessageCircle,
          label: 'Messages'
        },
        {
          path: '/profile',
          icon: User,
          label: 'Account'
        }
      ]
    }
  }

  const navItems = getNavItems()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      <div className="flex items-center justify-center gap-1 px-4 py-3 pb-0">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <Link
              key={index}
              to={item.path}
              className="relative"
            >
              <motion.div
                className={`relative flex items-center justify-center transition-all duration-300 ease-out touch-manipulation select-none cursor-pointer min-h-[44px] ${
                  active
                    ? 'bg-black text-white rounded-3xl px-4 py-2 min-w-[110px]'
                    : 'bg-white/20 text-gray-300 rounded-full w-12 h-12 hover:bg-white/30 hover:text-white active:bg-white/40'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className="flex items-center gap-2">
                  <span className="transition-all duration-300 flex-shrink-0 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  {active && (
                    <motion.span
                      className="text-sm font-medium whitespace-nowrap"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default MobileNavbar
