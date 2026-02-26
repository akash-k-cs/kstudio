export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  modifiedAt?: Date;
}

export interface FileContent {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
  language?: string;
}

export interface FileOperation {
  type: 'create' | 'update' | 'delete' | 'rename' | 'move';
  path: string;
  newPath?: string;
  content?: string;
}

export interface FileChangeEvent {
  projectId: string;
  operation: FileOperation;
  userId: string;
  timestamp: Date;
}
