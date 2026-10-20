# Car Management API

A NestJS REST API for managing cars and user authentication with MongoDB.

## Overview

This project includes:

- User registration and login
- JWT-based authentication
- Car CRUD operations
- Input validation with `class-validator`
- MongoDB persistence with Mongoose

## Tech Stack

- Node.js
- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt

## Requirements

- Node.js 18+
- npm
- MongoDB running locally or reachable through a MongoDB URI

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/car_management
PORT=3000
JWT_SECRET=your-super-secret-key
```

3. Make sure MongoDB is running.

4. Start the API in development mode:

```bash
npm run start:dev
```

The app runs by default at:

```text
http://localhost:3000
```

---

## Available Endpoints

### 1) Root

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | ❌ | Returns a simple hello message |

Example:

```http
GET /
```

Response:

```text
Hello World!
```

---

### 2) Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | ❌ | Register a new user |
| `POST` | `/auth/login` | ❌ | Login and receive a JWT token |
| `GET` | `/auth/profile` | ✅ | Get the authenticated user profile |

#### Register user

```http
POST /auth/register
Content-Type: application/json
```

Body:

```json
{
  "email": "user@example.com",
  "password": "123456",
  "username": "taha"
}
```

Required fields:

| Field | Type | Validation |
| --- | --- | --- |
| `email` | string | valid email format |
| `password` | string | minimum 6 characters |
| `username` | string | minimum 2 characters |

Success response:

```json
{
  "message": "تم تسجيل المستخدم بنجاح",
  "success": true,
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "username": "taha",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Notes:

- Duplicate email returns `409 Conflict`
- Password is not returned in the response

#### Login user

```http
POST /auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Success response:

```json
{
  "message": "تم تسجيل الدخول بنجاح",
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Notes:

- Invalid credentials return `401 Unauthorized`

#### Get authenticated profile

```http
GET /auth/profile
Authorization: Bearer <access_token>
```

Success response:

```json
{
  "message": "تم جلب بيانات المستخدم بنجاح",
  "success": true,
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "username": "taha",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Notes:

- Missing or invalid token returns `401 Unauthorized`
- Password is excluded from the returned user object

---

### 3) Cars

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/cars` | ❌ | List all cars |
| `GET` | `/cars?brand=Toyota` | ❌ | Filter cars by brand (case-insensitive exact match) |
| `GET` | `/cars/:id` | ❌ | Get one car by MongoDB ID |
| `POST` | `/cars` | ❌ | Create a new car |
| `PATCH` | `/cars/:id` | ❌ | Update a car |
| `DELETE` | `/cars/:id` | ❌ | Delete a car |

#### Car object fields

| Field | Type | Rules |
| --- | --- | --- |
| `brand` | string | required |
| `model` | string | required |
| `year` | number | required, between 1886 and 2100 |
| `PlateNum` | string | required |

#### Create a car

```http
POST /cars
Content-Type: application/json
```

Body:

```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2022,
  "PlateNum": "ABC-1234"
}
```

Success response:

```json
{
  "_id": "...",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2022,
  "PlateNum": "ABC-1234",
  "createdAt": "...",
  "updatedAt": "..."
}
```

Notes:

- Invalid request body returns `400 Bad Request`

#### Get all cars

```http
GET /cars
```

Optional filter:

```http
GET /cars?brand=Toyota
```

This matches brand values case-insensitively.

#### Get one car by ID

```http
GET /cars/:id
```

Example:

```http
GET /cars/64f8d4bc8c9e2d1d8d9aa111
```

If the car does not exist, the API returns `404 Not Found`.

#### Update a car

```http
PATCH /cars/:id
Content-Type: application/json
```

Example:

```json
{
  "model": "Camry",
  "year": 2024
}
```

Rules:

- At least one field must be provided
- Empty body returns `400 Bad Request`
- If the car is not found, returns `404 Not Found`

#### Delete a car

```http
DELETE /cars/:id
```

If the item exists, it is deleted and returned. If it does not exist, the API returns `404 Not Found`.

---

## Postman

Import the collection file:

```text
cars.postman_collection.json
```

The collection contains the available Auth and Cars requests.

Recommended flow:

1. Register a user
2. Login to get the JWT token
3. Copy the token into the `Authorization` header for `/auth/profile`
4. Use the cars endpoints as needed

---

## Validation and Errors

The application uses NestJS validation and returns standard HTTP errors such as:

- `400 Bad Request` for invalid inputs
- `401 Unauthorized` for invalid or missing JWT credentials
- `404 Not Found` for missing records
- `409 Conflict` for duplicate email registrations

---

## Scripts

```bash
npm run start:dev
npm run build
npm test
npm run test:e2e
```

This README reflects the actual API implemented in the current source code.
