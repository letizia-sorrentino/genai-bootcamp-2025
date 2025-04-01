# Docker Setup Instructions

This document provides instructions for running the Flashcards application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Project Structure

```
flashcards-app/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   └── .dockerignore
└── docker-compose.yml
```

## Environment Setup

### Backend Setup Only
```bash
# Navigate to backend directory
cd backend

# Copy example environment file
cp .env.example .env

# Edit .env file with your configurations
nano .env
```

## Building and Running with Docker Compose

### Development Mode
```bash
# Build and start all services
docker-compose -f docker-compose.dev.yml up --build

# Run in detached mode
docker-compose -f docker-compose.dev.yml up -d
```

### Production Mode
```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

### Accessing the Application
- Frontend: http://localhost
- Backend API: http://localhost:3000

## Individual Container Management

### Frontend Container

The frontend uses a multi-stage build process:
1. Build stage: Compiles the React/Vite application
2. Production stage: Serves the built files using Nginx

Build frontend individually:
```bash
cd frontend
docker build -t flashcards-frontend .
```

Run frontend individually:
```bash
docker run -p 80:80 flashcards-frontend
```

#### Frontend Development Mode
```bash
# Run with hot-reload enabled
docker run -p 5173:5173 -v $(pwd):/usr/src/app flashcards-frontend
```

### Backend Container

Build backend individually:
```bash
cd backend
docker build -t flashcards-backend .
```

Run backend individually:
```bash
docker run -p 3000:3000 --env-file .env flashcards-backend
```

## Container Management Commands

### View Running Containers
```bash
docker ps
```

### View Logs
```bash
# All containers
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Remove volumes too
docker-compose down -v
```

### Clean Up
```bash
# Remove unused images
docker image prune

# Remove all unused containers, networks, and images
docker system prune
```

## Troubleshooting

### Frontend Issues

1. **Blank Page/404 Errors**
   - Check if the build process completed successfully
   - Verify nginx configuration
   - Check browser console for errors

2. **Development Hot-Reload Not Working**
   - Ensure volume mounts are correct
   - Check if the correct ports are exposed
   - Verify Vite configuration

3. **API Connection Issues**
   - Check if the backend URL is correctly configured
   - Verify nginx proxy settings
   - Ensure backend service is running

### Backend Issues

1. **Container Won't Start**
   - Check if .env file exists and is properly configured
   - Verify port availability
   - Check logs for startup errors

2. **Database Connection Issues**
   - Verify database credentials in .env
   - Check if database service is running
   - Ensure network connectivity between containers

## Production Considerations

### Frontend
- Optimize nginx configuration for production
- Enable compression for static assets
- Configure proper cache headers
- Configure API endpoints in nginx proxy

### Backend
- Set NODE_ENV to production
- Configure proper logging
- Set up health checks
- Use production-grade database settings

## Security Best Practices

1. **Environment Variables**
   - Never commit backend .env files
   - Use secrets management in production
   - Rotate sensitive credentials regularly

2. **Container Security**
   - Use specific versions for base images
   - Regularly update dependencies
   - Implement least privilege principle
   - Scan images for vulnerabilities

3. **Network Security**
   - Use internal networks for service communication
   - Limit exposed ports
   - Configure CORS properly

## Support

For additional help or issues:
1. Check Docker documentation
2. Review application-specific documentation
3. Contact the development team

## Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Documentation](https://vitejs.dev/) 