// WebSocket Events
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // File operations
  FILE_CHANGED: 'file:changed',
  FILE_CREATED: 'file:created',
  FILE_DELETED: 'file:deleted',
  FILE_RENAMED: 'file:renamed',
  
  // Terminal
  TERMINAL_OUTPUT: 'terminal:output',
  TERMINAL_INPUT: 'terminal:input',
  TERMINAL_RESIZE: 'terminal:resize',
  TERMINAL_CLOSE: 'terminal:close',
  
  // OpenCode
  OPENCODE_MESSAGE: 'opencode:message',
  OPENCODE_STREAM: 'opencode:stream',
  OPENCODE_COMPLETE: 'opencode:complete',
  OPENCODE_ERROR: 'opencode:error',
  
  // Deployment
  DEPLOY_STATUS: 'deploy:status',
  DEPLOY_LOG: 'deploy:log',
  DEPLOY_COMPLETE: 'deploy:complete',
  
  // Collaboration
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  CURSOR_MOVED: 'cursor:moved',
} as const;

// API Routes
export const API_ROUTES = {
  AUTH: {
    GITHUB: '/auth/github',
    GITHUB_CALLBACK: '/auth/github/callback',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  PROJECTS: {
    BASE: '/projects',
    BY_ID: (id: string) => `/projects/${id}`,
    FILES: (id: string) => `/projects/${id}/files`,
    FILE: (id: string, path: string) => `/projects/${id}/files/${path}`,
  },
  GITHUB: {
    REPOS: '/github/repos',
    CLONE: '/github/clone',
    PUSH: '/github/push',
    PULL: '/github/pull',
    BRANCHES: (repo: string) => `/github/repos/${repo}/branches`,
  },
  OPENCODE: {
    CHAT: '/opencode/chat',
    STREAM: '/opencode/stream',
  },
  RAILWAY: {
    DEPLOY: '/railway/deploy',
    DEPLOYMENTS: '/railway/deployments',
    LOGS: (id: string) => `/railway/logs/${id}`,
  },
} as const;

// File extensions to language mapping
export const LANGUAGE_MAP: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'c',
  '.cs': 'csharp',
  '.php': 'php',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'sass',
  '.less': 'less',
  '.json': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.dockerfile': 'dockerfile',
  '.graphql': 'graphql',
  '.vue': 'vue',
  '.svelte': 'svelte',
};

// Default editor settings
export const DEFAULT_EDITOR_SETTINGS = {
  theme: 'vs-dark',
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  minimap: { enabled: true },
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
} as const;
