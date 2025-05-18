package router

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Initialize(db *gorm.DB) {
	router := gin.Default()

	handlers := initDependencies(db)

	initializeRoutes(router, handlers)

	router.Run(":8080")
}
