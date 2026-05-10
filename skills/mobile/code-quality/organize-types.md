# Organize Types - React Native

Analyze and maintain TypeScript type organization in React Native mobile codebase.

## What this skill does

Scans the React Native codebase to identify type organization issues and maintain the established type structure:

1. **Find misplaced types**: Identify type definitions outside the `types/` folder
2. **Detect duplicates**: Find duplicate type definitions across multiple files
3. **Check reusability**: Identify types used in 2+ files that should be centralized
4. **Suggest organization**: Recommend proper location based on type category
5. **Validate navigation types**: Ensure navigation param types are properly defined
6. **Check barrel exports**: Validate that all barrel exports (`index.ts`) are up-to-date

## When to use this skill

Run this skill when:
- **Adding new screens** - to ensure screen prop types are properly organized
- **Creating API services** - to organize request/response types
- **Refactoring components** - to check for duplicate types
- **Before releases** - to maintain clean type organization
- **After major changes** - to verify type organization consistency

## Type Organization Structure

React Native projects use a structured approach to organize TypeScript types:

```
mobile/src/types/
├── index.ts                      # Root barrel export
├── navigation.ts                 # Navigation param types
├── api/                          # API Request/Response contracts
│   ├── index.ts
│   ├── auth.ts                   # Auth API types
│   ├── user.ts                   # User API types
│   └── common.ts                 # ApiResponse<T>, ErrorResponse
├── entities/                     # Domain entities
│   ├── index.ts
│   ├── user.ts
│   ├── post.ts
│   └── notification.ts
├── screens/                      # Screen-specific types (if complex)
│   ├── index.ts
│   └── profile.ts                # ProfileScreenProps, ProfileState
├── ui/                           # Reusable UI component props
│   ├── index.ts
│   └── common.ts                 # ButtonProps, CardProps (if shared)
└── store/                        # State management types
    ├── index.ts
    ├── auth.ts                   # AuthState, AuthActions
    └── app.ts                    # AppState
```

## Organization Rules

### 1. Navigation Types → `types/navigation.ts`

```typescript
// ✅ GOOD: Centralized navigation types
// types/navigation.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Stack param lists
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
  Auth: { screen?: keyof AuthStackParamList };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: { referralCode?: string };
  ForgotPassword: undefined;
};

// Screen props shortcuts
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Tab param list
export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  ProfileTab: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
```

### 2. API Types → `types/api/`

```typescript
// ✅ GOOD: API types organized by domain
// types/api/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// types/api/common.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 3. Entity Types → `types/entities/`

```typescript
// ✅ GOOD: Domain entities
// types/entities/user.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  followers: number;
  following: number;
}
```

### 4. Screen Props → Inline or `types/screens/`

```typescript
// ✅ GOOD: Simple screen - props inline
// screens/HomeScreen.tsx
import type { RootStackScreenProps } from '~/types/navigation';

type Props = RootStackScreenProps<'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  // ...
};

// ✅ GOOD: Complex screen - types in separate file
// types/screens/profile.ts
export interface ProfileScreenState {
  isEditing: boolean;
  formData: ProfileFormData;
  errors: Record<string, string>;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
}
```

### 5. Store Types → `types/store/`

```typescript
// ✅ GOOD: Zustand/Redux state types
// types/store/auth.ts
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;
```

## What to Check

### ✅ Good Practices
- Navigation types in `types/navigation.ts`
- API types in `types/api/`
- Entity types in `types/entities/`
- Store types in `types/store/`
- Barrel exports (`index.ts`) in each folder
- Simple screen props inline
- Complex screen types in `types/screens/`

### ❌ Issues to Flag
- Navigation types scattered across files
- API response types defined in service files
- Duplicate type definitions
- Types used in 2+ files but not centralized
- Component props exported but only used once
- Missing barrel exports

## Example Output

When running this skill, provide a report like this:

```
## Type Organization Report

### ✅ Well Organized
- types/navigation.ts - All nav types centralized
- types/api/auth.ts - Auth API types
- types/entities/user.ts - User entity

### ⚠️ Issues Found

**1. Navigation Types Scattered**
- `ProfileScreenParams` defined in:
  - screens/ProfileScreen.tsx ❌
  **Action**: Move to types/navigation.ts

**2. Duplicate Types**
- `User` interface defined in:
  - types/entities/user.ts ✅
  - services/authService.ts ❌
  **Action**: Remove from authService, import from types

**3. API Types in Service**
- types/api/user.ts missing
- User API types in services/userService.ts
  **Action**: Move to types/api/user.ts

**4. Missing Barrel Export**
- types/api/index.ts doesn't export auth.ts
  **Action**: Add `export * from './auth'`

### 📊 Summary
- Total type files: 15
- Well organized: 12 (80%)
- Issues: 3 (20%)
```

## Common Patterns

### Good Import Patterns

```typescript
// ✅ GOOD: Import from barrel
import type { User, UserProfile } from '~/types/entities';
import type { LoginRequest, ApiResponse } from '~/types/api';
import type { RootStackScreenProps } from '~/types/navigation';

// ❌ BAD: Deep imports
import type { User } from '~/types/entities/user';
```

### Keep Inline (Component-specific)

```typescript
// ✅ GOOD: Component-specific props stay inline
// components/ui/Avatar.tsx
interface AvatarProps {
  uri?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

export const Avatar = ({ uri, size = 'md', fallback }: AvatarProps) => {
  // ...
};
```

### Centralize (Shared types)

```typescript
// ✅ GOOD: Shared types in types/
// types/ui/common.ts
export interface SelectOption {
  label: string;
  value: string;
}

// Used by multiple components
import type { SelectOption } from '~/types/ui';
```

## Instructions for Claude

When this skill is invoked:

1. **Scan for type definitions**:
   - Search for `export interface`, `export type` outside `types/` folder
   - Check screen files, service files, component files

2. **Check navigation types**:
   - Verify all `ParamList` types are in `types/navigation.ts`
   - Check screen props use centralized types

3. **Check for duplicates**:
   - Find identical type names in multiple locations
   - Compare definitions

4. **Validate structure**:
   - Check barrel exports exist
   - Verify exports are up-to-date

5. **Generate report**:
   - List well-organized types
   - Flag issues with specific actions
   - Provide summary

## Related Documentation

- [typescript-standards.md](../../guides/typescript-standards.md) - TS standards
- [file-organization.md](../../guides/file-organization.md) - File structure
- [navigation-guide.md](../../guides/navigation-guide.md) - Navigation types
