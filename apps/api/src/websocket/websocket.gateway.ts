import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WS_EVENTS } from '@kstudio/shared';
import { AuthService } from '../auth/auth.service';
import { ProjectsService } from '../projects/projects.service';
import { OpencodeService } from '../opencode/opencode.service';
import { TerminalService } from './terminal.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  currentProject?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private projectsService: ProjectsService,
    private opencodeService: OpencodeService,
    private terminalService: TerminalService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        console.log('No token provided, disconnecting client:', client.id);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.authService.findById(payload.sub);

      if (!user) {
        console.log('User not found, disconnecting client:', client.id);
        client.disconnect();
        return;
      }

      client.userId = user._id.toString();
      console.log(`Client connected: ${client.id} (User: ${user.username})`);
      
      // Emit ready event so client knows it can send messages
      client.emit('ready', { userId: client.userId });
    } catch (error) {
      console.error('WebSocket auth error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Cleanup terminal session
    this.terminalService.killTerminal(client.id);

    // Leave project room
    if (client.currentProject) {
      client.leave(`project:${client.currentProject}`);
    }
  }

  @SubscribeMessage('project:join')
  async handleJoinProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    if (!client.userId) {
      console.log('No userId for client:', client.id);
      return { success: false, error: 'Not authenticated' };
    }

    console.log(`Client ${client.id} joining project ${data.projectId}`);

    try {
      // Verify access
      await this.projectsService.findById(data.projectId, client.userId);
      
      // Leave previous project
      if (client.currentProject) {
        client.leave(`project:${client.currentProject}`);
        this.terminalService.killTerminal(client.id);
      }

      // Join new project room
      client.join(`project:${data.projectId}`);
      client.currentProject = data.projectId;

      // Initialize terminal
      const workspacePath = await this.projectsService.getWorkspacePath(
        data.projectId,
        client.userId,
      );

      console.log(`Creating terminal for client ${client.id} at workspace: ${workspacePath}`);

      this.terminalService.createTerminal(
        client.id,
        data.projectId,
        workspacePath,
        client.userId,
        (output) => {
          client.emit(WS_EVENTS.TERMINAL_OUTPUT, output);
        },
        (exitCode) => {
          console.log(`Terminal exited for client ${client.id} with code ${exitCode}`);
          client.emit(WS_EVENTS.TERMINAL_CLOSE, { exitCode });
        },
      );

      console.log(`Terminal created successfully for client ${client.id}`);
      return { success: true, workspacePath };
    } catch (error) {
      console.error('Error joining project:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Access denied' };
    }
  }

  @SubscribeMessage('project:leave')
  handleLeaveProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    client.leave(`project:${data.projectId}`);
    if (client.currentProject === data.projectId) {
      client.currentProject = undefined;
    }
    this.terminalService.killTerminal(client.id);
  }

  // Terminal events
  @SubscribeMessage(WS_EVENTS.TERMINAL_INPUT)
  handleTerminalInput(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { data: string },
  ) {
    console.log(`Terminal input from ${client.id}: ${JSON.stringify(data.data)}`);
    this.terminalService.writeToTerminal(client.id, data.data);
  }

  @SubscribeMessage(WS_EVENTS.TERMINAL_RESIZE)
  handleTerminalResize(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { cols: number; rows: number },
  ) {
    console.log(`Terminal resize from ${client.id}: ${data.cols}x${data.rows}`);
    this.terminalService.resizeTerminal(client.id, data.cols, data.rows);
  }

  // File events - broadcast to project room
  emitFileChange(projectId: string, data: { path: string; content?: string }) {
    this.server.to(`project:${projectId}`).emit(WS_EVENTS.FILE_CHANGED, data);
  }

  emitFileCreated(projectId: string, data: { path: string }) {
    this.server.to(`project:${projectId}`).emit(WS_EVENTS.FILE_CREATED, data);
  }

  emitFileDeleted(projectId: string, data: { path: string }) {
    this.server.to(`project:${projectId}`).emit(WS_EVENTS.FILE_DELETED, data);
  }

  // OpenCode events
  @SubscribeMessage(WS_EVENTS.OPENCODE_MESSAGE)
  async handleOpenCodeMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { message: string; projectId: string },
  ) {
    if (!client.userId) return;

    try {
      await this.opencodeService.streamMessage(
        data.projectId,
        data.message,
        client.userId,
        (chunk) => {
          client.emit(WS_EVENTS.OPENCODE_STREAM, chunk);
        },
        (response) => {
          client.emit(WS_EVENTS.OPENCODE_COMPLETE, response);
        },
        (error) => {
          client.emit(WS_EVENTS.OPENCODE_ERROR, error);
        },
      );
    } catch (error) {
      client.emit(WS_EVENTS.OPENCODE_ERROR, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Deployment events
  emitDeployStatus(projectId: string, data: { status: string; deploymentId: string }) {
    this.server.to(`project:${projectId}`).emit(WS_EVENTS.DEPLOY_STATUS, data);
  }

  emitDeployLog(projectId: string, data: { message: string; level: string }) {
    this.server.to(`project:${projectId}`).emit(WS_EVENTS.DEPLOY_LOG, data);
  }
}
