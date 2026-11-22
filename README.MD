# JWT-Based Authentication API

A RESTful authentication backend built using **Node.js, TypeScript and Express.js**. This project demonstrates secure user registration, login, JWT-based authentication, refresh-token rotation and logout functionality.

## 1. Features

- User registration with email and password validation.
- Secure password hashing using bcrypt.
- User authentication using email and password.
- JWT-based access and refresh tokens.
- Protected profile endpoint using access-token middleware.
- Refresh-token validation and rotation.
- Refresh-token invalidation during logout.
- Environment-based configuration for JWT secrets and token expiry.
- Input validation using Zod.
- Automated API tests using Jest and Supertest.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| TypeScript | Type safety and maintainable code |
| Express.js | REST API framework |
| JSON Web Token | Access and refresh token generation |
| bcrypt | Password hashing |
| Zod | Request validation |
| Jest | Automated testing |
| Supertest | HTTP endpoint testing |
| dotenv | Environment variable management |

### Framework Selection

Express.js was selected because of its lightweight architecture, mature middleware ecosystem and straightforward routing capabilities. It provides a simple foundation for implementing authentication middleware and RESTful API endpoints.

### Storage Approach

An in-memory JavaScript Map is used to store user records and hashed refresh tokens.

This approach was selected to keep the implementation lightweight and focus on authentication fundamentals without introducing database configuration. It is suitable for demonstrating the authentication workflow but is not intended for production deployment.

## 3. Project Structure

```text
jwt-auth-assignment/
│
├── src/
│   ├── config/
│   │   └── env.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── profile.controller.ts
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── profile.routes.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.store.ts
│   │   └── refresh-token.store.ts
│   │
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   └── token.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   └── auth.test.ts
│
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## 4. Installation and Setup

### Prerequisites

- Node.js
- npm

### Clone the repository

```bash
git clone <your-repository-url>
cd jwt-auth-assignment
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000

ACCESS_TOKEN_SECRET=your_long_access_token_secret
REFRESH_TOKEN_SECRET=your_long_refresh_token_secret

ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

Use separate, randomly generated secrets of at least 32 characters. Never commit your actual `.env` file.

### Run the development server

```bash
npm run dev
```

The API will be available at:

`http://localhost:3000`

### Run automated tests

```bash
npm test
```

## 5. API Documentation

Base URL: `http://localhost:3000`

### 5.1 Register a User

**Endpoint:** `POST /auth/register`

Request body:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Success response: `201 Created`

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "generated-user-id",
    "email": "user@example.com"
  }
}
```

Passwords are hashed using bcrypt before storage. Duplicate email registrations are rejected.

### 5.2 User Login

**Endpoint:** `POST /auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Success response: `200 OK`

```json
{
  "message": "Login successful",
  "tokenType": "Bearer",
  "accessToken": "generated-access-token",
  "refreshToken": "generated-refresh-token",
  "user": {
    "id": "generated-user-id",
    "email": "user@example.com"
  }
}
```

The API generates:
- Access token: 15 minutes.
- Refresh token: 7 days.

Both tokens contain the user ID and standard JWT timestamps (`iat` and `exp`).

### 5.3 Get User Profile

**Endpoint:** `GET /profile`

Required header:

```http
Authorization: Bearer <access-token>
```

Success response: `200 OK`

```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "generated-user-id",
    "email": "user@example.com"
  }
}
```

Requests without a valid access token are rejected with `401 Unauthorized`.

### 5.4 Refresh Access Token

**Endpoint:** `POST /auth/refresh`

Request body:

```json
{
  "refreshToken": "your-refresh-token"
}
```

Success response: `200 OK`

```json
{
  "message": "Tokens refreshed successfully",
  "tokenType": "Bearer",
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

The refresh endpoint validates the JWT and checks its hashed value against the server-side refresh-token store.

Refresh-token rotation invalidates the previous refresh token and issues a new token pair.

### 5.5 User Logout

**Endpoint:** `POST /auth/logout`

Request body:

```json
{
  "refreshToken": "your-refresh-token"
}
```

Success response: `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

The refresh token is invalidated and cannot be reused. Existing access tokens remain valid until their expiration.

## 6. Security Considerations

The implementation incorporates the following security practices:

- **Password hashing:** Passwords are hashed using bcrypt with a configurable work factor before storage.
- **JWT signing:** Access and refresh tokens are signed using separate environment-configured secrets.
- **Token expiry:** Short-lived access tokens and longer-lived refresh tokens reduce exposure.
- **Token validation:** Protected routes verify JWT signatures and expiry.
- **Refresh-token storage:** Only SHA-256 hashes of refresh tokens are stored server-side.
- **Token rotation:** Successful refresh requests invalidate the previous refresh token.
- **Input validation:** Zod validates incoming request data.
- **Sensitive information protection:** Password hashes and JWT secrets are never returned in API responses.

## 7. Testing

Automated tests are implemented using Jest and Supertest.

The test suite covers:

1. Successful user registration.
2. Duplicate email registration rejection.
3. Successful login and token generation.
4. Invalid login credentials.
5. Protected profile access with a valid access token.
6. Profile access without an access token.
7. Logout and refresh-token invalidation while preserving the validity of the existing access token.

Run the tests using:

```bash
npm test
```

## 8. Limitations and Future Improvements

The current implementation is designed as a minimal authentication demonstration. Potential production enhancements include:

- Replace in-memory storage with PostgreSQL, MongoDB or Redis.
- Implement atomic refresh-token rotation using database transactions.
- Add rate limiting to login and registration endpoints.
- Add role-based access control (RBAC).
- Implement password reset and email verification workflows.
- Use secure, HttpOnly cookies for browser-based refresh-token handling.
- Add structured logging and monitoring.
- Implement comprehensive unit and integration test coverage.
- Add HTTPS and production deployment configuration.

## 9. Assignment Objective

This project demonstrates the fundamental principles of JWT-based authentication, secure password handling, access control, refresh-token lifecycle management and modular backend architecture using Node.js and TypeScript.