import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, User, Music, MapPin, Calendar, MessageCircle, Check, X, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const EventApplications = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const [event, setEvent] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEventAndApplications()
  }, [eventId])

  const fetchEventAndApplications = async () => {
    try {
      // Fetch event details
      const eventDoc = await getDoc(doc(db, 'events', eventId))
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() }
        setEvent(eventData)

        // Check if user is the event creator
        if (userProfile.uid !== eventData.createdBy) {
          toast.error('Access denied')
          navigate('/dashboard')
          return
        }

        // Fetch applications for this event
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('eventId', '==', eventId)
        )
        const applicationsSnapshot = await getDocs(applicationsQuery)
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Fetch musician profiles for each application
        const applicationsWithProfiles = await Promise.all(
          applicationsData.map(async (application) => {
            const musicianDoc = await getDoc(doc(db, 'users', application.musicianId))
            return {
              ...application,
              musicianProfile: musicianDoc.exists() ? musicianDoc.data() : null
            }
          })
        )

        setApplications(applicationsWithProfiles)
      }
    } catch (error) {
      console.error('Error fetching event applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId, action) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: action,
        updatedAt: new Date().toISOString()
      })

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: action }
            : app
        )
      )

      toast.success(`Application ${action}`)
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    }
  }

  const viewMusicianProfile = (musicianId) => {
    navigate(`/musician/${musicianId}`)
  }

  const startConversation = (musicianId, musicianName) => {
    // This will be implemented when we create the conversation starter
    navigate('/messages', { state: { startConversationWith: { id: musicianId, name: musicianName } } })
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
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
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
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-dark-300 hover:text-white mr-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Event Applications</h1>
            <p className="text-dark-300">{event.title}</p>
          </div>
        </div>

        {/* Event Summary */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{applications.length}</div>
              <div className="text-dark-300 text-sm">Total Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {applications.filter(app => app.status === 'accepted').length}
              </div>
              <div className="text-dark-300 text-sm">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {applications.filter(app => app.status === 'pending').length}
              </div>
              <div className="text-dark-300 text-sm">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {applications.filter(app => app.status === 'declined').length}
              </div>
              <div className="text-dark-300 text-sm">Declined</div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="card text-center py-12">
            <User className="h-16 w-16 text-dark-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
            <p className="text-dark-300">Applications will appear here when musicians apply to your event.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map(application => (
              <div key={application.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  {/* Musician Info */}
                  <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {application.musicianProfile?.name || 'Unknown Musician'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          application.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          application.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                      
                      {application.musicianProfile && (
                        <div className="space-y-2">
                          {application.musicianProfile.genres && (
                            <div className="flex items-center text-sm text-dark-300">
                              <Music className="h-4 w-4 mr-2" />
                              <span>{application.musicianProfile.genres.join(', ')}</span>
                            </div>
                          )}
                          
                          {application.musicianProfile.instruments && (
                            <div className="flex flex-wrap gap-1">
                              {application.musicianProfile.instruments.map(instrument => (
                                <span key={instrument} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                                  {instrument}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {application.musicianProfile.location && (
                            <div className="flex items-center text-sm text-dark-300">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{application.musicianProfile.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-dark-300">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => viewMusicianProfile(application.musicianId)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Profile</span>
                    </button>
                    
                    <button
                      onClick={() => startConversation(application.musicianId, application.musicianProfile?.name)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Message</span>
                    </button>

                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApplicationAction(application.id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Check className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        
                        <button
                          onClick={() => handleApplicationAction(application.id, 'declined')}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Application Message */}
                {application.message && (
                  <div className="mt-4 p-4 bg-dark-700 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-2">Application Message:</h4>
                    <p className="text-dark-300 text-sm">{application.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventApplications
