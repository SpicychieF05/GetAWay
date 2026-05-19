<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:github-copilot-rules -->
# GitHub Copilot Agent Rules

## 1. Code Style and Conventions

### 1.1 Code Style

- **Language**: Use English for all code comments and documentation.
- **Comments**: Add comments to explain complex logic or non-obvious code.
- **Naming**: Use descriptive variable names and follow TypeScript naming conventions.
- **File Structure**: Organize files logically within the `src` directory.

### 1.2 TypeScript

- **Strict Mode**: Always enable `strict: true` in `tsconfig.json`.
- **Type Safety**: Use explicit types instead of `any` whenever possible.
- **Interfaces**: Prefer interfaces over types for object shapes when appropriate.

### 1.3 React Components

- **Functional Components**: Use functional components with React hooks.
- **Props**: Use TypeScript interfaces for component props.
- **Child Components**: Create child components in separate files when a component becomes large or complex.

## 2. State Management

- **Redux Toolkit**: Use Redux Toolkit for global state management.
- **Slice Pattern**: Create a slice for each feature with a reducer, actions, and selectors.
- **Normalization**: Normalize state for arrays of items where possible.

## 3. API and Data Handling

- **API Layer**: Create an `api` directory for API calls.
- **Axios**: Use axios for HTTP requests with proper error handling.
- **Query Parameters**: Use `URLSearchParams` for building query strings.

## 4. UI and Styling

- **Tailwind CSS**: Use Tailwind CSS for styling.
- **Utility Classes**: Compose utility classes for responsive design.
- **Mobile-First**: Design mobile-first and use responsive breakpoints.
- **Components**: Create reusable components in the `components` directory.

## 5. Testing

- **Jest**: Use Jest for unit testing.
- **React Testing Library**: Use React Testing Library for component testing.
- **Mocking**: Mock external dependencies and API calls.
- **Coverage**: Aim for high test coverage on critical components.

## 6. Performance and Optimization

- **Lazy Loading**: Use `React.lazy()` and `Suspense` for code splitting.
- **Memoization**: Use `React.memo()`, `useMemo()`, and `useCallback()` where appropriate.
- **List Rendering**: Always use `key` props when rendering lists.

## 7. Accessibility

- **ARIA Labels**: Add ARIA labels to interactive elements.
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible.
- **Semantic HTML**: Use appropriate HTML5 semantic elements.

## 8. Internationalization

- **i18next**: Use i18next for i18n implementation.
- **Translation Keys**: Use descriptive translation keys.
- **Language Detection**: Detect user's language from browser settings.

## 9. File Structure

```
src/
  api/          # API service layer
  components/   # Reusable React components
  features/     # Feature-specific components and logic
  store/        # Redux store configuration
  styles/       # Global styles and themes
  utils/        # Utility functions
```

## 10. Development Workflow

- **Branching**: Create a new branch for each feature or bug fix.
- **Commits**: Write clear, descriptive commit messages.
- **Code Review**: Submit Pull Requests for review before merging.
- **Testing**: Run tests before submitting code changes.

## 11. Security

- **XSS Prevention**: Sanitize user inputs and avoid `dangerouslySetInnerHTML`.
- **CSRF Protection**: Use appropriate CSRF tokens for state-changing requests.
- **Sensitive Data**: Do not hardcode API keys or sensitive information in the frontend.
- **Dependency Security**: Keep dependencies updated and use `npm audit` regularly.

## 12. Error Handling

- **Global Error Boundary**: Implement an error boundary to catch React errors.
- **Network Errors**: Handle network errors gracefully with user-friendly messages.
- **Logging**: Log errors to a central service (e.g., Sentry, LogRocket) in production.
<!-- END:github-copilot-rules -->
