import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Filter, Music, MapPin, User, MessageCircle, Eye, Star } from 'lucide-react'

const ArtistDiscovery = () => {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [artists, setArtists] = useState([])
  const [filteredArtists, setFilteredArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    genre: '',
    instrument: '',
    location: '',
    experience: ''
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

  const experienceLevels = [
    'beginner', 'intermediate', 'advanced', 'professional'
  ]

  useEffect(() => {
    if (userProfile?.role !== 'event_manager') {
      navigate('/dashboard')
      return
    }
    fetchArtists()
  }, [userProfile, navigate])

  useEffect(() => {
    applyFilters()
  }, [artists, searchTerm, filters])

  const fetchArtists = async () => {
    try {
      const artistsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'musician')
      )
      
      const artistsSnapshot = await getDocs(artistsQuery)
      const artistsData = artistsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setArtists(artistsData)
    } catch (error) {
      console.error('Error fetching artists:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = artists

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(artist =>
        artist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genres?.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        artist.instruments?.some(instrument => instrument.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Genre filter
    if (filters.genre) {
      filtered = filtered.filter(artist =>
        artist.genres?.includes(filters.genre)
      )
    }

    // Instrument filter
    if (filters.instrument) {
      filtered = filtered.filter(artist =>
        artist.instruments?.includes(filters.instrument)
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(artist =>
        artist.location?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Experience filter
    if (filters.experience) {
      filtered = filtered.filter(artist =>
        artist.experience === filters.experience
      )
    }

    setFilteredArtists(filtered)
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
      instrument: '',
      location: '',
      experience: ''
    })
    setSearchTerm('')
  }

  const viewArtistProfile = (artistId) => {
    navigate(`/musician/${artistId}`)
  }

  const startConversation = (artistId, artistName) => {
    navigate('/messages', { state: { startConversationWith: { id: artistId, name: artistName } } })
  }

  const getAvailabilityStatus = (availability) => {
    if (!availability) return 'Unknown'
    
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Check availability in the next week
    let availableDays = 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      if (!availability[date] || availability[date] === 'available') {
        availableDays++
      }
    }
    
    if (availableDays >= 5) return 'Highly Available'
    if (availableDays >= 3) return 'Available'
    if (availableDays >= 1) return 'Limited Availability'
    return 'Busy'
  }

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'Highly Available': return 'text-green-400'
      case 'Available': return 'text-green-300'
      case 'Limited Availability': return 'text-yellow-400'
      case 'Busy': return 'text-red-400'
      default: return 'text-dark-400'
    }
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
          <h1 className="text-3xl font-bold text-white mb-2">Discover Artists</h1>
          <p className="text-dark-300">
            Browse and connect with talented musicians for your events
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
              placeholder="Search artists by name, genre, instrument, or bio..."
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
                  <label className="block text-sm font-medium text-white mb-2">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">All levels</option>
                    {experienceLevels.map(level => (
                      <option key={level} value={level} className="capitalize">{level}</option>
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
            Showing {filteredArtists.length} of {artists.length} artists
          </p>
        </div>

        {/* Artists Grid */}
        {filteredArtists.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-dark-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No artists found</h3>
            <p className="text-dark-300 mb-6">
              {artists.length === 0 
                ? "No artists have registered yet. Check back later!"
                : "Try adjusting your search criteria or filters."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtists.map(artist => {
              const availabilityStatus = getAvailabilityStatus(artist.availability)
              return (
                <div
                  key={artist.id}
                  className="card hover:bg-dark-700 transition-colors duration-200 group"
                >
                  {/* Artist Avatar */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mb-3">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white text-center group-hover:text-primary-400 transition-colors">
                      {artist.name}
                    </h3>
                    {artist.location && (
                      <div className="flex items-center text-sm text-dark-300 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{artist.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {artist.genres && artist.genres.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {artist.genres.slice(0, 3).map(genre => (
                          <span key={genre} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                            {genre}
                          </span>
                        ))}
                        {artist.genres.length > 3 && (
                          <span className="px-2 py-1 bg-dark-600 text-dark-300 rounded text-xs">
                            +{artist.genres.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Instruments */}
                  {artist.instruments && artist.instruments.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {artist.instruments.slice(0, 2).map(instrument => (
                          <span key={instrument} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            {instrument}
                          </span>
                        ))}
                        {artist.instruments.length > 2 && (
                          <span className="px-2 py-1 bg-dark-600 text-dark-300 rounded text-xs">
                            +{artist.instruments.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experience & Availability */}
                  <div className="mb-4 text-center space-y-1">
                    {artist.experience && (
                      <div className="text-sm text-dark-300 capitalize">
                        {artist.experience} level
                      </div>
                    )}
                    <div className={`text-sm font-medium ${getAvailabilityColor(availabilityStatus)}`}>
                      {availabilityStatus}
                    </div>
                  </div>

                  {/* Bio Preview */}
                  {artist.bio && (
                    <p className="text-sm text-dark-300 text-center mb-4 line-clamp-2">
                      {artist.bio}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewArtistProfile(artist.id)}
                      className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => startConversation(artist.id, artist.name)}
                      className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>Chat</span>
                    </button>
                  </div>

                  {/* Portfolio Link */}
                  {artist.portfolio && (
                    <div className="mt-3 text-center">
                      <a
                        href={artist.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 text-sm underline"
                      >
                        View Portfolio
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtistDiscovery
