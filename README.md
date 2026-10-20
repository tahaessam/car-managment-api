# Car Management API

A NestJS REST API for managing users, cars, maintenance records, and fuel logs with MongoDB and JWT authentication.

## Requirements

- Node.js 18+
- npm
- MongoDB

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/car_management
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
```

`MONGODB_URI` and `JWT_SECRET` are required. `PORT` defaults to `3000`.

Start the server:

```bash
npm run start:dev
```

Base URL: `http://localhost:3000`

## Authentication

Register and login are public. Cars, maintenance, and fuel-log endpoints require a JWT. Send it in the standard bearer header:

```http
Authorization: Bearer <access_token>
```

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Create a user |
| `POST` | `/auth/login` | No | Authenticate and return a JWT |
| `GET` | `/auth/profile` | Yes | Get the authenticated user's profile |

Registration body:

```json
{
  "email": "driver@example.com",
  "password": "password123",
  "username": "driver"
}
```

Email must be valid, password must be at least 6 characters, and username at least 2 characters. Login returns an `access_token` inside `data`; tokens expire after one hour. Passwords are hashed and excluded from user responses.

## Cars

All car endpoints require authentication. A car's `owner` is assigned from the authenticated user; do not include `owner` in request bodies.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/cars` | List the authenticated user's cars |
| `GET` | `/cars?brand=Toyota` | Filter their cars by exact, case-insensitive brand |
| `GET` | `/cars/:id` | Get an owned car |
| `POST` | `/cars` | Create a car |
| `PATCH` | `/cars/:id` | Update one or more car fields |
| `DELETE` | `/cars/:id` | Delete an owned car |

Create body:

```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2024,
  "PlateNum": "ABC-1234"
}
```

`brand`, `model`, and `PlateNum` are strings; `year` is an integer from 1886 through 2100. Updates accept any non-empty subset of these fields.

## Maintenance

All maintenance endpoints require authentication. Every maintenance record is linked to exactly one car by `carId`. The server gets the car ID from the route and verifies that the car belongs to the authenticated user. Do not send `carId` or `owner` in the body.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/cars/:carId/maintenance` | Add maintenance to an owned car |
| `GET` | `/cars/:carId/maintenance` | List maintenance for an owned car |
| `GET` | `/maintenance/:id` | Get an owned car's maintenance record |
| `PATCH` | `/maintenance/:id` | Update a maintenance record |
| `DELETE` | `/maintenance/:id` | Delete a maintenance record |

Create body:

```json
{
  "type": "Oil Change",
  "description": "Changed engine oil and filter",
  "date": "2025-01-15",
  "odometer": 45000,
  "laborCost": 65,
  "partsCost": 42.5,
  "notes": "Synthetic oil"
}
```

Required fields are `type` and `description` (non-empty strings), `date` (date string), and `odometer` (number greater than or equal to zero). `laborCost` and `partsCost` are optional non-negative numbers and default to zero. `notes` is optional.

## Fuel Logs

All fuel-log endpoints require authentication. Each fuel log is assigned to exactly one car using the `carId` from the route. The server verifies that the car belongs to the authenticated user before creating, listing, reading, updating, or deleting its fuel logs. Do not send `carId` or `owner` in the body.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/cars/:carId/fuel-logs` | Add a fuel log to an owned car |
| `GET` | `/cars/:carId/fuel-logs` | List fuel logs for an owned car |
| `GET` | `/fuel-logs/:id` | Get a fuel log for an owned car |
| `PATCH` | `/fuel-logs/:id` | Update a fuel log |
| `DELETE` | `/fuel-logs/:id` | Delete a fuel log |

Create body:

```json
{
  "isFullTank": true,
  "fuelAmount": 40,
  "totalCost": 60,
  "fuelPriceAmount": 1.5,
  "odometerReading": 45000
}
```

`isFullTank` must be a boolean. The other fields are required non-negative numbers. Updates accept a non-empty subset of those fields.

## Ownership and Errors

- A user's car list and car operations are scoped to the authenticated user.
- Maintenance and fuel logs are scoped through their associated car.
- Cars or records not found or not owned by the user return `404 Not Found`.
- Invalid DTO fields or IDs return `400 Bad Request`.
- Missing or invalid JWTs return `401 Unauthorized`.
- Duplicate registration email returns `409 Conflict`.
- Unknown body fields are removed by the global validation pipe.

## Repository Structure

Application services depend on typed repository contracts. Mongoose-specific persistence is implemented in repository adapters (for users, cars, maintenance, and fuel), keeping database queries out of the services.

## Postman

Import [`cars.postman_collection.json`](./cars.postman_collection.json). The collection uses `baseUrl` (default `http://localhost:3000`) and stores the login token in the collection-level `token` variable. It includes Auth, Cars, Maintenance, and Fuel Logs folders. Run Login before protected requests; create a car before running its maintenance or fuel-log requests.

## Scripts

```bash
npm run start:dev
npm run build
npm test
npm run test:e2e
```
