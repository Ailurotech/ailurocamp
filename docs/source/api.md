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

### POST /api/courses

Create a new course (instructor only).

**Request Body:**

```json
{
  "title": "Introduction to Programming",
  "description": "Learn the basics of programming",
  "modules": [
    {
      "title": "Module 1",
      "content": "Content for module 1"
    }
  ]
}
```

**Response:**

```json
{
  "id": "course_id",
  "title": "Introduction to Programming",
  "description": "Learn the basics of programming",
  "instructor": "instructor_id",
  "modules": [
    {
      "title": "Module 1",
      "content": "Content for module 1"
    }
  ]
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
