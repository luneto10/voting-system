.PHONY: run run-server run-client build clean test tidy

SERVER_DIR = cd Server &&
CLIENT_DIR = cd Client &&

# Default target - runs both server and client
run:
	$(SERVER_DIR) air & $(CLIENT_DIR) npm run dev -- --host

# Run only the server
run-server:
	$(SERVER_DIR) air

# Run only the client
run-client:
	$(CLIENT_DIR) npm run dev

# Build the server
build:
	$(SERVER_DIR) go build -o bin/app

# Run tests
test:
	$(SERVER_DIR) go test ./...

# Tidy dependencies
tidy:
	$(SERVER_DIR) go mod tidy

# Clean build artifacts
clean:
	$(SERVER_DIR) rm -rf bin/ tmp/
	$(CLIENT_DIR) rm -rf dist/ node_modules/ 