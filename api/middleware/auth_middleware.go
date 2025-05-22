package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			schema.SendError(c, http.StatusUnauthorized, "Invalid token claims")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// Get user ID from sub claim
		userID, ok := claims["sub"].(float64)
		if !ok {
			schema.SendError(c, http.StatusUnauthorized, "Invalid user ID in token")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// Set both the complete claims and the user ID in context
		c.Set("claims", claims)
		c.Set("user_id", uint(userID))
		c.Next()
	}
}
