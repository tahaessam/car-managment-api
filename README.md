
## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

## Car Management API

A REST API for managing cars, built with NestJS, TypeScript, Mongoose, and MongoDB.

Each car has a `brand`, `model`, `year`, and `PlateNum`. MongoDB timestamps (`createdAt` and `updatedAt`) are added automatically.

## Requirements

- Node.js and npm
- MongoDB, available locally or through a connection URI

## Setup

Install dependencies from this directory:

```bash
npm install
```

Configure the environment in `.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/car_management
PORT=3000
```

Ensure MongoDB is running, then start the API:

```bash
npm run start:dev
```

The API is available at `http://localhost:3000` by default.

## Car Fields

| Field | Type | Rules |
| --- | --- | --- |
| `brand` | string | Required when creating a car |
| `model` | string | Required when creating a car |
| `year` | integer | Required when creating a car; between 1886 and 2100 |
| `PlateNum` | string | Required when creating a car |

## Endpoints

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

## Postman

Import [`cars.postman_collection.json`](cars.postman_collection.json) into Postman. Set the `baseUrl` collection variable if the API is not running at `http://localhost:3000`. The create request stores its returned ID in `carId` for the get, update, and delete requests.

## Tests and Build

```bash
npm test
npm run test:e2e
npm run build
```
