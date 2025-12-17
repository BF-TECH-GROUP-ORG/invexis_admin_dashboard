# Auth Quick Reference

## Login
```jsx
import { useDispatch } from "react-redux";
import { login } from "@/features/AuthSlice";

const dispatch = useDispatch();
const result = await dispatch(login({ identifier: "email", password: "pass" }));
if (login.fulfilled.match(result)) navigate("/");
```

## Get User Data
```jsx
const { user, token, isAuthenticated } = useSelector(s => s.auth);
```

## Make API Request
```jsx
import api from "@/lib/axios";
const { data } = await api.get("/endpoint");  // Token auto-attached
```

## Logout
```jsx
import { performLogout } from "@/features/AuthSlice";
const dispatch = useDispatch();
const queryClient = useQueryClient();
await dispatch(performLogout());
queryClient.clear();
router.push("/auth/login");
```

## Check if Authenticated
```jsx
const isAuthenticated = useSelector(s => s.auth.isAuthenticated);
```

## Get Token (rarely needed)
```jsx
import { getToken } from "@/lib/authUtils";
const token = getToken();  // Returns JWT or null
```

## Response Format
```json
// Login/Refresh Response
{
  "ok": true,
  "accessToken": "eyJhbGc...",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "super_admin",
    ...
  }
}
```

## Where Things Are Stored

| What | Where | Accessible | Secure |
|------|-------|-----------|--------|
| Access Token | Memory (authUtils) | Axios interceptor | ✅ |
| User Object | Redux store | useSelector | ✅ |
| Refresh Token | httpOnly Cookie | Backend only | ✅ |

## Automatic Flows

✅ Token expires? Axios automatically refreshes  
✅ Page refresh? AuthProvider restores session  
✅ Tab close? Token cleared (not stored)  
✅ Logout? Backend + frontend + cache cleared  

## Status Values
- `"idle"` - Not authenticated
- `"loading"` - API request in progress
- `"succeeded"` - Login successful
- `"failed"` - Login failed

## Error Handling
```jsx
const result = await dispatch(login(creds));
if (login.rejected.match(result)) {
  console.error(result.payload.message);  // "Invalid credentials"
}
```

## Redux State Shape
```javascript
{
  auth: {
    user: null,              // User object or null
    token: null,             // Access token (JWT) or null
    isAuthenticated: false,  // Boolean
    status: "idle",          // "idle" | "loading" | "succeeded" | "failed"
    error: null,             // Error message or null
    isInitialized: false,    // App initialized?
  }
}
```

## Troubleshooting

| Problem | Check |
|---------|-------|
| Token lost after refresh | AuthProvider mounted? restoreSession working? |
| User shows but token null | Login thunk storing token? |
| API requests fail 401 | Axios interceptor working? Token in header? |
| Logout doesn't clear cache | queryClient.clear() called? |
| Refresh token cookie missing | Backend setting httpOnly cookie? |
| Login page shows when logged in | ProtectedRoute checking Redux token? |

## Endpoints Required

| Method | Path | Uses | Returns |
|--------|------|------|---------|
| POST | `/api/auth/login` | Credentials | `{ok, accessToken, user}` |
| POST | `/api/auth/refresh` | httpOnly cookie | `{ok, accessToken}` |
| GET | `/api/auth/me` | Authorization header | User object |
| POST | `/api/auth/logout` | Authorization header | `{ok}` |

## Key Files

- `src/features/AuthSlice.js` - Redux state & thunks
- `src/services/AuthService.js` - API client
- `src/lib/authUtils.js` - Token utilities
- `src/lib/axios.js` - Axios config & interceptors
- `src/components/forms/LoginForm.jsx` - Login form
- `src/providers/AuthProvider.jsx` - Session restoration

## Documentation

- **AUTH_IMPLEMENTATION_GUIDE.md** - Complete guide with all details
- **AUTH_CHANGES_SUMMARY.md** - What changed and why
- **AUTH_QUICK_REFERENCE.md** - This file (quick lookup)
