package router

import "github.com/gin-gonic/gin"

func initializeRoutes(router *gin.Engine) {
	basePath := "/api/v1"

	v1 := router.Group(basePath)
	{
		form := v1.Group("/form")
		{
			form.POST("", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Form created"})
			})
		}
	}
}
