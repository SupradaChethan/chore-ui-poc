# API Integration Guide

## Overview
The calendar app now integrates with a REST API backend for all user and chore operations.

## Backend API Configuration

**Base URL**: `http://localhost:8080/api/v1`

You can change this in `src/api.js` by updating the `API_BASE` constant.

## How It Works

### User Operations
- **Load Users**: Fetches all users on app start
- **Add User**: POST to `/api/v1/users`
- **Edit User**: PUT to `/api/v1/users/{id}`
- **Delete User**: DELETE to `/api/v1/users/{id}`

### Chore Operations
- **Load Chores**: Fetches chores for current date on mount and date change
- **Add Chore**: POST to `/api/v1/chores`
- **Edit Chore**: PUT to `/api/v1/chores/{id}`
- **Delete Chore**: DELETE to `/api/v1/chores/{id}`

### AI Bot Assistant
- **Chat**: POST to `/api/v1/assistant/chat`
- Sends `sessionId` with each message to maintain conversation context
- Falls back to local commands if API is unavailable
- Session ID is generated once per app session: `session-{timestamp}-{random}`

## Data Format Mapping

### User
**API Format**:
```json
{
  "name": "string",
  "color": "string"
}
```

### Chore
**API Format**:
```json
{
  "description": "string",
  "time": "07:25:00",
  "date": "2025-10-30",
  "userId": 1
}
```

### AI Chat Request
**API Format**:
```json
{
  "sessionId": "session-1735654321-abc123",
  "message": "How can I add a new user?"
}
```

**Response**:
```json
{
  "response": "AI-generated response here"
}
```

**App Format**:
```javascript
{
  id: 1,
  title: "description",
  description: "",
  date: "2025-10-30T07:25:00",
  userId: 1
}
```

## Error Handling
- Console errors logged for debugging
- Alert messages shown to user on failures
- Graceful fallback for bot assistant

## Starting the App

1. Make sure backend is running on `http://localhost:8080`
2. Run `npm run dev` to start the frontend
3. The app will automatically fetch users and chores from the backend

## Notes
- No localStorage fallback - app requires backend connection
- Date format: `yyyy-MM-dd` for API calls
- Time format: `HH:mm:ss` for API calls
