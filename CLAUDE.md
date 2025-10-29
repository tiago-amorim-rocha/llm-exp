# LLM Town

## Quick Context
A web application for creating a simulated town with agents controlled by LLM API calls. Currently in early stages with a basic UI for prompt testing.

## Architecture (4 modules + 1 main)

```
index.html          - Entry point, loads game.js as ES6 module
├── config.js       - UI constants and configuration
├── debugConsole.js - Debug console for logging (self-contained)
├── gemini.js       - Gemini API integration (gemini-2.5-flash)
└── game.js         - Main: UI, application logic, coordination
```

## Key Systems

### Cache Busting & Version Control
- Version-aware module imports using `window.__BUILD`
- Reads from `version.txt` or falls back to timestamp
- All module imports use `?v=${v}` parameter to prevent stale caches
- **Post-commit hook**: Auto-updates `version.txt` with commit hash after each commit
- **GitHub Actions autopromote**: Auto-merges `claude/**` branches to `main` on push
- Hook prevents infinite loops by detecting `[auto-version]` commits

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
- **Gemini API integration** (gemini-2.5-flash model)
- Real-time LLM responses with error handling
- Debug console for development
- Responsive layout
- Automated version control and deployment

## Future Development
- Town visualization and simulation
- Multiple agents with individual personalities
- Agent interaction system
- Persistent state management
- Agent memory and context awareness

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
