package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/luneto10/voting-system/internal/helper/auth"
	"github.com/luneto10/voting-system/internal/schema"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			schema.SendError(c, http.StatusUnauthorized, "Authorization header is required")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// Check if the Authorization header has the correct format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			schema.SendError(c, http.StatusUnauthorized, "Invalid authorization header format")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]
		token, err := auth.ValidateToken(tokenString)
		if err != nil {
			schema.SendError(c, http.StatusUnauthorized, "Invalid token")
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
