# API Reference

## Base URL

```
Development: http://localhost:4000
Production: https://api.codestudio.io (planned)
```

## Authentication

All API requests (except auth endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### GET /auth/github

Initiates GitHub OAuth flow.

**Response**: Redirects to GitHub OAuth page

---

### GET /auth/github/callback

Handles GitHub OAuth callback.

**Query Parameters**:
- `code` (string): GitHub authorization code

**Response**: Redirects to frontend with token

---

### GET /auth/me

Returns current authenticated user.

**Response**:
```json
{
  "id": "user_id",
  "githubId": "12345",
  "username": "johndoe",
  "email": "john@example.com",
  "avatarUrl": "https://avatars.githubusercontent.com/...",
  "githubAccessToken": "...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /auth/logout

Logs out the current user.

**Response**:
```json
{ "message": "Logged out" }
```

---

## Projects Endpoints

### GET /projects

Returns all projects for the current user.

**Response**:
```json
[
  {
    "id": "project_id",
    "name": "my-project",
    "description": "A sample project",
    "ownerId": "user_id",
    "githubRepo": "username/repo",
    "githubBranch": "main",
    "workspacePath": "/tmp/kstudio-workspaces/project_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### POST /projects

Creates a new project.

**Request Body**:
```json
{
  "name": "my-project",
  "description": "A sample project"
}
```

**Response**:
```json
{
  "id": "project_id",
  "name": "my-project",
  "description": "A sample project",
  "ownerId": "user_id",
  "workspacePath": "/tmp/kstudio-workspaces/project_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /projects/:id

Returns a specific project.

**Parameters**:
- `id` (string): Project ID

**Response**: Project object

---

### PATCH /projects/:id

Updates a project.

**Parameters**:
- `id` (string): Project ID

**Request Body**:
```json
{
  "name": "updated-name",
  "description": "Updated description"
}
```

**Response**: Updated project object

---

### DELETE /projects/:id

Deletes a project and its workspace.

**Parameters**:
- `id` (string): Project ID

**Response**:
```json
{ "message": "Project deleted" }
```

---

## File Endpoints

### GET /projects/:id/files

Returns the file tree for a project.

**Parameters**:
- `id` (string): Project ID

**Response**:
```json
{
  "name": "root",
  "path": "",
  "type": "directory",
  "children": [
    {
      "name": "src",
      "path": "src",
      "type": "directory",
      "children": [
        {
          "name": "index.ts",
          "path": "src/index.ts",
          "type": "file"
        }
      ]
    },
    {
      "name": "package.json",
      "path": "package.json",
      "type": "file"
    }
  ]
}
```

---

### GET /projects/:id/files/*

Returns file content.

**Parameters**:
- `id` (string): Project ID
- `*` (string): File path (URL encoded)

**Response**:
```json
{
  "content": "file content here",
  "path": "src/index.ts"
}
```

---

### POST /projects/:id/files

Creates a new file.

**Parameters**:
- `id` (string): Project ID

**Request Body**:
```json
{
  "path": "src/newfile.ts",
  "content": "// New file content"
}
```

**Response**:
```json
{ "message": "File created" }
```

---

### PATCH /projects/:id/files/*

Updates file content.

**Parameters**:
- `id` (string): Project ID
- `*` (string): File path (URL encoded)

**Request Body**:
```json
{
  "content": "updated file content"
}
```

**Response**:
```json
{ "message": "File saved" }
```

---

### DELETE /projects/:id/files/*

Deletes a file.

**Parameters**:
- `id` (string): Project ID
- `*` (string): File path (URL encoded)

**Response**:
```json
{ "message": "File deleted" }
```

---

## GitHub Endpoints

### GET /github/repos

Returns user's GitHub repositories.

**Response**:
```json
[
  {
    "id": 123456,
    "name": "repo-name",
    "fullName": "username/repo-name",
    "description": "Repository description",
    "private": false,
    "htmlUrl": "https://github.com/username/repo-name",
    "cloneUrl": "https://github.com/username/repo-name.git",
    "defaultBranch": "main"
  }
]
```

---

### POST /github/clone

Clones a GitHub repository to a new project.

**Request Body**:
```json
{
  "repoFullName": "username/repo-name",
  "branch": "main"
}
```

**Response**: Project object

---

### POST /github/push

Pushes changes to GitHub.

**Request Body**:
```json
{
  "projectId": "project_id",
  "message": "Commit message"
}
```

**Response**:
```json
{ "message": "Changes pushed" }
```

---

### POST /github/pull

Pulls latest changes from GitHub.

**Request Body**:
```json
{
  "projectId": "project_id"
}
```

**Response**:
```json
{ "message": "Changes pulled" }
```

---

## WebSocket Events

Connect to: `ws://localhost:4000/socket.io`

### Authentication

Send token in handshake:
```javascript
const socket = io('/', {
  auth: { token: 'jwt_token' }
});
```

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `project:join` | Client → Server | Join project room |
| `project:leave` | Client → Server | Leave project room |
| `terminal:input` | Client → Server | Send terminal input |
| `terminal:output` | Server → Client | Receive terminal output |
| `terminal:resize` | Client → Server | Resize terminal |
| `terminal:close` | Server → Client | Terminal closed |
| `file:changed` | Server → Client | File was modified |
| `file:created` | Server → Client | File was created |
| `file:deleted` | Server → Client | File was deleted |
| `opencode:message` | Client → Server | Send AI message |
| `opencode:stream` | Server → Client | AI response chunk |
| `opencode:complete` | Server → Client | AI response complete |
| `ready` | Server → Client | Server authenticated |

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Project not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```
