package main

import (
	"log"

	"github.com/luneto10/voting-system/api/router"
	"github.com/luneto10/voting-system/config"
	"github.com/luneto10/voting-system/internal/db"
	applog "github.com/luneto10/voting-system/internal/log"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize logger
	logger := applog.NewLogger(cfg.Log)
	logger.Info("Logger initialized")

	// Initialize database
	database, err := db.InitializePostgres(cfg.DB)
	if err != nil {
		logger.Errorf("Failed to initialize database: %v", err)
		return
	}
	logger.Info("Database initialized")

	// Initialize router
	router.Initialize(database)

}
