export declare const WS_EVENTS: {
    readonly CONNECT: "connect";
    readonly DISCONNECT: "disconnect";
    readonly FILE_CHANGED: "file:changed";
    readonly FILE_CREATED: "file:created";
    readonly FILE_DELETED: "file:deleted";
    readonly FILE_RENAMED: "file:renamed";
    readonly TERMINAL_OUTPUT: "terminal:output";
    readonly TERMINAL_INPUT: "terminal:input";
    readonly TERMINAL_RESIZE: "terminal:resize";
    readonly TERMINAL_CLOSE: "terminal:close";
    readonly OPENCODE_MESSAGE: "opencode:message";
    readonly OPENCODE_STREAM: "opencode:stream";
    readonly OPENCODE_COMPLETE: "opencode:complete";
    readonly OPENCODE_ERROR: "opencode:error";
    readonly DEPLOY_STATUS: "deploy:status";
    readonly DEPLOY_LOG: "deploy:log";
    readonly DEPLOY_COMPLETE: "deploy:complete";
    readonly USER_JOINED: "user:joined";
    readonly USER_LEFT: "user:left";
    readonly CURSOR_MOVED: "cursor:moved";
};
export declare const API_ROUTES: {
    readonly AUTH: {
        readonly GITHUB: "/auth/github";
        readonly GITHUB_CALLBACK: "/auth/github/callback";
        readonly ME: "/auth/me";
        readonly LOGOUT: "/auth/logout";
    };
    readonly PROJECTS: {
        readonly BASE: "/projects";
        readonly BY_ID: (id: string) => string;
        readonly FILES: (id: string) => string;
        readonly FILE: (id: string, path: string) => string;
    };
    readonly GITHUB: {
        readonly REPOS: "/github/repos";
        readonly CLONE: "/github/clone";
        readonly PUSH: "/github/push";
        readonly PULL: "/github/pull";
        readonly BRANCHES: (repo: string) => string;
    };
    readonly OPENCODE: {
        readonly CHAT: "/opencode/chat";
        readonly STREAM: "/opencode/stream";
    };
    readonly RAILWAY: {
        readonly DEPLOY: "/railway/deploy";
        readonly DEPLOYMENTS: "/railway/deployments";
        readonly LOGS: (id: string) => string;
    };
};
export declare const LANGUAGE_MAP: Record<string, string>;
export declare const DEFAULT_EDITOR_SETTINGS: {
    readonly theme: "vs-dark";
    readonly fontSize: 14;
    readonly fontFamily: "'JetBrains Mono', 'Fira Code', monospace";
    readonly tabSize: 2;
    readonly insertSpaces: true;
    readonly wordWrap: "on";
    readonly minimap: {
        readonly enabled: true;
    };
    readonly lineNumbers: "on";
    readonly scrollBeyondLastLine: false;
    readonly automaticLayout: true;
};
