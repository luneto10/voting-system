package router

import "github.com/gin-gonic/gin"

func initializeRoutes(router *gin.Engine, handlers *Handler) {
	basePath := "/api/v1"

	v1 := router.Group(basePath)
	{
		form := v1.Group("/forms")
		{
			form.POST("", handlers.FormHandler.CreateForm)
		}
	}
}
