# WorkNest Backend

A comprehensive backend API for WorkNest - a collaborative project management application with real-time features.

## 🚀 Features

### Core Functionality

- **🔐 Authentication System** - Secure user registration and login with JWT tokens
- **📁 Project Management** - Create, update, and manage collaborative projects
- **✅ Task Management** - Create, assign, track, and manage tasks within projects
- **💬 Real-time Messaging** - Instant chat functionality within project rooms
- **📎 File Management** - Upload and share files using Cloudinary integration
- **👤 User Management** - User profiles, updates, and search functionality

### Technical Features

- **🔄 Real-time Updates** - Socket.io integration for live notifications
- **🛡️ Security** - JWT authentication, rate limiting, helmet security headers
- **✅ Input Validation** - Zod schema validation for all inputs
- **📝 Logging** - Winston logger for error and activity tracking
- **⚡ API Rate Limiting** - Protection against brute-force attacks
- **☁️ Cloud Storage** - Cloudinary integration for file uploads
- **🐳 Docker Support** - PostgreSQL database in containerized environment

## 🏗️ Tech Stack

| Category       | Technology                |
| -------------- | ------------------------- |
| Runtime        | Node.js                   |
| Language       | TypeScript                |
| Framework      | Express.js                |
| Database       | PostgreSQL                |
| ORM            | Prisma                    |
| Real-time      | Socket.io                 |
| Authentication | JWT (jsonwebtoken)        |
| Validation     | Zod                       |
| File Storage   | Cloudinary                |
| Logging        | Winston                   |
| Rate Limiting  | express-rate-limit        |
| Security       | Helmet, CORS, Compression |
| Development    | nodemon, tsx, ts-node     |

## 📁 Project Structure

```
WorkNest-Backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts               # Application entry point
│   ├── routes.ts              # API routes aggregation
│   ├── config/
│   │   ├── cloudinary.ts      # Cloudinary configuration
│   │   ├── db.ts              # Prisma database client
│   │   ├── env.ts             # Environment variables validation
│   │   └── socket.ts          # Socket.io setup
│   ├── constants/
│   │   └── statusCodes.ts     # HTTP status codes
│   ├── middlewares/
│   │   ├── auth.middleware.ts # JWT authentication
│   │   ├── error.middleware.ts# Global error handling
│   │   ├── rateLimit.middleware.ts # API rate limiting
│   │   └── validation.middleware.ts # Zod schema validation
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.service.ts
│   │   ├── file/              # File management module
│   │   ├── messages/          # Messaging module
│   │   ├── projects/          # Project management module
│   │   ├── tasks/             # Task management module
│   │   └── user/              # User management module
│   ├── startup/
│   │   └── prod.ts            # Production middleware setup
│   └── utils/
│       ├── AppError.ts        # Custom error class
│       ├── catchAsync.ts      # Async error wrapper
│       ├── permissions.ts     # Authorization utilities
│       └── responseObject.ts  # API response formatter
├── docker-compose.yml         # Docker configuration
├── nodemon.json               # Nodemon configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

## 📦 API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/auth/register` | Register a new user     |
| POST   | `/auth/login`    | Login and get JWT token |

### Users (`/api/v1/user`)

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| GET    | `/user/me`             | Get current user profile |
| PATCH  | `/user/me`             | Update user details      |
| GET    | `/user/search?q=email` | Search users by email    |

### Projects (`/api/v1/project`)

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| POST   | `/project`               | Create a new project       |
| GET    | `/project`               | Get all user's projects    |
| GET    | `/project/:id/members`   | Get project members        |
| POST   | `/project/add-member`    | Add member to project      |
| POST   | `/project/remove-member` | Remove member from project |
| PATCH  | `/project/:id`           | Update project details     |
| DELETE | `/project/:id`           | Delete project             |

### Tasks (`/api/v1/tasks`)

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| POST   | `/tasks`                | Create a new task       |
| GET    | `/tasks/:id`            | Get tasks for a project |
| PATCH  | `/tasks/:taskId`        | Update task status      |
| PATCH  | `/tasks/:taskId/assign` | Assign task to user     |
| DELETE | `/tasks/:taskId`        | Delete task             |

### Messages (`/api/v1/message`)

| Method | Endpoint              | Description      |
| ------ | --------------------- | ---------------- |
| POST   | `/message`            | Send a message   |
| GET    | `/message/:projectId` | Get chat history |

### Files (`/api/v1/file`)

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | `/file/upload`     | Upload a file     |
| GET    | `/file/:projectId` | Get project files |
| DELETE | `/file/:fileId`    | Delete a file     |

## 🔌 Socket.io Events

### Authentication

Socket.io connections require JWT authentication. Pass the JWT token in the handshake query or headers:

```javascript
const socket = io("http://localhost:5050", {
  query: { token: "your-jwt-token" },
});
```

Or in headers:

```javascript
const socket = io("http://localhost:5050", {
  extraHeaders: { token: "your-jwt-token" },
});
```

### Client → Server

| Event          | Payload     | Description         |
| -------------- | ----------- | ------------------- |
| `join_project` | `projectId` | Join a project room |

### Server → Client

| Event                | Payload         | Description           |
| -------------------- | --------------- | --------------------- |
| `invited_to_project` | `{ projectId }` | User added to project |
| `new_message`        | `Message`       | New message sent      |
| `task_created`       | `Task`          | New task created      |
| `task_updated`       | `Task`          | Task status updated   |
| `task_assigned`      | `Task`          | Task assigned to user |
| `new_file`           | `File`          | New file uploaded     |

## 🗄️ Database Schema

### Models

**User**

- `id` - UUID primary key
- `name` - Optional display name
- `email` - Unique email address
- `password` - Hashed password
- Relations: projects, projectMembers, tasks, messages, files

**Project**

- `id` - UUID primary key
- `name` - Project name
- `ownerId` - Owner user ID
- `description` - Optional description
- Relations: owner, members, tasks, messages, files

**ProjectMember**

- `id` - UUID primary key
- `userId` - User ID
- `projectId` - Project ID
- `role` - "owner" or "member"
- Unique: `[userId, projectId]`

**Task**

- `id` - UUID primary key
- `title` - Task title
- `description` - Optional description
- `status` - "todo", "in_progress", or "done"
- `projectId` - Project ID
- `assignedToId` - Optional assignee ID

**Message**

- `id` - UUID primary key
- `content` - Message text
- `projectId` - Project ID
- `senderId` - Sender user ID

**File**

- `id` - UUID primary key
- `name` - File name
- `url` - Cloudinary URL
- `size` - File size in bytes
- `projectId` - Project ID
- `uploaderId` - Uploader user ID

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (or use Docker)
- Cloudinary account

### Installation

1. **Clone the repository**

   ```bash
   cd WorkNest-Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env  # If you have an example file
   ```

   Or create `.env` with the following:

   ```env
   NODE_ENV=development
   PORT=5050
   DATABASE_URL=postgresql://postgres@localhost:5433/worknest
   JWT_SECRET=your-super-secret-key-at-least-32-characters
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Set up the database**

   ```bash
   # Using Docker (recommended)
   npm run dock:start

   # Or use your local PostgreSQL
   ```

5. **Run database migrations**

   ```bash
   npm run db:setup
   ```

6. **Start the development server**

   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Or build and run production server
   npm run build
   npm start
   ```

   The server will be running at `http://localhost:5050`

### Available Scripts

| Script                | Description                        |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Start development server with tsx  |
| `npm run build`       | Build for production               |
| `npm run start`       | Start production server            |
| `npm run db:migrate`  | Run Prisma migrations              |
| `npm run db:push`     | Push schema to database            |
| `npm run db:generate` | Generate Prisma client             |
| `npm run db:setup`    | Run migrations and generate client |
| `npm run db:view`     | Open Prisma Studio                 |
| `npm run dock:start`  | Start Docker containers            |
| `npm run dock:stop`   | Stop Docker containers             |

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - 100 requests/15min for API, 5 attempts/hour for auth
- **Helmet** - Security headers (CSP, HSTS, etc.)
- **CORS** - Cross-origin resource sharing control
- **Input Validation** - Zod schemas for all inputs
- **Error Handling** - Global error middleware with logging

## 📝 API Response Format

All API responses follow this structure:

```typescript
{
  message: string; // Human-readable message
  status: number; // HTTP status code
  success: boolean; // Indicates success/failure
  data: object; // Response data
}
```

Example success response:

```json
{
  "message": "Project created successfully",
  "status": 201,
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Project",
    "ownerId": "uuid"
  }
}
```

Example error response:

```json
{
  "message": "Validation Error",
  "status": 400,
  "success": false,
  "data": [
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🧪 Error Handling

The application uses a centralized error handling middleware that:

- Catches all errors globally
- Logs errors with Winston (error.log for 5xx, combined.log for all)
- Returns appropriate HTTP status codes
- Includes stack traces only in development mode

### Custom Error Classes

```typescript
// Custom operational error
throw new AppError("User not found", 404);
```

## 🐳 Docker Support

Start PostgreSQL with Docker:

```bash
# Start the container
npm run dock:start

# Stop the container
npm run dock:stop
```

Docker configuration in `docker-compose.yml`:

- PostgreSQL 17 Alpine
- Port 5433 mapped to host
- Persistent volume for data

## 📄 License

ISC License

## 👨‍💻 Author

Developed with ❤️ by Simon Adama for collaborative project management
