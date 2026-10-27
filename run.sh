#!/bin/bash
# WeBuild Runner Script

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "Please edit .env and set JWT_SECRET if needed"
fi

case "$1" in
  setup)
    echo "Running setup..."
    npm run setup
    ;;
  dev)
    echo "Starting development servers..."
    npm run dev
    ;;
  build)
    echo "Building all packages..."
    npm run build
    ;;
  test)
    echo "Running tests..."
    npm run test
    ;;
  *)
    echo "Usage: ./run.sh [setup|dev|build|test]"
    echo "  setup - Install deps, generate Prisma client, migrate and seed DB"
    echo "  dev   - Start API (port 4000) and web (port 5173)"
    echo "  build - Build all packages"
    echo "  test  - Run tests"
    exit 1
    ;;
esac
