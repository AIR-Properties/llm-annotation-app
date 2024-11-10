# Annotation App

A React application for managing annotations and LLM responses.

## Environment Variables

The application requires the following environment variable:

- `REACT_APP_API_URL`: The URL of the backend API

## Security Notes

This project includes package overrides to address security vulnerabilities:
- `nth-check`: Enforced version >=2.0.1
- `postcss`: Enforced version >=8.4.31

These overrides are configured in package.json to ensure secure versions are used regardless of transitive dependencies.

## Docker Setup

This project includes Docker configuration for both development and production environments.

### Prerequisites

- Docker
- Docker Compose

### Development Environment

To run the application in development mode with hot-reloading:

```bash
# Set the API URL and run development server
REACT_APP_API_URL=http://localhost:8000 docker-compose up dev

# Or using the provided script
REACT_APP_API_URL=http://localhost:8000 ./docker.sh dev
```

The development server will be available at `http://localhost:3000`

### Production Environment

To build and run the production version:

```bash
# Set the API URL and run production server
REACT_APP_API_URL=https://api.yourdomain.com docker-compose up prod

# Or using the provided script
REACT_APP_API_URL=https://api.yourdomain.com ./docker.sh prod
```

The production build will be served at `http://localhost:80`

### Additional Commands

```bash
# Build the Docker images (remember to set REACT_APP_API_URL)
REACT_APP_API_URL=https://api.yourdomain.com ./docker.sh build

# Stop running containers
./docker.sh stop

# Clean up Docker resources (remove containers, images, and volumes)
./docker.sh clean
```

### Docker Script Usage

The `docker.sh` script provides convenient commands for managing the Docker environment:

- `dev`: Run development environment
- `prod`: Run production environment
- `build`: Build Docker images
- `stop`: Stop running containers
- `clean`: Stop and remove containers, networks, and images

Remember to set the `REACT_APP_API_URL` environment variable when running any of these commands.

## Development Without Docker

If you prefer to run the application without Docker:

```bash
# Install dependencies
npm install

# Set API URL and start development server
REACT_APP_API_URL=http://localhost:8000 npm start

# Create production build with API URL
REACT_APP_API_URL=https://api.yourdomain.com npm run build
```

## Package Updates

After cloning or pulling updates, it's recommended to run:

```bash
# Install dependencies with security updates
npm install

# Or to specifically update security-related packages
npm update nth-check postcss
```

This ensures all security patches and overrides are properly applied.
