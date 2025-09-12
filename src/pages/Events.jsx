import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Filter, MapPin, Calendar, Clock, DollarSign, Users, Music } from 'lucide-react'

const Events = () => {
  const { userProfile } = useAuth()
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    genre: '',
    location: '',
    dateRange: '',
    instrument: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const genres = [
    'Rock', 'Pop', 'Jazz', 'Classical', 'Blues', 'Country', 'Electronic', 
    'Hip Hop', 'R&B', 'Folk', 'Reggae', 'Punk', 'Metal', 'Alternative'
  ]

  const instruments = [
    'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano', 'Keyboard', 'Violin', 
    'Saxophone', 'Trumpet', 'Flute', 'Cello', 'DJ'
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [events, searchTerm, filters])

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc')
      )
      
      const eventsSnapshot = await getDocs(eventsQuery)
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setEvents(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = events

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Genre filter
    if (filters.genre) {
      filtered = filtered.filter(event => event.genre === filters.genre)
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Instrument filter
    if (filters.instrument) {
      filtered = filtered.filter(event =>
        event.roles.some(role => role.instrument === filters.instrument)
      )
    }

    // Date range filter
    if (filters.dateRange) {
      const today = new Date()
      const filterDate = new Date(today)
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setDate(today.getDate())
          break
        case 'week':
          filterDate.setDate(today.getDate() + 7)
          break
        case 'month':
          filterDate.setMonth(today.getMonth() + 1)
          break
        default:
          break
      }
      
      if (filters.dateRange !== '') {
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date)
          return eventDate >= today && eventDate <= filterDate
        })
      }
    }

    setFilteredEvents(filtered)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      genre: '',
      location: '',
      dateRange: '',
      instrument: ''
    })
    setSearchTerm('')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Events</h1>
          <p className="text-dark-300">
            Discover exciting performance opportunities and connect with event organizers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-dark-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
              placeholder="Search events by title, description, or location..."
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            
            {(searchTerm || Object.values(filters).some(f => f)) && (
              <button
                onClick={clearFilters}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Genre</label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">All genres</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="input-field w-full"
                    placeholder="City or state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Any time</option>
                    <option value="today">Today</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Instrument</label>
                  <select
                    value={filters.instrument}
                    onChange={(e) => handleFilterChange('instrument', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">All instruments</option>
                    {instruments.map(instrument => (
                      <option key={instrument} value={instrument}>{instrument}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-dark-300">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-dark-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-dark-300 mb-6">
              {events.length === 0 
                ? "No events are currently available. Check back later!"
                : "Try adjusting your search criteria or filters."
              }
            </p>
            {events.length === 0 && userProfile?.role === 'event_manager' && (
              <Link to="/create-event" className="btn-primary">
                Create the First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="card hover:bg-dark-700 transition-colors duration-200 group"
              >
                {/* Event Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-dark-300">by {event.createdByName}</p>
                  </div>
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs font-medium">
                    {event.genre}
                  </span>
                </div>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-dark-300">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formatDate(event.date)}</span>
                    {event.time && (
                      <>
                        <Clock className="h-4 w-4 ml-4 mr-2 flex-shrink-0" />
                        <span>{event.time}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-dark-300">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-dark-300">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{event.compensation}</span>
                  </div>
                </div>

                {/* Required Roles */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-white mb-2">Looking for:</p>
                  <div className="flex flex-wrap gap-1">
                    {event.roles.slice(0, 3).map((role, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-dark-600 text-dark-200 rounded text-xs"
                      >
                        {role.count}x {role.instrument}
                      </span>
                    ))}
                    {event.roles.length > 3 && (
                      <span className="px-2 py-1 bg-dark-600 text-dark-200 rounded text-xs">
                        +{event.roles.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Description Preview */}
                <p className="text-sm text-dark-300 line-clamp-2 mb-4">
                  {event.description}
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-dark-700">
                  <div className="flex items-center text-sm text-dark-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{event.applicationsCount || 0} applied</span>
                  </div>
                  
                  {event.applicationDeadline && (
                    <div className="text-xs text-dark-400">
                      Apply by {formatDate(event.applicationDeadline)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Events
