# Code Studio

<p align="center">
  <strong>A powerful web-based IDE with GitHub integration, AI assistance, and one-click deployment</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#license">License</a>
</p>

---

## Features

| Feature | Description |
|---------|-------------|
| 🖥️ **Monaco Editor** | VS Code-powered editor with syntax highlighting, IntelliSense, and multi-cursor support |
| 📁 **File Explorer** | Visual file tree with drag-and-drop, create, rename, and delete operations |
| 💻 **Integrated Terminal** | Full PTY terminal emulation - run any shell commands |
| 🔗 **GitHub Integration** | OAuth login, clone repos, push/pull changes |
| 🤖 **AI Assistant** | OpenCode integration for AI-powered coding assistance |
| 🚀 **One-Click Deploy** | Deploy to Railway with a single click |

## Quick Start

### Prerequisites

- Node.js 18+ (22.x recommended)
- pnpm 8+
- Docker (for MongoDB)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start MongoDB
docker-compose up -d

# 3. Configure environment
cp .env.example .env
# Edit .env with your GitHub OAuth credentials

# 4. Build shared package
pnpm --filter @kstudio/shared build

# 5. Start development servers
pnpm dev
```

Open http://localhost:3000 in your browser.

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:4000/auth/github/callback`
4. Copy credentials to `.env`

## Documentation

Detailed documentation is available in the [`docs/`](./docs) folder:

| Document | Description |
|----------|-------------|
| [📋 Overview](./docs/01-overview.md) | Project vision, features, and status |
| [🛠️ Tech Stack](./docs/02-tech-stack.md) | Technologies and dependencies |
| [🏗️ Architecture](./docs/03-architecture.md) | System design and module structure |
| [📅 Implementation Plan](./docs/04-implementation-plan.md) | Development phases and roadmap |
| [📡 API Reference](./docs/05-api-reference.md) | REST API and WebSocket events |
| [💻 Development Guide](./docs/06-development-guide.md) | Setup, commands, and troubleshooting |

## Project Structure

```
kstudio/
├── apps/
│   ├── web/              # React frontend (Vite + TypeScript)
│   └── api/              # NestJS backend
├── packages/
│   └── shared/           # Shared types & constants
├── docs/                 # Documentation
├── .env                  # Environment variables
├── .env.example          # Environment template
└── docker-compose.yml    # Local MongoDB setup
```

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Zustand (state management)
- Monaco Editor
- xterm.js

### Backend
- NestJS
- MongoDB + Mongoose
- Socket.io
- Passport.js (GitHub OAuth)
- node-pty

See [Tech Stack Documentation](./docs/02-tech-stack.md) for details.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/kstudio
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_secret_key

# Optional
OPENCODE_API_KEY=your_opencode_key
RAILWAY_API_TOKEN=your_railway_token
```

See `.env.example` for all available options.

## Scripts

```bash
pnpm dev              # Start development servers
pnpm build            # Build all apps
pnpm lint             # Lint code

# Individual apps
pnpm --filter @kstudio/web dev    # Frontend only
pnpm --filter @kstudio/api dev    # Backend only
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Built with ❤️ using React, NestJS, and TypeScript
</p>
