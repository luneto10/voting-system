package model

import (
	"encoding/json"

	"gorm.io/gorm"
)

type DraftSubmission struct {
	gorm.Model
	FormID             uint            `gorm:"not null" json:"form_id"`
	UserID             uint            `gorm:"not null" json:"user_id"`
	Answers            json.RawMessage `gorm:"type:json" json:"answers"`
	ProgressPercentage float64         `gorm:"default:0" json:"progress_percentage"`

	Form Form `gorm:"foreignKey:FormID" json:"form"`
	User User `gorm:"foreignKey:UserID" json:"user"`
}
