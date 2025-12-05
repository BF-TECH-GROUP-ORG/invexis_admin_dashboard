# Authentication Implementation Guide

## Overview

Your authentication system has been completely refactored to:
1. **Use Redux Global State** for storing access token and user data (not localStorage)
2. **Handle httpOnly Cookies** for refresh tokens (automatically managed by the browser)
3. **Support the New API Response Format** with `accessToken` and `user` fields
4. **Implement Secure Token Storage** with in-memory token storage and automatic session restoration

---

## Architecture

### Data Flow

```
User Login → LoginForm → dispatch(login thunk) 
  ↓
AuthService.login() → /api/auth/login
  ↓
Response: { ok: true, accessToken, user: {...} }
  ↓
AuthSlice.login.fulfilled → Redux Store (token + user) + Memory (token)
  ↓
loginForm redirects to /
  ↓
App initializes → AuthProvider → dispatch(restoreSession thunk)
  ↓
restoreSession uses refresh token from httpOnly cookie
  ↓
Redux state restored, user stays logged in
```

### Token Storage

| Storage | Token Type | Secure | Accessible |
|---------|-----------|--------|-----------|
| Redux State | Access Token | ✅ | Across components |
| Memory (authUtils) | Access Token | ✅ | For Axios requests |
| httpOnly Cookie | Refresh Token | ✅ | Only backend (automatic) |
| localStorage | ❌ REMOVED | N/A | N/A |

---

## Updated Files

### 1. `src/services/AuthService.js`
**Purpose**: API client for authentication endpoints

**Key Changes**:
- Added proper JSDoc documentation for each function
- Added `getMe()` function to fetch current user profile
- Added `changePassword()`, `requestOtpLogin()`, `verifyOtpLogin()` functions
- Updated `logout()` to gracefully handle errors (doesn't throw)

**Key Functions**:
```javascript
login(credentials)                    // POST /auth/login
registerSuperAdmin(payload)          // POST /auth/register
refreshToken()                       // POST /auth/refresh
logout()                             // POST /auth/logout
getMe()                              // GET /auth/me
```

---

### 2. `src/features/AuthSlice.js`
**Purpose**: Redux slice managing authentication state and async thunks

**Key Changes**:
- Simplified and documented all thunks
- `login` thunk now properly extracts `accessToken` and `user` from response
- `restoreSession` thunk calls `/auth/refresh` then `/auth/me`
- Token is stored in both Redux and memory via `setToken()`
- Better error handling with clear error messages
- Added state initialization tracking with `isInitialized` flag

**State Shape**:
```javascript
{
  auth: {
    user: null,                 // User object from server
    token: null,                // Access token (JWT)
    isAuthenticated: false,     // Logged in?
    status: "idle",             // idle, loading, succeeded, failed
    error: null,                // Error message
    isInitialized: false,       // App initialization complete?
  }
}
```

**Thunks**:
```javascript
dispatch(login({ identifier, password }))  // User login
dispatch(restoreSession())                 // Restore from refresh cookie
dispatch(performLogout())                  // Logout and clear state
```

---

### 3. `src/components/forms/LoginForm.jsx`
**Purpose**: User login form component

**Key Changes**:
- Now dispatches Redux `login` thunk instead of calling service directly
- Properly awaits async thunk result
- Checks if thunk was `fulfilled` or `rejected`
- Removed manual `setToken()`, `setAuthData()` calls (handled by thunk)
- Cleaner error handling

**Usage**:
```jsx
const result = await dispatch(login(credentials));
if (login.fulfilled.match(result)) {
  // Success - redirect
} else if (login.rejected.match(result)) {
  // Failure - show error
}
```

---

### 4. `src/lib/authUtils.js`
**Purpose**: Token management utility functions

**Key Changes**:
- Comprehensive JSDoc explaining why memory-only storage is secure
- Added `isAuthenticated()` function
- Legacy functions (`setRefreshToken`, `setUser`, etc.) are now no-ops with clear comments
- Clears legacy localStorage items on `removeToken()`
- Added debug logging for token operations

**Key Functions**:
```javascript
setToken(token)              // Store in memory
getToken()                   // Retrieve from memory
removeToken()                // Clear from memory + legacy localStorage
isAuthenticated()            // Check if token exists
```

---

### 5. `src/lib/axios.js`
**Purpose**: Axios instance with token and CSRF handling

**Key Changes**:
- Improved request interceptor with better logging
- Rewrote response interceptor with queue system for concurrent 401 errors
- Proper handling of token refresh using httpOnly cookie
- Better error messages for network issues
- Queue subscribers instead of promise array for better reliability

**Request Flow**:
1. Attach Authorization header with token from memory
2. Attach CSRF token from cookie (for non-GET requests)
3. Send request

**Response Flow (401 Unauthorized)**:
1. If already refreshing, queue this request
2. If first 401, start refresh process:
   - Call `/auth/refresh` (uses httpOnly cookie)
   - Get new token from response
   - Store in memory via `setToken()`
   - Notify all queued requests
3. Retry original request with new token
4. If refresh fails, clear token and redirect to `/auth/login`

---

## How It Works

### Login Flow

1. **User enters credentials** in LoginForm
2. **Form dispatches Redux thunk**: `dispatch(login({ identifier, password }))`
3. **Thunk calls API**:
   ```javascript
   POST /api/auth/login
   {
     identifier: "user@example.com",
     password: "password123"
   }
   ```
4. **Backend responds**:
   ```javascript
   {
     ok: true,
     accessToken: "eyJhbGc...",
     user: {
       _id: "692...",
       firstName: "John",
       lastName: "Doe",
       email: "john@example.com",
       role: "super_admin",
       ... // other user fields
     }
   }
   ```
5. **Thunk stores token and user**:
   - `setToken(accessToken)` → memory (authUtils)
   - Redux state updated with `token` and `user`
6. **AuthProvider doesn't see login** (you called dispatch directly)
7. **Form redirects** to `/` (dashboard)

### Session Restoration Flow

1. **User refreshes page** or revisits app
2. **AuthProvider mounts** in root layout
3. **Dispatches `restoreSession` thunk**:
   ```javascript
   await dispatch(restoreSession())
   ```
4. **Thunk calls `/auth/refresh`**:
   - Uses httpOnly refresh token cookie (automatically sent by browser)
   - Gets new `accessToken` from response
   - Stores in memory via `setToken()`
5. **Thunk calls `getMe()`**:
   - Uses new token from previous step
   - Gets current user profile
6. **Redux state updated** with token and user
7. **AuthProvider unmounts**, app renders normally
8. **User stays logged in** despite page refresh

### Logout Flow

1. **User clicks logout** in NavBar or SideBar
2. **Calls `dispatch(performLogout())`**:
   ```javascript
   await dispatch(performLogout())
   ```
3. **Thunk calls `/auth/logout`**:
   - Backend invalidates session
   - Backend clears httpOnly cookie
4. **Thunk clears client state**:
   - Redux state cleared
   - Memory token cleared
5. **NavBar/SideBar clears React Query cache**:
   ```javascript
   queryClient.clear()
   ```
6. **Redirects to `/auth/login`**
7. **User is fully logged out** on both frontend and backend

### Token Refresh Flow

1. **User makes API request** with valid token
2. **Request goes through Axios interceptor**:
   - Authorization header attached: `Bearer <token>`
   - Request sent to API
3. **If token still valid**: API responds normally
4. **If token expired** (401 response):
   - Axios response interceptor catches 401
   - Calls `/auth/refresh`:
     ```javascript
     POST /api/auth/refresh
     // Browser automatically includes httpOnly cookie
     ```
   - Backend validates refresh token in cookie
   - Backend returns new `accessToken`
   - `setToken(newToken)` updates memory
   - Original request retried with new token
5. **If refresh token expired**:
   - `/auth/refresh` returns 401
   - Token cleared from memory
   - User redirected to `/auth/login`
   - Refresh cookie cleared by backend

---

## Environment Setup

### `.env.local`

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://granitic-jule-haunting.ngrok-free.dev/api

# Optional: for development
NEXT_PUBLIC_DEBUG_AUTH=true
```

### Backend Requirements

Your backend must:

1. **Accept login requests**:
   ```
   POST /api/auth/login
   Content-Type: application/json
   Body: { identifier, password }
   Response: { ok: true, accessToken, user: {...} }
   ```

2. **Set refresh token in httpOnly cookie**:
   ```javascript
   res.cookie('refreshToken', token, {
     httpOnly: true,
     secure: true,        // HTTPS only
     sameSite: 'strict',
     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
   })
   ```

3. **Support refresh endpoint**:
   ```
   POST /api/auth/refresh
   Response: { ok: true, accessToken }
   // Uses refreshToken from cookie automatically
   ```

4. **Support logout endpoint**:
   ```
   POST /api/auth/logout
   Authorization: Bearer <accessToken>
   Response: { ok: true }
   // Server invalidates session and clears refreshToken cookie
   ```

5. **Support me endpoint**:
   ```
   GET /api/auth/me
   Authorization: Bearer <accessToken>
   Response: { ok: true, user: {...} } or { ...user }
   ```

---

## Usage Examples

### Login in a Component

```jsx
import { useDispatch } from "react-redux";
import { login } from "@/features/AuthSlice";

export default function LoginForm() {
  const dispatch = useDispatch();

  const handleLogin = async () => {
    const result = await dispatch(login({
      identifier: "user@example.com",
      password: "password123"
    }));

    if (login.fulfilled.match(result)) {
      // Success
      console.log("User:", result.payload.user);
      router.push("/");
    } else {
      // Failed
      console.error(result.payload.message);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Access User in a Component

```jsx
import { useSelector } from "react-redux";

export default function Dashboard() {
  const { user, isAuthenticated, status } = useSelector(s => s.auth);

  if (status === "loading") return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;

  return <div>Welcome, {user.firstName}!</div>;
}
```

### Make Authenticated API Requests

```jsx
import api from "@/lib/axios";

// Axios automatically adds Authorization header
const { data } = await api.get("/api/some/endpoint");

// Token is refreshed automatically if expired
// Redirects to login if refresh fails
```

### Logout

```jsx
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { performLogout } from "@/features/AuthSlice";

export default function LogoutButton() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(performLogout());
    queryClient.clear();
    router.push("/auth/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## Security Considerations

### ✅ What's Secure

1. **Access token in memory**
   - Not accessible via XSS attacks through localStorage
   - Cleared when tab/window closes
   - Not stored persistently

2. **Refresh token in httpOnly cookie**
   - Not accessible via JavaScript (XSS safe)
   - Automatically sent with requests
   - Managed by browser and server
   - Cleared by server on logout

3. **CSRF protection**
   - CSRF token extracted from cookie and sent in headers
   - Backend validates CSRF token for state-changing requests

4. **Automatic token refresh**
   - Users stay logged in across page refreshes
   - No need for localStorage persistence
   - Refresh happens transparently in interceptor

### ⚠️ Potential Issues

1. **Token lost on page refresh** (before sessions are restored)
   - Mitigated: `restoreSession` called immediately in AuthProvider
   - Mitigated: ProtectedRoute checks Redux token before rendering

2. **Multiple tabs/windows**
   - Each tab has its own memory token
   - Refresh cookie is shared across tabs
   - If one tab logs out, refresh cookie is cleared (affects all tabs)
   - Solution: Could use BroadcastChannel API for tab sync (not implemented)

3. **Network errors during refresh**
   - User is redirected to login
   - Solution: Could implement retry with exponential backoff (not implemented)

---

## Testing Checklist

- [ ] User can login with email
- [ ] User can login with phone
- [ ] User can login with username
- [ ] Incorrect credentials show error message
- [ ] After login, user is stored in Redux
- [ ] After login, token is stored in memory
- [ ] User data visible in all components (Dashboard, Profile, etc.)
- [ ] Page refresh keeps user logged in (restoreSession works)
- [ ] Logout clears Redux state
- [ ] Logout clears memory token
- [ ] Logout clears React Query cache
- [ ] Logout redirects to login page
- [ ] Expired token triggers refresh automatically
- [ ] Refresh failure redirects to login page
- [ ] Protected routes redirect to login when not authenticated
- [ ] Auth routes redirect to dashboard when authenticated
- [ ] Multiple concurrent requests work correctly
- [ ] Network errors are handled gracefully

---

## Troubleshooting

### Issue: "Token lost after page refresh"
**Cause**: `restoreSession` not called or failing
**Solution**: 
1. Check AuthProvider is wrapping the app
2. Check backend `/auth/refresh` endpoint works
3. Check httpOnly cookie is being set (browser DevTools → Application → Cookies)

### Issue: "Login succeeds but user doesn't appear"
**Cause**: Redux state not updated or component not subscribed
**Solution**:
1. Use `useSelector(s => s.auth.user)` to subscribe to Redux
2. Check login thunk payload includes user data
3. Check backend response includes user object

### Issue: "Logout doesn't clear everything"
**Cause**: React Query cache still has old data
**Solution**:
1. Call `queryClient.clear()` after `performLogout()`
2. Already done in NavBar and SideBar logout handlers

### Issue: "Refresh token not being sent"
**Cause**: httpOnly cookie not set or CORS issue
**Solution**:
1. Check backend sets cookie with `httpOnly: true`
2. Check axios has `withCredentials: true`
3. Check CORS headers allow credentials
4. Check ngrok URL is in CORS whitelist

### Issue: "CSRF token validation failing"
**Cause**: CSRF cookie not present or header not sent
**Solution**:
1. Check backend sets `_csrf` cookie
2. Check axios reads and sends CSRF token
3. Check backend CSRF middleware is enabled
4. Check backend validates both GET and POST

---

## Migration from Old Implementation

If you had localStorage before, it's automatically cleared:

```javascript
// Old implementation stored:
localStorage.setItem("invexis_token", token);
localStorage.setItem("invexis_refresh_token", refresh);
localStorage.setItem("invexis_user", JSON.stringify(user));

// New implementation:
// - Token in memory only
// - Refresh token in httpOnly cookie
// - User in Redux store
// - localStorage items cleared on logout
```

No migration needed for existing code - the old keys are cleared automatically.

---

## Further Improvements (Not Implemented)

1. **Tab Synchronization**: Use BroadcastChannel to sync logout across tabs
2. **Token Rotation**: Refresh token on every request
3. **Silent Refresh**: Refresh token before expiration (background)
4. **Request Retry**: Exponential backoff for failed requests
5. **Offline Mode**: Cache auth state for offline access
6. **Device Fingerprinting**: Validate device on refresh (already in routes but not enforced)
7. **Rate Limiting**: Per-user rate limiting (already in routes but not enforced)

---

## Files Modified

1. ✅ `src/services/AuthService.js` - API client
2. ✅ `src/features/AuthSlice.js` - Redux state & thunks
3. ✅ `src/components/forms/LoginForm.jsx` - Login form
4. ✅ `src/lib/authUtils.js` - Token utilities
5. ✅ `src/lib/axios.js` - Axios interceptors
6. ✅ `src/components/layouts/NavBar.jsx` - Already using performLogout
7. ✅ `src/components/layouts/SideBar.jsx` - Already using performLogout
8. ✅ `src/providers/ProtectedRoute.jsx` - Already checking Redux token
9. ✅ `src/providers/AuthProvider.jsx` - Already calling restoreSession

---

## API Response Format

Your backend returns:
```json
{
  "ok": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "69245db15630218ace02b5d3",
    "firstName": "Admin",
    "lastName": "Super",
    "email": "super.admin@invexis.com",
    "phone": "+250789123457",
    "role": "super_admin",
    "isEmailVerified": false,
    "twoFAEnabled": false,
    "employmentStatus": "active",
    "loginHistory": [...],
    "sessions": [...],
    ... // other fields
  }
}
```

The frontend extracts:
- `accessToken` → stored in memory + Redux
- `user` → stored in Redux
- Refresh token → managed by browser (httpOnly cookie)

---

## Support

For issues or questions:
1. Check console logs with `[authUtils]`, `[Axios]`, `[Redux Auth]` prefixes
2. Check browser DevTools:
   - Application → Cookies → refreshToken (httpOnly)
   - Redux DevTools → auth slice
3. Check backend logs for `/auth/login`, `/auth/refresh`, `/auth/logout` errors
