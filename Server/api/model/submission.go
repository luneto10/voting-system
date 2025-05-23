package model

import (
	"time"

	"gorm.io/gorm"
)

type Submission struct {
	gorm.Model
	UserID      uint       `gorm:"not null;index"`
	User        User       `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	FormID      uint       `gorm:"not null;index"`
	Form        Form       `gorm:"foreignKey:FormID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	CompletedAt *time.Time `gorm:"autoUpdateTime"`
	Answers     []Answer   `gorm:"foreignKey:SubmissionID;constraint:OnDelete:CASCADE"`
}
