# Auth Implementation Setup & Deployment Guide

## Immediate Next Steps

### Step 1: Verify Backend Requirements ✅

Your backend MUST have these endpoints working:

```bash
# Test login endpoint
curl -X POST https://granitic-jule-haunting.ngrok-free.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "super.admin@invexis.com", "password": "password"}'

# Expected response:
{
  "ok": true,
  "accessToken": "eyJhbGc...",
  "user": {
    "_id": "...",
    "firstName": "Admin",
    "lastName": "Super",
    "email": "super.admin@invexis.com",
    "role": "super_admin",
    ...
  }
}
```

### Step 2: Verify Backend Token Cookie ✅

After login, backend MUST set refresh token in httpOnly cookie:

```javascript
// Backend should do something like:
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: true,        // HTTPS only
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

**Verify in browser**:
1. Login successfully
2. Open DevTools → Application → Cookies
3. Look for cookie named `refreshToken`
4. It should have these flags:
   - ✅ `HttpOnly` (no JS access)
   - ✅ `Secure` (HTTPS only)
   - ✅ `SameSite=Strict`
5. Value should NOT be empty

### Step 3: Verify Environment Variables ✅

Create/update `.env.local`:

```env
# Required
NEXT_PUBLIC_API_BASE_URL=https://granitic-jule-haunting.ngrok-free.dev/api

# Optional - for debugging
NEXT_PUBLIC_DEBUG_AUTH=true
```

### Step 4: Install/Update Dependencies ✅

```bash
npm install
# or
yarn install
# or
pnpm install
```

These should already be installed from your `package.json`:
- `@reduxjs/toolkit` - Redux state management
- `react-redux` - React bindings for Redux
- `@tanstack/react-query` - Data fetching & caching
- `axios` - HTTP client

### Step 5: Start Development Server ✅

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

App should be at: http://localhost:3000

### Step 6: Test Login Flow ✅

1. Go to http://localhost:3000/auth/login
2. Enter credentials:
   - Email: `super.admin@invexis.com`
   - Password: `password` (or whatever your backend has)
3. Click "Sign In"
4. Should redirect to `/` (dashboard)
5. Check browser DevTools:
   - Redux DevTools → auth slice should have user data
   - Application → Cookies should have `refreshToken`
   - Console should show axios logs

---

## Configuration

### BaseURL Configuration

The app uses this priority order for API base URL:

1. **Environment Variable** (highest priority)
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api
   ```

2. **Fallback** (default)
   ```javascript
   https://granitic-jule-haunting.ngrok-free.dev/api
   ```

**For different environments**:

```env
# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# Staging
NEXT_PUBLIC_API_BASE_URL=https://staging-api.invexis.com/api

# Production
NEXT_PUBLIC_API_BASE_URL=https://api.invexis.com/api
```

### Redux Store Configuration

Redux is already configured in `src/store/index.js`. Check that it includes:

```javascript
import authReducer from "@/features/AuthSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // ... other slices
  },
});
```

### Axios Interceptor Configuration

Axios is already configured in `src/lib/axios.js` with:
- ✅ Request interceptor (adds token & CSRF)
- ✅ Response interceptor (auto-refresh on 401)
- ✅ Queue system for concurrent requests
- ✅ Error handling

No additional setup needed.

---

## Deployment Checklist

### Before Deploying to Staging

- [ ] All tests pass (see AUTH_TESTING_CHECKLIST.md)
- [ ] No console errors in DevTools
- [ ] Redux DevTools shows correct auth state
- [ ] Login/logout/token refresh work correctly
- [ ] Session persists across page refreshes
- [ ] Stale data is cleared on logout
- [ ] No localStorage tokens (security check)
- [ ] httpOnly cookie is set (security check)

### Staging Deployment Steps

1. **Update `.env.local` for staging**:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://staging-api.invexis.com/api
   ```

2. **Build the app**:
   ```bash
   npm run build
   # Should complete without errors
   ```

3. **Test in staging environment**:
   ```bash
   npm run start
   # Visit https://staging.invexis.com
   # Run AUTH_TESTING_CHECKLIST.md tests
   ```

4. **Check staging logs**:
   - Look for `[authUtils]`, `[Axios]`, `[Redux Auth]` logs
   - Look for any 401/403 errors
   - Check that tokens are refreshing

### Before Deploying to Production

- [ ] All staging tests pass
- [ ] Backend is prepared and tested
- [ ] https:// is enabled (required for secure cookies)
- [ ] CORS is configured for production domain
- [ ] Backend refresh token cookie is set properly
- [ ] Rate limiting is configured
- [ ] Audit logging is configured
- [ ] Error tracking (Sentry, etc.) is configured

### Production Deployment Steps

1. **Update `.env` for production**:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.invexis.com/api
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   npm run start
   # Or deploy to your hosting (Vercel, etc.)
   ```

3. **Smoke test in production**:
   - Test login with real user
   - Check token refresh works
   - Check logout clears everything
   - Monitor error tracking for issues

4. **Monitor after deployment**:
   - Watch for 401/403 auth errors
   - Watch for CORS errors
   - Watch for token refresh failures
   - Check user feedback for login issues

---

## Troubleshooting Deployment

### Issue: "CORS error: response has no 'Access-Control-Allow-Credentials' header"

**Cause**: Backend not allowing credentials

**Solution**:
```javascript
// Backend middleware (Express example)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token');
  next();
});
```

### Issue: "Refresh token not being sent to /api/auth/refresh"

**Cause**: Browser not sending httpOnly cookie

**Solutions**:
1. Check axios has `withCredentials: true` ✅ (already configured)
2. Check backend sets cookie with:
   - `httpOnly: true`
   - `secure: true` (HTTPS)
   - `sameSite: 'strict'` or 'lax'
3. Check CORS header: `Access-Control-Allow-Credentials: true`

### Issue: "Token keeps getting cleared unexpectedly"

**Cause**: Redux state reset or page reload

**Solutions**:
1. Check AuthProvider is wrapping app ✅
2. Check restoreSession is being called ✅
3. Check token is being set in memory: `setToken(token)` ✅
4. Monitor Redux state changes in DevTools

### Issue: "Login works but other API calls return 401"

**Cause**: Token not being attached to requests

**Solutions**:
1. Check Axios request interceptor adds header:
   ```
   Authorization: Bearer <token>
   ```
2. Check token exists in memory: `getToken()` returns non-null
3. Check Redux has token: `auth.token` is set
4. Check Axios instance is from `@/lib/axios` (has interceptors)

### Issue: "Logout doesn't redirect to login"

**Cause**: `performLogout` not completing or redirect failing

**Solutions**:
1. Check logout calls `dispatch(performLogout())`
2. Check `performLogout` completes before redirect
3. Check router object is valid
4. Check user has permission to access `/auth/login`

---

## Monitoring in Production

### Key Metrics to Track

1. **Auth Success Rate**
   - Monitor `/api/auth/login` success vs failure
   - Alert if >5% failures
   - Investigate spike in failures

2. **Token Refresh Rate**
   - Monitor `/api/auth/refresh` calls
   - Should be proportional to user activity
   - Alert if unusually high (possible attack)

3. **Session Duration**
   - Monitor average session length
   - Alert if dropping suddenly (logout issues)
   - Track user engagement

4. **Error Types**
   - 401 Unauthorized
   - 403 Forbidden
   - CORS errors
   - Token refresh failures
   - Network timeouts

### Recommended Integrations

1. **Error Tracking** (Sentry, Rollbar, etc.)
   ```javascript
   // Capture auth errors
   Sentry.captureException(err);
   ```

2. **Analytics** (Mixpanel, Amplitude, etc.)
   ```javascript
   // Track login success
   analytics.track('User Login', { role: user.role });
   // Track logout
   analytics.track('User Logout', { duration: sessionTime });
   ```

3. **Logging** (LogRocket, etc.)
   ```javascript
   // See user interactions leading to auth errors
   LogRocket.identify(user.id, { email: user.email });
   ```

---

## Security Checklist

- [ ] Access token stored in memory only (not localStorage)
- [ ] Refresh token stored in httpOnly cookie only
- [ ] User object stored in Redux (not localStorage)
- [ ] HTTPS enabled in production
- [ ] CSRF protection enabled
- [ ] Rate limiting enabled on auth endpoints
- [ ] Token expiration time reasonable (15-30 min for access token)
- [ ] Refresh token expiration time long (7 days or more)
- [ ] Logout invalidates tokens on backend
- [ ] Device fingerprinting enabled (if implemented)
- [ ] 2FA enforcement for admin users (if implemented)

---

## Performance Optimization

### Current Optimizations

✅ In-memory token storage (no localStorage overhead)
✅ Axios request/response interceptors (reusable)
✅ Queue system for concurrent 401 errors (no double refresh)
✅ React Query cache integration (no redundant API calls)
✅ Lazy loading of auth components
✅ Minimal re-renders (Redux selectors)

### Additional Optimizations (Optional)

1. **Token Pre-Refresh** (Silent Refresh)
   - Refresh token before expiration
   - User never sees 401 error
   - Seamless experience

2. **Request Retry Logic**
   - Exponential backoff for failed requests
   - Max retries configurable
   - Better resilience

3. **Offline Mode**
   - Cache auth state with Session Storage
   - Allow access to cached pages
   - Sync when back online

4. **Tab Synchronization**
   - Use BroadcastChannel API
   - Sync logout across tabs
   - Prevent stale auth state

---

## API Documentation

### Login Endpoint

```
POST /api/auth/login
Content-Type: application/json
X-CSRF-Token: <csrf-token-from-cookie>

Request:
{
  "identifier": "email or phone or username",
  "password": "user password"
}

Response (200 OK):
{
  "ok": true,
  "accessToken": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+250789123457",
    "role": "super_admin",
    "isEmailVerified": false,
    "twoFAEnabled": false,
    "employmentStatus": "active",
    ... // other fields
  }
}

Response (400 Bad Request):
{
  "ok": false,
  "message": "Invalid identifier or password",
  "error": "INVALID_CREDENTIALS"
}

Response (429 Too Many Requests):
{
  "ok": false,
  "message": "Too many login attempts. Please try again later.",
  "retryAfter": 3600
}
```

### Refresh Token Endpoint

```
POST /api/auth/refresh
Content-Type: application/json
Cookie: refreshToken=<httponly-cookie>
X-CSRF-Token: <csrf-token-from-cookie>

Request:
{} // Empty body, refresh token in cookie

Response (200 OK):
{
  "ok": true,
  "accessToken": "new-jwt-token-here"
}

Response (401 Unauthorized):
{
  "ok": false,
  "message": "Refresh token expired or invalid",
  "error": "INVALID_REFRESH_TOKEN"
}
```

### Logout Endpoint

```
POST /api/auth/logout
Authorization: Bearer <access-token>
X-CSRF-Token: <csrf-token-from-cookie>

Request:
{} // Empty body

Response (200 OK):
{
  "ok": true,
  "message": "Logged out successfully"
}

Response (401 Unauthorized):
{
  "ok": false,
  "message": "Unauthorized"
}
```

### Get Current User Endpoint

```
GET /api/auth/me
Authorization: Bearer <access-token>

Response (200 OK):
{
  "ok": true,
  "user": { ... } // Current user object
}

// OR just return user object directly:
{
  "_id": "...",
  "firstName": "John",
  ... // user data
}

Response (401 Unauthorized):
{
  "ok": false,
  "message": "Unauthorized"
}
```

---

## Rollback Plan

If there's an issue with the new auth implementation:

1. **Immediate Rollback**:
   ```bash
   git revert <commit-hash>
   git push
   # Redeploy with previous version
   ```

2. **What's Preserved**:
   - User data from session (httpOnly cookie)
   - Backend session tokens
   - Backend audit logs

3. **What's Lost**:
   - In-memory tokens (cleared)
   - Redux auth state (cleared)
   - User must re-login

4. **Time to Rollback**:
   - < 5 minutes (just a git revert + deploy)

---

## Future Improvements

1. **Biometric Auth** (Face ID, Fingerprint)
2. **Passwordless Login** (Magic Links, OTP)
3. **Social Login** (Google, Microsoft, etc.)
4. **Session Management UI** (View/Revoke Sessions)
5. **Device Fingerprinting** (Validate device on refresh)
6. **Risk-Based Authentication** (Extra verification for unusual logins)
7. **Single Sign-On (SSO)** (Across multiple apps)
8. **Fine-Grained Permissions** (Beyond roles)

---

## Support & Questions

**For issues with authentication**:
1. Check console for errors with `[authUtils]`, `[Axios]` prefixes
2. Check Redux DevTools for state issues
3. Check Network tab for API failures
4. Check backend logs for server errors
5. Refer to `AUTH_IMPLEMENTATION_GUIDE.md` for detailed explanations

**Documentation files**:
- `AUTH_IMPLEMENTATION_GUIDE.md` - Complete technical guide
- `AUTH_CHANGES_SUMMARY.md` - What changed and why
- `AUTH_QUICK_REFERENCE.md` - Quick lookup for common tasks
- `AUTH_TESTING_CHECKLIST.md` - Testing guide
- `AUTH_SETUP_DEPLOYMENT.md` - This file

---

## Files Modified

✅ `src/services/AuthService.js`
✅ `src/features/AuthSlice.js`
✅ `src/components/forms/LoginForm.jsx`
✅ `src/lib/authUtils.js`
✅ `src/lib/axios.js`
📄 `AUTH_IMPLEMENTATION_GUIDE.md`
📄 `AUTH_CHANGES_SUMMARY.md`
📄 `AUTH_QUICK_REFERENCE.md`
📄 `AUTH_TESTING_CHECKLIST.md`
📄 `AUTH_SETUP_DEPLOYMENT.md` (this file)

---

## Version History

**v1.0** (Current)
- ✅ Redux global state for auth
- ✅ In-memory token storage
- ✅ httpOnly refresh token support
- ✅ Automatic token refresh
- ✅ Session restoration
- ✅ React Query integration
- ✅ CSRF protection
- ✅ Comprehensive error handling

---

**Last Updated**: November 26, 2025
**Author**: Implementation Guide
**Status**: ✅ Ready for Testing & Deployment
