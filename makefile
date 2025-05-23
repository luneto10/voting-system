.PHONY: run build clean test tidy

SERVER_DIR = cd Server &&

# Default target
run:
	$(SERVER_DIR) air

build:
	$(SERVER_DIR) go build -o bin/app

test:
	$(SERVER_DIR) go test ./...

tidy:
	$(SERVER_DIR) go mod tidy

clean:
	$(SERVER_DIR) rm -rf bin/ tmp/ 