package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"gorm.io/gorm"
)

func Initialize(db *gorm.DB) {
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	handlers := initDependencies(db)

	initializeRoutes(router, handlers)

	router.Run(":8080")
}
