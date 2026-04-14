# Contributing to nested-regex-groups

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nested-regex-groups.git
   cd nested-regex-groups
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Run tests with coverage**
   ```bash
   npm run test:coverage
   ```

## Project Structure

```
nested-regex-groups/
├── src/
│   ├── index.ts           # Core parsing functions
│   ├── index.test.ts      # Core tests
│   ├── template.ts        # Template tag implementation
│   ├── template.test.ts   # Template tag tests
│   ├── parse-pattern.test.ts  # Runtime parsing tests
├── examples/              # Usage examples
├── .github/
│   └── workflows/
│       ├── ci.yml         # Continuous integration
│       └── publish.yml    # NPM publishing
├── dist/                  # Compiled output (generated)
└── coverage/              # Coverage reports (generated)
```

## Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code in `src/`
   - Add tests for new functionality
   - Update documentation as needed

3. **Run tests**
   ```bash
   npm test
   ```

4. **Check coverage**
   ```bash
   npm run test:coverage
   ```
   - Aim for >80% coverage
   - Current coverage: 99.1%

5. **Build and verify**
   ```bash
   npm run build
   ```

### Writing Tests

- Place tests next to the code they test (e.g., `index.test.ts` for `index.ts`)
- Use descriptive test names
- Test both success and failure cases
- Include edge cases

Example:
```typescript
describe('myFunction', () => {
  it('handles valid input', () => {
    const result = myFunction('valid');
    expect(result.success).toBe(true);
  });

  it('returns error for invalid input', () => {
    const result = myFunction('invalid');
    expect(result.success).toBe(false);
  });
});
```

### Code Style

- Use TypeScript
- Follow existing code style
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Keep functions focused and small

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for regex flags
fix: handle empty group names correctly
docs: update API documentation
test: add tests for edge cases
chore: update dependencies
```

## Pull Request Process

1. **Update documentation**
   - Update README.md if adding features
   - Add examples if helpful
   - Update CHANGELOG.md

2. **Ensure tests pass**
   ```bash
   npm test
   ```

3. **Check TypeScript compilation**
   ```bash
   npx tsc --noEmit
   ```

4. **Create pull request**
   - Provide clear description
   - Reference any related issues
   - Include examples if applicable

5. **Wait for CI**
   - GitHub Actions will run tests
   - Fix any failures

## Testing

### Run All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Test Specific File
```bash
npx vitest src/index.test.ts
```

## Building

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Examples

Run examples to verify functionality:

```bash
# Basic usage
node examples/basic-usage.ts

# Template tags
node examples/template-usage.ts

# JSON config
node examples/json-config-usage.ts
```

## Documentation

Update documentation when:
- Adding new features
- Changing APIs
- Adding examples
- Fixing bugs that affect usage

Documentation files:
- `README.md` - Main documentation
- `GETTING_STARTED.md` - Tutorial
- `TEMPLATE_TAG.md` - Template tag guide
- `JSON_CONFIG.md` - JSON config guide
- `CHANGELOG.md` - Version history

## Release Process

Releases are handled by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Push tag to trigger publish workflow
5. GitHub Actions publishes to npm

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues before creating new ones

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

Thank you for contributing! 🎉
