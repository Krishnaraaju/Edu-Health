# 🏥 Privacy-first Health & Education Assistant

A comprehensive, privacy-focused health and education platform with AI-powered chat, personalized content feeds, and multi-language support (English & Hindi). Built with a modern tech stack featuring React, React Native, Node.js, and MongoDB.

![CI/CD](https://github.com/YOUR_USERNAME/healthcare/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🔐 Privacy-First Design
- On-device personalization scoring
- Minimal data collection with explicit consent
- Secure JWT authentication
- No third-party tracking

### 🤖 AI-Powered Health Assistant
- Intelligent chatbot with health knowledge
- Emergency detection and crisis resources
- Built-in safety disclaimers
- Content moderation pipeline

### 📱 Multi-Platform
- **Web PWA** - React + Vite + Tailwind CSS
- **Mobile** - React Native + Expo
- **Backend** - Node.js + Express + MongoDB

### 🌍 Accessibility
- Multi-language support (English, Hindi)
- Voice input/output (Web Speech API, expo-speech)
- Offline-first architecture
- Responsive design

## 🏗️ Architecture

```
healthcare/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── index.js         # Server entry
│   ├── tests/               # Jest test suites
│   └── Dockerfile           # Production container
├── web/                     # React PWA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── i18n.js          # Translations
│   └── public/              # Static assets
├── mobile/                  # React Native Expo app
│   ├── src/
│   │   ├── context/         # Auth & i18n providers
│   │   ├── screens/         # Screen components
│   │   └── services/        # API client
│   └── App.js               # Entry point
├── seed/                    # Database seed scripts
├── docker-compose.yml       # Local development
└── .github/workflows/       # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose
- MongoDB (or use Docker)

### 1. Clone and Setup

```bash
git clone https://github.com/YOUR_USERNAME/healthcare.git
cd healthcare
```

### 2. Start Backend with Docker

```bash
# Start MongoDB and seed database
docker-compose up -d

# Or manually:
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Start Web App

```bash
cd web
npm install
npm run dev
# Open http://localhost:5173
```

### 4. Start Mobile App

```bash
cd mobile
npm install
npx expo start
# Scan QR with Expo Go app
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/healthcare

# Authentication
JWT_SECRET=your-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# LLM Provider
LLM_PROVIDER=openai  # or 'local'
OPENAI_API_KEY=your-openai-key
LOCAL_LLM_ENDPOINT=http://localhost:11434

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Moderation
MODERATION_ENABLED=true
```

### Web Environment Variables

Create `web/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/preferences` | PUT | Update preferences |

### Content

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/content` | GET | List content (paginated) |
| `/api/content/:id` | GET | Get content by ID |
| `/api/content/:id/like` | POST | Like content |
| `/api/feed` | GET | Personalized feed |
| `/api/feed/trending` | GET | Trending content |

### Chat

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message to AI |
| `/api/chat` | GET | Get conversation history |
| `/api/chat/:id` | GET | Get specific conversation |
| `/api/chat/emergency` | POST | Check for emergency |

### Moderation (Admin)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/moderation/check` | POST | Check text for moderation |
| `/api/moderation/flags` | GET | List flagged content |
| `/api/moderation/flags/:id` | PUT | Update flag status |

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm test -- --coverage      # With coverage
npm test -- --watch         # Watch mode
```

### Run Web Tests
```bash
cd web
npm test                    # Run all tests
npm test -- --run          # Single run
```

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Password Security**: bcrypt hashing
- **Rate Limiting**: Global and per-endpoint limits
- **Input Validation**: express-validator schemas
- **Content Moderation**: Keyword + LLM-based filtering
- **Emergency Detection**: Crisis keyword recognition
- **Health Disclaimers**: Automatic safety notices
- **CORS Protection**: Configured origins
- **Security Headers**: Helmet.js middleware

## 🌐 Deployment

### Docker Production Build

```bash
# Build backend image
cd backend
docker build -t healthcare-backend:latest .

# Run with environment variables
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI=your-mongodb-uri \
  -e JWT_SECRET=your-secret \
  healthcare-backend:latest
```

### CI/CD Pipeline

The project includes GitHub Actions for:
- Automated testing on push/PR
- Linting and code quality checks
- Docker image building
- Security vulnerability scanning
- Deployment hooks (configure per your hosting)

## 📊 Project Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Architecture & Database | ✅ Complete |
| Phase 2 | Backend Core APIs | ✅ Complete |
| Phase 3 | Web Frontend (PWA) | ✅ Complete |
| Phase 4 | Mobile App (Expo) | ✅ Complete |
| Phase 5 | AI Safety & Personalization | ✅ Complete |
| Phase 6 | Testing & CI/CD | ✅ Complete |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Emergency helplines referenced are for India (112, NIMHANS, iCall)
- Health information is for educational purposes only
- Built with ❤️ for accessible healthcare education

---

**⚠️ Disclaimer**: This application provides health information for educational purposes only. Always consult healthcare professionals for medical advice, diagnosis, or treatment.
