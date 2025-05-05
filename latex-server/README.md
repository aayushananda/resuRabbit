# Secure LaTeX Compilation Server

A highly secure, scalable server for compiling LaTeX documents with robust error handling, resource management, and multi-pass compilation support.

## Features

- **Security & Sandboxing**

  - Input sanitization to prevent LaTeX command injection
  - Docker containerization for isolation
  - Non-root user execution
  - Resource limits and security constraints

- **Resource Management**

  - Time limits for compilation jobs
  - Memory limits for LaTeX processes
  - Job queueing with Bull/Redis for concurrency control
  - Automatic cleanup of temporary files

- **Multi-pass Compilation**

  - Support for cross-references and TOC/LOF/LOT
  - Bibliography support with BibTeX and Biber
  - Multiple LaTeX engines (pdfLaTeX, XeLaTeX, LuaLaTeX)

- **Robust Error Handling**

  - Structured logging with Winston
  - Detailed compilation error reporting
  - Real-time logs access API

- **API Improvements**
  - RESTful endpoints for job status, logs, and results
  - Secure preview with token validation
  - Health check endpoint
  - Job status monitoring

## API Endpoints

- `POST /api/compile-latex` - Submit LaTeX code for compilation
- `GET /api/status/:jobId` - Check job status
- `GET /api/logs/:jobId` - Get compilation logs
- `GET /api/download/:jobId` - Download compiled PDF
- `GET /api/preview/:filename?token=xxx` - Preview PDF with security token
- `GET /health` - Health check endpoint

## Setup & Deployment

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start Redis (required for job queue):
   ```
   docker run -p 6379:6379 redis:alpine
   ```
4. Run in development mode:
   ```
   npm run dev
   ```

### Production Deployment

Use Docker Compose for production deployment:

```
docker-compose up -d
```

This will start both the LaTeX server and Redis with proper resource limits and security configurations.

## Environment Variables

| Variable            | Description                     | Default                |
| ------------------- | ------------------------------- | ---------------------- |
| PORT                | Server port                     | 3001                   |
| TEMP_DIR            | Directory for temporary files   | ./src/temp             |
| PUBLIC_DIR          | Directory for public files      | ./src/public           |
| MAX_COMPILE_TIME_MS | Max compilation time (ms)       | 30000                  |
| MAX_JOB_AGE_HOURS   | Time to keep files (hours)      | 2                      |
| QUEUE_CONCURRENCY   | Max concurrent compilation jobs | 3                      |
| REDIS_URL           | Redis connection URL            | redis://localhost:6379 |

## Security Considerations

- All LaTeX input is sanitized to prevent command injection
- Compilation runs in a sandboxed environment
- Resource limits prevent DoS attacks
- Files are automatically cleaned up
- Preview requires security tokens
