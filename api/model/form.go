package model

import (
	"time"

	"gorm.io/gorm"
)

type Form struct {
	gorm.Model
	Title     string `gorm:"not null"`
	CreatedAt time.Time
}
