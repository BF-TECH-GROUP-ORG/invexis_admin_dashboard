# Session Expiry Fix - Complete Solution

## Problem

The frontend was experiencing immediate session expiration after login, causing 401 errors and displaying "Session expired" alerts even though the backend had successfully authenticated the user.

### Root Causes Identified

1. **Token Expiry Calculation Error**: The `expiresAt` was being calculated incorrectly, potentially being set to the past
2. **Improper Session Strategy**: NextAuth wasn't explicitly configured for JWT-based sessions
3. **Over-eager Error Rejection**: The axios interceptor was rejecting requests on session errors instead of letting them proceed to get 401 response
4. **No Token Refresh Buffer**: The refresh logic had a 30-second buffer, which was too aggressive

## Solutions Implemented

### 1. Auth Configuration (`src/auth.js`)

#### Added Explicit Session Strategy

```javascript
session: {
  strategy: "jwt",
  maxAge: 15 * 60, // 15 minutes
},
jwt: {
  maxAge: 15 * 60, // 15 minutes
}
```

#### Improved JWT Callback

- **Better Expiry Calculation**: Now checks for invalid values and uses safer fallbacks
  - Validates `expiresInSeconds > 0` instead of just `!isNaN`
  - Includes current time and remaining seconds in logs for debugging
- **Token Refresh Logic**:
  - Checks time until expiry and only refreshes when < 60 seconds (more conservative)
  - Ensures refresh endpoint is called without the refresh token in request body (only in cookies)
  - Validates `response.data && response.data.ok` for safety
- **Error Handling**:
  - Tracks errors in `token.error` field
  - Returns token with error state instead of throwing
  - Better logging for debugging

#### Enhanced Credentials Provider

- Added error logging for credential parsing failures

### 2. Axios Interceptor (`src/lib/axios.js`)

#### Session Error Handling

- **Changed Behavior**: Now logs session errors but allows requests to proceed
  - Previously: Immediately rejected requests if `token.error` was set
  - Now: Logs warning and lets request proceed (will get 401 from backend)
  - The 401 response handler in response interceptor then shows appropriate error message

#### Improved Token Logging

- More readable format: `Token: {first10}...{last10}`
- Includes HTTP method and URL for better debugging

## Key Changes Summary

### Before

```javascript
// Session expires too early or immediately
token.expiresAt = Date.now() + expiresInSeconds * 1000; // Could be calculated wrong

// Rejected on session error
if (cachedSession.error === "RefreshAccessTokenError") {
  return Promise.reject(new Error("Session expired")); // Too aggressive
}

// 30 second buffer was too aggressive
if (Date.now() < token.expiresAt - 30000) { ... }
```

### After

```javascript
// Safer expiry calculation
if (isNaN(expiresInSeconds) || expiresInSeconds <= 0) {
  // Fall back to JWT decode or default
}
token.expiresAt = Date.now() + expiresInSeconds * 1000;

// Allows request to proceed, 401 handler deals with errors
if (cachedSession.error) {
  console.warn("[Axios] Session has error:", cachedSession.error);
  // Don't reject - let request fail naturally
}

// 60 second buffer is more reasonable
if (timeUntilExpiry > 60000) {
  return token;
}
```

## Testing Recommendations

1. **Login Flow**
   - Check browser console for logs showing token expiry time
   - Verify token expiry is > 14 minutes in future
2. **Session Duration**

   - Wait 15 minutes and verify automatic logout or redirect to login
   - Verify token refresh works before expiry

3. **Error Scenarios**

   - Kill backend server and verify 401 handling
   - Check that "Session expired" notification appears correctly

4. **Token Inspection**
   - Use browser DevTools Application > Cookies
   - Verify `refreshToken` is being set with proper flags (httpOnly, Secure, SameSite)

## Debugging

Enable debug logging by checking browser console with `NODE_ENV=development`:

```
[Auth] Session initialized. Expires at: 2026-01-07T12:15:00.000Z (in 900s)
[Auth] Token still valid (850s remaining)
[Axios Auth] GET /auth/me | Token: eyJhbGc...XXXXXXXX
[Auth] Token refreshed successfully. New expiry: 2026-01-07T12:30:00.000Z
```

## Files Modified

1. `/src/auth.js` - NextAuth configuration and JWT callback
2. `/src/lib/axios.js` - Request interceptor session handling

## Deployment Notes

- No breaking changes
- Backward compatible with existing sessions
- Sessions will automatically expire after 15 minutes of inactivity
- Token refresh happens automatically 60 seconds before expiry
