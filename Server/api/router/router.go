package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/luneto10/voting-system/config"

	"gorm.io/gorm"
)

func Initialize(db *gorm.DB) {
	router := gin.Default()

	cfg, err := config.LoadConfig()
	if err != nil {
		panic(err)
	}

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	handlers := initDependencies(db)

	initializeRoutes(router, handlers)

	router.Run(":8080")
}
