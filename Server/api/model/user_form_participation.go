package model

import (
	"time"

	"gorm.io/gorm"
)

type UserFormParticipation struct {
	gorm.Model
	FormID       uint       `gorm:"not null" json:"form_id"`
	UserID       uint       `gorm:"not null" json:"user_id"`
	Status       string     `gorm:"default:'available'" json:"status"`
	StartedAt    *time.Time `json:"started_at"`
	CompletedAt  *time.Time `json:"completed_at"`
	LastModified time.Time  `json:"last_modified"`

	Form Form `gorm:"foreignKey:FormID" json:"form"`
	User User `gorm:"foreignKey:UserID" json:"user"`
}

// TableName specifies the table name for UserFormParticipation
func (UserFormParticipation) TableName() string {
	return "user_form_participations"
}
