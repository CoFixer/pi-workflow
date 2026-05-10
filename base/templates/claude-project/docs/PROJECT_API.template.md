# API Reference: {PROJECT_NAME}

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.{PROJECT_NAME}.com`

## Authentication

This API uses **httpOnly cookie-based authentication** for secure session management.

### 🍪 For Browser/Web Clients (PRIMARY METHOD)

Authentication is handled automatically via httpOnly cookies:

**Flow:**
1. Client calls `POST /auth/login` with credentials
2. Backend validates and sets `accessToken` and `refreshToken` as httpOnly cookies via `Set-Cookie` header
3. All subsequent requests automatically include cookies (browser handles this)
4. Frontend uses `withCredentials: true` in axios/fetch configuration
5. **NO tokens stored in localStorage or sessionStorage**

**Cookie Configuration:**
```
HttpOnly: true       # JavaScript cannot access (XSS protection)
Secure: true         # HTTPS only (production)
SameSite: Strict     # CSRF protection (production)
Path: /
Max-Age: 86400       # 24 hours (access token)
```

**Frontend Setup:**
```javascript
// axios configuration
axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,  // REQUIRED to include cookies
})
```

**Backend CORS:**
```javascript
// NestJS main.ts
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true  // REQUIRED to allow cookies
})
```

### 🔑 For API Clients/External Services (FALLBACK)

Bearer token authentication is supported for non-browser clients:

```
Authorization: Bearer <token>
```

Obtain token via login endpoint, then pass in Authorization header for subsequent requests.

**When to use:**
- Mobile apps (non-web views)
- External API clients (Postman, curl, third-party)
- Server-to-server communication
- Command-line tools

**Note**: Web browsers should ALWAYS use cookies for security.

## Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh token | Yes |
| POST | `/auth/logout` | Logout user | Yes |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users | Yes |
| GET | `/users/:id` | Get user by ID | Yes |
| PATCH | `/users/:id` | Update user | Yes |
| DELETE | `/users/:id` | Delete user | Yes |

## Request/Response Examples

### Login

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false  // Optional: extends cookie expiration to 30 days
}
```

**Response Body:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

**Response Headers (Set-Cookie):**
```http
Set-Cookie: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
```

**CRITICAL NOTES:**

1. **Tokens are NOT in response body** - only user data is returned
2. **Tokens are set via Set-Cookie headers** - browser stores automatically
3. **Frontend does NOT manually store tokens** - security vulnerability
4. **Cookies automatically included in subsequent requests**
5. **httpOnly flag prevents JavaScript access** - XSS protection

**Frontend Implementation:**
```typescript
// Login request
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Backend sets cookies automatically via Set-Cookie header
// No localStorage.setItem() needed - in fact, DON'T do this!

// Dispatch user to Redux/state (NO tokens)
dispatch(loginSuccess(response.data.user));

// Navigate to dashboard
navigate('/dashboard');

// All subsequent API calls automatically include cookies
const data = await api.get('/protected-endpoint');
// No need to add Authorization header - cookies sent automatically
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401
}
```

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
