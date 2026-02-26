export interface User {
  id: string;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  accessToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  userId: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Omit<User, 'accessToken'>;
}
