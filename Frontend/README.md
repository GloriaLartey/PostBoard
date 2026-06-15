# 🚀 PostBoard Frontend

Modern React application for PostBoard - internal file and message sharing platform. Built with React 19, Vite, TailwindCSS, and React Query.

## 🎯 Features

- **Authentication**
  - User signup with email verification
  - Secure login/logout
  - Password recovery
  - Session management with auto-refresh

- **Content Management**
  - File upload (single and bulk)
  - Folder management
  - Create messages and links
  - Search functionality

- **User Interface**
  - Responsive design with TailwindCSS
  - Grid/List view toggle
  - Real-time content updates
  - Toast notifications
  - Error boundaries

- **Sections**
  - Home - Recent activities
  - My Files - User uploads
  - Shared with Me - Received shares
  - Drafts - Draft content
  - Trash - Deleted items

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4
- **State Management**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Icons**: React Icons

## 📦 Installation

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Setup

1. **Navigate to frontend directory**

   ```bash
   cd Frontend
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

## 🚀 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🗂️ Project Structure

```
Frontend/
├── src/
│   ├── api/
│   │   ├── axios.js        # Axios instance with interceptors
│   │   ├── auth.api.js     # Authentication endpoints
│   │   └── content.api.js  # Content endpoints
│   ├── hooks/
│   │   ├── useAuth.js      # Auth queries and mutations
│   │   └── useContent.js   # Content queries and mutations
│   ├── components/
│   │   ├── ProtectedRoute.jsx    # Route protection
│   │   ├── ErrorBoundary.jsx     # Error handling
│   │   ├── Toast.jsx            # Notifications
│   │   └── [other components]
│   ├── pages/
│   │   ├── home.jsx
│   │   ├── hero.jsx
│   │   ├── login.jsx
│   │   ├── signUp.jsx
│   │   └── [other pages]
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vite.config.js
├── eslint.config.js
└── package.json
```

## 🔌 API Integration

### Custom Hooks

The application uses React Query hooks for data fetching:

```javascript
// Auth hooks
import {
  useAuth,
  useLogin,
  useLogout,
  useIsAuthenticated,
} from "@/hooks/useAuth";

// Content hooks
import {
  useSectionContents,
  useFolderContents,
  useSearchContents,
  useUploadFile,
  useShareContent,
} from "@/hooks/useContent";
```

### Axios Configuration

Automatic token injection and refresh:

- Attaches JWT tokens to requests
- Auto-refreshes tokens on 401 errors
- Handles failed request queuing during refresh
- Redirects to login on auth failure

## 🎨 Components

### ProtectedRoute

Wraps routes requiring authentication. Redirects to login if not authenticated.

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

Global error handling component catches React errors.

```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Toast

Simple notification component.

```jsx
<Toast
  message="Success!"
  type="success"
  duration={3000}
  onClose={() => setShowToast(false)}
/>
```

## 📊 State Management

React Query handles all server state:

- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

```javascript
const { data, isLoading, error } = useSectionContents("home");
const uploadMutation = useUploadFile();

// Execute mutation
uploadMutation.mutate(formData);
```

## 🔐 Authentication Flow

1. User signs up → OTP email sent
2. User verifies OTP → Account created
3. User logs in → Access token stored
4. Token expired → Auto-refresh with refresh token
5. Refresh fails → Redirect to login

## 🎯 Environment Setup

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

## 📱 Responsive Design

Built with TailwindCSS for mobile-first responsive design:

- Mobile (640px)
- Tablet (768px)
- Desktop (1024px+)

## 🧪 Development Tips

- Use React DevTools for component debugging
- Use React Query DevTools for server state debugging
- Check Network tab for API requests
- Use ESLint for code quality

## 🚀 Production Build

```bash
npm run build
```

Optimized build output in `dist/` directory ready for deployment.

## 📝 Styling

TailwindCSS v4 with utility classes. Customize in `index.css`.

## 🛠️ Troubleshooting

**API Connection Issues**

- Verify `VITE_API_URL` matches backend URL
- Check backend is running on correct port
- Clear browser cache and cookies

**Authentication Issues**

- Clear localStorage
- Check token expiration
- Verify JWT secret matches backend

**File Upload Issues**

- Check file size limits
- Verify Cloudinary configuration
- Check browser console for errors

## 📝 License

ISC

## 👥 Support

For issues or questions, please contact the development team.
