# Code Review Process

This document outlines our code review process and guidelines for the AiluroCamp project.

## Overview

Our code review process combines automated checks with AI-assisted reviews to ensure code quality and maintainability. The process is triggered automatically when a pull request is opened or updated.

## Pre-Pull Request Checklist

Before creating a pull request, please ensure:

1. Run `yarn format` to format your code according to project standards
2. Test your changes thoroughly
3. Update relevant documentation
4. Ensure all tests pass

## Automated Checks

### 1. Code Formatting Check

Before any code review begins, an automated check ensures that all code follows our formatting standards:

- Uses the project's configured formatting rules
- Maintains consistent code style across the codebase
- Runs automatically on all pull requests
- **Note:** If this check fails, please run `yarn format` locally and update your PR

### 2. AI-Assisted Code Review

Our AI code review system evaluates changes based on five key criteria:

#### Code Readability (0-20)

- Clarity of code structure
- Naming conventions
- Overall code organization
- Comments and documentation

#### Maintainability (0-20)

- Modularity of code
- Documentation quality
- Ease of future modifications
- Code reusability

#### Performance (0-20)

- Algorithm efficiency
- Resource usage
- Potential optimizations
- Scalability considerations

#### Security (0-20)

- Potential vulnerabilities
- Secure coding practices
- Data handling
- Authentication and authorization

#### Code Style (0-20)

- Adherence to coding standards
- Consistency with existing codebase
- Best practices implementation
- Code formatting

> **Important:** If you believe the AI review feedback doesn't make sense or is incorrect, please reach out to the project maintainers for clarification. The AI review is meant to assist, not replace human judgment.

## Review Process

1. **Pull Request Creation**

   - Create a pull request targeting the `main` branch
   - Provide a clear description of changes
   - Link any related issues or tickets
   - Ensure you've run `yarn format` before creating the PR

2. **Automated Checks**

   - Code formatting check runs automatically
   - AI review is triggered after formatting check passes
   - Review results are posted as comments on the PR

3. **Review Criteria**

   - Overall score must be 91/100 or higher
   - Each category must score 16/20 or higher
   - Issues identified must be addressed before merging

4. **Required Actions**
   - Address all identified issues
   - Update code based on review feedback
   - Ensure all automated checks pass
   - Get approval from at least one team member

## Best Practices

### For Pull Request Authors

1. Keep pull requests focused and manageable
2. Write clear commit messages
3. Update documentation as needed
4. Test changes thoroughly
5. Address review comments promptly
6. Run `yarn format` before creating or updating PRs

### For Reviewers

1. Review code thoroughly and objectively
2. Provide constructive feedback
3. Focus on both technical and functional aspects
4. Consider security implications
5. Ensure documentation is updated
6. Help clarify any AI review feedback that might be unclear

## Excluded Files

The following files are excluded from the AI review process:

- `pnpm-lock.yaml`
- `package-lock.json`
- `yarn.lock`
- `package.json`
- Any other lock files

## Getting Help

If you have questions about the code review process or need assistance:

1. Check the project documentation
2. Ask in the team's communication channel
3. Contact the project maintainers
4. If you disagree with AI review feedback, reach out to discuss it
