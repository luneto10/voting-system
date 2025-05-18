package config

import (
	"os"

	"github.com/joho/godotenv"
)

var (
	cfg *DBConfig
)

func LoadEnv() error {
	if err := godotenv.Load(); err != nil {
		return err
	}

	cfg = &DBConfig{
		Host:     getEnv("POSTGRES_HOST", "localhost"),
		Port:     getEnv("POSTGRES_PORT", "5432"),
		User:     getEnv("POSTGRES_USER", "postgres"),
		Password: getEnv("POSTGRES_PASSWORD", "postgres"),
		DBName:   getEnv("POSTGRES_DB", "go_orm_db"),
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func GetConfig() *DBConfig {
	return cfg
}
