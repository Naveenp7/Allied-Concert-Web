import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, addDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Clock, MapPin, DollarSign, User, Music, MessageCircle, ArrowLeft } from 'lucide-react'
import AvailabilityCalendar from '../components/calendar/AvailabilityCalendar'
import toast from 'react-hot-toast'

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', id))
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() }
        setEvent(eventData)
        
        // Check if user has already applied
        if (userProfile && eventData.applications) {
          const userApplication = eventData.applications.find(
            app => app.musicianId === userProfile.uid
          )
          setHasApplied(!!userApplication)
        }
      } else {
        toast.error('Event not found')
        navigate('/events')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!userProfile || userProfile.role !== 'musician') {
      toast.error('Only musicians can apply to events')
      return
    }

    setApplying(true)

    try {
      // Create application document
      const applicationData = {
        eventId: event.id,
        eventTitle: event.title,
        musicianId: userProfile.uid,
        musicianName: userProfile.name,
        musicianEmail: userProfile.email,
        eventManagerId: event.createdBy,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        message: `Hi! I'm interested in performing at ${event.title}. I believe my skills in ${userProfile.instruments?.join(', ') || 'music'} would be a great fit for this event.`
      }

      await addDoc(collection(db, 'applications'), applicationData)

      // Update event with application
      await updateDoc(doc(db, 'events', event.id), {
        applications: arrayUnion({
          musicianId: userProfile.uid,
          musicianName: userProfile.name,
          appliedAt: new Date().toISOString(),
          status: 'pending'
        }),
        applicationsCount: (event.applicationsCount || 0) + 1
      })

      setHasApplied(true)
      toast.success('Application submitted successfully!')
    } catch (error) {
      console.error('Error applying to event:', error)
      toast.error('Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
          <button onClick={() => navigate('/events')} className="btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center text-dark-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
                  <p className="text-dark-300">Organized by {event.createdByName}</p>
                </div>
                <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium">
                  {event.genre}
                </span>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-dark-300">
                  <Calendar className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="text-white font-medium">{formatDate(event.date)}</p>
                    {event.time && <p className="text-sm">{event.time}</p>}
                  </div>
                </div>

                <div className="flex items-center text-dark-300">
                  <MapPin className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="text-white font-medium">{event.location}</p>
                    {event.venue && <p className="text-sm">{event.venue}</p>}
                  </div>
                </div>

                <div className="flex items-center text-dark-300">
                  <DollarSign className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="text-white font-medium">{event.compensation}</p>
                    <p className="text-sm capitalize">{event.compensationType}</p>
                  </div>
                </div>

                {event.duration && (
                  <div className="flex items-center text-dark-300">
                    <Clock className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <p className="text-white font-medium">{event.duration}</p>
                      <p className="text-sm">Duration</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">About This Event</h3>
                <p className="text-dark-300 leading-relaxed">{event.description}</p>
              </div>
            </div>

            {/* Required Musicians */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Musicians Needed</h3>
              <div className="space-y-3">
                {event.roles.map((role, index) => (
                  <div key={index} className="p-4 bg-dark-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">
                          {role.count}x {role.instrument}
                        </h4>
                        {role.description && (
                          <p className="text-dark-300 text-sm mt-1">{role.description}</p>
                        )}
                      </div>
                      <Music className="h-5 w-5 text-primary-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {event.requirements && (
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                <p className="text-dark-300">{event.requirements}</p>
              </div>
            )}

            {/* Contact Info */}
            {event.contactInfo && (
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
                <p className="text-dark-300">{event.contactInfo}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Application</h3>
              
              {userProfile?.role === 'musician' ? (
                <div className="space-y-4">
                  {hasApplied ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="h-8 w-8 text-green-400" />
                      </div>
                      <p className="text-green-400 font-medium mb-2">Application Submitted</p>
                      <p className="text-dark-300 text-sm">
                        Your application is being reviewed by the event organizer.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applying ? 'Submitting...' : 'Apply for This Event'}
                      </button>
                      <p className="text-dark-400 text-xs mt-2 text-center">
                        Your profile and availability will be shared with the organizer
                      </p>
                    </div>
                  )}
                </div>
              ) : userProfile?.role === 'event_manager' ? (
                <div className="text-center py-4">
                  <MessageCircle className="h-12 w-12 text-primary-500 mx-auto mb-3" />
                  <p className="text-white font-medium mb-2">Event Manager</p>
                  <p className="text-dark-300 text-sm">
                    {event.createdBy === userProfile.uid 
                      ? 'This is your event' 
                      : 'Contact the organizer for more details'
                    }
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-dark-300 mb-4">Sign in as a musician to apply</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-primary"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Event Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Event Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-300">Applications</span>
                  <span className="text-white">{event.applicationsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Positions</span>
                  <span className="text-white">
                    {event.roles.reduce((total, role) => total + role.count, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Posted</span>
                  <span className="text-white">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {event.applicationDeadline && (
                  <div className="flex justify-between">
                    <span className="text-dark-300">Deadline</span>
                    <span className="text-white">
                      {new Date(event.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Share Event */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Share Event</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copied to clipboard!')
                }}
                className="w-full btn-secondary"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
