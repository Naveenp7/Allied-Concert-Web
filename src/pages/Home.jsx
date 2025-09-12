import React from 'react'
import { Link } from 'react-router-dom'
import { Music, Users, Calendar, MessageCircle, Star, ArrowRight } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Connect. Collaborate. Create.
          </h1>
          <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto">
            Allied is the premier platform connecting event managers with talented musicians. 
            Find your next gig or discover the perfect artist for your event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/events" className="btn-secondary text-lg px-8 py-3">
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Allied?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <Music className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">For Musicians</h3>
              <p className="text-dark-300">
                Discover gigs, showcase your talent, and manage your availability with our intuitive calendar system.
              </p>
            </div>
            <div className="card text-center">
              <Users className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">For Event Managers</h3>
              <p className="text-dark-300">
                Post events, find the perfect artists, and manage applications all in one place.
              </p>
            </div>
            <div className="card text-center">
              <Calendar className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Smart Scheduling</h3>
              <p className="text-dark-300">
                GitHub-style availability calendar helps you track bookings and availability at a glance.
              </p>
            </div>
            <div className="card text-center">
              <MessageCircle className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Direct Communication</h3>
              <p className="text-dark-300">
                Built-in messaging system for seamless communication between artists and event managers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Musicians */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-6">For Musicians</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h4 className="text-white font-medium">Create Your Profile</h4>
                    <p className="text-dark-300">Set up your profile with bio, genres, instruments, and portfolio links.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h4 className="text-white font-medium">Browse & Apply</h4>
                    <p className="text-dark-300">Discover events that match your style and apply with one click.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h4 className="text-white font-medium">Get Booked</h4>
                    <p className="text-dark-300">Receive notifications when you're selected and manage your schedule.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Event Managers */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-6">For Event Managers</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h4 className="text-white font-medium">Post Your Event</h4>
                    <p className="text-dark-300">Create detailed event listings with requirements and compensation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h4 className="text-white font-medium">Review Applications</h4>
                    <p className="text-dark-300">Browse musician profiles and availability calendars.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h4 className="text-white font-medium">Book Artists</h4>
                    <p className="text-dark-300">Select your preferred musicians and coordinate event details.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of musicians and event managers already using Allied.
          </p>
          <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
            Sign Up Today
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
