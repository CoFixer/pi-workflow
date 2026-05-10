# Frontend Best Practices

## React Component Best Practices

### Component File Organization

```typescript
// GOOD: Component with typed props, hooks at top
interface ButtonProps {
    variant?: 'primary' | 'outline';
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

export function Button({ variant = 'primary', children, onClick, disabled }: ButtonProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        if (onClick) onClick();
    };

    return (
        <button
            className={cn(
                'px-4 py-2 rounded-md',
                variant === 'primary' && 'bg-blue-500 text-white',
                variant === 'outline' && 'border border-gray-300',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handleClick}
            disabled={disabled || isLoading}
        >
            {children}
        </button>
    );
}

// BAD: Untyped props, inline styles, logic in JSX
export function Button(props) {
    return (
        <button style={{ padding: '10px' }} onClick={() => props.onClick && props.onClick()}>
            {props.children}
        </button>
    );
}
```

### Component Organization Pattern

```
components/
├── ui/                    # Reusable UI primitives (Shadcn/UI)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── layout/                # Layout components
│   ├── page-header.tsx
│   ├── bottom-nav.tsx
│   └── sidebar.tsx
└── features/              # Feature-specific components
    ├── auth/
    │   ├── LoginForm.tsx
    │   └── RegisterForm.tsx
    └── dashboard/
        ├── StatsCard.tsx
        └── ActivityList.tsx
```

---

## State Management Patterns

### When to Use Each State Type

| State Type | Use Case | Example |
|------------|----------|---------|
| **Local State** (`useState`) | UI-only state, form inputs | Modal open/close, input values |
| **Redux** | Global app state, auth | User session, app settings |
| **React Query** | Server state, API data | User list, notifications |
| **URL State** | Shareable/bookmarkable state | Filters, pagination, search |

### Redux Toolkit Slice Pattern

```typescript
// GOOD: Typed slice with initial state
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthUser } from '@/types/redux/auth';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
```

### React Query Key Factory Pattern

```typescript
// GOOD: Centralized query key factory
export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
    session: () => [...authKeys.all, 'session'] as const,
};

export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

// Usage in hooks
export function useUser(id: string) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => userService.getById(id),
    });
}
```

### React Query with Mutations

```typescript
// GOOD: Mutation with cache invalidation
export function useLogin() {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (data: LoginRequest) => authService.login(data),
        onSuccess: (response) => {
            dispatch(loginSuccess(response.data.user));
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
        onError: (error) => {
            dispatch(loginFailure(error.message));
        },
    });
}
```

---

## Form Handling (React Hook Form + Zod)

### Zod Schema Definition

```typescript
// GOOD: Schema with custom error messages
import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema with cross-field validation
export const registerSchema = z
    .object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email address').optional(),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });
```

### Form Component Pattern

```typescript
// GOOD: Form with React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/utils/validations/auth';

export function LoginForm() {
    const { mutate: login, isPending } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = (data: LoginFormData) => {
        login(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <input {...register('username')} placeholder="Username" />
                {errors.username && <span className="text-red-500">{errors.username.message}</span>}
            </div>
            <div>
                <input {...register('password')} type="password" placeholder="Password" />
                {errors.password && <span className="text-red-500">{errors.password.message}</span>}
            </div>
            <button type="submit" disabled={isPending}>
                {isPending ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
```

---

## Tailwind CSS + Shadcn/UI Patterns

### Class Composition with cn()

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
    'flex items-center gap-2',
    isActive && 'bg-blue-100',
    disabled && 'opacity-50 cursor-not-allowed'
)} />
```

### Component Variants with cva

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    {
        variants: {
            variant: {
                primary: 'bg-primary text-white hover:bg-primary/90',
                outline: 'border border-input bg-background hover:bg-accent',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
            },
            size: {
                sm: 'h-8 px-3 text-sm',
                md: 'h-10 px-4',
                lg: 'h-12 px-6 text-lg',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
    children: React.ReactNode;
}

export function Button({ variant, size, children }: ButtonProps) {
    return <button className={buttonVariants({ variant, size })}>{children}</button>;
}
```

### Responsive Design

```typescript
// Mobile-first responsive pattern
<div className="
    grid grid-cols-1          /* Mobile: 1 column */
    sm:grid-cols-2            /* Tablet: 2 columns */
    lg:grid-cols-3            /* Desktop: 3 columns */
    gap-4
">
    {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Hide/show based on screen size
<nav className="hidden md:flex">Desktop nav</nav>
<nav className="flex md:hidden">Mobile nav</nav>
```

---

## Socket.IO Frontend Patterns

### Frontend Socket Service Pattern

```typescript
// GOOD: Singleton service with typed events
class ChatSocketService {
    private socket: Socket | null = null;

    connect(): Socket {
        if (this.socket?.connected) return this.socket;

        this.socket = io('/chat', {
            withCredentials: true,  // Send cookies
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
        });

        return this.socket;
    }

    onNewMessage(callback: (event: NewMessageEvent) => void): void {
        this.socket?.on('message:new', callback);
    }

    offNewMessage(): void {
        this.socket?.off('message:new');
    }
}

export const chatSocketService = new ChatSocketService();
```

### React Hook Pattern for Socket Rooms

```typescript
// GOOD: Hook with proper cleanup and React Query integration
export function useChatRoomSocket({ roomId, enabled = true }) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!enabled || !chatSocketService.isConnected()) return;

        chatSocketService.joinRoom(roomId);

        const handleNewMessage = (event: NewMessageEvent) => {
            if (event.roomId !== roomId) return;

            // Update React Query cache directly for instant UI update
            queryClient.setQueryData<ChatMessage[]>(
                chatKeys.messages(roomId),
                (old = []) => [...old, event.message]
            );
        };

        chatSocketService.onNewMessage(handleNewMessage);

        return () => {
            chatSocketService.offNewMessage();
            chatSocketService.leaveRoom(roomId);
        };
    }, [roomId, enabled, queryClient]);
}
```

---

## Related Guides

For more detailed patterns, see:
- [Component Patterns](component-patterns.md) - Detailed component structure
- [Data Fetching](data-fetching.md) - API integration patterns
- [TanStack Query](tanstack-query.md) - Query patterns
- [TypeScript Standards](typescript-standards.md) - Type safety guidelines
- [Authentication Architecture](authentication-architecture.md) - Auth flow details

---

## Playwright E2E Testing

### Page Object Model Pattern

```typescript
// test/page-objects/login.page.ts
import { Locator, Page } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.getByTestId('username-input');
        this.passwordInput = page.getByTestId('password-input');
        this.submitButton = page.getByRole('button', { name: /login/i });
        this.errorMessage = page.getByRole('alert');
    }

    async goto() {
        await this.page.goto('/auth/login');
    }

    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async expectErrorMessage(message: string) {
        await expect(this.errorMessage).toContainText(message);
    }
}
```

### Custom Test Fixtures

```typescript
// test/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';

type AuthFixtures = {
    loginPage: LoginPage;
    login: (username: string, password: string) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
    login: async ({ page }, use) => {
        const loginFn = async (username: string, password: string) => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();
            await loginPage.login(username, password);
            await page.waitForURL('/dashboard');
        };
        await use(loginFn);
    },
});

export { expect } from '@playwright/test';
```

### Test Structure

```typescript
// test/tests/auth/login.spec.ts
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Login Page', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    test('should display login form', async ({ loginPage }) => {
        await expect(loginPage.usernameInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ loginPage }) => {
        await loginPage.login('invalid', 'wrong');
        await loginPage.expectErrorMessage('Invalid credentials');
    });

    test('should redirect to dashboard on success', async ({ page, login }) => {
        await login('admin@example.com', 'Password123!');
        await expect(page).toHaveURL('/dashboard');
    });
});
```
