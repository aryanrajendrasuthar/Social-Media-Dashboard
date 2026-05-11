# Social Media Dashboard

A full-stack Instagram/Twitter-inspired social media application built with React, Node.js, MongoDB, Redis, and Socket.io.

## Features

- **Authentication** — JWT-based login/register with profile setup and avatar upload
- **Posts** — Create text posts with optional images, hashtag extraction, 2200 character limit
- **Real-time feed** — Infinite scroll with cursor-based pagination, Redis-cached feed aggregation
- **Interactions** — Like, comment, share posts with optimistic UI updates
- **Follow system** — Follow/unfollow users, followers/following lists
- **Real-time notifications** — Socket.io push notifications for likes, comments, follows, shares
- **Explore** — Search posts and users, trending hashtags sidebar
- **User profiles** — Grid/list view toggle, stats, cover photo, post pagination
- **Online presence** — Real-time online user indicators via Socket.io

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v3 |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB + Mongoose |
| Cache | Redis (ioredis) |
| Auth | JWT + bcryptjs |
| Uploads | Multer (disk storage) |
| Containers | Docker + Docker Compose |

## Project Structure

```
social-media-dashboard/
├── backend/
│   ├── config/          # DB, Redis, Socket.io setup
│   ├── controllers/     # Route handlers (auth, posts, users, notifications)
│   ├── middleware/       # JWT protect, Multer upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── server.js        # Entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, Feed, Common components
│   │   ├── context/     # AuthContext, SocketContext
│   │   ├── pages/       # Home, Explore, Profile, Notifications, Settings
│   │   ├── services/    # Axios API service
│   │   └── types/       # TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Docker & Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repo
git clone <repo-url>
cd social-media-dashboard

# Set up backend environment
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET to a secure random string

# Start all services
docker-compose up --build
```

Visit [http://localhost:3000](http://localhost:3000)

### Option 2: Local Development

**Backend:**

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, Redis settings, and a JWT secret

npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Environment Variables

Create `backend/.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/social_dashboard
JWT_SECRET=your_secure_random_secret_here
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile + avatar |

### Posts
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/posts/feed` | Paginated feed |
| POST | `/api/posts` | Create post |
| POST | `/api/posts/:id/like` | Toggle like |
| GET | `/api/posts/:id/comments` | Get comments |
| POST | `/api/posts/:id/comments` | Add comment |
| GET | `/api/posts/trending` | Trending hashtags |
| GET | `/api/posts/search?q=` | Search posts |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/:username` | Get profile |
| GET | `/api/users/:username/posts` | Get user posts |
| POST | `/api/users/:userId/follow` | Toggle follow |
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/suggested` | Suggested users |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | Get all notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/read-all` | Mark all as read |

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `notification:new` | Server → Client | New notification pushed |
| `user:online` | Server → Client | User came online |
| `user:offline` | Server → Client | User went offline |

## License

MIT
