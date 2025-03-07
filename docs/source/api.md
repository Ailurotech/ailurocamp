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

### GET /api/instructor/course?instructorId={instructorId}&page={page}

Get all courses by instructor Id and page number (instructor only).

**Response:**

```json
{
  "courses": [
    {
      "_id": "course_id",
      "title": "Introduction to Programming",
      "description": "Learn the basics of programming",
      "instructor": "instructor_id",
      "thumbnail": "image path",
      "modules": [],
      "enrolledStudents": [],
      "price": 34,
      "category": "Backend",
      "level": "beginner",
      "status": "unpublished",
      "averageRating": 0,
      "revenue": 0,
      "tags": ["Language", "C"],
      "ratingCount": 0,
      "ratingSum": 0,
      "createdAt": "2025-03-06T10:26:28.534Z",
      "updatedAt": "2025-03-06T10:26:28.544Z",
      "__v": 0
    },
    {
      "_id": "course_id",
      "title": "test2",
      "description": "test2",
      "instructor": "instructor_id",
      "thumbnail": "image path",
      "modules": [],
      "enrolledStudents": [],
      "price": 33.99,
      "category": "Frontend",
      "level": "middle",
      "status": "unpublished",
      "averageRating": 0,
      "revenue": 0,
      "tags": ["tag1", "tag2", "tag3"],
      "ratingCount": 0,
      "ratingSum": 0,
      "createdAt": "2025-03-01T14:15:28.796Z",
      "updatedAt": "2025-03-02T11:02:58.536Z",
      "__v": 0
    },
    {
      "_id": "course_id",
      "title": "test1",
      "description": "test1",
      "instructor": "instructor_id",
      "thumbnail": "image path",
      "modules": [],
      "enrolledStudents": [],
      "price": 34,
      "category": "Frontend",
      "level": "middle",
      "status": "published",
      "averageRating": 7,
      "revenue": 0,
      "tags": ["tag1", "tag2", "tag3"],
      "createdAt": "2025-02-27T14:57:32.584Z",
      "updatedAt": "2025-03-02T11:02:52.958Z",
      "__v": 0,
      "ratingCount": 2,
      "ratingSum": 14
    }
  ],
  "totalCourses": 3,
  "page": 1,
  "limit": 10
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

### PATCH /api/instructor/course?courseId={courseId}

Update a course by courseId (instructor only)

**Request Body:**

```json
{
  "title": "new title",
  "description": "new description"
}
```

**Response:**

```json
{
  "message": "Course updated successfully",
  "updatedResult": {
    "_id": "course_id",
    "title": "new title",
    "description": "new description",
    "instructor": "instructor_id",
    "thumbnail": "image path",
    "modules": [],
    "enrolledStudents": [],
    "price": 34,
    "category": "Frontend",
    "level": "middle",
    "status": "published",
    "averageRating": 7.666666666666667,
    "revenue": 0,
    "tags": ["tag1", "tag2", "tag3"],
    "createdAt": "2025-02-27T14:57:32.584Z",
    "updatedAt": "2025-03-06T13:27:02.385Z",
    "__v": 0,
    "ratingCount": 3,
    "ratingSum": 23
  }
}
```

### DELETE /api/instructor/course?courseId={courseId}

Delete a course by courseId (instructor only)

**Response:**

```json
{
  "message": "Course deleted successfully",
  "deletedResult": {
    "_id": "deleted course_id",
    "title": "test2",
    "description": "test2",
    "instructor": "instructor_id",
    "thumbnail": "image path",
    "modules": [],
    "enrolledStudents": [],
    "price": 33.99,
    "category": "Frontend",
    "level": "middle",
    "status": "unpublished",
    "averageRating": 0,
    "revenue": 0,
    "tags": ["tag1", "tag2", "tag3"],
    "ratingCount": 0,
    "ratingSum": 0,
    "createdAt": "2025-03-01T14:15:28.796Z",
    "updatedAt": "2025-03-02T11:02:58.536Z",
    "__v": 0
  }
}
```

### GET /api/review?courseId={courseId}&page={page}

Get all reviews by courseId and page number

**Response:**

```json
{
  "reviews": [
    {
      "_id": "review_id",
      "userId": {
        "_id": "user_id",
        "name": "Jerry"
      },
      "comment": "Very helpful",
      "rating": 9,
      "updatedAt": "2025-03-06T13:00:16.726Z"
    },
    {
      "_id": "review_id",
      "userId": {
        "_id": "user_id",
        "name": "Allen"
      },
      "comment": "Not bad",
      "rating": 6,
      "updatedAt": "2025-02-28T10:33:59.743Z"
    }
  ],
  "totalReviews": 2,
  "page": 1,
  "limit": 10
}
```

### POST /api/review

Create a review (student only)

**Request Body:**

```json
{
  "courseId": "course_id",
  "userId": "user_id",
  "rating": "9",
  "comment": "Very helpful"
}
```

**Response:**

```json
{
  "message": "Review added successfully.",
  "review": {
    "courseId": "course_id",
    "userId": "user_id",
    "comment": "Very helpful",
    "rating": 9,
    "_id": "67c9a73213d0f684715f5f1d",
    "createdAt": "2025-03-06T13:46:26.582Z",
    "updatedAt": "2025-03-06T13:46:26.582Z",
    "__v": 0
  }
}
```

### PUT /api/review

Update a review (student only)

**Request Body:**

```json
{
  "courseId": "course_id",
  "userId": "user_id",
  "rating": "8",
  "comment": "Good"
}
```

**Response:**

```json
{
  "message": "Review updated successfully.",
  "review": {
    "_id": "review_id",
    "courseId": "course_id",
    "userId": "user_id",
    "comment": "Good",
    "rating": 8,
    "createdAt": "2025-03-06T13:00:16.726Z",
    "updatedAt": "2025-03-06T13:58:46.042Z",
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
