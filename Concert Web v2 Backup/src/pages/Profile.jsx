import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { format } from 'date-fns'
import { User, Mail, Music, MapPin, Link as LinkIcon, Calendar, Edit, Save, X, LogOut } from 'lucide-react'
import AvailabilityCalendar from '../components/calendar/AvailabilityCalendar'
import toast from 'react-hot-toast'

const Profile = () => {
  const { userProfile, updateUserProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [availability, setAvailability] = useState({})

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        genres: Array.isArray(userProfile.genres) ? userProfile.genres.join(', ') : '',
        instruments: Array.isArray(userProfile.instruments) ? userProfile.instruments.join(', ') : '',
        portfolio: userProfile.portfolio || '',
        experience: userProfile.experience || '',
        rate: userProfile.rate || ''
      })
      setAvailability(userProfile.availability || {})
    }
  }, [userProfile])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      const updates = {
        ...formData,
        ...(userProfile.role === 'musician' && {
          genres: formData.genres.split(',').map(g => g.trim()).filter(g => g),
          instruments: formData.instruments.split(',').map(i => i.trim()).filter(i => i),
        }),
        availability
      }

      await updateUserProfile(updates)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleDateClick = async (date, currentStatus) => {
    if (userProfile.role !== 'musician') return

    const dateStr = format(date, 'yyyy-MM-dd')
    const newStatus = currentStatus === 'available' ? 'blocked' : 'available'
    
    const newAvailability = {
      ...availability,
      [dateStr]: newStatus
    }

    setAvailability(newAvailability)

    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        availability: newAvailability
      })
      toast.success(`Date marked as ${newStatus}`)
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Failed to update availability')
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-dark-300">Manage your profile information and settings</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="btn-primary flex items-center space-x-2"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
            <button
              onClick={logout}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    />
                  ) : (
                    <p className="text-dark-300">{userProfile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email
                  </label>
                  <p className="text-dark-300">{userProfile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="City, State"
                    />
                  ) : (
                    <p className="text-dark-300">{userProfile.location || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="input-field w-full resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-dark-300">{userProfile.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Musician-specific fields */}
            {userProfile.role === 'musician' && (
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-6">Musical Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Music className="inline h-4 w-4 mr-2" />
                      Genres
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="genres"
                        value={formData.genres}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        placeholder="Rock, Jazz, Classical (comma-separated)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {userProfile.genres?.map(genre => (
                          <span key={genre} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                            {genre}
                          </span>
                        )) || <span className="text-dark-300">No genres specified</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Instruments/Role</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="instruments"
                        value={formData.instruments}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        placeholder="Guitar, Vocals, Drums (comma-separated)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {userProfile.instruments?.map(instrument => (
                          <span key={instrument} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                            {instrument}
                          </span>
                        )) || <span className="text-dark-300">No instruments specified</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <LinkIcon className="inline h-4 w-4 mr-2" />
                      Portfolio Links
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        placeholder="https://soundcloud.com/yourprofile"
                      />
                    ) : (
                      userProfile.portfolio ? (
                        <a 
                          href={userProfile.portfolio} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 underline"
                        >
                          {userProfile.portfolio}
                        </a>
                      ) : (
                        <span className="text-dark-300">No portfolio links</span>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Experience Level</label>
                    {isEditing ? (
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      >
                        <option value="">Select experience level</option>
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">Intermediate (2-5 years)</option>
                        <option value="advanced">Advanced (5-10 years)</option>
                        <option value="professional">Professional (10+ years)</option>
                      </select>
                    ) : (
                      <p className="text-dark-300 capitalize">{userProfile.experience || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Rate (per hour/event)</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="rate"
                        value={formData.rate}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        placeholder="$100/hour or $500/event"
                      />
                    ) : (
                      <p className="text-dark-300">{userProfile.rate || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-300">Member since</span>
                  <span className="text-white">
                    {userProfile.createdAt ? new Date(userProfile.createdAt).getFullYear() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Profile views</span>
                  <span className="text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">
                    {userProfile.role === 'musician' ? 'Gigs completed' : 'Events created'}
                  </span>
                  <span className="text-white">0</span>
                </div>
              </div>
            </div>

            {/* Role Badge */}
            <div className="card">
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  userProfile.role === 'musician' 
                    ? 'bg-primary-500/20 text-primary-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {userProfile.role === 'musician' ? (
                    <>
                      <Music className="h-4 w-4 mr-2" />
                      Musician
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Event Manager
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Calendar for Musicians */}
        {userProfile.role === 'musician' && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-6">Availability Calendar</h2>
            <AvailabilityCalendar
              availability={availability}
              onDateClick={handleDateClick}
              readOnly={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
