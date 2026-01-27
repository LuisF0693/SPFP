# Contributing to SPFP

Thank you for your interest in contributing to SPFP (Sistema de Planejamento Financeiro Pessoal)! This guide will help you get started.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Conventions](#commit-conventions)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and professional
- Welcome feedback and questions
- Focus on criticism of ideas, not individuals
- Help create a safe space for everyone

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- A GitHub account

### Local Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SPFP.git
   cd SPFP
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `test/description` - Adding or updating tests
- `chore/description` - Build, dependencies, tooling

**Example:**
```bash
git checkout -b feat/add-transaction-import
git checkout -b fix/dashboard-memory-leak
```

### Work with Stories

1. **Find a story to work on**
   - Check `/docs/stories/` for development stories
   - Look for stories with `[ ]` unchecked tasks

2. **Create a feature branch from the story**
   ```bash
   git checkout -b feat/story-name
   ```

3. **Update story progress as you work**
   - Mark completed tasks with `[x]`
   - Update the File List section
   - Commit the story file updates

4. **Reference the story in commits**
   ```bash
   git commit -m "feat: implement X [Story ID]"
   ```

### Sprint Branches

Work is organized by sprints:

- `sprint-0` - Foundation work
- `sprint-1` - Security & Types
- `sprint-2-3` - Architecture
- `sprint-4` - Frontend
- `sprint-5-6` - Database

Check out the appropriate sprint branch when starting work.

## Coding Standards

### TypeScript

- Use strict mode (enabled in tsconfig.json)
- Define types explicitly; avoid `any`
- Use interfaces for object shapes
- Use proper union types instead of wide types

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User | null {
  // ...
}

// Avoid
function getUser(id: any): any {
  // ...
}
```

### React Best Practices

- Use functional components with hooks
- Prefer composition over complex conditionals
- Keep components focused and single-responsibility
- Extract custom hooks for reusable logic
- Use React.memo for performance-critical components

```typescript
// Good
interface UserCardProps {
  userId: string;
}

export const UserCard: React.FC<UserCardProps> = ({ userId }) => {
  const user = useUser(userId);

  if (!user) return <LoadingCard />;

  return <div>{user.name}</div>;
};

export default React.memo(UserCard);
```

### Code Organization

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── features/       # Feature-specific components
├── context/            # React Context providers
├── services/           # Business logic & API
├── hooks/              # Custom React hooks
├── types/              # TypeScript types & interfaces
├── utils/              # Utility functions
├── data/               # Static data & constants
└── test/               # Test files
```

### Naming Conventions

- **Files**: PascalCase for components (Component.tsx), camelCase for utilities (helper.ts)
- **Functions**: camelCase (getUser, handleSubmit)
- **Constants**: UPPER_SNAKE_CASE (MAX_ITEMS, API_URL)
- **Classes**: PascalCase (UserService, ApiClient)
- **Interfaces**: PascalCase, prefix with I or use convention without prefix (User, UserProps)

### Code Style

- Use semicolons consistently
- Use 2-space indentation
- Max line length: 100 characters (soft limit)
- Use meaningful variable names
- Add comments for complex logic
- Avoid console.log in production code

```typescript
// Good
const calculateMonthlyBudget = (annualBudget: number): number => {
  return annualBudget / 12;
};

// Avoid
const calc = (x: any) => x / 12; // Unclear and poorly typed
```

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without feature change
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build, dependencies, tooling
- `ci:` - CI/CD configuration changes

### Examples

```bash
git commit -m "feat(transactions): add recurring transaction support"
git commit -m "fix(dashboard): resolve memory leak in chart updates"
git commit -m "docs: update installation instructions"
git commit -m "refactor(auth): simplify authentication flow"
```

## Pull Request Process

### Before Submitting

1. **Update your branch with main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Ensure all checks pass**
   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

3. **Self-review your code**
   - Does it follow project conventions?
   - Are there any obvious bugs or issues?
   - Is error handling adequate?
   - Are there console.log statements to remove?

### Creating the PR

1. **Push your branch**
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Open a PR on GitHub**
   - Use the PR template (auto-populated)
   - Fill in all sections of the template
   - Link related issues with "Closes #123"
   - Request reviewers
   - Add labels and project

### PR Guidelines

- **Title**: Clear, concise, and descriptive
- **Description**: Explain the "why" not just the "what"
- **Scope**: Keep PRs focused - split large changes
- **Tests**: Include tests for new functionality
- **Documentation**: Update docs for public APIs
- **Checklist**: Complete all items in PR template

### Review Process

- At least one approval required before merge
- CI/CD checks must pass (lint, tests, build)
- Address all requested changes
- Resolve conversations before merging
- Maintain a clean commit history (rebase if needed)

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- transactions.test.ts

# Run tests with UI
npm run test:ui
```

### Writing Tests

Use Vitest and React Testing Library:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should display user name', () => {
    render(<UserCard userId="123" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    render(<UserCard userId="123" />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

- Aim for at least 70% code coverage
- Prioritize testing:
  - Business logic
  - Edge cases
  - Error scenarios
  - User interactions
  - API integrations

## Documentation

### Update Documentation When

- Adding new features
- Changing existing functionality
- Creating new utilities or hooks
- Updating configuration
- Modifying API integrations

### Documentation Files

- **CLAUDE.md** - Project overview and architecture
- **ARCHITECTURE.md** - Detailed system design
- **DEPLOYMENT.md** - Deployment and release process
- **README.md** - Project intro and quick start
- **Code Comments** - Complex logic and edge cases

### Code Documentation

```typescript
/**
 * Calculates the monthly budget from annual budget
 *
 * @param annualBudget - The annual budget in dollars
 * @returns Monthly budget (annual / 12)
 * @throws Error if annualBudget is negative
 *
 * @example
 * const monthly = calculateMonthlyBudget(12000);
 * console.log(monthly); // 1000
 */
export function calculateMonthlyBudget(annualBudget: number): number {
  if (annualBudget < 0) {
    throw new Error('Annual budget cannot be negative');
  }
  return annualBudget / 12;
}
```

## Getting Help

- **Questions**: Open a discussion or ask in PR comments
- **Issues**: Check existing issues before opening new ones
- **Documentation**: Read CLAUDE.md and ARCHITECTURE.md
- **Slack**: Join the SPFP team channel for real-time help

## Recognition

Contributors are recognized in:
- Git commit history
- Pull request reviews
- Release notes for major contributions
- CONTRIBUTORS.md file (coming soon)

---

Thank you for contributing to SPFP! Your efforts help make financial planning accessible to everyone.
