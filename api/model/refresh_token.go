package model

import (
	"time"

	"gorm.io/gorm"
)

type RefreshToken struct {
	gorm.Model
	Token     string    `gorm:"unique;not null"` // The actual refresh token string
	UserID    uint      `gorm:"not null"`        // Reference to the user who owns this token
	User      User      `gorm:"foreignKey:UserID"`
	ExpiresAt time.Time `gorm:"not null"`      // When this token expires
	Revoked   bool      `gorm:"default:false"` // Whether this token has been revoked
}
