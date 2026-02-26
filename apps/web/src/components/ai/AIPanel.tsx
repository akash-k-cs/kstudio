import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { socketService } from '@/services/socket';
import clsx from 'clsx';

interface AIPanelProps {
  projectId: string;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function AIPanel({ projectId, onClose }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Listen for streaming responses
    socketService.onOpenCodeStream((chunk) => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + chunk },
          ];
        }
        return prev;
      });
    });

    socketService.onOpenCodeComplete(() => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, isStreaming: false },
          ];
        }
        return prev;
      });
      setIsLoading(false);
    });

    socketService.onOpenCodeError((error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${error}`,
        },
      ]);
      setIsLoading(false);
    });

    return () => {
      // Cleanup listeners would go here
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    socketService.sendOpenCodeMessage(input.trim(), projectId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-editor-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-secondary to-accent-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">AI Assistant</h3>
            <p className="text-xs text-text-muted">Powered by OpenCode</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-editor-hover rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Bot className="w-12 h-12 text-text-muted mb-4" />
            <h4 className="text-text-primary font-medium mb-2">How can I help?</h4>
            <p className="text-text-secondary text-sm max-w-[250px]">
              Ask me to write code, explain concepts, debug issues, or help with your project.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div
                className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                  message.role === 'user'
                    ? 'bg-accent-primary'
                    : 'bg-editor-active'
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-accent-secondary" />
                )}
              </div>
              <div
                className={clsx(
                  'flex-1 rounded-lg px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-accent-primary/10 text-text-primary'
                    : 'bg-editor-active text-text-primary'
                )}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-text-primary animate-pulse ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-editor-border">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={2}
            className="w-full bg-editor-bg border border-editor-border rounded-lg px-4 py-3 pr-12 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-secondary resize-none text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-accent-secondary hover:bg-accent-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
