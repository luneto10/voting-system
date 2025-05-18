package model

import (
	"gorm.io/gorm"
)

type Form struct {
	gorm.Model
	Title string `gorm:"not null"`
}
