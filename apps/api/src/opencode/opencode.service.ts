import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ProjectsService } from '../projects/projects.service';

export interface OpenCodeResponse {
  response: string;
  actions?: Array<{
    type: 'file_edit' | 'file_create' | 'terminal_command';
    path?: string;
    content?: string;
    command?: string;
  }>;
}

@Injectable()
export class OpencodeService {
  private apiUrl: string;
  private apiKey: string;

  constructor(
    private configService: ConfigService,
    private projectsService: ProjectsService,
  ) {
    this.apiUrl = this.configService.get<string>('OPENCODE_API_URL') || 'http://localhost:4096';
    this.apiKey = this.configService.get<string>('OPENCODE_API_KEY') || '';
  }

  async sendMessage(
    projectId: string,
    message: string,
    userId: string,
  ): Promise<OpenCodeResponse> {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, userId);

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/chat`,
        {
          message,
          context: {
            workspacePath,
            projectId,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
          timeout: 60000, // 60 second timeout
        },
      );

      return response.data;
    } catch (error) {
      // If OpenCode is not available, return a helpful message
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        return {
          response: "OpenCode agent is not currently available. Please ensure the OpenCode service is running and configured correctly.\n\nTo start OpenCode:\n```bash\nopencode web --port 4096\n```",
        };
      }

      throw error;
    }
  }

  async streamMessage(
    projectId: string,
    message: string,
    userId: string,
    onChunk: (chunk: string) => void,
    onComplete: (response: string) => void,
    onError: (error: string) => void,
  ): Promise<void> {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, userId);

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/chat/stream`,
        {
          message,
          context: {
            workspacePath,
            projectId,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
          responseType: 'stream',
          timeout: 120000, // 2 minute timeout for streaming
        },
      );

      let fullResponse = '';

      response.data.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        fullResponse += text;
        onChunk(text);
      });

      response.data.on('end', () => {
        onComplete(fullResponse);
      });

      response.data.on('error', (error: Error) => {
        onError(error.message);
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        onError('OpenCode agent is not available. Please ensure the service is running.');
      } else {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
}
