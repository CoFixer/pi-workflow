---
name: frontend-dev-guidelines
description: Frontend development guidelines for React Native/TypeScript applications. Modern patterns including Expo Router, React Navigation, Redux Toolkit, NativeWind 4.x, React Native Paper components, React Hook Form + Zod validation, and Axios HTTP service. Use when creating components, screens, features, fetching data, styling, navigation, or working with mobile app code.
---

# React Native Development Guidelines

## Purpose

Comprehensive guide for modern React Native development with TypeScript, Expo Router, React Navigation, Redux Toolkit, NativeWind, and React Native Paper. Supports both the New Architecture and classic bridge architecture.

## When to Use This Skill

- Creating new components or screens
- Building new features
- Fetching data with Axios + TanStack Query
- Setting up navigation with Expo Router or React Navigation
- Styling components with NativeWind 4.x (Tailwind CSS)
- Using React Native Paper components
- Form handling with React Hook Form + Zod
- TypeScript best practices
- Platform-specific code (iOS/Android)
- Camera/vision integration
- Real-time features with WebRTC/WebSocket

---

## Tech Stack Overview

| Category | Technology |
|----------|------------|
| Framework | React Native 0.76+ (New Architecture) |
| Expo SDK | Expo SDK 52+ |
| Navigation | Expo Router 4.x / React Navigation 7.x |
| Build Tool | Metro Bundler / EAS Build |
| State Management | Redux Toolkit 2.x |
| Server State | TanStack Query 5.x |
| Styling | NativeWind 4.x (Tailwind CSS for RN) |
| UI Components | React Native Paper 5.x |
| Data Fetching | Axios (HttpService class) |
| Forms | React Hook Form 7.x + Zod 3.x |
| Storage | MMKV / AsyncStorage |
| Animations | React Native Reanimated 3.x |
| Camera | react-native-vision-camera 4.x |
| Icons | React Native Vector Icons / Expo Icons |
| Testing | Jest + React Native Testing Library |
| E2E Testing | Maestro / Detox |
| TypeScript | 5.x (strict mode) |

---

## Quick Start

### New Screen Checklist (Expo Router)

Creating a screen with Expo Router? Follow this checklist:

1. Create screen file in `app/` directory (file-based routing)
2. Use NativeWind 4.x for styling
3. Add TypeScript types
4. Handle loading/error states
5. Configure layout if needed (`_layout.tsx`)

### New Screen Checklist (React Navigation)

Creating a screen with React Navigation? Follow this checklist:

1. Create screen component in `src/screens/`
2. Add navigation route to navigator
3. Use NativeWind for styling
4. Add TypeScript types for route params
5. Handle loading/error states

### New Component Checklist

Creating a component? Follow this checklist:

1. Create in `src/components/` or `components/`
2. Use NativeWind 4.x classes
3. Add proper TypeScript props interface
4. Consider platform differences (iOS/Android)
5. Add accessibility props where appropriate

---

## Resources

For detailed guidance, read these resources in order:

1. [Navigation Guide](../../guides/navigation-guide.md) - Expo Router & React Navigation
2. [Component Patterns](../../guides/component-patterns.md) - Screen and component structure
3. [Styling Guide](../../guides/styling-guide.md) - NativeWind 4.x patterns
4. [Data Fetching](../../guides/data-fetching.md) - Axios + TanStack Query v5
5. [TypeScript Standards](../../guides/typescript-standards.md) - Type safety patterns
6. [Common Patterns](../../guides/common-patterns.md) - Camera, animations, storage patterns
7. [Performance](../../guides/performance.md) - New Architecture optimizations
