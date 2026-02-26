import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as pty from '@homebridge/node-pty-prebuilt-multiarch';
import * as os from 'os';
import * as fs from 'fs';

interface TerminalSession {
  pty: pty.IPty;
  projectId: string;
  userId: string;
}

@Injectable()
export class TerminalService implements OnModuleDestroy {
  private terminals: Map<string, TerminalSession> = new Map();

  createTerminal(
    clientId: string,
    projectId: string,
    workspacePath: string,
    userId: string,
    onData: (data: string) => void,
    onExit: (code: number) => void,
  ): void {
    // Kill existing terminal for this client
    this.killTerminal(clientId);

    const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh';

    // Ensure workspace directory exists
    if (!fs.existsSync(workspacePath)) {
      console.log(`Creating workspace directory: ${workspacePath}`);
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    console.log(`Spawning shell: ${shell} in directory: ${workspacePath}`);

    try {
      const terminal = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: workspacePath,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          HOME: process.env.HOME || '/tmp',
          PATH: process.env.PATH,
        },
      });

      terminal.onData((data) => {
        onData(data);
      });

      terminal.onExit(({ exitCode }) => {
        console.log(`Terminal for client ${clientId} exited with code ${exitCode}`);
        this.terminals.delete(clientId);
        onExit(exitCode);
      });

      this.terminals.set(clientId, {
        pty: terminal,
        projectId,
        userId,
      });

      console.log(`Terminal spawned successfully for client ${clientId}, PID: ${terminal.pid}`);
    } catch (error) {
      console.error(`Failed to spawn terminal for client ${clientId}:`, error);
      throw error;
    }
  }

  writeToTerminal(clientId: string, data: string): void {
    const session = this.terminals.get(clientId);
    if (session) {
      session.pty.write(data);
    }
  }

  resizeTerminal(clientId: string, cols: number, rows: number): void {
    const session = this.terminals.get(clientId);
    if (session) {
      session.pty.resize(cols, rows);
    }
  }

  killTerminal(clientId: string): void {
    const session = this.terminals.get(clientId);
    if (session) {
      session.pty.kill();
      this.terminals.delete(clientId);
    }
  }

  getTerminalForClient(clientId: string): TerminalSession | undefined {
    return this.terminals.get(clientId);
  }

  onModuleDestroy(): void {
    // Cleanup all terminals on shutdown
    for (const [clientId] of this.terminals) {
      this.killTerminal(clientId);
    }
  }
}
