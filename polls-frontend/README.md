# Polls & Voting App

A modern React TypeScript application for creating, voting on, and viewing poll results with real-time updates.

## Features

- 🔐 **Authentication**: Login/Register with JWT tokens
- 📊 **Poll Management**: Create, view, and manage polls
- 🗳️ **Voting**: Vote on polls with one vote per poll
- 📈 **Real-time Results**: Live charts with WebSocket updates
- 📱 **Responsive Design**: Mobile-first with Tailwind CSS
- ⚡ **Performance**: React Query for caching and state management

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **HTTP Client**: Axios with interceptors
- **Real-time**: WebSocket client

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd polls-voting-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API endpoints
REACT_APP_API_BASE=https://your-api-url.com
REACT_APP_WS_BASE=wss://your-websocket-url.com
```

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── api/                 # API configuration and hooks
│   ├── config.ts       # Axios instance with interceptors
│   ├── auth.ts         # Authentication API hooks
│   └── polls.ts        # Polls API hooks
├── components/         # Reusable UI components
│   ├── PollCard.tsx    # Poll card component
│   ├── PollForm.tsx    # Poll creation form
│   ├── VoteOptions.tsx # Voting interface
│   └── ResultsChart.tsx # Charts for results
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── CreatePoll.tsx  # Poll creation page
│   ├── PollDetail.tsx  # Poll detail page
│   └── MyPolls.tsx     # User's polls page
├── routes/             # Routing configuration
│   └── ProtectedRoute.tsx # Route protection
├── store/              # State management
│   └── auth.ts         # Authentication store
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── utils/              # Utility functions
│   ├── validators.ts   # Form validation schemas
│   └── websocket.ts    # WebSocket client
└── config/             # Configuration
    └── env.ts          # Environment configuration
```

## API Integration

The app is designed to work with a FastAPI backend. The API endpoints expected are:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `GET /users/me` - Get current user

### Polls
- `GET /polls` - List polls with pagination and search
- `GET /polls/:id` - Get poll details
- `POST /polls` - Create new poll
- `POST /polls/:id/vote` - Vote on poll
- `GET /polls/:id/results` - Get poll results
- `GET /polls/my` - Get user's polls

### WebSocket
- `ws://<API_BASE>/ws/polls/:id` - Real-time poll updates

## Features in Detail

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Persistent login state

### Poll Management
- Create polls with multiple options
- Form validation with Zod
- Search and pagination
- User-specific poll management

### Voting System
- One vote per poll per user
- Real-time vote counting
- Visual feedback for voted polls

### Real-time Updates
- WebSocket connection for live updates
- Fallback to polling every 5 seconds
- Automatic reconnection
- Live charts and statistics

### UI/UX
- Responsive design with Tailwind CSS
- Loading states and error handling
- Form validation with helpful messages
- Accessible components

## Development

### Code Style
- ESLint + Prettier for code formatting
- TypeScript strict mode
- Component-based architecture
- Custom hooks for API calls

### State Management
- Zustand for global state (auth)
- React Query for server state
- Local state with useState/useReducer

### Performance
- React Query caching
- Component memoization
- Lazy loading for routes
- Optimized re-renders

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `build` folder to your hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE` | Backend API URL | `https://api.example.com` |
| `REACT_APP_WS_BASE` | WebSocket URL | `wss://api.example.com` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
