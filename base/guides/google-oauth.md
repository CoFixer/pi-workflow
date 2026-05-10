# Google OAuth Integration Guide

How to integrate Google OAuth login in our NestJS + React stack.

---

## Overview

Our stack uses the **OAuth 2.0 Implicit Flow** for Google login:
- Frontend initiates OAuth and receives `access_token` directly
- Backend validates token via Google's userinfo endpoint
- JWT tokens stored in httpOnly cookies

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Google    │────▶│  Frontend   │────▶│   Backend   │
│             │     │   OAuth     │     │  Callback   │     │  Validate   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      │ 1. Click login    │                   │                   │
      │──────────────────▶│                   │                   │
      │                   │ 2. Auth page      │                   │
      │◀──────────────────│                   │                   │
      │ 3. User consents  │                   │                   │
      │──────────────────▶│                   │                   │
      │                   │ 4. Redirect with  │                   │
      │                   │    access_token   │                   │
      │                   │──────────────────▶│                   │
      │                   │                   │ 5. POST /social-login
      │                   │                   │──────────────────▶│
      │                   │                   │                   │ 6. Validate token
      │                   │                   │                   │    with Google
      │                   │                   │ 7. Set cookies    │
      │                   │                   │◀──────────────────│
      │ 8. Redirect to    │                   │                   │
      │    dashboard      │                   │                   │
      │◀──────────────────────────────────────│                   │
```

---

## Setup Requirements

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Authorized JavaScript origins**: `http://localhost:5173` (dev)
   - **Authorized redirect URIs**: `http://localhost:5173/auth/callback/google`
7. Copy the **Client ID**

### 2. Environment Variables

**Frontend** (`.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Key Files

### Frontend

| File | Purpose |
|------|---------|
| `components/auth/SocialLoginButtons.tsx` | Initiates OAuth flow |
| `pages/auth/callback.tsx` | Handles OAuth callback |
| `services/httpServices/authService.ts` | API calls to backend |
| `routes/auth.routes.ts` | Route registration |

### Backend

| File | Purpose |
|------|---------|
| `modules/auth/auth.service.ts` | Token validation, user creation |
| `modules/auth/auth.controller.ts` | `/social-login` endpoint |
| `shared/enums/social-login-type.enum.ts` | Provider enum values |

---

## Implementation Details

### Frontend: Initiating OAuth

```typescript
// SocialLoginButtons.tsx
const handleGoogleLogin = async () => {
  const state = generateState();

  // IMPORTANT: Use localStorage, not sessionStorage
  // sessionStorage can be cleared during redirects
  localStorage.setItem('oauth_state', state);
  localStorage.setItem('oauth_provider', 'GOOGLE');

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/callback/google`,
    response_type: 'token',  // Implicit flow - returns access_token
    scope: 'email profile',
    state: state,
    prompt: 'select_account',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};
```

### Frontend: Handling Callback

```typescript
// callback.tsx
// Google returns access_token in URL hash (not query params)
const hash = window.location.hash;
const hashParams = new URLSearchParams(hash.substring(1));
const accessToken = hashParams.get('access_token');

// Fetch user info from Google
const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
  headers: { Authorization: `Bearer ${accessToken}` }
}).then(r => r.json());

// Send to backend
await dispatch(socialLogin({
  token: accessToken,
  email: userInfo.email,
  fullName: userInfo.name,
  socialLoginType: 3,  // GOOGLE = 3 (numeric!)
  termsAndConditionsAccepted: true,  // Required for new users
}));
```

### Backend: Validating Token

```typescript
// auth.service.ts
private async verifyGoogleToken(token: string) {
  // IMPORTANT: Use userinfo endpoint for access tokens
  // Do NOT use tokeninfo endpoint (that's for id_tokens)
  const response = await axios.get(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const googleUser = response.data;

  if (!googleUser.verified_email) {
    throw new BadRequestException('Email not verified');
  }

  return {
    email: googleUser.email,
    fullName: googleUser.name,
    sub: googleUser.id,
  };
}
```

---

## Common Gotchas

### 1. SocialLoginTypeEnum is Numeric

```typescript
// Backend expects numbers, not strings!
enum SocialLoginTypeEnum {
  APPLE = 1,
  KAKAO = 2,
  GOOGLE = 3,
  NAVER = 4,
}

// Frontend must send: socialLoginType: 3
// NOT: socialLoginType: 'GOOGLE'
```

### 2. State Must Use localStorage

```typescript
// WRONG - sessionStorage can be cleared during redirect
sessionStorage.setItem('oauth_state', state);

// CORRECT - localStorage persists
localStorage.setItem('oauth_state', state);
```

### 3. Access Token vs ID Token

| Token Type | Returned When | Validate With |
|------------|---------------|---------------|
| `access_token` | `response_type=token` | userinfo endpoint |
| `id_token` | `response_type=id_token` | tokeninfo endpoint |

Our stack uses `access_token` (implicit flow).

### 4. New Users Need Terms Acceptance

```typescript
// For new user registration via social login
{
  termsAndConditionsAccepted: true  // Required!
}
```

### 5. Route Path Must Include Prefix

```typescript
// auth.routes.ts
// WRONG - won't match /auth/callback/google
route("callback/:provider", "pages/auth/callback.tsx")

// CORRECT
route("auth/callback/:provider", "pages/auth/callback.tsx")
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `redirect_uri_mismatch` | URI not in Google Console | Add exact URI including port |
| `State mismatch` | sessionStorage cleared | Use localStorage instead |
| `Invalid Google token` | Using wrong endpoint | Use userinfo for access_token |
| `socialLoginType must be 1,2,3,4` | Sending string | Send numeric enum value |
| `Please signup first` | Missing terms flag | Add `termsAndConditionsAccepted: true` |
| `Database operation failed` | Invalid entity fields | Check User entity columns |

---

## Testing Checklist

- [ ] Google Cloud Console credentials configured
- [ ] `VITE_GOOGLE_CLIENT_ID` set in frontend `.env`
- [ ] Redirect URI matches exactly (including port)
- [ ] JavaScript origin configured
- [ ] Backend running and accessible
- [ ] Database connected

---

## Related Files

- [SocialLoginButtons.tsx](../../../frontend/app/components/auth/SocialLoginButtons.tsx)
- [callback.tsx](../../../frontend/app/pages/auth/callback.tsx)
- [auth.service.ts](../../../backend/src/modules/auth/auth.service.ts)
- [social-login-type.enum.ts](../../../backend/src/shared/enums/social-login-type.enum.ts)
