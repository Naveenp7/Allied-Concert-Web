import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Calendar, MapPin, DollarSign, Clock, Users, Music, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const CreateEvent = () => {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    venue: '',
    genre: '',
    roles: [{ instrument: '', count: 1, description: '' }],
    compensation: '',
    compensationType: 'fixed',
    applicationDeadline: '',
    requirements: '',
    contactInfo: ''
  })

  const genres = [
    'Rock', 'Pop', 'Jazz', 'Classical', 'Blues', 'Country', 'Electronic', 
    'Hip Hop', 'R&B', 'Folk', 'Reggae', 'Punk', 'Metal', 'Alternative', 'Other'
  ]

  const instruments = [
    'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano', 'Keyboard', 'Violin', 
    'Saxophone', 'Trumpet', 'Flute', 'Cello', 'DJ', 'Other'
  ]

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRoleChange = (index, field, value) => {
    const newRoles = [...formData.roles]
    newRoles[index] = { ...newRoles[index], [field]: value }
    setFormData({ ...formData, roles: newRoles })
  }

  const addRole = () => {
    setFormData({
      ...formData,
      roles: [...formData.roles, { instrument: '', count: 1, description: '' }]
    })
  }

  const removeRole = (index) => {
    if (formData.roles.length > 1) {
      const newRoles = formData.roles.filter((_, i) => i !== index)
      setFormData({ ...formData, roles: newRoles })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        ...formData,
        createdBy: userProfile.uid,
        createdByName: userProfile.name,
        createdAt: new Date().toISOString(),
        status: 'open',
        applicationsCount: 0,
        applications: []
      }

      const docRef = await addDoc(collection(db, 'events'), eventData)
      toast.success('Event created successfully!')
      navigate(`/events/${docRef.id}`)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  if (userProfile?.role !== 'event_manager') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-dark-300">Only event managers can create events.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
          <p className="text-dark-300">Post your event and find talented musicians</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Summer Jazz Festival"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field w-full resize-none"
                  placeholder="Describe your event, atmosphere, and what you're looking for..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Event Date *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Start Time *
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="3 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <Music className="inline h-4 w-4 mr-2" />
                  Genre *
                </label>
                <select
                  name="genre"
                  required
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="">Select genre</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  City/Location *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="New York, NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Venue Name
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Blue Note Jazz Club"
                />
              </div>
            </div>
          </div>

          {/* Required Roles */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Required Musicians</h2>
              <button
                type="button"
                onClick={addRole}
                className="btn-secondary text-sm"
              >
                Add Role
              </button>
            </div>

            <div className="space-y-4">
              {formData.roles.map((role, index) => (
                <div key={index} className="p-4 bg-dark-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Instrument/Role *
                      </label>
                      <select
                        value={role.instrument}
                        onChange={(e) => handleRoleChange(index, 'instrument', e.target.value)}
                        className="input-field w-full"
                        required
                      >
                        <option value="">Select instrument</option>
                        {instruments.map(instrument => (
                          <option key={instrument} value={instrument}>{instrument}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Count *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={role.count}
                        onChange={(e) => handleRoleChange(index, 'count', parseInt(e.target.value))}
                        className="input-field w-full"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-white">
                          Description
                        </label>
                        {formData.roles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRole(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={role.description}
                        onChange={(e) => handleRoleChange(index, 'description', e.target.value)}
                        className="input-field w-full"
                        placeholder="Lead guitarist with rock experience"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compensation */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Compensation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Compensation Type *
                </label>
                <select
                  name="compensationType"
                  required
                  value={formData.compensationType}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="percentage">Revenue Share</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <DollarSign className="inline h-4 w-4 mr-2" />
                  Amount/Details *
                </label>
                <input
                  type="text"
                  name="compensation"
                  required
                  value={formData.compensation}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="$500 per musician"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Additional Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Special Requirements
                </label>
                <textarea
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="input-field w-full resize-none"
                  placeholder="Equipment needed, dress code, experience level, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contact Information
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Phone number or additional contact details"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary px-8 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEvent
