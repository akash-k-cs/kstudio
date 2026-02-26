import { io, Socket } from 'socket.io-client';
import { WS_EVENTS } from '@kstudio/shared';
import { useAuthStore } from '@/stores/authStore';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionPromise: Promise<void> | null = null;
  private readyPromise: Promise<void> | null = null;
  private isReady = false;
  private onConnectCallbacks: Array<() => void> = [];
  private onReadyCallbacks: Array<() => void> = [];

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.socket) {
      return this.socket;
    }

    const token = useAuthStore.getState().accessToken;

    this.socket = io('/', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.connectionPromise = new Promise((resolve) => {
      this.socket!.on('connect', () => {
        console.log('Socket connected, waiting for ready...');
        this.reconnectAttempts = 0;
        this.onConnectCallbacks.forEach(cb => cb());
        this.onConnectCallbacks = [];
        resolve();
      });
    });

    // Wait for the server to confirm authentication
    this.readyPromise = new Promise((resolve) => {
      this.socket!.on('ready', (data) => {
        console.log('Socket ready, authenticated as:', data);
        this.isReady = true;
        this.onReadyCallbacks.forEach(cb => cb());
        this.onReadyCallbacks = [];
        resolve();
      });
    });

    this.socket.on(WS_EVENTS.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
      this.isReady = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
    });

    return this.socket;
  }

  async waitForConnection(): Promise<void> {
    if (this.socket?.connected) return;
    if (this.connectionPromise) {
      await this.connectionPromise;
    }
  }

  async waitForReady(): Promise<void> {
    if (this.isReady) return;
    if (this.readyPromise) {
      await this.readyPromise;
    }
  }

  onConnect(callback: () => void): void {
    if (this.socket?.connected) {
      callback();
    } else {
      this.onConnectCallbacks.push(callback);
    }
  }

  onReady(callback: () => void): void {
    if (this.isReady) {
      callback();
    } else {
      this.onReadyCallbacks.push(callback);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Project room management
  async joinProject(projectId: string): Promise<void> {
    console.log('joinProject called with projectId:', projectId);
    await this.waitForConnection();
    console.log('Socket connected, waiting for ready...');
    await this.waitForReady();
    console.log('Socket ready, emitting project:join');
    this.socket?.emit('project:join', { projectId }, (response: unknown) => {
      console.log('project:join response:', response);
    });
  }

  leaveProject(projectId: string): void {
    this.socket?.emit('project:leave', { projectId });
  }

  // File events
  onFileChanged(callback: (data: { path: string; content: string }) => void): void {
    this.socket?.on(WS_EVENTS.FILE_CHANGED, callback);
  }

  onFileCreated(callback: (data: { path: string }) => void): void {
    this.socket?.on(WS_EVENTS.FILE_CREATED, callback);
  }

  onFileDeleted(callback: (data: { path: string }) => void): void {
    this.socket?.on(WS_EVENTS.FILE_DELETED, callback);
  }

  // Terminal events
  sendTerminalInput(data: string): void {
    console.log('Sending terminal input:', JSON.stringify(data), 'Socket connected:', this.socket?.connected);
    this.socket?.emit(WS_EVENTS.TERMINAL_INPUT, { data });
  }

  onTerminalOutput(callback: (data: string) => void): void {
    console.log('Setting up terminal output listener');
    this.socket?.on(WS_EVENTS.TERMINAL_OUTPUT, (data) => {
      console.log('Received terminal output:', data?.substring?.(0, 50) || data);
      callback(data);
    });
  }

  offTerminalOutput(callback: (data: string) => void): void {
    this.socket?.off(WS_EVENTS.TERMINAL_OUTPUT, callback);
  }

  onTerminalClose(callback: (data: { exitCode: number }) => void): void {
    this.socket?.on(WS_EVENTS.TERMINAL_CLOSE, callback);
  }

  offTerminalClose(callback: (data: { exitCode: number }) => void): void {
    this.socket?.off(WS_EVENTS.TERMINAL_CLOSE, callback);
  }

  resizeTerminal(cols: number, rows: number): void {
    this.socket?.emit(WS_EVENTS.TERMINAL_RESIZE, { cols, rows });
  }

  // OpenCode events
  sendOpenCodeMessage(message: string, projectId: string): void {
    this.socket?.emit(WS_EVENTS.OPENCODE_MESSAGE, { message, projectId });
  }

  onOpenCodeStream(callback: (chunk: string) => void): void {
    this.socket?.on(WS_EVENTS.OPENCODE_STREAM, callback);
  }

  onOpenCodeComplete(callback: (response: string) => void): void {
    this.socket?.on(WS_EVENTS.OPENCODE_COMPLETE, callback);
  }

  onOpenCodeError(callback: (error: string) => void): void {
    this.socket?.on(WS_EVENTS.OPENCODE_ERROR, callback);
  }

  // Deployment events
  onDeployStatus(callback: (data: { status: string; deploymentId: string }) => void): void {
    this.socket?.on(WS_EVENTS.DEPLOY_STATUS, callback);
  }

  onDeployLog(callback: (data: { message: string; level: string }) => void): void {
    this.socket?.on(WS_EVENTS.DEPLOY_LOG, callback);
  }

  // Cleanup listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
export default socketService;
