import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, User, Music, MapPin, Calendar, MessageCircle, ExternalLink, Star } from 'lucide-react'
import AvailabilityCalendar from '../components/calendar/AvailabilityCalendar'
import toast from 'react-hot-toast'

const MusicianProfile = () => {
  const { musicianId } = useParams()
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const [musician, setMusician] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMusicianProfile()
  }, [musicianId])

  const fetchMusicianProfile = async () => {
    try {
      const musicianDoc = await getDoc(doc(db, 'users', musicianId))
      if (musicianDoc.exists()) {
        const musicianData = { id: musicianDoc.id, ...musicianDoc.data() }
        setMusician(musicianData)
      } else {
        toast.error('Musician not found')
        navigate('/artist-discovery')
      }
    } catch (error) {
      console.error('Error fetching musician profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const startConversation = async () => {
    try {
      // Check if conversation already exists
      const conversationData = {
        participants: [
          {
            uid: userProfile.uid,
            name: userProfile.name,
            role: userProfile.role
          },
          {
            uid: musician.uid,
            name: musician.name,
            role: musician.role
          }
        ],
        createdAt: new Date().toISOString(),
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: ''
      }

      await addDoc(collection(db, 'conversations'), conversationData)
      navigate('/messages')
      toast.success('Conversation started!')
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast.error('Failed to start conversation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!musician) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Musician Not Found</h2>
          <button onClick={() => navigate('/artist-discovery')} className="btn-primary">
            Back to Artist Discovery
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-dark-300 hover:text-white mr-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Musician Profile</h1>
            <p className="text-dark-300">View detailed profile and availability</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card">
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{musician.name}</h2>
                      <div className="flex items-center space-x-4 text-dark-300">
                        <div className="flex items-center">
                          <Music className="h-4 w-4 mr-2 text-primary-500" />
                          <span>Musician</span>
                        </div>
                        {musician.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                            <span>{musician.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {userProfile?.role === 'event_manager' && (
                      <button
                        onClick={startConversation}
                        className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Start Conversation</span>
                      </button>
                    )}
                  </div>

                  {musician.bio && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                      <p className="text-dark-300 leading-relaxed">{musician.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Musical Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Musical Information</h3>
              
              <div className="space-y-4">
                {musician.genres && musician.genres.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {musician.genres.map(genre => (
                        <span key={genre} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {musician.instruments && musician.instruments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Instruments & Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {musician.instruments.map(instrument => (
                        <span key={instrument} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          {instrument}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {musician.experience && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Experience Level</h4>
                      <p className="text-dark-300 capitalize">{musician.experience}</p>
                    </div>
                  )}

                  {musician.rate && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Rate</h4>
                      <p className="text-dark-300">{musician.rate}</p>
                    </div>
                  )}
                </div>

                {musician.portfolio && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Portfolio</h4>
                    <a
                      href={musician.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Portfolio
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Calendar */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Availability Calendar</h3>
              <AvailabilityCalendar
                availability={musician.availability || {}}
                readOnly={true}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-300">Member since</span>
                  <span className="text-white">
                    {musician.createdAt ? new Date(musician.createdAt).getFullYear() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Profile views</span>
                  <span className="text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Gigs completed</span>
                  <span className="text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-white">N/A</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            {userProfile?.role === 'event_manager' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={startConversation}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Send Message</span>
                  </button>
                  <button
                    onClick={() => navigate('/create-event')}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Create Event</span>
                  </button>
                </div>
              </div>
            )}

            {/* Availability Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Availability Summary</h3>
              <div className="space-y-2">
                {(() => {
                  const availability = musician.availability || {}
                  const today = new Date()
                  let availableDays = 0
                  let bookedDays = 0
                  
                  // Check next 30 days
                  for (let i = 0; i < 30; i++) {
                    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
                    const dateStr = date.toISOString().split('T')[0]
                    const status = availability[dateStr] || 'available'
                    
                    if (status === 'available') availableDays++
                    else if (status === 'booked') bookedDays++
                  }
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-dark-300">Available (30 days)</span>
                        <span className="text-green-400">{availableDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-300">Booked (30 days)</span>
                        <span className="text-red-400">{bookedDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-300">Blocked (30 days)</span>
                        <span className="text-yellow-400">{30 - availableDays - bookedDays} days</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MusicianProfile
