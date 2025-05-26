package config

import (
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() error {
	// Try to load .env file, but don't fail if it doesn't exist
	// This allows the application to work both in development and production
	_ = godotenv.Load()
	return nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
