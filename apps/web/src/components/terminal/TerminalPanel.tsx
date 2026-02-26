import { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { socketService } from '@/services/socket';
import 'xterm/css/xterm.css';

interface TerminalPanelProps {
  projectId: string;
}

export default function TerminalPanel({ projectId }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const outputHandlerRef = useRef<((data: string) => void) | null>(null);
  const closeHandlerRef = useRef<((data: { exitCode: number }) => void) | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const setupTerminal = useCallback(() => {
    if (!terminalRef.current || terminalInstance.current) return;

    // Initialize terminal
    const terminal = new Terminal({
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        cursorAccent: '#0d1117',
        selectionBackground: '#264f78',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 10000,
      allowProposedApi: true,
      convertEol: true,
      scrollOnUserInput: true,
    });

    // Initialize addons
    const fit = new FitAddon();
    const webLinks = new WebLinksAddon();

    terminal.loadAddon(fit);
    terminal.loadAddon(webLinks);

    terminal.open(terminalRef.current);
    
    // Slight delay before fitting to ensure container is rendered
    setTimeout(() => {
      fit.fit();
    }, 100);

    terminalInstance.current = terminal;
    fitAddon.current = fit;

    // Handle terminal input - send to backend
    terminal.onData((data) => {
      console.log('Terminal onData triggered:', JSON.stringify(data), 'Connected:', socketService.isConnected());
      if (socketService.isConnected()) {
        socketService.sendTerminalInput(data);
      } else {
        console.warn('Socket not connected, cannot send terminal input');
      }
    });

    // Handle terminal resize
    terminal.onResize(({ cols, rows }) => {
      if (socketService.isConnected()) {
        socketService.resizeTerminal(cols, rows);
      }
    });

    // Set up terminal output handler
    outputHandlerRef.current = (data: string) => {
      terminal.write(data);
    };

    // Set up terminal close handler
    closeHandlerRef.current = (data: { exitCode: number }) => {
      terminal.writeln('');
      terminal.writeln(`\x1b[33mTerminal session ended (exit code: ${data.exitCode})\x1b[0m`);
      terminal.writeln('\x1b[90mReconnect by refreshing the page.\x1b[0m');
    };

    // Listen for terminal events from server
    socketService.onTerminalOutput(outputHandlerRef.current);
    socketService.onTerminalClose(closeHandlerRef.current);

    // Write welcome message
    terminal.writeln('\x1b[38;5;39m╔════════════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[38;5;39m║\x1b[0m  \x1b[1;38;5;231m⚡ Code Studio Terminal\x1b[0m                    \x1b[38;5;39m║\x1b[0m');
    terminal.writeln('\x1b[38;5;39m╚════════════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[38;5;245mProject: ' + projectId + '\x1b[0m');
    terminal.writeln('\x1b[38;5;245mRun git commands, npm scripts, or any shell command.\x1b[0m');
    terminal.writeln('');

    setIsConnected(true);

    // Initial resize notification to server after connection
    setTimeout(() => {
      if (socketService.isConnected() && fitAddon.current) {
        const dims = fitAddon.current.proposeDimensions();
        if (dims) {
          socketService.resizeTerminal(dims.cols, dims.rows);
        }
      }
    }, 200);
  }, [projectId]);

  useEffect(() => {
    // Wait for socket to be ready (authenticated), then set up terminal
    socketService.onReady(() => {
      setupTerminal();
    });

    // Handle window resize
    const handleResize = () => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);

    // Create a ResizeObserver for the container
    let resizeObserver: ResizeObserver | null = null;
    if (terminalRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (fitAddon.current && terminalInstance.current) {
          fitAddon.current.fit();
        }
      });
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      
      // Remove terminal event listeners
      if (outputHandlerRef.current) {
        socketService.offTerminalOutput(outputHandlerRef.current);
      }
      if (closeHandlerRef.current) {
        socketService.offTerminalClose(closeHandlerRef.current);
      }
      
      if (terminalInstance.current) {
        terminalInstance.current.dispose();
        terminalInstance.current = null;
      }
    };
  }, [projectId, setupTerminal]);

  return (
    <div className="h-full bg-[#0d1117] flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#f85149] hover:brightness-110 cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#d29922] hover:brightness-110 cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#3fb950] hover:brightness-110 cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M0 2.75A2.75 2.75 0 012.75 0h10.5A2.75 2.75 0 0116 2.75v10.5A2.75 2.75 0 0113.25 16H2.75A2.75 2.75 0 010 13.25V2.75zM2.75 1.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V2.75c0-.69-.56-1.25-1.25-1.25H2.75zM5 6.5l-.97.97a.75.75 0 001.06 1.06L7.53 6.1a.75.75 0 00-.04-1.1L5.1 2.97a.75.75 0 00-1.04 1.08L5.5 5.5l-.5 1zm3 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5H8z"/>
            </svg>
            <span className="text-sm text-[#c9d1d9] font-medium">Terminal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#3fb950]' : 'bg-[#f85149]'}`} />
          <span className="text-xs text-[#8b949e]">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div ref={terminalRef} className="flex-1 min-h-0 overflow-hidden" />
    </div>
  );
}
