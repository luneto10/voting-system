package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/luneto10/voting-system/internal/helper/auth"
	"github.com/luneto10/voting-system/internal/schema"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("token")
		if err != nil {
			schema.SendError(c, http.StatusUnauthorized, "Unauthorized")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		token, err := auth.ValidateToken(tokenString)
		if err != nil {
			schema.SendError(c, http.StatusUnauthorized, "Unauthorized")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Set("user", token.Claims)
		c.Next()
	}
}
