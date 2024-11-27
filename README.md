# Todo List Application

## Prerequisites

- Docker and Docker Compose installed
- MongoDB (will be run in containers)
- Node.js
- Pnpm
- mongosh

## Getting Started

1. Start the MongoDB cluster:
   `cd docker && docker compose up -d`
2. Init the MongoDB cluster:
   `cd docker/scripts && ./init-mongodb-cluster.sh`
3. Generate mock data:
   `cd server/mock && node mock.js`
4. Start the application:
   `cd server && pnpm i && pnpm run start`

## Check the application

- Open the browser and navigate to `http://localhost:3000/health`

## Use Get Todo List API

- Get user id
  `mongosh "mongodb://localhost:27017/todo_app"`
  `db.users.find().limit(10)`

- Open the browser and navigate to `http://localhost:3000/todos/top?userId=xxxxxx`

## Test

- `cd server && pnpm run test`
