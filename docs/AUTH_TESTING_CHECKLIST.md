# Auth Implementation - Testing Checklist

## Pre-Testing Setup
- [ ] Backend auth service is running
- [ ] ngrok tunnel is active: `https://granitic-jule-haunting.ngrok-free.dev`
- [ ] Backend `/api/auth/login` endpoint works
- [ ] Backend `/api/auth/refresh` endpoint works
- [ ] Backend `/api/auth/me` endpoint works
- [ ] Backend `/api/auth/logout` endpoint works
- [ ] Refresh token is set in httpOnly cookie
- [ ] CORS is configured for credentials
- [ ] `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
- [ ] Redux DevTools browser extension installed (optional but helpful)

---

## 1. Login Flow Testing

### 1.1 Successful Login
- [ ] Navigate to `/auth/login`
- [ ] Enter valid email/phone/username
- [ ] Enter valid password
- [ ] Click "Sign In"
- [ ] Wait for network request to complete
- [ ] Should redirect to `/` (dashboard)
- [ ] User should be visible (navbar shows user name)

**DevTools Checks**:
- [ ] Network: `POST /api/auth/login` returns `{ok, accessToken, user}`
- [ ] Redux: `auth.user` contains user data
- [ ] Redux: `auth.token` is not null (but don't log the actual value)
- [ ] Redux: `auth.isAuthenticated` is `true`
- [ ] Redux: `auth.status` is `"succeeded"`
- [ ] Cookies: `refreshToken` exists (httpOnly flag visible)
- [ ] Console: No errors, check for `[authUtils]` and `[Axios]` logs

### 1.2 Invalid Credentials
- [ ] Navigate to `/auth/login`
- [ ] Enter invalid email/password
- [ ] Click "Sign In"
- [ ] Should show error message: "Invalid credentials" or similar
- [ ] Should NOT redirect
- [ ] Redux: `auth.isAuthenticated` should be `false`

**DevTools Checks**:
- [ ] Network: `POST /api/auth/login` returns error response
- [ ] Redux: `auth.error` contains error message
- [ ] Redux: `auth.status` is `"failed"`
- [ ] Redux: `auth.user` is `null`
- [ ] Redux: `auth.token` is `null`

### 1.3 Missing Fields
- [ ] Navigate to `/auth/login`
- [ ] Leave email empty
- [ ] Click "Sign In"
- [ ] Should show validation error (field required)
- [ ] Should NOT make network request
- [ ] Leave password empty, enter email
- [ ] Click "Sign In"
- [ ] Should show validation error
- [ ] Should NOT make network request

### 1.4 Network Error
- [ ] Stop backend server
- [ ] Navigate to `/auth/login`
- [ ] Enter credentials
- [ ] Click "Sign In"
- [ ] Should show error about network/connection
- [ ] Should NOT redirect

---

## 2. Session Restoration Testing

### 2.1 Page Refresh While Logged In
- [ ] Login successfully (see 1.1)
- [ ] Refresh page (F5)
- [ ] Should NOT redirect to login page
- [ ] User should still be visible
- [ ] Should NOT require re-login

**DevTools Checks**:
- [ ] Network: `POST /api/auth/refresh` is called (uses httpOnly cookie)
- [ ] Network: `GET /api/auth/me` is called
- [ ] Network: Both return successfully
- [ ] Redux: `auth.user` is populated
- [ ] Redux: `auth.isInitialized` is `true`
- [ ] Cookies: `refreshToken` still exists

### 2.2 New Tab While Logged In
- [ ] Login successfully in one tab
- [ ] Open new tab
- [ ] Navigate to `/` in new tab
- [ ] Should automatically restore session (no login needed)
- [ ] User should be visible

**DevTools Checks**:
- Same as 2.1

### 2.3 Close and Reopen Tab
- [ ] Login successfully
- [ ] Close browser tab
- [ ] Close all tabs with the app
- [ ] Open new tab
- [ ] Go to `/`
- [ ] Should require login (token lost because memory was cleared)
- [ ] Should redirect to `/auth/login`

**Note**: This is expected! Memory token is lost when tab closes. But refresh token in httpOnly cookie could still restore it if implemented. Check if your backend cookie is set to persist.

### 2.4 Local Storage Cleanup
- [ ] DevTools → Application → Local Storage
- [ ] Should NOT have `invexis_token`
- [ ] Should NOT have `invexis_refresh_token`
- [ ] Should NOT have `invexis_user`
- [ ] All old localStorage keys should be gone

---

## 3. Token Refresh Testing

### 3.1 Automatic Token Refresh on Expired Token
- [ ] Login successfully
- [ ] Get the access token from Redux (note the JWT)
- [ ] Wait for token to expire (or manually modify to expired for testing)
- [ ] Make an API request (e.g., fetch companies, users, etc.)
- [ ] Request should succeed (not 401)
- [ ] Should NOT show login redirect

**DevTools Checks**:
- [ ] Network: API request shows `401` temporarily
- [ ] Network: `POST /api/auth/refresh` is called
- [ ] Network: Gets new `accessToken`
- [ ] Network: Original API request is retried
- [ ] Network: Retry succeeds (200 OK)
- [ ] Redux: `auth.token` is updated with new token
- [ ] Console: See token refresh logs

### 3.2 Concurrent Requests During Token Refresh
- [ ] Login successfully
- [ ] Expire token (or use very short token for testing)
- [ ] Quickly make 3 API requests at the same time
- [ ] All 3 should succeed after token refresh
- [ ] Should only see ONE call to `/api/auth/refresh` (not 3)

**DevTools Checks**:
- [ ] Network: `POST /api/auth/refresh` called once
- [ ] Network: All 3 original requests retried
- [ ] All 3 requests show `200 OK`
- [ ] No queue overflow or double refresh

### 3.3 Token Refresh Failure (Refresh Token Expired)
- [ ] This requires refresh token to be expired (7+ days of no access)
- [ ] User should be redirected to login page
- [ ] Redux: `auth.isAuthenticated` becomes `false`
- [ ] Error message or redirect should be visible

---

## 4. Logout Testing

### 4.1 Standard Logout
- [ ] Login successfully
- [ ] Click logout button (NavBar or SideBar)
- [ ] Should see loading state briefly
- [ ] Should redirect to `/auth/login`
- [ ] Should NOT be logged in

**DevTools Checks**:
- [ ] Network: `POST /api/auth/logout` is called
- [ ] Redux: `auth.user` is `null`
- [ ] Redux: `auth.token` is `null`
- [ ] Redux: `auth.isAuthenticated` is `false`
- [ ] Cookies: `refreshToken` is gone
- [ ] Memory: `getToken()` returns `null`

### 4.2 Logout Then Try Protected Route
- [ ] Login successfully
- [ ] Logout
- [ ] Navigate to `/` or any protected route
- [ ] Should redirect to `/auth/login`
- [ ] ProtectedRoute should prevent access

**DevTools Checks**:
- [ ] Redux: `auth.isAuthenticated` is `false`
- [ ] Navigation: Redirect is immediate

### 4.3 Logout Then Try Login Again
- [ ] Login successfully
- [ ] Logout
- [ ] Login again with same credentials
- [ ] Should succeed (no conflicts)
- [ ] Should have new token
- [ ] Should be on dashboard

**DevTools Checks**:
- [ ] Redux: New user object in state
- [ ] Redux: New token (different from before)
- [ ] Cookies: New refreshToken cookie

### 4.4 Logout Clears React Query Cache
- [ ] Setup: Fetch some data (companies, users, etc.)
- [ ] See data on page
- [ ] Logout
- [ ] Login again
- [ ] Check that stale data is NOT visible
- [ ] Data should be refetched from server if needed

---

## 5. Protected Route Testing

### 5.1 Unauthenticated Access to Protected Routes
- [ ] Don't login
- [ ] Try to navigate to `/` (or any non-auth route)
- [ ] Should redirect to `/auth/login`

### 5.2 Authenticated Access to Protected Routes
- [ ] Login successfully
- [ ] Navigate to `/` and other routes
- [ ] Should work normally
- [ ] SideBar and NavBar should be visible

### 5.3 Unauthenticated Access to Auth Routes
- [ ] Don't login
- [ ] Navigate to `/auth/login`
- [ ] Should show login page (no SideBar/NavBar)
- [ ] Should be able to login

### 5.4 Authenticated Access to Auth Routes
- [ ] Login successfully
- [ ] Try to navigate to `/auth/login`
- [ ] Behavior: Either show login page OR redirect to dashboard
- [ ] Check what your ProtectedRoute implements

---

## 6. Component Integration Testing

### 6.1 User Data Accessible in Components
- [ ] Login successfully
- [ ] Check Dashboard shows user name
- [ ] Check Profile page shows user email
- [ ] Check any component using `useSelector(s => s.auth.user)`
- [ ] All should show correct user data

### 6.2 User Data Persists Across Navigation
- [ ] Login successfully
- [ ] Navigate to different pages
- [ ] User data should still be visible
- [ ] Redux state should not be cleared

### 6.3 Role-Based Rendering
- [ ] Login with different roles (if available)
- [ ] Check that role-specific UI is shown
- [ ] Example: Admin sees "Users" menu, regular user doesn't
- [ ] Role should come from `user.role` in Redux

---

## 7. Error Handling Testing

### 7.1 Network Timeout
- [ ] Simulate slow network (DevTools → Throttle)
- [ ] Try to login
- [ ] Should show timeout error after X seconds
- [ ] Should NOT hang forever

### 7.2 CORS Error
- [ ] Change `NEXT_PUBLIC_API_BASE_URL` to wrong domain
- [ ] Try to login
- [ ] Should show CORS/network error
- [ ] Error message should be helpful

### 7.3 API Error Response
- [ ] Backend returns error (e.g., 500)
- [ ] Should show error message to user
- [ ] Should NOT redirect or break

### 7.4 Invalid Token Format
- [ ] Manually set Redux `auth.token` to invalid value (DevTools)
- [ ] Make API request
- [ ] Should get 401 from server
- [ ] Should trigger refresh or redirect to login

---

## 8. Security Testing

### 8.1 Token in localStorage
- [ ] After login, check DevTools → Application → Local Storage
- [ ] Should NOT have access token stored
- [ ] Old `invexis_token` key should be gone

### 8.2 Token in Cookies (JavaScript Accessible)
- [ ] After login, check DevTools → Application → Cookies
- [ ] Access token should NOT be in cookies visible to JS
- [ ] Refresh token should have `httpOnly` flag

### 8.3 Token in Memory (Not Persistent)
- [ ] Login successfully
- [ ] Close ALL browser tabs
- [ ] Open new tab (private/incognito if possible)
- [ ] Go to app
- [ ] Should need to login again (memory is cleared)

### 8.4 Authorization Header
- [ ] Login successfully
- [ ] Make any API request
- [ ] Check Network tab → Request Headers
- [ ] Should have `Authorization: Bearer <token>`
- [ ] Token should be valid JWT

### 8.5 CSRF Protection
- [ ] Login successfully
- [ ] Check cookies for CSRF token
- [ ] Make POST/PUT/DELETE request
- [ ] Check headers for CSRF token
- [ ] Backend should validate CSRF token

---

## 9. Edge Cases

### 9.1 Multiple Rapid Login Attempts
- [ ] Navigate to login page
- [ ] Click "Sign In" multiple times rapidly
- [ ] Should only make one request
- [ ] Should not show duplicate requests in Network tab

### 9.2 Login While Request in Progress
- [ ] Enter credentials
- [ ] Click "Sign In"
- [ ] While request is pending, click "Sign In" again
- [ ] Should not make duplicate request
- [ ] Button should be disabled during request

### 9.3 Refresh Page While Login Request Pending
- [ ] Enter credentials, click "Sign In"
- [ ] Quickly refresh page (F5) before response
- [ ] Should cancel request or handle gracefully
- [ ] Should not break the app state

### 9.4 Fast Logout and Login
- [ ] Login successfully
- [ ] Immediately click logout
- [ ] While logout request pending, try to login again
- [ ] Should handle gracefully (wait for logout to finish or show error)

---

## 10. Mobile/Responsive Testing

### 10.1 Login on Mobile
- [ ] DevTools → Responsive Design Mode
- [ ] Set to mobile device (iPhone, Android)
- [ ] Login should work
- [ ] No layout issues

### 10.2 Token Refresh on Mobile
- [ ] Use mobile viewport
- [ ] Expire token
- [ ] Make API request
- [ ] Should refresh successfully
- [ ] No layout issues during refresh

### 10.3 Logout on Mobile
- [ ] Use mobile viewport
- [ ] Logout should work
- [ ] Redirect should work
- [ ] No layout issues

---

## Final Checklist

- [ ] All tests above pass
- [ ] No console errors (except expected CORS warnings)
- [ ] Redux DevTools show correct state
- [ ] Network tab shows expected requests
- [ ] Cookies show httpOnly refresh token
- [ ] localStorage is clean (no old keys)
- [ ] App works on different browsers (Chrome, Firefox, Safari)
- [ ] App works on mobile viewport
- [ ] Logout completely clears data
- [ ] Re-login works after logout
- [ ] Session persists across page refreshes
- [ ] Token auto-refreshes when expired

---

## If Tests Fail

Check these in order:

1. **Backend is running**
   ```bash
   curl https://granitic-jule-haunting.ngrok-free.dev/api/auth
   # Should return: { "message": "auth service is routed to the gateway" }
   ```

2. **Network requests are working**
   - DevTools → Network tab
   - Check request URL is correct
   - Check request has Authorization header
   - Check response has correct format

3. **Redux state is updating**
   - Redux DevTools → auth slice
   - Check `user`, `token`, `isAuthenticated` after login
   - Check they're cleared after logout

4. **Tokens are stored correctly**
   - Memory: Use DevTools Console: `localStorage.getItem('invexis_token')` → should be null
   - httpOnly Cookie: Check DevTools → Cookies for `refreshToken`
   - Redux: Check Redux DevTools for token presence

5. **Axios is configured correctly**
   - Check `baseURL` in `axios.js` matches `NEXT_PUBLIC_API_BASE_URL`
   - Check `withCredentials: true` is set
   - Check request interceptor adds Authorization header

6. **AuthProvider is initialized**
   - Check `app/layout.jsx` wraps app with `AuthProvider`
   - Check `providers/AuthProvider.jsx` calls `restoreSession`

7. **Console logs for debugging**
   - Look for `[authUtils]` logs
   - Look for `[Axios]` logs
   - Check for any error messages
   - Check for 401/403/CORS errors

---

## After All Tests Pass

🎉 Your authentication system is working correctly!

- [ ] Commit these changes to git
- [ ] Create PR with these changes
- [ ] Update team documentation if needed
- [ ] Monitor production for any auth-related issues
- [ ] Keep `AUTH_IMPLEMENTATION_GUIDE.md` updated as you make changes
