# 📘 PostBoard - Project Setup & Development Guide

Complete guide to setup and develop PostBoard - internal file and message sharing platform.

## 🎯 Quick Start

### Prerequisites

- Node.js v16+
- npm or yarn
- MongoDB instance (local or Atlas)
- Cloudinary account
- Gmail account (for notifications)

### 5-Minute Setup

```bash
# Backend setup
cd Backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend setup (in new terminal)
cd Frontend
npm install
cp .env.example .env
npm run dev
```

**Backend**: http://localhost:5000/api  
**Frontend**: http://localhost:5173

---

## 🔐 Environment Configuration

### Backend `.env`

**Required Variables**:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://user:pass@host:port/postboard

# Frontend
CLIENT_URL=http://localhost:5173

# JWT
JWT_SECRET=your_random_secret_here
JWT_REFRESH_SECRET=your_random_refresh_secret_here

# Email (Gmail)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Generate secure secrets**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

---

## 📁 Project Architecture

```
PostBoard/
├── Backend/                 # Node.js + Express
│   ├── config/             # Configurations
│   ├── controllers/        # Business logic
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   ├── validators/        # Input validation
│   ├── app.js             # Express app
│   ├── server.js          # Entry point
│   └── package.json
│
└── Frontend/               # React + Vite
    ├── src/
    │   ├── api/          # API clients
    │   ├── components/   # React components
    │   ├── hooks/        # Custom hooks
    │   ├── pages/        # Page components
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Development Workflow

### Start Both Servers

**Terminal 1 - Backend**:

```bash
cd Backend
npm run dev
# Output: 🚀 PostBoard server running on port 5000
```

**Terminal 2 - Frontend**:

```bash
cd Frontend
npm run dev
# Output: ➜ Local:   http://localhost:5173/
```

### API Testing

Use Postman/Thunder Client:

- **Base URL**: `http://localhost:5000/api`
- **Health Check**: `GET /health`

### File Changes

- Backend: Changes auto-reload with nodemon
- Frontend: Changes hot-reload with Vite

---

## 🔌 API Layer Architecture

### Frontend API Organization

**`src/api/axios.js`** - Axios instance with interceptors:

- Automatic token injection
- 401 error handling with token refresh
- Error logging

**`src/api/auth.api.js`** - Authentication endpoints:

```javascript
signup, login, logout, verifyOTP, resetPassword, etc.
```

**`src/api/content.api.js`** - Content endpoints:

```javascript
uploadFile, createFolder, shareContent, searchContents, etc.
```

### Frontend Hooks

**`src/hooks/useAuth.js`** - Auth state management:

```javascript
useAuth(); // Get current user
useLogin(); // Login mutation
useLogout(); // Logout mutation
useIsAuthenticated(); // Check auth status
```

**`src/hooks/useContent.js`** - Content state management:

```javascript
useSectionContents(); // Get section contents
useUploadFile(); // Upload mutation
useShareContent(); // Share mutation
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       ├─ POST /auth/signup
       │  └─ OTP sent to email
       │
       ├─ POST /auth/verify-otp
       │  └─ Account created, access token returned
       │
       ├─ POST /auth/login
       │  └─ Access token + refresh token (in cookie)
       │
       └─ Auto-refresh on 401
          └─ POST /auth/refresh-token
             └─ New access token returned
```

---

## 🧪 Testing API Endpoints

### Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "SecurePass123"
  }'
```

### Protected Endpoint

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📚 Key Components

### ProtectedRoute

Wraps routes requiring authentication:

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/>
```

### ErrorBoundary

Catches React errors globally:

```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Toast Notifications

User feedback component:

```jsx
<Toast message="Success!" type="success" duration={3000} />
```

---

## 🛠️ Common Tasks

### Add New API Endpoint

1. **Backend** - `routes/contentRoutes.js`:

```javascript
router.post("/new-action", protect, validate, newActionController);
```

2. **Backend** - `controllers/contentController.js`:

```javascript
exports.newActionController = async (req, res) => {
  // Logic here
};
```

3. **Frontend** - `api/content.api.js`:

```javascript
export const newAction = async (data) => {
  const { data: response } = await api.post("/content/new-action", data);
  return response;
};
```

4. **Frontend** - `hooks/useContent.js`:

```javascript
export const useNewAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: newAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
};
```

### Debug Issues

**Frontend**:

- Check Network tab (DevTools)
- Check Console for errors
- Verify `VITE_API_URL` is correct

**Backend**:

- Check terminal logs
- Verify MongoDB connection
- Check `.env` variables

---

## 📦 Dependencies

### Backend Key Packages

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing
- `cloudinary` - File storage

### Frontend Key Packages

- `react` - UI framework
- `vite` - Build tool
- `react-query` - Server state
- `axios` - HTTP client
- `tailwindcss` - Styling

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy `dist/` folder
```

### Backend (Heroku/Railway)

```bash
npm start
# Set environment variables in platform
```

---

## 📝 Git Workflow

```bash
# Branch naming
feature/feature-name
bugfix/bug-name
hotfix/critical-fix

# Commit messages
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Refactor code
```

---

## ❓ Troubleshooting

### Port Already in Use

```bash
# Backend (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Backend (Mac/Linux)
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error

- Verify connection string in `.env`
- Check MongoDB is running
- Check IP whitelist in MongoDB Atlas

### CORS Errors

- Verify `CLIENT_URL` in backend `.env`
- Check frontend `VITE_API_URL`
- Restart both servers

### Token Issues

- Clear localStorage
- Check token expiration
- Verify JWT secrets match

---

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Query Docs](https://tanstack.com/query/latest/)
- [Vite Docs](https://vitejs.dev/)

---

## 👥 Team

For questions or support, contact the development team.

Last Updated: June 2026
