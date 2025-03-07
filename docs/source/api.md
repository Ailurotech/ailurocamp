# API Documentation

This document provides details about the API endpoints available in the AiluroCamp Learning Management System.

## Authentication Endpoints

### POST /api/auth/register

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### POST /api/auth/login

Authenticate a user.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["student"]
  }
}
```

## User Management Endpoints

### GET /api/users

Get all users (admin only).

**Response:**

```json
{
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["student"]
    }
  ]
}
```

### GET /api/users/:id

Get a specific user.

**Response:**

```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["student"]
}
```

## Course Management Endpoints

### GET /api/courses

Get all courses.

**Response:**

```json
{
  "courses": [
    {
      "id": "course_id",
      "title": "Introduction to Programming",
      "description": "Learn the basics of programming",
      "instructor": "instructor_id",
      "enrolledStudents": ["student_id"]
    }
  ]
}
```

### POST /api/instructor/course

Create a new course (instructor only).

**Request Body:**

Form-data
| key | type | value |
|-------------|------|-------|
| title | Text | Introduction to Programming |
| description | Text | Learn the basics of programming |
| category | Text | Backend |
| level | Text | beginner |
| price | Text | 23 |
| thumbnail | File | File |
| tags | Text | language, C |
| status | Text | published |
| instructor | Text | instructor_id |

**Response:**

```json
{
  "message": "Course created successfully",
  "savedCourse": {
    "title": "Introduction to Programming",
    "description": "Learn the basics of programming",
    "instructor": "instructor_id",
    "thumbnail": "image path",
    "modules": [],
    "enrolledStudents": [],
    "price": 23,
    "category": "Backend",
    "level": "beginner",
    "status": "published",
    "averageRating": 0,
    "revenue": 0,
    "tags": ["language", "C"],
    "ratingCount": 0,
    "ratingSum": 0,
    "_id": "course_id",
    "createdAt": "2025-03-06T10:03:10.189Z",
    "updatedAt": "2025-03-06T10:03:10.208Z",
    "__v": 0
  }
}
```

### GET /api/category

Get all categories.

**Response:**

```json
{
  "categories": [
    {
      "_id": "category_id",
      "category": ["Frontend", "Backend"],
      "__v": 0
    }
  ]
}
```

### POST /api/category

Create a new category (admin only)

**Request Body:**

```json
{
  "category": ["Frontend", "Backend", "Fullstack"]
}
```

**Response:**

```json
{
  "message": "Category created successfully",
  "categoryRes": {
    "category": ["Frontend", "Backend", "Fullstack"],
    "_id": "category_id",
    "__v": 0
  }
}
```

### GET /api/level

Get all levels.

**Response:**

```json
{
  "levels": [
    {
      "_id": "level_id",
      "level": ["beginner", "middle", "advanced"],
      "__v": 0
    }
  ]
}
```

### POST /api/level

Create a new level (admin only)

**Request Body:**

```json
{
  "level": ["beginner", "middle", "advanced"]
}
```

**Response:**

```json
{
  "message": "Level created successfully",
  "levelRes": {
    "level": ["beginner", "middle", "advanced"],
    "_id": "level_id",
    "__v": 0
  }
}
```

## Assignment Management Endpoints

### GET /api/courses/:courseId/assignments

Get all assignments for a course.

**Response:**

```json
{
  "assignments": [
    {
      "id": "assignment_id",
      "title": "Assignment 1",
      "description": "Complete the exercises",
      "dueDate": "2023-12-31T23:59:59Z",
      "points": 100
    }
  ]
}
```

### POST /api/courses/:courseId/assignments

Create a new assignment (instructor only).

**Request Body:**

```json
{
  "title": "Assignment 1",
  "description": "Complete the exercises",
  "dueDate": "2023-12-31T23:59:59Z",
  "points": 100
}
```

**Response:**

```json
{
  "id": "assignment_id",
  "title": "Assignment 1",
  "description": "Complete the exercises",
  "dueDate": "2023-12-31T23:59:59Z",
  "points": 100
}
```

## Kanban Board Endpoints

### GET /api/board

Get all GitHub projects for the authenticated user.

**Response:**

```json
{
  "projects": [
    {
      "id": 12345678,
      "name": "Development Project",
      "isV2": true,
      "orgProject": true
    }
  ]
}
```

### GET /api/board?projectId=12345678

Get columns and cards for a specific GitHub project.

**Query Parameters:**

- `projectId` (required): The ID of the GitHub project to retrieve

**Response:**

```json
{
  "columns": [
    {
      "id": "1234",
      "name": "To Do",
      "cards": [
        {
          "id": "5678",
          "title": "Fix login bug",
          "note": "Users are experiencing issues with login on mobile devices",
          "content_url": "https://github.com/owner/repo/issues/123",
          "created_at": "2023-07-01T10:00:00Z",
          "number": 123
        }
      ]
    },
    {
      "id": "2345",
      "name": "In Progress",
      "cards": []
    },
    {
      "id": "3456",
      "name": "Done",
      "cards": []
    }
  ]
}
```

### POST /api/board

Create a new issue or move a card between columns.

**Request Body for Creating an Issue:**

```json
{
  "action": "createIssue",
  "title": "Fix navigation menu",
  "body": "The navigation menu is not responsive on mobile devices",
  "labels": ["bug", "frontend"]
}
```

**Response for Creating an Issue:**

```json
{
  "success": true,
  "issue": {
    "id": 987654321,
    "number": 124,
    "title": "Fix navigation menu",
    "url": "https://github.com/owner/repo/issues/124"
  }
}
```

**Request Body for Moving a Card:**

```json
{
  "action": "moveCard",
  "cardId": "5678",
  "columnId": "2345",
  "position": "top",
  "isV2": true,
  "fieldId": "field_123"
}
```

**Response for Moving a Card:**

```json
{
  "success": true
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "message": "Error message describing what went wrong",
  "error": "Optional detailed error information"
}
```

Common HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Rate Limiting

API requests are subject to rate limiting to prevent abuse:

- 100 requests per minute per IP address
- 1000 requests per hour per user

Exceeding these limits will result in a `429 Too Many Requests` response.

## Authentication

Most API endpoints require authentication using JWT tokens. Include the token in the request cookies (handled automatically by NextAuth.js when using the client-side libraries).

## API Versioning

The current API version is v1 (implicit in the paths). Future versions will be explicitly versioned (e.g., `/api/v2/courses`).

## Development and Testing

For local development and testing, the API is available at `http://localhost:3000/api/`.

For production, the API endpoints depend on your deployment configuration.
