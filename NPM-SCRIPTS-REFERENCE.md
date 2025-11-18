# NPM Scripts for ARNOMA Development

## Add these scripts to your package.json

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "npm run lint && npm run format:check && npm run test:cypress",
    "test:cypress": "cypress run",
    "test:cypress:open": "cypress open",
    "test:unit": "echo 'No unit tests configured yet'",
    "lighthouse": "lighthouse https://arnoma.us --view",
    "lighthouse:mobile": "lighthouse https://arnoma.us --preset=mobile --view",
    "dev": "echo 'Use Live Server extension: Right-click index.html → Open with Live Server'",
    "precommit": "npm run lint:fix && npm run format",
    "validate": "npm run lint && npm run format:check && npm run test:cypress"
  }
}
```

## Usage

### Development

```bash
npm run lint              # Check for ESLint errors
npm run lint:fix          # Auto-fix ESLint errors
npm run format            # Format all files with Prettier
npm run format:check      # Check if files are formatted
```

### Testing

```bash
npm run test              # Run all tests (lint + format + cypress)
npm run test:cypress      # Run Cypress tests in headless mode
npm run test:cypress:open # Open Cypress interactive test runner
```

### Performance

```bash
npm run lighthouse        # Run Lighthouse audit on desktop
npm run lighthouse:mobile # Run Lighthouse audit on mobile
```

### Pre-commit

```bash
npm run precommit         # Fix code before committing (lint + format)
npm run validate          # Full validation (lint + format + tests)
```

## Git Hooks (Optional)

Install Husky for automatic pre-commit checks:

```bash
npm install --save-dev husky

# Initialize Husky
npx husky-init

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run precommit"

# Add pre-push hook (runs full test suite)
npx husky add .husky/pre-push "npm run validate"
```

This ensures code is always linted and formatted before committing!
