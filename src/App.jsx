import { useState, useEffect, useRef } from 'react'
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  parseISO,
  setHours,
  setMinutes
} from 'date-fns'
import './App.css'
import { userAPI, choreAPI, assistantAPI } from './api'

function App() {
  // Default users with distinct bright colors
  const defaultUsers = [
    { id: 1, name: 'Alice', color: '#4CAF50' },
    { id: 2, name: 'Bob', color: '#2196F3' },
    { id: 3, name: 'Charlie', color: '#FF9800' }
  ]

  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [newUserName, setNewUserName] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [showBotChat, setShowBotChat] = useState(false)
  const [botMessages, setBotMessages] = useState([
    { type: 'bot', text: 'Hi! I\'m your calendar assistant. I can help you manage users and chores. Try commands like "add user John" or "add chore for Alice".' }
  ])
  const [userInput, setUserInput] = useState('')
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of bot chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [botMessages])

  // Load initial data from API
  useEffect(() => {
    loadUsers()
    loadChores()
  }, [])

  // Reload chores when date changes
  useEffect(() => {
    loadChores()
  }, [currentDate])

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll()
      setUsers(data)
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const loadChores = async () => {
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const data = await choreAPI.getAll(dateStr)
      // Convert API format to app format
      const formattedEvents = (data || []).map(chore => ({
        id: chore.id,
        title: chore.description,
        description: '',
        date: `${chore.date}T${chore.time}`,
        userId: chore.userId
      }))
      setEvents(formattedEvents)
    } catch (err) {
      console.error('Failed to load chores:', err)
      setEvents([])
    }
  }

  const goToPreviousDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, -1))
  }

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleCreateEvent = async () => {
    if (!eventTitle || !selectedDate || !selectedTime || !selectedUserId) return

    try {
      const choreData = {
        description: eventTitle,
        time: selectedTime + ':00',
        date: format(selectedDate, 'yyyy-MM-dd'),
        userId: selectedUserId
      }

      await choreAPI.create(choreData)
      await loadChores()

      setShowModal(false)
      setEventTitle('')
      setEventDescription('')
      setSelectedTime('')
      setSelectedDate(null)
    } catch (err) {
      console.error('Failed to create chore:', err)
      alert('Failed to create chore')
    }
  }

  const handleAddUser = async () => {
    if (!newUserName.trim()) return

    try {
      const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FFC107', '#F44336']
      const userData = {
        name: newUserName.trim(),
        color: colors[users.length % colors.length]
      }

      await userAPI.create(userData)
      await loadUsers()

      setNewUserName('')
      setShowUserModal(false)
    } catch (err) {
      console.error('Failed to add user:', err)
      alert('Failed to add user')
    }
  }

  const handleEditUser = async () => {
    if (!editingUser || !editingUser.name.trim()) return

    try {
      await userAPI.update(editingUser.id, {
        name: editingUser.name,
        color: editingUser.color
      })
      await loadUsers()

      setEditingUser(null)
      setShowEditUserModal(false)
    } catch (err) {
      console.error('Failed to update user:', err)
      alert('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? Their chores will remain.')) {
      return
    }

    try {
      await userAPI.delete(userId)
      await loadUsers()
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Failed to delete user')
    }
  }

  const openEditUser = (user) => {
    setEditingUser({ ...user })
    setShowEditUserModal(true)
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent || !editingEvent.title || !editingEvent.time) return

    try {
      const eventDate = new Date(editingEvent.date)
      const choreData = {
        description: editingEvent.title,
        time: editingEvent.time + ':00',
        date: format(eventDate, 'yyyy-MM-dd'),
        userId: editingEvent.userId
      }

      await choreAPI.update(editingEvent.id, choreData)
      await loadChores()

      setEditingEvent(null)
      setShowEditEventModal(false)
    } catch (err) {
      console.error('Failed to update chore:', err)
      alert('Failed to update chore')
    }
  }

  const openEditEvent = (event) => {
    const eventDate = parseISO(event.date)
    setEditingEvent({
      ...event,
      time: format(eventDate, 'HH:mm')
    })
    setShowEditEventModal(true)
  }

  const getUserById = (userId) => {
    return users.find(user => user.id === userId)
  }

  const openModal = (date) => {
    setSelectedDate(date)
    setShowModal(true)
  }

  const getEventsForUser = (userId) => {
    return events
      .filter(event => event.userId === userId && isSameDay(parseISO(event.date), currentDate))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const deleteEvent = async (eventId) => {
    try {
      await choreAPI.delete(eventId)
      await loadChores()
    } catch (err) {
      console.error('Failed to delete chore:', err)
      alert('Failed to delete chore')
    }
  }

  const handleBotCommand = async (input) => {
    // Add user message
    setBotMessages(prev => [...prev, { type: 'user', text: input }])
    setUserInput('')

    try {
      // Call AI assistant API with sessionId
      const response = await assistantAPI.chat(sessionId, input)

      // Add bot response
      setTimeout(() => {
        setBotMessages(prev => [...prev, { type: 'bot', text: response.response }])
        // Refresh screen to show latest changes
        loadUsers()
        loadChores()
      }, 300)
    } catch (err) {
      console.error('AI assistant error:', err)
      // Fallback to local commands if API fails
      handleLocalCommand(input)
    }
  }

  const handleLocalCommand = (input) => {
    const lowerInput = input.toLowerCase().trim()
    let botResponse = ''

    // Add user command
    if (lowerInput.startsWith('add user ')) {
      const userName = input.substring(9).trim()
      if (userName) {
        handleAddUser()
        botResponse = `✓ User "${userName}" has been added successfully!`
      } else {
        botResponse = 'Please provide a user name. Example: "add user John"'
      }
    }
    // Add chore command
    else if (lowerInput.includes('add chore')) {
      const forMatch = input.match(/for (\w+)/i)
      if (forMatch) {
        const userName = forMatch[1]
        const user = users.find(u => u.name.toLowerCase() === userName.toLowerCase())
        if (user) {
          setSelectedUserId(user.id)
          setSelectedDate(currentDate)
          setShowBotChat(false)
          setShowModal(true)
          botResponse = `Opening chore form for ${user.name}...`
        } else {
          botResponse = `User "${userName}" not found. Available users: ${users.map(u => u.name).join(', ')}`
        }
      } else {
        botResponse = 'Please specify a user. Example: "add chore for Alice"'
      }
    }
    // List users command
    else if (lowerInput.includes('list users') || lowerInput.includes('show users')) {
      if (users.length > 0) {
        botResponse = `Current users (${users.length}):\n${users.map(u => `• ${u.name}`).join('\n')}`
      } else {
        botResponse = 'No users found. Add a user first!'
      }
    }
    // List chores command
    else if (lowerInput.includes('list chores') || lowerInput.includes('show chores')) {
      const todayEvents = events.filter(event => isSameDay(parseISO(event.date), currentDate))
      if (todayEvents.length > 0) {
        botResponse = `Chores for ${format(currentDate, 'MMMM d')}:\n${todayEvents.map(e => {
          const user = users.find(u => u.id === e.userId)
          return `• ${e.title} - ${user ? user.name : 'Unknown'} at ${format(parseISO(e.date), 'h:mm a')}`
        }).join('\n')}`
      } else {
        botResponse = `No chores scheduled for ${format(currentDate, 'MMMM d')}`
      }
    }
    // Go to today
    else if (lowerInput.includes('today') || lowerInput.includes('go to today')) {
      goToToday()
      botResponse = '✓ Jumped to today!'
    }
    // Help command
    else if (lowerInput.includes('help') || lowerInput === '?') {
      botResponse = `Here's what I can do:
• "add user [name]" - Add a new user
• "add chore for [user]" - Add a chore for a user
• "list users" - Show all users
• "list chores" - Show today's chores
• "today" - Jump to today's date
• "help" - Show this help message`
    }
    // Default response
    else {
      botResponse = 'I didn\'t understand that. Type "help" to see what I can do!'
    }

    // Add bot response
    setTimeout(() => {
      setBotMessages(prev => [...prev, { type: 'bot', text: botResponse }])
      // Refresh screen to show latest changes
      loadUsers()
      loadChores()
    }, 300)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>My Chores Calendar</h1>

        <div className="date-navigation">
          <button className="nav-btn" onClick={goToPreviousDay}>← Previous</button>
          <div className="current-date">
            <h2>{format(currentDate, 'EEEE')}</h2>
            <p>{format(currentDate, 'MMMM d, yyyy')}</p>
          </div>
          <button className="nav-btn" onClick={goToNextDay}>Next →</button>
        </div>

        <button className="today-btn" onClick={goToToday}>Today</button>

        <div className="users-section">
          <div className="users-info">
            <span className="user-count">{users.length} {users.length === 1 ? 'User' : 'Users'}</span>
            <button className="add-user-btn" onClick={() => setShowUserModal(true)}>
              + Add User
            </button>
          </div>
        </div>
      </header>

      <div className="calendar">
        {users.map((user) => {
          const userEvents = getEventsForUser(user.id)

          return (
            <div key={user.id} className="user-column">
              <div className="user-column-header" style={{ backgroundColor: user.color }}>
                <div className="user-name">{user.name}</div>
                <div className="user-actions">
                  <button
                    className="edit-user-btn"
                    onClick={() => openEditUser(user)}
                    title="Edit user"
                  >
                    ✎
                  </button>
                  <button
                    className="delete-user-btn"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Delete user"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="user-column-content">
                <button
                  className="add-event-btn"
                  onClick={() => {
                    setSelectedUserId(user.id)
                    openModal(currentDate)
                  }}
                >
                  + Add Chore
                </button>

                <div className="events-list">
                  {userEvents.map(event => (
                    <div
                      key={event.id}
                      className="event-card"
                      style={{
                        borderLeft: `4px solid ${user.color}`,
                      }}
                    >
                      <div className="event-time">
                        {format(parseISO(event.date), 'h:mm a')}
                      </div>
                      <div className="event-title">{event.title}</div>
                      {event.description && (
                        <div className="event-description">{event.description}</div>
                      )}
                      <div className="event-actions">
                        <button
                          className="edit-event-btn"
                          onClick={() => openEditEvent(event)}
                          title="Edit chore"
                        >
                          ✎
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteEvent(event.id)}
                          title="Delete chore"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Chore</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="text"
                  value={selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
                  disabled
                  className="input-disabled"
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  className="input"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Chore Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter chore title"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Enter chore description"
                  className="input textarea"
                  rows="3"
                />
              </div>

              <button
                className="submit-btn"
                onClick={handleCreateEvent}
                disabled={!eventTitle || !selectedTime}
              >
                Create Chore
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>User Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter user name"
                  className="input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddUser()
                  }}
                />
              </div>

              <button
                className="submit-btn"
                onClick={handleAddUser}
                disabled={!newUserName.trim()}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditUserModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditUserModal(false)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={() => setShowEditUserModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>User Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Enter user name"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={editingUser.color}
                  onChange={(e) => setEditingUser({ ...editingUser, color: e.target.value })}
                  className="input"
                />
              </div>

              <button
                className="submit-btn"
                onClick={handleEditUser}
                disabled={!editingUser.name.trim()}
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditEventModal && editingEvent && (
        <div className="modal-overlay" onClick={() => setShowEditEventModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Chore</h2>
              <button className="close-btn" onClick={() => setShowEditEventModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={editingEvent.time}
                  onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={editingEvent.userId}
                  onChange={(e) => setEditingEvent({ ...editingEvent, userId: Number(e.target.value) })}
                  className="input"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Chore Title</label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="Enter chore title"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Enter chore description"
                  className="input textarea"
                  rows="3"
                />
              </div>

              <button
                className="submit-btn"
                onClick={handleUpdateEvent}
                disabled={!editingEvent.title || !editingEvent.time}
              >
                Update Chore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bot Chat Modal */}
      {showBotChat && (
        <div className="bot-chat-container">
          <div className="bot-chat-header">
            <div className="bot-header-info">
              <span className="bot-icon">🤖</span>
              <div>
                <h3>Calendar Assistant</h3>
                <p className="bot-status">Online</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setShowBotChat(false)}>×</button>
          </div>

          <div className="bot-chat-messages">
            {botMessages.map((message, index) => (
              <div key={index} className={`bot-message ${message.type}`}>
                {message.type === 'bot' && <span className="message-icon">🤖</span>}
                <div className="message-text">{message.text}</div>
                {message.type === 'user' && <span className="message-icon">👤</span>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="bot-chat-input">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && userInput.trim()) {
                  handleBotCommand(userInput)
                }
              }}
              placeholder="Type a command or 'help'..."
              className="bot-input"
            />
            <button
              className="bot-send-btn"
              onClick={() => userInput.trim() && handleBotCommand(userInput)}
              disabled={!userInput.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Bot Button */}
      <button
        className="bot-float-btn"
        onClick={() => setShowBotChat(!showBotChat)}
        title="Open Calendar Assistant"
      >
        🤖
      </button>
    </div>
  )
}

export default App
