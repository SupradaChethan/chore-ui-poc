Here are all the REST API endpoints available in the chore service:

  User Management Endpoints

  Base Path: /api/v1/users

  | Method | Endpoint           | Description             |
  |--------|--------------------|-------------------------|
  | GET    | /api/v1/users      | Get all users           |
  | GET    | /api/v1/users/{id} | Get user by ID          |
  | POST   | /api/v1/users      | Create a new user       |
  | PUT    | /api/v1/users/{id} | Update an existing user |
  | DELETE | /api/v1/users/{id} | Delete a user           |

  Request Body (POST/PUT):
  {
    "name": "string",
    "color": "string"
  }

  Chore Management Endpoints

  Base Path: /api/v1/chores

  | Method | Endpoint                                     | Description
                                 |
  |--------|----------------------------------------------|--------------------------    
  -------------------------------|
  | GET    | /api/v1/chores                               | Get all chores (optional     
  query param: ?date=2025-10-30) |
  | GET    | /api/v1/chores/{id}                          | Get chore by ID
                                 |
  | GET    | /api/v1/chores/user/{userId}?date=2025-10-30 | Get chores by user ID and    
   date (date required)          |
  | POST   | /api/v1/chores                               | Create a new chore
                                 |
  | PUT    | /api/v1/chores/{id}                          | Update an existing chore     
                                 |
  | DELETE | /api/v1/chores/{id}                          | Delete a chore
                                 |

  Request Body (POST/PUT):
  {
    "description": "string",
    "time": "07:25:00",
    "date": "2025-10-30",
    "userId": 1
  }

  AI Assistant Endpoints

  Base Path: /api/v1/assistant

  | Method | Endpoint                 | Description                     |
  |--------|--------------------------|---------------------------------|
  | POST   | /api/v1/assistant/chat   | Chat with the AI assistant      |
  | GET    | /api/v1/assistant/health | Check if the assistant is ready |

  Request Body (POST):
  {
    "message": "How can I add a new user?"
  }

  Response:
  {
    "response": "AI-generated response here"
  }