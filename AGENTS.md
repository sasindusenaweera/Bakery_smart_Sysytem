# Agent Guidelines for SBH Project

## Project Overview

This is a full-stack web application with separate Backend and Frontend directories. The specific technologies and frameworks are not yet defined - update this section as the project takes shape.

---

## Build, Lint, and Test Commands

### Backend Commands

```bash
# Install dependencies
cd Backend
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run type checker
npm run typecheck

# Run tests
npm test

# Run a single test file
npm test -- <test-file-path>

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Frontend Commands

```bash
# Install dependencies
cd Frontend
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run type checker
npm run typecheck

# Run tests
npm test

# Run a single test file
npm test -- <test-file-path>

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Running a Single Test

To run a single test file or test case:

```bash
# Run specific test file
npm test -- src/path/to/testfile.test.ts

# Run specific test by name
npm test -- --testNamePattern="test name"

# Run tests in specific file with watch mode
npm test -- src/path/to/testfile.test.ts --watch
```

---

## Code Style Guidelines

### General Principles

- Keep functions small and focused (single responsibility)
- Write self-documenting code with clear variable/function names
- Avoid magic numbers - use constants or enums
- Handle errors explicitly - never swallow errors silently

### Imports and Exports

- Use explicit named exports over default exports
- Order imports: external libraries, internal modules, relative imports
- Use path aliases defined in tsconfig.json when available
- Group imports by type: React/components, hooks, utilities, types

```typescript
// Good import order
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/hooks'
import { formatDate, validateEmail } from '@/utils'
import { User } from '@/types'
import { userService } from '@/services'
```

### Formatting

- Use Prettier for code formatting (configured in `.prettierrc`)
- Run `npm run lint` before committing
- Maximum line length: 100 characters (or project default)
- Use 2 spaces for indentation
- Use single quotes for strings in JavaScript/TypeScript

### Types

- Always define types for API responses, function parameters, and state
- Use interfaces for object shapes, types for unions/intersections
- Avoid `any` - use `unknown` when type is truly unknown
- Enable strict mode in TypeScript configuration

```typescript
// Good type definitions
interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

type UserRole = 'admin' | 'user' | 'guest'

// Good function typing
function getUserById(id: string): Promise<User | null> {
  // implementation
}
```

### Naming Conventions

- **Files**: Use kebab-case for files (`user-service.ts`), PascalCase for components (`UserProfile.tsx`)
- **Variables/functions**: Use camelCase (`getUserData`, `isLoading`)
- **Constants**: Use UPPER_SNAKE_CASE for true constants, camelCase for object constants
- **Classes/Types**: Use PascalCase (`class UserService`, `interface ApiResponse`)
- **Booleans**: Use prefix `is`, `has`, `can`, `should` (`isActive`, `hasPermission`)

### Error Handling

- Use try-catch for async operations
- Create custom error classes for domain-specific errors
- Always log errors with appropriate context
- Return meaningful error messages to users (sanitized)

```typescript
// Good error handling
try {
  const data = await fetchUser(id)
  return data
} catch (error) {
  if (error instanceof NotFoundError) {
    throw new ApiError('User not found', 404)
  }
  logger.error('Failed to fetch user', { userId: id, error })
  throw new ApiError('Failed to fetch user', 500)
}
```

### React/Frontend Specific

- Use functional components with hooks
- Memoize expensive computations with `useMemo` and `useCallback`
- Keep component files under 200 lines
- Extract reusable logic into custom hooks
- Use TypeScript generics for reusable components

### API Design

- Use RESTful conventions for HTTP APIs
- Return consistent response shapes
- Use proper HTTP status codes
- Version APIs (e.g., `/api/v1/`)

### Testing Guidelines

- Write tests for business logic and utility functions
- Test edge cases and error scenarios
- Use descriptive test names that explain what's being tested
- Follow AAA pattern: Arrange, Act, Assert

```typescript
describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid')).toBe(false)
  })
})
```

---

## Project Structure

```
SBH/
├── Backend/          # Backend application
│   ├── src/
│   ├── tests/
│   └── package.json
├── Frontend/         # Frontend application
│   ├── src/
│   ├── tests/
│   └── package.json
└── AGENTS.md         # This file
```

---

## Additional Notes

- Always run `npm run lint` and `npm test` before submitting code
- Update this file as project conventions evolve
- Document any project-specific patterns in this file
