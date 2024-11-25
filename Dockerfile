# Development stage
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Add node_modules/.bin to PATH
ENV PATH /app/node_modules/.bin:$PATH

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Add build-time arguments
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Debug: Print environment variable during build
RUN echo "Building with REACT_APP_API_URL=$REACT_APP_API_URL"

# Build the application with cache busting
RUN REACT_APP_API_URL=$REACT_APP_API_URL BUILD_TIME=$(date +%s) npm run build

# Production stage - serve static files
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 80

# Start static file server
CMD ["serve", "-s", "build", "-l", "80"]
