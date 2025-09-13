import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Calendar, Music, Users, MessageCircle, Plus, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { userProfile } = useAuth()
  const [events, setEvents] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [userProfile])

  const fetchDashboardData = async () => {
    if (!userProfile) return

    try {
      if (userProfile.role === 'event_manager') {
        // Fetch events created by this manager
        const eventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', userProfile.uid),
          orderBy('createdAt', 'desc')
        )
        const eventsSnapshot = await getDocs(eventsQuery)
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setEvents(eventsData)
      } else {
        // Fetch applications by this musician
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('musicianId', '==', userProfile.uid),
          orderBy('appliedAt', 'desc')
        )
        const applicationsSnapshot = await getDocs(applicationsQuery)
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setApplications(applicationsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-dark-900 py-4 md:py-8">
      <div className="max-w-7xl mx-auto mobile-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mobile-title font-bold text-white mb-2">
            Welcome back, {userProfile?.name}!
          </h1>
          <p className="mobile-text text-dark-300">
            {userProfile?.role === 'event_manager' 
              ? 'Manage your events and find talented musicians'
              : 'Discover new opportunities and manage your applications'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="card mobile-card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-500/10 rounded-lg">
                <Calendar className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-dark-300">
                  {userProfile?.role === 'event_manager' ? 'Active Events' : 'Applications'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {userProfile?.role === 'event_manager' ? events.length : applications.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-dark-300">
                  {userProfile?.role === 'event_manager' ? 'Total Applications' : 'Accepted'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {userProfile?.role === 'event_manager' 
                    ? events.reduce((acc, event) => acc + (event.applicationsCount || 0), 0)
                    : applications.filter(app => app.status === 'accepted').length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-dark-300">Messages</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {userProfile?.role === 'event_manager' ? (
              <>
                <Link to="/create-event" className="btn-primary mobile-button flex items-center justify-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create New Event</span>
                </Link>
                <Link to="/artist-discovery" className="btn-secondary mobile-button flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Discover Artists</span>
                </Link>
                <Link to="/events" className="btn-secondary mobile-button flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Browse All Events</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/events" className="btn-primary flex items-center space-x-2">
                  <Music className="h-4 w-4" />
                  <span>Find Gigs</span>
                </Link>
                <Link to="/profile" className="btn-secondary flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Update Profile</span>
                </Link>
              </>
            )}
            <Link to="/messages" className="btn-secondary flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Messages</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events/Applications List */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              {userProfile?.role === 'event_manager' ? 'Your Events' : 'Your Applications'}
            </h3>
            
            {userProfile?.role === 'event_manager' ? (
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-dark-400 mx-auto mb-4" />
                    <p className="text-dark-300 mb-4">No events created yet</p>
                    <Link to="/create-event" className="btn-primary">
                      Create Your First Event
                    </Link>
                  </div>
                ) : (
                  events.slice(0, 5).map(event => (
                    <div key={event.id} className="p-4 bg-dark-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">{event.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.status === 'open' ? 'bg-green-500/20 text-green-400' :
                          event.status === 'closed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-dark-300 space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-dark-300">
                          {event.applicationsCount || 0} applications
                        </span>
                        {(event.applicationsCount || 0) > 0 && (
                          <Link 
                            to={`/event/${event.id}/applications`}
                            className="text-primary-400 hover:text-primary-300 text-sm underline"
                          >
                            View Applications
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 text-dark-400 mx-auto mb-4" />
                    <p className="text-dark-300 mb-4">No applications yet</p>
                    <Link to="/events" className="btn-primary">
                      Browse Events
                    </Link>
                  </div>
                ) : (
                  applications.slice(0, 5).map(application => (
                    <div key={application.id} className="p-4 bg-dark-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">{application.eventTitle}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          application.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          application.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                      <div className="text-sm text-dark-300">
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-dark-400 mx-auto mb-4" />
                <p className="text-dark-300">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
