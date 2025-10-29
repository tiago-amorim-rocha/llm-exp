# LLM Town

## Quick Context
A web application for creating a simulated town with agents controlled by LLM API calls. Currently in early stages with a basic UI for prompt testing.

## Architecture (3 modules + 1 main)

```
index.html          - Entry point, loads game.js as ES6 module
├── config.js       - UI constants and configuration
├── debugConsole.js - Debug console for logging (self-contained)
└── game.js         - Main: UI, application logic, coordination
```

## Key Systems

### Cache Busting
- Version-aware module imports using `window.__BUILD`
- Reads from `version.txt` or falls back to timestamp
- All module imports use `?v=${v}` parameter to prevent stale caches

### Debug Console
- Toggle: Click 🐛 button (bottom-right)
- Console output capture (log, warn, error, info)
- Copy and clear functionality
- Self-contained logging system

### UI System
- Simple prompt input textarea
- Submit button with keyboard support (Enter to submit, Shift+Enter for newline)
- Result display area for API responses
- Dark theme with consistent styling

## Current Features
- Basic UI for entering prompts and viewing results
- Mock API response (echo back the prompt)
- Debug console for development
- Responsive layout

## Future Development
- Integration with LLM API for actual agent behavior
- Town visualization and simulation
- Multiple agents with individual personalities
- Agent interaction system
- Persistent state management

## How to Update This File
**Update when:**
- Adding/removing modules
- Changing core architecture or systems
- Adding new major features
- Significant UI/UX changes

**Don't update for:**
- Minor tweaks to constants
- Bug fixes
- Code refactoring within same module
- Small styling adjustments

Keep this file concise - focus on WHAT and WHY, not HOW.
