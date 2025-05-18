package router

import (
	"github.com/gin-gonic/gin"
	"github.com/luneto10/voting-system/internal/config"
)

func Initialize() {
	router := gin.Default()
	
	db := config.GetPostgres()
	handlers := initDependencies(db)

	initializeRoutes(router, handlers)

	router.Run(":8080")
}
