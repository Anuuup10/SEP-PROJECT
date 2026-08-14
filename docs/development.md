# Development Guidelines

## General

Keep the project simple and maintainable.

Do not over-engineer features.

Build the MVP before adding advanced features.

## Before Coding

Before implementing a feature:

1. Check the project documentation.
2. Check the existing code.
3. Check whether similar functionality already exists.
4. Decide where the new code belongs.
5. Implement the smallest reasonable solution.

## AI / Vibe Coding Rules

When using an AI coding assistant:

1. Read the relevant documentation first.
2. Follow the existing project architecture.
3. Do not create unnecessary files.
4. Do not introduce unnecessary libraries.
5. Do not rewrite working code without a reason.
6. Reuse existing components.
7. Explain major architectural changes before implementing them.
8. Test generated code.
9. Review AI-generated code before committing.
10. Update documentation when important decisions change.

## Code Rules

- Use clear naming.
- Keep components reasonably small.
- Avoid duplicate code.
- Keep secrets in environment variables.
- Never expose API keys in frontend code.
- Handle API errors properly.
- Validate user input.
- Handle AI failures gracefully.

## Git

Use feature branches for major features.

Example:

feature/scanner
feature/auth
feature/dashboard

Do not directly push untested experimental code to main.

## Development Workflow

Plan
  ↓
Check Documentation
  ↓
Implement
  ↓
Test
  ↓
Review
  ↓
Commit
  ↓
Update Documentation