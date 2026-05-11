# API Integration Guide

This guide maps frontend screens to their required backend API endpoints. Use this when implementing data fetching for any screen.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Public/Auth Routes](#publicauth-routes)
- [Coach Routes](#coach-routes)
- [Patient Routes](#patient-routes)
- [Shared/Common APIs](#sharedcommon-apis)
- [Implementation Patterns](#implementation-patterns)
- [After Successful Integration](#after-successful-integration)

---

## Quick Reference

| Route Group | Screens | Total API Calls |
|-------------|---------|-----------------|
| Public/Auth | 8 | ~6 endpoints |
| Coach | 10 | ~25 endpoints |
| Patient | 10 | ~22 endpoints |
| Shared | - | 5 endpoints |

**Full API documentation:** [PROJECT_API.md](../../../../.project/docs/PROJECT_API.md)

**Screen-to-API mapping:** [PROJECT_API_INTEGRATION.md](../../../../.project/docs/PROJECT_API_INTEGRATION.md)

---

## Public/Auth Routes

### Login (`/`)
**Component:** `pages/auth/index.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Login | POST | `/auth/login` | Authenticate user |

### Registration (`/register`)
**Component:** `pages/auth/register.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Register | POST | `/users` | Create new user |

### Forgot Password (`/forgot-password`)
**Component:** `pages/auth/forgot-password.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Request OTP | POST | `/auth/forgot-password` | Send password reset OTP |
| Reset Password | POST | `/auth/reset-password` | Reset password with OTP |

### Patient Signup (`/signup/patient`)
**Component:** `pages/auth/signup/patient.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Register | POST | `/users` | Create patient (role: PATIENT) |

### Coach Signup (`/signup/coach`)
**Component:** `pages/auth/signup/coach.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Register | POST | `/users` | Create coach (role: COACH) |

---

## Coach Routes

### Coach Dashboard (`/coach`)
**Component:** `pages/coach/home.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Today's Meetings | GET | `/meetings/coach/today` | Get today's sessions |
| Check Login | GET | `/auth/check-login` | Verify authentication |

### Patient List (`/coach/patients`)
**Component:** `pages/coach/patients.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Patients | GET | `/users?role=PATIENT` | List coach's patients |

### Patient Detail (`/coach/patient/:id`)
**Component:** `pages/coach/patient-detail.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Patient | GET | `/users/:id` | Get patient info |
| Get Prescriptions | GET | `/exercise-prescriptions/patient/:patientId` | Get patient's exercises |

### Patient Exercise History (`/coach/patient/:id/exercise-history`)
**Component:** `pages/coach/patient-exercise-history.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Exercise History | GET | `/exercise-days/patient/:patientId/history` | Get exercise day summaries |
| Exercise Logs | GET | `/exercise-logs/patient/:patientId/range` | Get detailed exercise logs |

### Patient Survey History (`/coach/patient/:id/survey-history`)
**Component:** `pages/coach/patient-survey-history.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Survey History | GET | `/surveys/patient/:patientId/history` | Get patient's surveys |

### Coach Calendar (`/coach/calendar`)
**Component:** `pages/coach/calendar.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Meetings | GET | `/meetings/coach/range` | Get meetings for date range |

### Chat List (`/coach/chat`)
**Component:** `pages/coach/chat.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Rooms | GET | `/chat/rooms` | Get all chat rooms |

### Chat Detail (`/coach/chat/:id`)
**Component:** `pages/coach/chat-detail.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Room | GET | `/chat/rooms/:id` | Get room details |
| Get Messages | GET | `/chat/rooms/:id/messages` | Get chat messages |
| Send Message | POST | `/chat/rooms/:id/messages` | Send new message |
| Mark Read | PUT | `/chat/rooms/:id/read` | Mark messages as read |

### Create Session (`/coach/session/create`)
**Component:** `pages/coach/session-create.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Create Meeting | POST | `/meetings` | Create Zoom meeting |

### Session Detail (`/coach/session/:id`)
**Component:** `pages/coach/session-detail.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Meeting | GET | `/meetings/:id` | Get meeting details |
| Update Meeting | PATCH | `/meetings/:id` | Update meeting info |
| Complete Meeting | PATCH | `/meetings/:id/complete` | Mark as completed |
| Cancel Meeting | PATCH | `/meetings/:id/cancel` | Cancel the meeting |

---

## Patient Routes

### Patient Dashboard (`/patient`)
**Component:** `pages/patient/home.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Today's Survey | GET | `/surveys/daily/today` | Check if survey completed |
| Exercises with Logs | GET | `/exercise-prescriptions/patient/:id/with-logs` | Today's exercises + progress |
| Next Meeting | GET | `/meetings/patient/next` | Get upcoming session |

### Patient Calendar (`/patient/calendar`)
**Component:** `pages/patient/calendar.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Meetings | GET | `/meetings/patient/range` | Get meetings for date range |

### Exercise List (`/patient/exercise`)
**Component:** `pages/patient/exercise.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Prescriptions | GET | `/exercise-prescriptions/patient/:id` | Get assigned exercises |
| Get Logs | GET | `/exercise-logs` | Get today's exercise logs |

### Exercise Detail (`/patient/exercise/:id`)
**Component:** `pages/patient/exercise-detail.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Exercise | GET | `/exercises/:id` | Get exercise details |
| Log Exercise | POST | `/exercise-logs` | Record exercise completion |

### Exercise History (`/patient/exercise/history`)
**Component:** `pages/patient/exercise-history.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get History | GET | `/exercise-days/history` | Get exercise day history |
| Get Logs | GET | `/exercise-logs/range` | Get logs for date range |

### Daily Survey (`/patient/survey`)
**Component:** `pages/patient/survey.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Submit Survey | POST | `/surveys/daily` | Submit daily survey |

### Survey History (`/patient/survey/history`)
**Component:** `pages/patient/survey-history.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get History | GET | `/surveys/history` | Get survey history |

### Chat List (`/patient/chat`)
**Component:** `pages/patient/chat.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Rooms | GET | `/chat/rooms` | Get all chat rooms |

### Chat Detail (`/patient/chat/:id`)
**Component:** `pages/patient/chat-detail.tsx`

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Get Room | GET | `/chat/rooms/:id` | Get room details |
| Get Messages | GET | `/chat/rooms/:id/messages` | Get chat messages |
| Send Message | POST | `/chat/rooms/:id/messages` | Send new message |
| Mark Read | PUT | `/chat/rooms/:id/read` | Mark messages as read |

---

## Shared/Common APIs

These APIs are used across multiple screens:

| API | Method | Endpoint | Used For |
|-----|--------|----------|----------|
| Check Login | GET | `/auth/check-login` | Verify session on protected routes |
| Logout | GET | `/auth/logout` | User logout |
| Refresh Token | GET | `/auth/refresh-access-token` | Token refresh (automatic) |
| Get Profile | GET | `/users/:id` | User profile pages |
| Update Profile | PATCH | `/users/:id` | Profile editing |
| Register FCM | POST | `/auth/register-fcm-token` | Push notifications |

---

## Implementation Patterns

### Creating an API Service

```typescript
// services/httpServices/meetingService.ts
import { get, post, patch } from '../httpMethods';
import type { Meeting, CreateMeetingDto } from '~/types/meeting';

export const meetingService = {
  getTodayMeetings: () =>
    get<Meeting[]>('/meetings/coach/today'),

  createMeeting: (data: CreateMeetingDto) =>
    post<Meeting>('/meetings', data),

  getMeeting: (id: string) =>
    get<Meeting>(`/meetings/${id}`),

  updateMeeting: (id: string, data: Partial<Meeting>) =>
    patch<Meeting>(`/meetings/${id}`, data),
};
```

### Creating a Redux Slice with Thunks

```typescript
// redux/features/meetingSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { meetingService } from '~/services/httpServices/meetingService';

export const fetchTodayMeetings = createAsyncThunk(
  'meetings/fetchToday',
  async () => {
    const response = await meetingService.getTodayMeetings();
    return response.data;
  }
);

const meetingSlice = createSlice({
  name: 'meetings',
  initialState: {
    meetings: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayMeetings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodayMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(fetchTodayMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
```

### Using in a Component

```typescript
// pages/coach/home.tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { fetchTodayMeetings } from '~/redux/features/meetingSlice';

export default function CoachHome() {
  const dispatch = useAppDispatch();
  const { meetings, loading } = useAppSelector((state) => state.meetings);

  useEffect(() => {
    dispatch(fetchTodayMeetings());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
```

---

## After Successful Integration

Once your API integration is working correctly, follow these steps:

### Integration Verification Checklist

- [ ] API calls return expected data
- [ ] Loading states display correctly
- [ ] Error states are handled gracefully
- [ ] TypeScript types match API response
- [ ] Redux state updates properly
- [ ] Component renders data correctly
- [ ] No console errors or warnings

### Create Pull Request

When integration is complete and verified, create a PR to the dev branch:

```bash
# Check your changes
git status
git diff

# Stage and commit
git add .
git commit -m "feat: Integrate [feature] API endpoints"

# Push and create PR
git push -u origin HEAD
gh pr create --base dev --title "feat: [Feature] API integration" --body "$(cat <<'EOF'
## Summary
- Integrated [endpoint] API for [feature]
- Added Redux slice for state management
- Created HTTP service methods

## APIs Integrated
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/example | GET | Fetch data |

## Test Plan
- [ ] Verified API responses in Network tab
- [ ] Tested loading/error states
- [ ] Confirmed data displays correctly

---
Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

For detailed PR creation workflow, see [Create Dev PR](create-dev-pr.md).

---

## Related Resources

- [Data Fetching Guide](data-fetching.md) - HttpService patterns
- [Common Patterns](common-patterns.md) - Redux and form patterns
- [Complete Examples](complete-examples.md) - Full working examples
- [Create Dev PR](create-dev-pr.md) - Submit integration for review
