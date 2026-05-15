# Drawing Game

A real-time multiplayer drawing and guessing game. One player draws a word while others try to guess it in the chat — similar to Skribbl.io.

## How it works

- At least 2 players are needed to start a round
- One player draws the given word on a shared canvas
- Other players guess by typing in the chat
- Correct guesses are hidden from players who haven't guessed yet
- Rounds rotate between players automatically
- Letters are progressively revealed as the timer counts down

## Tech Stack

- **Server:** Node.js, Express, Socket.IO v4
- **Client:** React 18, React Bootstrap 2, React Router 6, Vite

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- npm v8 or newer

## Running locally

### 1. Install server dependencies

In the project root:

```bash
npm install
```

### 2. Install client dependencies

```bash
cd client
npm install
cd ..
```

### 3. Start the server

In the project root:

```bash
npm start
```

The server runs on **http://localhost:5000**.

### 4. Start the client dev server

In a separate terminal, from the `client/` directory:

```bash
cd client
npm run dev
```

The client runs on **http://localhost:5173**.

### 5. Open the game

Open **http://localhost:5173** in two or more browser tabs/windows, enter a name in each, and the game will start automatically once two players have joined.

## Building for production

```bash
cd client
npm run build
```

This outputs a static bundle to `client/build/`. The Express server already serves it — just run `npm start` from the project root and visit **http://localhost:5000**.
