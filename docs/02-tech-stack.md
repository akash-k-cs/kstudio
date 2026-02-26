# Technical Stack

## Overview

Code Studio is built with a modern, scalable technology stack following best practices for full-stack TypeScript development.

## Frontend

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI library for building component-based interfaces |
| **TypeScript** | 5.x | Type-safe JavaScript for better developer experience |
| **Vite** | 5.x | Fast build tool and development server |

### UI & Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Beautiful icon library |
| **clsx** | Conditional className utility |

### State Management
| Technology | Purpose |
|------------|---------|
| **Zustand** | Lightweight state management |

### Code Editor
| Technology | Purpose |
|------------|---------|
| **Monaco Editor** | VS Code's editor component |
| **@monaco-editor/react** | React wrapper for Monaco |

### Terminal
| Technology | Purpose |
|------------|---------|
| **xterm.js** | Terminal emulator for the browser |
| **xterm-addon-fit** | Auto-resize terminal |
| **xterm-addon-web-links** | Clickable links in terminal |

### Networking
| Technology | Purpose |
|------------|---------|
| **Axios** | HTTP client for API requests |
| **Socket.io Client** | WebSocket client for real-time features |

---

## Backend

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 10.x | Progressive Node.js framework |
| **TypeScript** | 5.x | Type-safe backend development |
| **Express** | 4.x | HTTP server (via NestJS platform) |

### Database
| Technology | Purpose |
|------------|---------|
| **MongoDB** | Document database for flexible data storage |
| **Mongoose** | MongoDB ODM with TypeScript support |

### Authentication
| Technology | Purpose |
|------------|---------|
| **Passport.js** | Authentication middleware |
| **passport-github2** | GitHub OAuth strategy |
| **passport-jwt** | JWT authentication strategy |
| **@nestjs/jwt** | JWT utilities for NestJS |

### Real-time Communication
| Technology | Purpose |
|------------|---------|
| **Socket.io** | WebSocket server for real-time events |
| **@nestjs/websockets** | NestJS WebSocket integration |

### Terminal Backend
| Technology | Purpose |
|------------|---------|
| **node-pty-prebuilt-multiarch** | Pseudo-terminal for shell spawning |

### Git Operations
| Technology | Purpose |
|------------|---------|
| **simple-git** | Git operations in Node.js |

### Validation
| Technology | Purpose |
|------------|---------|
| **class-validator** | DTO validation decorators |
| **class-transformer** | Object transformation |

---

## Infrastructure

### Development
| Tool | Purpose |
|------|---------|
| **pnpm** | Fast, disk-efficient package manager |
| **pnpm workspaces** | Monorepo management |
| **Docker Compose** | Local MongoDB setup |
| **nodemon** | Auto-restart on file changes |

### Database
| Service | Purpose |
|---------|---------|
| **MongoDB** | Primary database |
| **Mongo Express** | Database admin UI (development) |

### Deployment (Planned)
| Service | Purpose |
|---------|---------|
| **Railway** | Backend hosting & deployment |
| **Vercel/Netlify** | Frontend hosting |

---

## Shared Packages

### @kstudio/shared
Contains shared code between frontend and backend:
- **Types** - TypeScript interfaces for User, Project, File, etc.
- **Constants** - WebSocket events, API routes, editor settings
- **Utilities** - Shared helper functions

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **TypeScript** | Static type checking |
| **Prettier** | Code formatting (recommended) |
| **Git** | Version control |

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Node.js Requirements

- **Minimum**: Node.js 18.x
- **Recommended**: Node.js 20.x or 22.x
