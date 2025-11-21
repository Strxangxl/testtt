# Urgent Note Sender

A focused MERN + Material UI application that lets students send a single, 24-hour note to trusted friends even when traditional social media tools are blocked. Every note is short, expires automatically, and keeps the experience intentionally minimal so it cannot turn into a chat app.

## Key Capabilities

- **Private friend model** – add friends directly by username, accept or reject requests, and never expose a global user directory.
- **Urgent micro-notes** – text-only notes limited to 300 characters to keep messages quick and purposeful.
- **Auto-expiring storage** – MongoDB TTL index guarantees that every note is removed 24 hours after creation.
- **Live delivery + read receipts** – the backend streams server-sent events (SSE) so browsers can show instant inbox updates and read confirmations.
- **Optional browser push nudges** – when permission is granted, new notes trigger a native notification to pull the recipient back to the site.

## Tech Stack

- **Frontend:** React (Vite) + Material UI, Axios, React Router
- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT auth, SSE notification stream

## Getting Started

### 1. Configure the API

```bash
cd server
cp .env.example .env   # Update Mongo connection + JWT secret as needed
npm install
npm run dev            # or npm start for production mode
```

Environment variables used by the server:

| Name | Description |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `CLIENT_ORIGIN` | Comma-separated origins allowed by CORS/SSE |

### 2. Launch the web client

```bash
cd client
npm install
npm run dev   # Runs Vite on http://localhost:5173
```

Create a file named `.env` (optional) inside `client/` if you need to override the API origin:

```
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Use the app

1. Register with email, password, and a unique username.
2. Add a friend by typing their username exactly. They must accept before either side can send notes.
3. Compose a short message (max 300 characters) and hit send.
4. The recipient gets an instant inbox entry and, if permitted, a browser notification. Notes expire automatically after 24 hours.

## API Overview

| Endpoint | Description |
| --- | --- |
| `POST /api/auth/register` · `POST /api/auth/login` | Email/username authentication that returns a JWT. |
| `GET /api/auth/me` | Returns the authenticated user profile + friend ids. |
| `POST /api/friends/request` | Send a one-to-one friend request (`username` body param). |
| `POST /api/friends/respond` | Accept or reject a request (`requestId`, `action`). |
| `GET /api/friends` | List accepted friends. |
| `GET /api/friends/requests` | Pending incoming/outgoing requests. |
| `POST /api/notes` | Send a note to a friend (max 300 chars). |
| `GET /api/notes/inbox` · `GET /api/notes/outbox` | Active notes received/sent within the last 24 hours. |
| `POST /api/notes/:id/read` | Marks a note as read and triggers a read receipt SSE event. |
| `DELETE /api/notes/:id` | Manually clear a note from the inbox (auto-delete still enforces at 24h). |
| `GET /api/notes/stream?token=JWT` | SSE stream for live note + status events. |

## Implementation Notes

- MongoDB TTL ensures expired notes are dropped even if the app is offline.
- The notification service keeps lightweight in-memory lists of active SSE clients keyed by user id.
- The React dashboard listens to the SSE channel, updates inbox/outbox state in real time, and optionally triggers the browser notification API.
- UI elements rely entirely on Material UI components to keep styling consistent and accessible.

Feel free to extend this foundation with service workers, deployable notification services, or alternative auth flows as needed.
