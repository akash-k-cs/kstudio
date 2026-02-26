# Development Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher (22.x recommended)
- **pnpm** 8.x or higher
- **Docker** and **Docker Compose**
- **Git**

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/kstudio.git
cd kstudio
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/kstudio
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback
JWT_SECRET=your-secret-key

# Optional
OPENCODE_API_KEY=your_opencode_key
RAILWAY_API_TOKEN=your_railway_token
```

### 4. Start MongoDB

```bash
docker-compose up -d
```

This starts:
- MongoDB on port 27017
- Mongo Express (admin UI) on port 8081

### 5. Build Shared Package

```bash
pnpm --filter @kstudio/shared build
```

### 6. Start Development Servers

```bash
pnpm dev
```

This starts:
- Frontend on http://localhost:3000
- Backend on http://localhost:4000

---

## Project Structure

```
kstudio/
├── apps/
│   ├── web/              # React frontend
│   └── api/              # NestJS backend
├── packages/
│   └── shared/           # Shared types & constants
├── docs/                 # Documentation
├── .env                  # Environment variables
├── docker-compose.yml    # Local services
└── pnpm-workspace.yaml   # Monorepo config
```

---

## Common Commands

### Development

```bash
# Start all apps in development mode
pnpm dev

# Start only frontend
pnpm --filter @kstudio/web dev

# Start only backend
pnpm --filter @kstudio/api dev

# Build shared package
pnpm --filter @kstudio/shared build
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @kstudio/web build
pnpm --filter @kstudio/api build
```

### Linting

```bash
# Lint all apps
pnpm lint

# Lint specific app
pnpm --filter @kstudio/web lint
pnpm --filter @kstudio/api lint
```

### Database

```bash
# Start MongoDB
docker-compose up -d

# Stop MongoDB
docker-compose down

# View logs
docker-compose logs -f mongodb

# Access Mongo Express
open http://localhost:8081
```

---

## Working with the Monorepo

### Adding Dependencies

```bash
# Add to root
pnpm add -w package-name

# Add to specific app
pnpm --filter @kstudio/web add package-name
pnpm --filter @kstudio/api add package-name

# Add dev dependency
pnpm --filter @kstudio/api add -D package-name
```

### Using Shared Package

The shared package is available as `@kstudio/shared`:

```typescript
// Frontend or Backend
import { WS_EVENTS, DEFAULT_EDITOR_SETTINGS } from '@kstudio/shared';
import type { User, Project, FileNode } from '@kstudio/shared';
```

After modifying shared package, rebuild:

```bash
pnpm --filter @kstudio/shared build
```

---

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Code Studio (Development)
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:4000/auth/github/callback
4. Copy Client ID and Client Secret to `.env`

---

## Testing

### Manual Testing

1. Start the dev server
2. Open http://localhost:3000
3. Click "Login with GitHub"
4. Create a project
5. Edit files and use terminal

### API Testing

Use tools like:
- [Insomnia](https://insomnia.rest/)
- [Postman](https://postman.com/)
- [HTTPie](https://httpie.io/)

Example:
```bash
# Get projects (with auth token)
curl -H "Authorization: Bearer <token>" http://localhost:4000/projects
```

---

## Debugging

### Frontend (React)

1. Open Chrome DevTools (F12)
2. Check Console for errors
3. Use React DevTools extension
4. Network tab for API calls

### Backend (NestJS)

1. Check terminal for logs
2. Use `console.log()` statements
3. Debug with VS Code:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to API",
      "port": 9229,
      "restart": true
    }
  ]
}
```

Start with debug:
```bash
pnpm --filter @kstudio/api start:debug
```

### WebSocket

1. Use browser DevTools → Network → WS
2. Filter by Socket.io messages
3. Check connection status

---

## Troubleshooting

### "Module not found" errors

```bash
# Rebuild shared package
pnpm --filter @kstudio/shared build

# Reinstall dependencies
pnpm install
```

### MongoDB connection issues

```bash
# Check if MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Port already in use

```bash
# Find process on port
lsof -ti:4000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Terminal not working

1. Check backend logs for errors
2. Ensure `node-pty` is installed correctly:
```bash
pnpm rebuild @homebridge/node-pty-prebuilt-multiarch
```

### GitHub OAuth not working

1. Verify callback URL matches exactly
2. Check Client ID and Secret
3. Ensure GITHUB_CALLBACK_URL in .env is correct

---

## Code Style

### TypeScript

- Use strict mode
- Prefer interfaces over types
- Use descriptive variable names
- Document complex functions

### React

- Functional components only
- Use hooks appropriately
- Keep components small and focused
- Use Zustand for global state

### NestJS

- Follow module structure
- Use DTOs for validation
- Use guards for authentication
- Keep services focused

---

## Git Workflow

### Branches

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes

### Commit Messages

```
type(scope): description

feat(editor): add syntax highlighting
fix(terminal): resolve resize issue
docs(readme): update setup instructions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
