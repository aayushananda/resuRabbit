FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN npm run build

# Create production image
FROM node:18-alpine

# Install LaTeX dependencies - use correct Alpine package names
RUN apk add --no-cache \
    texlive \
    texlive-dvi \
    texlive-xetex \
    biber \
    fontconfig \
    && fc-cache -f

# Create non-root user
RUN addgroup -S latex && adduser -S latex -G latex

WORKDIR /app

# Copy built application
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Create necessary directories
RUN mkdir -p dist/temp dist/public \
    && chown -R latex:latex /app

# Switch to non-root user
USER latex

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production \
    TEMP_DIR=/app/dist/temp \
    PUBLIC_DIR=/app/dist/public \
    PORT=3001 \
    MAX_COMPILE_TIME_MS=30000 \
    MAX_JOB_AGE_HOURS=2 \
    QUEUE_CONCURRENCY=3

# Run the application
CMD ["node", "dist/server.js"] 