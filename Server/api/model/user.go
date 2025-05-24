package model

import "gorm.io/gorm"

type UserRole string

const (
	UserRoleAdmin UserRole = "admin"
	UserRoleUser  UserRole = "user"
)

type User struct {
	gorm.Model
	Email       string       `gorm:"not null;unique;index"`
	Password    string       `gorm:"not null"`
	Role        UserRole     `gorm:"not null;default:user"`
	Submissions []Submission `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Forms       []Form       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}
