# Agent RSP

> **An agent-first AI knowledge assistant built with the MERN stack — combining RAG, vector search, tool calling, and LLM reasoning to interact intelligently with your stored information.**

---

## Overview

Agent RSP is a full-stack web application that goes beyond traditional CRUD. Users save and manage information in their personal workspace, then interact with an AI agent that can semantically retrieve relevant content and generate contextual, grounded responses.

The core intelligence layer is an AI agent powered by Groq's LLM. When a user asks a question, the agent decides whether to invoke a semantic search tool, retrieves relevant information from a Qdrant vector database, and uses that retrieved context to produce an accurate answer — rather than guessing or hallucinating.

**What makes Agent RSP different from a standard MERN application:**

- An AI agent with tool-calling capability sits at the core of the system
- User content is embedded and stored in a vector database (Qdrant) for semantic retrieval
- Retrieval-Augmented Generation (RAG) grounds the agent's responses in the user's actual stored knowledge
- The agent explicitly communicates when requested information is not available, rather than inventing answers

---

## Features

### Application
- User registration and login
- JWT-based authentication with protected routes
- Protected user profile
- Create, read, update, and delete saved knowledge/content
- User-specific data isolation

### AI Agent
- Agent-first architecture with tool calling
- Semantic search tool for retrieving relevant stored content
- Retrieval-Augmented Generation (RAG) pipeline
- Groq LLM integration (`llama-3.1-8b-instant` — current implementation)
- Context-aware, grounded AI responses
- Agent clearly communicates when requested information is not present in stored knowledge

### Vector Search & Embeddings
- Text converted to vector embeddings via Hugging Face
- Qdrant vector database for semantic similarity search
- Cosine similarity matching (vector size: 384)
- Semantically relevant retrieval even when query wording differs from stored content

---

## Architecture

### System Flow

```
User
 ↓
React Frontend
 ↓
Express REST API
 ↓
Agent RSP AI Agent
 ↓
Tool Selection (Tool Calling)
 ↓
Semantic Search Tool
 ↓
Hugging Face Embeddings
 ↓
Qdrant Vector Search
 ↓
Relevant Context
 ↓
Groq LLM
 ↓
AI Response
 ↓
React Frontend
```

### Storage Flow

```
User Content → MongoDB          (persistent application data)
User Content → Embedding → Qdrant  (semantic retrieval)
```

MongoDB and Qdrant serve distinct roles:

| Store | Role |
|---|---|
| **MongoDB** | Primary application data store — user accounts, saved content |
| **Qdrant** | Vector store — embeddings for semantic similarity search |
| **Groq** | LLM — agent reasoning and response generation |
| **Hugging Face** | Embedding generation — converts text to vectors |

---

## AI Agent

The agent is the core intelligence layer of Agent RSP.

When a user submits a question:

1. The agent receives the question
2. The agent determines whether a tool is required to answer it
3. If relevant, the semantic search tool is invoked
4. The question is converted to an embedding via Hugging Face
5. Qdrant performs a vector similarity search against stored embeddings
6. Relevant stored content is retrieved
7. The retrieved context is provided to the agent
8. Groq's LLM generates the final response grounded in that context

This allows Agent RSP to answer questions using the user's own stored knowledge rather than relying purely on the LLM's general training data.

**Hallucination prevention:** When the requested information does not exist in the user's stored knowledge, the agent is designed to clearly communicate this rather than fabricating an answer.

---

## RAG Pipeline

Retrieval-Augmented Generation (RAG) is the retrieval mechanism that connects user content to AI responses.

**Ingestion (when content is saved):**

1. User saves information
2. Relevant text fields are combined
3. Text is converted to a vector embedding using Hugging Face's inference system
4. The embedding (vector) is stored in Qdrant
5. The original content is stored in MongoDB

**Retrieval (when user asks a question):**

1. The user's question is converted to an embedding
2. Qdrant performs cosine similarity search against stored vectors
3. The most semantically relevant stored content is retrieved
4. The retrieved context is supplied to the Groq LLM
5. Groq generates a contextual response based on the retrieved information

---

## Vector Search

Instead of relying on exact keyword matching, Agent RSP represents text as numerical vectors called embeddings. These vectors capture semantic meaning — the relationships between concepts — rather than just surface-level words.

When a user asks a question, the query is also converted to an embedding. Qdrant compares query and stored vectors using **cosine similarity** to find the most semantically related content.

This means users can ask about a concept using their own words, even if those words differ from the exact terms stored in their knowledge base.

**Current Qdrant configuration:**

| Parameter | Value |
|---|---|
| Vector size | 384 |
| Distance metric | Cosine |

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Authentication** | JWT, bcrypt |
| **AI / LLM** | Groq (`llama-3.1-8b-instant` — current implementation) |
| **Embeddings** | Hugging Face Inference API |
| **Vector Database** | Qdrant |
| **Language** | JavaScript |
| **Containerisation** | Docker (Qdrant, development) |
| **API** | REST |

---



## Project Structure

```
Agent-RSP/
│
├── Client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── Server/
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   ├── Config/
│   ├── tools/
│   ├── services/
│   ├── express-server.js
│   ├── package.json
│   └── ...
│
├── .gitignore

```

> The project structure may evolve as development continues.

---

## Backend Architecture

| Layer | Responsibility |
|---|---|
| **Express Server** | Handles incoming HTTP API requests |
| **Routes** | Defines API endpoints |
| **Controllers** | Contains application and business logic |
| **Models** | Defines MongoDB schemas |
| **Auth Middleware** | Protects private routes using JWT verification |
| **AI Agent** | Handles LLM interaction and tool orchestration |
| **Tools** | Provides agent capabilities (e.g. semantic search) |
| **Services** | Manages external integrations — Groq, Hugging Face, Qdrant |

---

## Authentication

Agent RSP uses JWT-based authentication:

1. **Registration** — User creates an account; password is hashed using bcrypt before storage
2. **Login** — Credentials are verified; a JWT token is issued on success
3. **Protected routes** — API routes that require authentication validate the JWT on each request
4. **User-specific data** — Authenticated users can only access their own stored content

---

## API Overview

### Authentication Routes

| Endpoint | Description |
|---|---|
| `POST /api/users/register` | Register a new user |
| `POST /api/users/login` | Login and receive a JWT token |
| `GET /api/users/profile` | Retrieve the authenticated user's profile (protected) |

### Content Management Routes (Protected)

Protected routes are available for creating, retrieving, updating, and deleting user-saved content. All content management routes require a valid JWT token.

---

## Environment Variables

Create a `.env` file in the `Server/` directory. Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
HF_TOKEN=your_huggingface_token
QDRANT_URL=your_qdrant_url
``

---

## Installation & Running Locally

### Prerequisites

- Node.js
- npm
- Docker (for running Qdrant locally)
- MongoDB connection (local or Atlas)
- Groq API key
- Hugging Face API token


### 1. Install Dependencies

**Frontend:**

```bash
cd Client
npm install
```

**Backend:**

```bash
cd Server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `Server/` directory using the template in the [Environment Variables](#environment-variables) section above.

### 3. Start Qdrant (Docker — Development)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

> This runs Qdrant locally for development. Qdrant will be accessible at `http://localhost:6333`.

### 4. Start the Backend

```bash
cd Server
npm start
```

> The exact script depends on your `Server/package.json` scripts configuration.
> Backend runs at: `http://localhost:5000`

### 5. Start the Frontend

```bash
cd Client
npm run dev
```

> Frontend runs at: `http://localhost:5173`

---

## Example Workflow

**Scenario: User saves information about React.js**

1. User saves a piece of content describing what React.js is and what it is used for
2. The application generates a vector embedding of that content via Hugging Face
3. The embedding is stored in Qdrant; the content is stored in MongoDB

**User later asks:**

> *"What is React used for?"*

4. The agent receives the question
5. The agent determines that a semantic search is relevant
6. The question is embedded and compared against stored vectors in Qdrant
7. The React.js content is retrieved as a top similarity match
8. Groq's LLM generates a response grounded in the retrieved content

**If the information is not available:**

If the user asks about a topic not present in their stored knowledge, the agent clearly communicates that the available knowledge base does not contain that information, rather than generating a fabricated answer.

---

## Development Status

Agent RSP is an actively developed project.

**Currently implemented:**

- MERN CRUD operations
- JWT authentication
- AI agent with tool calling
- Groq LLM integration
- Hugging Face embedding generation
- Qdrant vector database integration
- RAG pipeline
- Semantic search tool
- MongoDB data storage
- React frontend

---

## Future Enhancements

- Additional AI agent tools and capabilities
- Multi-step and multi-turn agent workflows
- Conversation memory across sessions
- Improved retrieval with reranking
- Knowledge graph and semantic relationship mapping
- File and document ingestion (PDF, plain text)
- Enhanced visualisation capabilities
- Role-based access control
- Automated testing (unit and integration)

---

## Technical Value

Agent RSP demonstrates practical implementation across:

| Area | Technologies / Concepts |
|---|---|
| Full-stack development | MERN (MongoDB, Express, React, Node.js) |
| REST API design | Express, Controllers, Routes, Middleware |
| Authentication | JWT, bcrypt, protected routes |
| Database design | MongoDB schemas, user-scoped data |
| AI agent architecture | Tool calling, agent reasoning loop |
| RAG | Retrieval-Augmented Generation pipeline |
| Embeddings | Hugging Face inference, vector representations |
| Vector databases | Qdrant, cosine similarity, semantic search |
| LLM integration | Groq API, chat completions |
| External API integration | Groq, Hugging Face |
| Containerisation | Docker (Qdrant development setup) |
| Modern frontend | React, Vite, Tailwind CSS |

---

Agent RSP is a project focused on combining full-stack MERN engineering with modern AI agent architecture, Retrieval-Augmented Generation, vector search, and LLM integration — demonstrating how these technologies can be composed into a coherent, working application.
