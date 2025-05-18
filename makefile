.PHONY: run build clean test tidy

# Default target
run:
	air

build:
	go build -o bin/app

test:
	go test ./...

tidy:
	go mod tidy

clean:
	rm -rf bin/ tmp/ 