#!/bin/bash

# Function to display usage instructions
show_usage() {
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev         - Run development environment"
    echo "  prod        - Run production environment"
    echo "  build       - Build Docker images"
    echo "  stop        - Stop running containers"
    echo "  clean       - Stop and remove containers, networks, and images"
    echo ""
}

# Check if command is provided
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

# Process commands
case "$1" in
    dev)
        echo "Starting development environment..."
        docker-compose up app-dev
        ;;
    prod)
        echo "Starting production environment..."
        docker-compose up app-prod
        ;;
    build)
        echo "Building Docker images..."
        docker-compose build
        ;;
    stop)
        echo "Stopping containers..."
        docker-compose down
        ;;
    clean)
        echo "Cleaning up Docker resources..."
        docker-compose down --rmi all --volumes --remove-orphans
        ;;
    *)
        echo "Invalid command: $1"
        show_usage
        exit 1
        ;;
esac
