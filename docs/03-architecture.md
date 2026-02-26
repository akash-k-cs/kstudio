# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   React     │  │   Monaco    │  │   Xterm.js  │  │   Zustand   ││
│  │   Router    │  │   Editor    │  │   Terminal  │  │   Store     ││
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘│
│         │                │                │                │        │
│         └────────────────┼────────────────┼────────────────┘        │
│                          │                │                          │
│                    ┌─────┴─────┐    ┌─────┴─────┐                   │
│                    │   Axios   │    │ Socket.io │                   │
│                    │   HTTP    │    │ WebSocket │                   │
│                    └─────┬─────┘    └─────┬─────┘                   │
└──────────────────────────┼────────────────┼─────────────────────────┘
                           │                │
                     ┌─────┴────────────────┴─────┐
                     │      Vite Dev Proxy        │
                     └─────┬────────────────┬─────┘
                           │                │
┌──────────────────────────┼────────────────┼─────────────────────────┐
│                          │   BACKEND      │                          │
│                    ┌─────┴─────┐    ┌─────┴─────┐                   │
│                    │  Express  │    │ Socket.io │                   │
│                    │  Server   │    │  Server   │                   │
│                    └─────┬─────┘    └─────┬─────┘                   │
│                          │                │                          │
│  ┌───────────────────────┴────────────────┴───────────────────────┐ │
│  │                      NestJS Application                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │   Auth   │  │ Projects │  │  GitHub  │  │ WebSocket│       │ │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Gateway │       │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │ │
│  │       │             │             │             │              │ │
│  │  ┌────┴─────────────┴─────────────┴─────────────┴────┐        │ │
│  │  │                    Services                        │        │ │
│  │  └────┬─────────────┬─────────────┬─────────────┬────┘        │ │
│  └───────┼─────────────┼─────────────┼─────────────┼─────────────┘ │
│          │             │             │             │                │
│    ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐        │
│    │  Mongoose │ │ node-pty  │ │simple-git │ │   Axios   │        │
│    │   ODM     │ │ Terminal  │ │    Git    │ │ External  │        │
│    └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘        │
└──────────┼─────────────┼─────────────┼─────────────┼────────────────┘
           │             │             │             │
     ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
     │  MongoDB  │ │  Shell    │ │  GitHub   │ │  Railway  │
     │  Database │ │  (bash)   │ │   API     │ │   API     │
     └───────────┘ └───────────┘ └───────────┘ └───────────┘
```

---

## Monorepo Structure

```
kstudio/
├── apps/
│   ├── web/                    # React Frontend
│   │   ├── src/
│   │   │   ├── components/     # UI Components
│   │   │   ├── pages/          # Route Pages
│   │   │   ├── stores/         # Zustand Stores
│   │   │   ├── services/       # API & Socket Services
│   │   │   └── main.tsx        # Entry Point
│   │   └── vite.config.ts
│   │
│   └── api/                    # NestJS Backend
│       ├── src/
│       │   ├── auth/           # Authentication Module
│       │   ├── projects/       # Projects & Files Module
│       │   ├── github/         # GitHub Integration
│       │   ├── websocket/      # WebSocket Gateway
│       │   ├── opencode/       # AI Integration
│       │   ├── railway/        # Deployment Integration
│       │   └── main.ts         # Entry Point
│       └── tsconfig.json
│
├── packages/
│   └── shared/                 # Shared Types & Constants
│       ├── src/
│       │   ├── types/          # TypeScript Interfaces
│       │   └── constants.ts    # Shared Constants
│       └── package.json
│
├── docs/                       # Documentation
├── .env                        # Environment Variables
├── docker-compose.yml          # Local Database Setup
└── pnpm-workspace.yaml         # Monorepo Config
```

---

## Module Architecture

### Frontend Modules

```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
├─────────────────────────────────────────────────────────┤
│  Pages                                                   │
│  ├── LoginPage        - GitHub OAuth login              │
│  ├── AuthCallback     - OAuth callback handler          │
│  ├── DashboardPage    - Project list & management       │
│  └── EditorPage       - Main IDE interface              │
├─────────────────────────────────────────────────────────┤
│  Components                                              │
│  ├── Layout           - Page layouts & navigation       │
│  ├── Editor           - Monaco editor & tabs            │
│  ├── Sidebar          - File explorer                   │
│  ├── Terminal         - Xterm.js terminal               │
│  └── AI               - OpenCode assistant panel        │
├─────────────────────────────────────────────────────────┤
│  Stores (Zustand)                                        │
│  ├── authStore        - User & token state              │
│  ├── projectStore     - Projects & file tree            │
│  └── editorStore      - Open tabs & editor state        │
├─────────────────────────────────────────────────────────┤
│  Services                                                │
│  ├── api.ts           - REST API client (Axios)         │
│  └── socket.ts        - WebSocket client (Socket.io)    │
└─────────────────────────────────────────────────────────┘
```

### Backend Modules

```
┌─────────────────────────────────────────────────────────┐
│                    NestJS Application                    │
├─────────────────────────────────────────────────────────┤
│  AuthModule                                              │
│  ├── Controller       - /auth/* endpoints               │
│  ├── Service          - User management                 │
│  ├── Strategies       - GitHub OAuth, JWT               │
│  └── Guards           - Route protection                │
├─────────────────────────────────────────────────────────┤
│  ProjectsModule                                          │
│  ├── Controller       - /projects/* endpoints           │
│  ├── ProjectsService  - Project CRUD                    │
│  ├── FilesService     - File system operations          │
│  └── Schemas          - Mongoose schemas                │
├─────────────────────────────────────────────────────────┤
│  GithubModule                                            │
│  ├── Controller       - /github/* endpoints             │
│  └── Service          - Clone, push, pull operations    │
├─────────────────────────────────────────────────────────┤
│  WebsocketModule                                         │
│  ├── Gateway          - Socket.io event handlers        │
│  └── TerminalService  - PTY management                  │
├─────────────────────────────────────────────────────────┤
│  OpencodeModule                                          │
│  ├── Controller       - /opencode/* endpoints           │
│  └── Service          - AI API integration              │
├─────────────────────────────────────────────────────────┤
│  RailwayModule                                           │
│  ├── Controller       - /railway/* endpoints            │
│  └── Service          - Deployment operations           │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Authentication Flow

```
User → Login Page → GitHub OAuth → Callback → JWT Token → Authenticated
```

1. User clicks "Login with GitHub"
2. Redirect to GitHub OAuth
3. GitHub redirects back with code
4. Backend exchanges code for GitHub token
5. Create/update user in MongoDB
6. Generate JWT token
7. Store token in Zustand (localStorage)

### File Editing Flow

```
Open File → Load Content → Edit → Ctrl+S → Save API → MongoDB
```

1. Click file in explorer
2. API fetches file content from workspace
3. Content displayed in Monaco Editor
4. User edits file
5. Ctrl+S triggers save
6. PATCH request updates file on disk

### Terminal Flow

```
User Input → Socket.io → PTY → Shell → Output → Socket.io → Terminal
```

1. User types in terminal
2. Input sent via WebSocket
3. node-pty writes to shell
4. Shell processes command
5. Output captured by PTY
6. Output sent via WebSocket
7. xterm.js displays output

---

## Security Architecture

### Authentication
- GitHub OAuth 2.0 for identity
- JWT tokens for session management
- Token stored in localStorage (httpOnly in production)

### Authorization
- All API routes protected by JwtAuthGuard
- Project ownership verified on each request
- WebSocket connections authenticated

### Data Isolation
- Each user's projects in separate directories
- MongoDB queries filtered by ownerId
- Terminal sessions isolated per client

---

## Scalability Considerations

### Current (Single Server)
- Single NestJS instance
- Single MongoDB instance
- Terminal sessions in-memory

### Future (Distributed)
- Horizontal scaling with load balancer
- Redis for session/terminal state
- MongoDB replica set
- Container orchestration (K8s)
