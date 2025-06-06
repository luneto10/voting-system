package config

import (
	"fmt"
)

// Config holds all configuration values for the application.
type Config struct {
	DB          DBConfig
	Log         LogConfig
	JWT         JWTConfig
	FrontendURL string
}

// DBConfig holds database configuration values.
type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

// LogConfig holds logging configuration values.
type LogConfig struct {
	Level  string
	Format string
}

type JWTConfig struct {
	SecretKey string
}

// LoadConfig loads configuration from environment variables.
func LoadConfig() (*Config, error) {
	if err := LoadEnv(); err != nil {
		return nil, fmt.Errorf("error loading environment variables: %v", err)
	}

	cfg := &Config{
		DB: DBConfig{
			Host:     getEnv("POSTGRES_HOST", "localhost"),
			Port:     getEnv("POSTGRES_PORT", "5432"),
			User:     getEnv("POSTGRES_USER", "postgres"),
			Password: getEnv("POSTGRES_PASSWORD", "postgres"),
			DBName:   getEnv("POSTGRES_DB", "go_orm_db"),
		},
		Log: LogConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "text"),
		},
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
	}

	return cfg, nil
}
