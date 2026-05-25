# PainPointFinder

**Discover real problems. Validate before you build.**

AI-powered platform that discovers real-world problems from 500+ platforms and validates startup ideas.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Axios, Recharts, React Router
- **Backend:** Node.js, Express, MongoDB, BullMQ, Redis, JWT, OpenAI

## Setup

### 1. Install dependencies

```bash
cd painpointfinder
npm run install:all
```

### 2. Configure environment

Fill in `painpointfinder/.env`:

```
MONGODB_URI=mongodb://localhost:27017/painpointfinder
JWT_SECRET=your_secret_here
OPENAI_API_KEY=sk-...
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USERNAME=
REDDIT_PASSWORD=
YOUTUBE_API_KEY=
NEWS_API_KEY=
APIFY_API_TOKEN=
PORT=5000
```

### 3. Start MongoDB (and Redis optionally)

```bash
# MongoDB must be running locally or use Atlas URI
# Redis optional — BullMQ queue degrades gracefully if unavailable
```

### 4. Run the project

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/find` | Search & discover problems |
| GET | `/api/find/history` | Search history |
| GET | `/api/find/trends` | Trend analytics |
| POST | `/api/finalize` | AI validation report |
