package router

import (
	"github.com/gin-gonic/gin"
	"github.com/luneto10/voting-system/api/middleware"
)

func initializeRoutes(router *gin.Engine, handlers *Handler) {
	basePath := "/api/v1"

	v1 := router.Group(basePath)
	{
		form := v1.Group("/forms", middleware.AuthMiddleware())
		{
			form.GET("/:id", handlers.FormHandler.GetForm)
			form.POST("", handlers.FormHandler.CreateForm)
			form.PUT("/:id", handlers.FormHandler.UpdateForm)
		}

		auth := v1.Group("/auth")
		{
			auth.POST("/register", handlers.AuthHandler.Register)
			auth.POST("/login", handlers.AuthHandler.Login)
		}
	}
}
