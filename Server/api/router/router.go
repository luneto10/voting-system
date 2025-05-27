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

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{cfg.FrontendURL},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Origin", "Content-Type", "Accept", "Authorization", "Cookie",
			"X-Requested-With", "X-CSRF-Token",
		},
		ExposeHeaders:    []string{"Set-Cookie"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}))

	handlers := initDependencies(db)

	initializeRoutes(router, handlers)

	router.Static("/assets", "../../../client/dist/assets")
	router.StaticFile("/", "../../../client/dist/index.html")

	router.NoRoute(func(c *gin.Context) {
		c.File("../../../client/dist/index.html")
	})

	router.Run("0.0.0.0:8080")
}
