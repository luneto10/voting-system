package main

import (
	"github.com/luneto10/voting-system/api/router"
	"github.com/luneto10/voting-system/internal/config"
)

var (
	logger *config.Logger
)


func main() {
	logger = config.NewLogger("Voting System")

	if err := config.Init(); err != nil {
		logger.Errorf("error initializing config: %v", err)
		return
	}

	router.Initialize()
}