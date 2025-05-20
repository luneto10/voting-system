# Voting System

A Go-based voting system that allows users to create forms, submit answers, and manage submissions.

## Prerequisites

- Go 1.21 or higher
- Docker and Docker Compose
- PostgreSQL (if running locally)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=go_orm_db
LOG_LEVEL=info
LOG_FORMAT=text
```

## Running the Application

### 1. Start the Database

```bash
docker-compose up -d
```

This will start a PostgreSQL container using the configuration in `docker-compose.yml`.

### 2. Run the Application

You can run the application using the provided `makefile`:

```bash
make run
```

This command uses [Air](https://github.com/cosmtrek/air) for hot reloading, so any changes to the code will automatically restart the server.

Alternatively, you can run the application directly:

```bash
go run main.go
```

The application will start on `http://localhost:8080`.

## Docker

### Building the Docker Image

```bash
docker build -t voting-system .
```

### Running the Docker Container

```bash
docker run -p 8080:8080 voting-system
```

## Development

### Hot Reload

The project uses [Air](https://github.com/cosmtrek/air) for hot reloading. To start the application with hot reload:

```bash
make run
```

### Testing

```bash
make test
```

### Cleaning Up

To clean up build artifacts and temporary files:

```bash
make clean
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 