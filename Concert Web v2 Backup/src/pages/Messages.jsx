import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { MessageCircle, Send, User, Search, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const Messages = () => {
  const { userProfile } = useAuth()
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      fetchConversations()
    }
  }, [userProfile])

  useEffect(() => {
    // Handle starting new conversation from navigation state
    if (location.state?.startConversationWith && userProfile) {
      startNewConversation(location.state.startConversationWith)
    }
  }, [location.state, userProfile])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchConversations = () => {
    if (!userProfile) return

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userProfile.uid),
      orderBy('lastMessageAt', 'desc')
    )

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setConversations(conversationsData)
      setLoading(false)
    })

    return unsubscribe
  }

  const fetchMessages = (conversationId) => {
    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMessages(messagesData)
    })

    return unsubscribe
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const messageData = {
        text: newMessage,
        senderId: userProfile.uid,
        senderName: userProfile.name,
        createdAt: new Date().toISOString(),
        read: true // Set read status to true when sending a message
      }

      // Add message to conversation
      await addDoc(
        collection(db, 'conversations', selectedConversation.id, 'messages'),
        messageData
      )

      // Update conversation last message
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: newMessage,
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: userProfile.uid,
        lastMessageRead: true // Mark the last message as read by the sender
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const startNewConversation = async (targetUser) => {
    try {
      // Check if conversation already exists
      const existingConversations = conversations.filter(conv => 
        conv.participants.some(p => p.uid === targetUser.id)
      )
      
      if (existingConversations.length > 0) {
        setSelectedConversation(existingConversations[0])
        toast.success('Conversation found!')
        return
      }

      // Create new conversation
      const conversationData = {
        participants: [userProfile.uid, targetUser.id],
        participantDetails: [
          {
            uid: userProfile.uid,
            name: userProfile.name,
            role: userProfile.role
          },
          {
            uid: targetUser.id,
            name: targetUser.name,
            role: 'musician' // Assuming target is always musician when starting from event manager
          }
        ],
        createdAt: new Date().toISOString(),
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: ''
      }

      const docRef = await addDoc(collection(db, 'conversations'), conversationData)
      toast.success('Conversation started!')
      
      // The conversation will appear in the list automatically via the listener
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast.error('Failed to start conversation')
    }
  }

  const getOtherParticipant = (conversation) => {
    if (conversation.participantDetails) {
      return conversation.participantDetails.find(p => p.uid !== userProfile.uid)
    }
    return conversation.participants.find(p => p.uid !== userProfile.uid)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
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
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Conversations Sidebar (visible on mobile when no conversation is selected) */}
        {!selectedConversation && (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-dark-700">
              <h2 className="text-xl font-semibold text-white mb-4">Messages</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-dark-400" />
                </div>
                <input
                  type="text"
                  className="input-field pl-10 w-full text-sm"
                  placeholder="Search conversations..."
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="h-12 w-12 text-dark-400 mx-auto mb-4" />
                  <p className="text-dark-300">No conversations yet</p>
                  <p className="text-dark-400 text-sm mt-2">
                    Apply to events to start messaging with organizers
                  </p>
                </div>
              ) : (
                conversations.map(conversation => {
                  const otherParticipant = getOtherParticipant(conversation)
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-dark-700 cursor-pointer hover:bg-dark-700 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-dark-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-white font-medium truncate">
                              {otherParticipant?.name || 'Unknown User'}
                            </p>
                            <p className="text-dark-400 text-xs">
                              {formatTime(conversation.lastMessageAt)}
                            </p>
                          </div>
                          <p className="text-dark-300 text-sm truncate">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Chat Area (visible on mobile when a conversation is selected) */}
        {selectedConversation && (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center space-x-3">
                <button onClick={() => setSelectedConversation(null)} className="text-white mr-2">
                  &lt; Back
                </button>
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                  </p>
                  <p className="text-dark-400 text-sm">
                    {getOtherParticipant(selectedConversation)?.role === 'musician' ? 'Musician' : 'Event Manager'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-dark-400 mx-auto mb-4" />
                  <p className="text-dark-300">No messages yet</p>
                  <p className="text-dark-400 text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwnMessage = message.senderId === userProfile.uid
                  const showDate = index === 0 || 
                    formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt)

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="text-dark-400 text-sm bg-dark-700 px-3 py-1 rounded-full">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                          isOwnMessage 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-dark-700 text-white'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 flex items-center gap-1 ${isOwnMessage ? 'text-primary-200 justify-end' : 'text-dark-400'}`}>
                            {formatTime(message.createdAt)}
                            {isOwnMessage && message.read && <CheckCheck size={14} />}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-dark-700">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 input-field"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
