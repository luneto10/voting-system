package router

import (
	"github.com/gin-gonic/gin"
	"github.com/luneto10/voting-system/api/middleware"
)

func initializeRoutes(router *gin.Engine, handlers *Handler) {
	basePath := "/api/v1"

	v1 := router.Group(basePath)
	{
		form := v1.Group("/forms")
		{
			form.GET("/:id", middleware.AuthMiddleware(), handlers.FormHandler.GetForm)
			form.GET("/:id/public", middleware.AuthMiddleware(), handlers.FormHandler.GetPublicForm)
			form.POST("", middleware.AuthMiddleware(), handlers.FormHandler.CreateForm)
			form.PUT("/:id", middleware.AuthMiddleware(), handlers.FormHandler.UpdateForm)
			form.DELETE("/:id", middleware.AuthMiddleware(), handlers.FormHandler.DeleteForm)
			form.GET("/user", middleware.AuthMiddleware(), handlers.FormHandler.GetUserForms)
			form.POST("/:id/submit", middleware.AuthMiddleware(), handlers.FormHandler.SubmitForm)
			form.GET("/:id/hasvoted", middleware.AuthMiddleware(), handlers.FormHandler.UserSubmittedForm)
			form.GET("/:id/voters", middleware.AuthMiddleware(), handlers.FormHandler.GetFormVoters)
		}

		auth := v1.Group("/auth")
		{
			auth.POST("/register", handlers.AuthHandler.Register)
			auth.POST("/login", handlers.AuthHandler.Login)
			auth.POST("/refresh", handlers.AuthHandler.RefreshToken)
			auth.POST("/logout", handlers.AuthHandler.Logout)
		}

		dashboard := v1.Group("/dashboard")
		{
			dashboard.GET("", middleware.AuthMiddleware(), handlers.DashboardHandler.GetDashboard)
			dashboard.PUT("/forms/:formId/status/:status", middleware.AuthMiddleware(), handlers.DashboardHandler.UpdateFormStatus)
			dashboard.DELETE("/forms/:formId/status", middleware.AuthMiddleware(), handlers.DashboardHandler.DeleteFormParticipation)
			dashboard.GET("/activities", middleware.AuthMiddleware(), handlers.DashboardHandler.GetUserActivities)
		}

		drafts := v1.Group("/drafts")
		{
			drafts.POST("", middleware.AuthMiddleware(), handlers.DraftHandler.SaveDraft)
			drafts.GET("/:formId", middleware.AuthMiddleware(), handlers.DraftHandler.GetDraft)
			drafts.DELETE("/:formId", middleware.AuthMiddleware(), handlers.DraftHandler.DeleteDraft)
		}
	}
}
