# Car Management API

A REST API for managing cars with **user authentication**, built with NestJS, TypeScript, Mongoose, and MongoDB.

## Features

- **Cars CRUD** — Create, read, update, and delete cars
- **Authentication** — Register, login with JWT tokens, bcrypt password hashing
- **Protected Routes** — JWT guard for endpoints that require authentication
- **Validation** — Runtime DTO validation with class-validator

## Requirements

- Node.js and npm
- MongoDB, available locally or through a connection URI

## Setup

Install dependencies:

```bash
npm install
```

Configure the environment in `.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/car_management
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-production
```

> ⚠️ **Important**: Change `JWT_SECRET` to a strong, random value in production.

Ensure MongoDB is running, then start the API:

```bash
npm run start:dev
```

The API is available at `http://localhost:3000` by default.

---

## Authentication

### Auth Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | ❌ | Register a new user |
| `POST` | `/auth/login` | ❌ | Login and receive a JWT access token |
| `GET` | `/auth/profile` | ✅ Bearer | Get the authenticated user's profile |

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456",
  "username": "taha"
}
```

| Field | Type | Rules |
| --- | --- | --- |
| `email` | string | Required, must be a valid email |
| `password` | string | Required, minimum 6 characters |
| `username` | string | Required, minimum 2 characters |

Returns the created user (without password). Duplicate email returns `409 Conflict`.

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```

Returns `{ access_token: "..." }`. Wrong credentials return `401 Unauthorized`.

### Profile (Protected)

```http
GET /auth/profile
Authorization: Bearer <access_token>
```

Returns the authenticated user's data. Missing or invalid token returns `401 Unauthorized`.

---

## Cars

### Car Fields

| Field | Type | Rules |
| --- | --- | --- |
| `brand` | string | Required when creating a car |
| `model` | string | Required when creating a car |
| `year` | integer | Required when creating a car; between 1886 and 2100 |
| `PlateNum` | string | Required when creating a car |

### Car Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/cars` | List all cars |
| `GET` | `/cars?brand=Toyota` | List cars whose brand exactly matches, case-insensitively |
| `GET` | `/cars/:id` | Get one car by MongoDB ID |
| `POST` | `/cars` | Create a car |
| `PATCH` | `/cars/:id` | Update one or more car fields |
| `DELETE` | `/cars/:id` | Delete a car |

Create request example:

```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2022,
  "PlateNum": "ABC-1234"
}
```

PATCH accepts any non-empty subset of the car fields. An empty body returns `400 Bad Request`. Missing records return `404 Not Found`; invalid create fields return `400 Bad Request`.

---

## Postman

Import [`cars.postman_collection.json`](cars.postman_collection.json) into Postman. The collection includes both **Auth** and **Cars** request folders.

The `baseUrl` collection variable defaults to `http://localhost:3000`. The auth flow:
1. **Register** creates a user
2. **Login** stores the `access_token` in a collection variable automatically
3. **Profile** uses the stored token in the `Authorization` header
4. Car requests can run independently

## Tests and Build

```bash
npm test
npm run test:e2e
npm run build
```
