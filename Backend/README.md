# 🚀 PostBoard Backend

Internal file and message sharing platform for Adroit360. Built with Node.js, Express, MongoDB, and modern security best practices.

## 📋 Features

- **User Authentication**
  - Email-based signup with OTP verification
  - Secure login with JWT tokens
  - Password recovery via email
  - Role-based access control (employee/admin)
  - Session management with refresh tokens

- **Content Management**
  - Upload single files and folders
  - Create messages and links
  - Folder hierarchy with parent-child relationships
  - Multiple file type support (images, videos, audio, documents, code)

- **Sharing & Access**
  - Share content with specific users or organization-wide
  - Decode key generation for shared files
  - Individual share tracking with timestamps

- **Security Features**
  - Password hashing with bcryptjs
  - HttpOnly cookies for refresh tokens
  - Rate limiting on sensitive endpoints
  - Input validation and sanitization
  - CORS protection
  - Helmet security headers

- **File Management**
  - Cloudinary integration for file storage
  - Automatic trash cleanup after 50 days
  - File encoding/decoding
  - Search functionality

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors, express-rate-limit

## 📦 Installation

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB instance (local or Atlas)
- Cloudinary account
- Gmail account (for email notifications)

### Setup

1. **Clone and navigate to backend**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   - `MONGO_URI`: MongoDB connection string
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`: Random secret keys
   - `SMTP_USER`, `SMTP_PASS`: Gmail app password
   - `CLOUDINARY_*`: Cloudinary API credentials
   - `CLIENT_URL`: Frontend URL (e.g., `http://localhost:5173`)

3. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

The API will be available at `http://localhost:5000/api`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Content
- `POST /api/content/upload` - Upload single file
- `POST /api/content/upload-folder` - Upload folder
- `POST /api/content/folder` - Create folder
- `POST /api/content/message` - Create message
- `POST /api/content/link` - Create link
- `GET /api/content/section/:section` - Get section contents
- `GET /api/content/search` - Search contents
- `GET /api/content/:id` - Get single content
- `PATCH /api/content/:id` - Update content
- `POST /api/content/:id/share` - Share content
- `POST /api/content/:id/encode` - Encode content
- `POST /api/content/:id/decode` - Decode content
- `DELETE /api/content/:id` - Move to trash
- `PATCH /api/content/:id/restore` - Restore from trash
- `DELETE /api/content/:id/permanent` - Permanently delete

## 🗂️ Project Structure

```
Backend/
├── config/          # Configuration files
│   ├── db.js       # MongoDB connection
│   ├── cloudinary.js
│   ├── mailer.js
│   └── multer.js
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/         # Mongoose schemas
├── routes/         # API routes
├── utils/          # Helper functions
├── validators/     # Input validation rules
├── app.js          # Express app setup
├── server.js       # Server entry point
└── package.json
```

## 🔐 Environment Variables

See `.env.example` for all required variables.

**Critical Variables**:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for access tokens
- `SMTP_USER`/`SMTP_PASS` - Email credentials

## 📝 Middleware

- **Authentication**: JWT verification, user validation
- **Error Handling**: Global error handler with standardized responses
- **Validation**: express-validator for input validation
- **Rate Limiting**: DDoS protection on auth endpoints
- **CORS**: Cross-origin request handling

## 🚀 Development Tips

- Use `npm run dev` for development with auto-reload
- Check logs for detailed error information
- Use Postman/Thunder Client to test endpoints
- Ensure MongoDB is running before starting server
- Check email configuration for OTP delivery

## 📊 Database

PostBoard uses MongoDB with three main collections:
- **Users** - User accounts and profiles
- **Contents** - Files, folders, messages, links
- **PendingUsers** - Email verification during signup

## 🛡️ Security Considerations

- Passwords are hashed with bcryptjs
- Tokens expire and must be refreshed
- Refresh tokens are stored in HttpOnly cookies
- Rate limiting prevents brute force attacks
- Input validation prevents injection attacks
- CORS restricts cross-origin requests

## 📝 License

ISC

## 👥 Support

For issues or questions, please contact the development team.
