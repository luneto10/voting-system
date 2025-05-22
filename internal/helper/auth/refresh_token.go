package auth

import (
	"crypto/rand"
	"encoding/base64"
	"time"
)

const (
	RefreshTokenExpiration = 7 * 24 * time.Hour // 7 days
)

func GenerateRefreshToken(userID uint) (string, error) {
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}

	token := base64.URLEncoding.EncodeToString(tokenBytes)
	return token, nil
}

func IsRefreshTokenExpired(expiresAt time.Time) bool {
	return time.Now().After(expiresAt)
}
