package auth

import (
	"crypto/rand"
	"encoding/base64"
	"time"
)

const (
	// RefreshTokenExpiration defines how long a refresh token is valid
	RefreshTokenExpiration = 7 * 24 * time.Hour // 7 days
)

// GenerateRefreshToken creates a new random refresh token
func GenerateRefreshToken(userID uint) (string, error) {
	// Generate 32 random bytes
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}

	// Encode to base64 for a string representation
	token := base64.URLEncoding.EncodeToString(tokenBytes)
	return token, nil
}

// IsRefreshTokenExpired checks if a refresh token has expired
func IsRefreshTokenExpired(expiresAt time.Time) bool {
	return time.Now().After(expiresAt)
}
