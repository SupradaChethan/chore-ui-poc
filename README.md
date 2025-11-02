# Chore Calendar UI - Proof of Concept

A mobile-friendly chores calendar application built with React and Vite. This app helps manage daily chores across multiple users with a clean, intuitive interface.

## Features

- **User Management**: Add, edit, and delete users with customizable colors
- **Chore Scheduling**: Create, edit, and delete chores with specific times and dates
- **Day Navigation**: Browse through dates with previous/next day navigation or jump to today
- **Column-Based Layout**: Each user has their own color-coded column showing their chores
- **AI Calendar Assistant**: Interactive chatbot that helps manage users and chores via natural language commands
- **Mobile-Friendly**: Responsive design optimized for mobile devices

## Tech Stack

- **Frontend**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Date Handling**: date-fns 4.1.0
- **Backend API**: Connects to a REST API at `http://localhost:8080/api/v1`

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- Backend API server running on port 8080

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Integration

The app expects a backend API with the following endpoints:

- `GET/POST /api/v1/users` - User management
- `GET/POST /api/v1/chores` - Chore management
- `POST /api/v1/assistant/chat` - AI assistant chat

## Calendar Assistant Commands

The built-in AI assistant supports commands like:

- "add user [name]" - Add a new user
- "add chore for [user]" - Create a chore for a specific user
- "list users" - Show all users
- "list chores" - Show today's chores
- "today" - Jump to today's date
- "help" - Show available commands
