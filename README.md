# 2D Metaverse Backend

A backend system for a real-time 2D metaverse application that enables multiple users to interact inside shared virtual spaces. The system supports real-time communication, room management, and state synchronization.

---

## Overview

This project is inspired by a production-style architecture where different parts of the application are separated into independent services (monorepo approach).

The backend handles:

* Real-time communication between users
* Space and room management
* Player movement synchronization
* Authentication and session handling

---

## Features

* Real-time multiplayer interaction using WebSockets
* Room and space management
* Event-based communication system
* Scalable backend architecture
* Separation of concerns (apps/services)
* Modular and maintainable codebase

---

## Tech Stack

* Backend: Node.js, Express.js
* Real-time Communication: WebSockets
* Authentication: JWT
* Architecture: Monorepo (multiple apps/services)

---

## Project Structure

```
├── apps
│   ├── http-server        # REST APIs (auth, spaces, metadata)
│   ├── ws-server          # WebSocket server (real-time updates)
│
├── packages
│   ├── db                 # Database schemas and queries
│   ├── common             # Shared types and utilities
│
├── docker                 # Docker configuration
├── .env
├── package.json
└── README.md
```

---

## Architecture Overview

This project follows a **multi-service architecture**:

* HTTP Server handles standard REST APIs
* WebSocket Server handles real-time communication
* Shared packages contain reusable logic

---

## High-Level Architecture

```
            Client (Frontend)
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   HTTP Server        WebSocket Server
        │                   │
        └─────────┬─────────┘
                  ▼
               Database
```

---

## Real-Time Flow

```
1. Client connects via WebSocket
2. User joins a space (room)
3. Client sends movement/events
4. Server processes event
5. Server broadcasts to other users
6. All clients update state in real time
```

---

## How It Works

* Users connect to the WebSocket server
* Each user is assigned to a room/space
* Events (move, join, leave) are transmitted
* Server broadcasts updates to all users in the same space
* State is synchronized across clients

---

## Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/cyph3rms1n/2D-Metaverse
cd 2D-Metaverse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file:

```
PORT=5000
WS_PORT=3001
JWT_SECRET=your_secret
DATABASE_URL=your_database_url
```

### 4. Run Services

Run HTTP server:

```bash
cd apps/http-server
npm run dev
```

Run WebSocket server:

```bash
cd apps/ws-server
npm run dev
```

---

## API and WebSocket Design

### REST APIs (HTTP Server)

* Authentication
* Space creation
* User metadata

### WebSocket Events (WS Server)

* join_room
* move
* leave_room
* broadcast_state

---

## Key Concepts

* WebSocket-based real-time systems
* Event-driven architecture
* Room-based communication model
* Separation of services (HTTP vs WS)
* Scalable backend design

---

## Limitations

* Single-instance WebSocket server
* No distributed state management
* Limited fault tolerance

---

## Future Improvements

* Redis Pub/Sub for scaling WebSockets
* Load balancing across WS servers
* Persistent world state
* Chat and voice integration
* Advanced collision handling

