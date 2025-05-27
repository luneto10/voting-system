package auth

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/helper"
)

var (
	SecretKey    = os.Getenv("JWT_SECRET_KEY")
	TokenExpired = 15 * time.Minute
)

func GenerateJWT(user *model.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"iss":   "http://localhost:8080",
			"sub":   user.ID,
			"email": user.Email,
			"exp":   time.Now().Add(TokenExpired).Unix(),
		})

	return token.SignedString([]byte(SecretKey))
}

func ValidateToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return []byte(SecretKey), nil
	})
	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, helper.ErrInvalidToken
	}

	return token, nil
}
