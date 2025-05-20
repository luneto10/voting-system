package model

import (
	"time"

	"gorm.io/gorm"
)

type Form struct {
	gorm.Model
	Title       string     `json:"title" gorm:"not null" validate:"required,min=5,max=100"`
	Description string     `json:"description"`
	StartAt     time.Time  `json:"start_at" gorm:"default:null"`
	EndAt       time.Time  `json:"end_at" gorm:"default:null"`
	Questions   []Question `gorm:"foreignKey:FormID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}
