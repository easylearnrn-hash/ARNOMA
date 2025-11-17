export default [
  {
    // Files to ignore (replaces .eslintignore)
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      '*.html',
      '*.css',
      '*.sql',
      '*.md',
      '*.txt',
      'temp-validation.js',
      'debug-*.js',
      'analyze-code.js',
      'audit_script.js',
      'function_audit.js',
      'package.json',
      'package-lock.json',
      'eslint.config.js',
      'cypress.config.js',
      'cypress/**'  // Ignore Cypress tests (they have their own globals)
    ]
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        DOMParser: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        MessageChannel: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        // Application-specific globals
        supabase: 'readonly',
        students: 'writable',
        groups: 'writable',
        PaymentStore: 'writable',
        SkipClassManager: 'writable',
        AbsentManager: 'writable',
        NotificationCenter: 'writable',
        PaymentReminderManager: 'writable',
        ClassCountdownTimer: 'writable',
        getCachedStudents: 'readonly',
        currentPaymentPopupData: 'writable'
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-console': 'off',
      'no-duplicate-case': 'error',
      'no-dupe-keys': 'error',
      'no-empty': 'warn'
    }
  }
];
